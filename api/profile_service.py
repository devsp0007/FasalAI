"""
Profile Service — CRUD operations for user profiles stored in SQLite.
"""

import sqlite3
import json
import os
from datetime import datetime

DB_DIR = os.path.join(os.path.dirname(__file__), "..", "latest_model")
DB_PATH = os.path.join(DB_DIR, "smartcrop.db")


def _get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_profile(user_id: int) -> dict | None:
    """Load a user's profile. Returns dict or None."""
    conn = _get_conn()
    try:
        row = conn.execute(
            "SELECT * FROM profiles WHERE user_id = ?", (user_id,)
        ).fetchone()
        if not row:
            return None

        profile = dict(row)
        # Parse JSON fields
        try:
            profile["crops_grown"] = json.loads(profile.get("crops_grown") or "[]")
        except (json.JSONDecodeError, TypeError):
            profile["crops_grown"] = []
        try:
            profile["notifications"] = json.loads(profile.get("notifications") or "{}")
        except (json.JSONDecodeError, TypeError):
            profile["notifications"] = {}

        return profile
    finally:
        conn.close()


def save_profile(user_id: int, data: dict) -> dict:
    """Save or update a user's profile. Returns the saved profile."""
    conn = _get_conn()
    try:
        # Serialize JSON fields
        crops_json = json.dumps(data.get("crops_grown", []))
        notif_json = json.dumps(data.get("notifications", {}))

        conn.execute("""
            INSERT INTO profiles (user_id, name, district, state, language, role, farm_size, crops_grown, notifications, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                name = excluded.name,
                district = excluded.district,
                state = excluded.state,
                language = excluded.language,
                role = excluded.role,
                farm_size = excluded.farm_size,
                crops_grown = excluded.crops_grown,
                notifications = excluded.notifications,
                updated_at = excluded.updated_at
        """, (
            user_id,
            data.get("name", ""),
            data.get("district", ""),
            data.get("state", ""),
            data.get("language", "en"),
            data.get("role", "farmer"),
            data.get("farm_size"),
            crops_json,
            notif_json,
            datetime.utcnow().isoformat(),
        ))
        conn.commit()

        # Also update the name in the users table
        if data.get("name"):
            conn.execute("UPDATE users SET name = ? WHERE id = ?", (data["name"], user_id))
            conn.commit()

        return get_profile(user_id)
    finally:
        conn.close()


def delete_profile(user_id: int) -> bool:
    """Delete a user's profile and account."""
    conn = _get_conn()
    try:
        conn.execute("DELETE FROM profiles WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        return True
    finally:
        conn.close()
