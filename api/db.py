"""
Database Module — Supabase client singleton.
All services import `get_supabase()` from here.
"""

import os
from supabase import create_client, Client

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """Return the singleton Supabase client. Creates it on first call."""
    global _supabase_client
    if _supabase_client is None:
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_KEY", "")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_KEY environment variables are required. "
                "Set them in a .env file or your hosting dashboard."
            )
        _supabase_client = create_client(url, key)
    return _supabase_client


def check_connection() -> bool:
    """Verify Supabase connectivity by running a simple query."""
    try:
        sb = get_supabase()
        # Try to query the users table (even if empty, this tests the connection)
        sb.table("users").select("id").limit(1).execute()
        return True
    except Exception as e:
        print(f"  [ERROR] Supabase connection failed: {e}")
        return False
