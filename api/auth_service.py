"""
Auth Service — SQLite-based user registration, login, and JWT management.
"""

import os
import sqlite3
import bcrypt
import jwt
import json
from datetime import datetime, timedelta

# ── Configuration ─────────────────────────────────────
DB_DIR = os.path.join(os.path.dirname(__file__), "..", "latest_model")
DB_PATH = os.path.join(DB_DIR, "smartcrop.db")
JWT_SECRET = os.environ.get("JWT_SECRET", "smartcrop-sih25010-secret-key-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 30


def _get_conn():
    """Get a database connection with row_factory for dict-like access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")  # Better concurrent access
    return conn


def init_db():
    """Create database tables if they don't exist. Called at server startup."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = _get_conn()
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                phone       TEXT UNIQUE NOT NULL,
                password    TEXT NOT NULL,
                name        TEXT DEFAULT '',
                created_at  TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS profiles (
                user_id       INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                name          TEXT DEFAULT '',
                district      TEXT DEFAULT '',
                state         TEXT DEFAULT '',
                language      TEXT DEFAULT 'en',
                role          TEXT DEFAULT 'farmer',
                farm_size     REAL,
                crops_grown   TEXT DEFAULT '[]',
                notifications TEXT DEFAULT '{}',
                updated_at    TEXT DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
        print("  ✅ SQLite database initialized")
    finally:
        conn.close()


def _generate_token(user_id: int, phone: str, name: str) -> str:
    """Generate a JWT token for a user."""
    payload = {
        "user_id": user_id,
        "phone": phone,
        "name": name,
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRY_DAYS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def register_user(phone: str, password: str, name: str = "") -> dict:
    """
    Register a new user. Returns {"token": ..., "user": {...}}.
    Raises ValueError if phone already exists.
    """
    phone = phone.strip()
    if not phone or not password:
        raise ValueError("Phone and password are required")

    # Hash password
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = _get_conn()
    try:
        # Check if phone already exists
        existing = conn.execute("SELECT id FROM users WHERE phone = ?", (phone,)).fetchone()
        if existing:
            raise ValueError("A user with this phone number already exists")

        cursor = conn.execute(
            "INSERT INTO users (phone, password, name) VALUES (?, ?, ?)",
            (phone, hashed, name.strip())
        )
        user_id = cursor.lastrowid

        # Create empty profile for the user
        conn.execute(
            "INSERT INTO profiles (user_id, name) VALUES (?, ?)",
            (user_id, name.strip())
        )
        conn.commit()

        token = _generate_token(user_id, phone, name)
        return {
            "token": token,
            "user": {"id": user_id, "phone": phone, "name": name},
        }
    finally:
        conn.close()


def login_user(phone: str, password: str) -> dict:
    """
    Login a user. Returns {"token": ..., "user": {...}}.
    Raises ValueError if credentials are invalid.
    """
    phone = phone.strip()
    if not phone or not password:
        raise ValueError("Phone and password are required")

    conn = _get_conn()
    try:
        row = conn.execute(
            "SELECT id, phone, password, name FROM users WHERE phone = ?", (phone,)
        ).fetchone()

        if not row:
            raise ValueError("Invalid phone number or password")

        if not bcrypt.checkpw(password.encode("utf-8"), row["password"].encode("utf-8")):
            raise ValueError("Invalid phone number or password")

        token = _generate_token(row["id"], row["phone"], row["name"])
        return {
            "token": token,
            "user": {"id": row["id"], "phone": row["phone"], "name": row["name"]},
        }
    finally:
        conn.close()


def get_current_user(token: str) -> dict:
    """
    Decode a JWT token and return the user payload.
    Raises ValueError if token is invalid or expired.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {
            "user_id": payload["user_id"],
            "phone": payload["phone"],
            "name": payload.get("name", ""),
        }
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired. Please login again.")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token. Please login again.")
