#!/usr/bin/env python3
"""Initialize database tables."""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.database import init_db_sync
from backend.config import settings

def main():
    print(f"Initializing database at: {settings.db_path}")
    init_db_sync(settings.db_path)
    print("Database initialized successfully.")

if __name__ == "__main__":
    main()
