#!/usr/bin/env python3
"""Database backup utility."""
import shutil
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.config import settings

def backup_db():
    db_path = settings.db_path
    backup_dir = "backups"
    if not os.path.exists(db_path):
        print(f"Database not found: {db_path}")
        sys.exit(1)
    os.makedirs(backup_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(backup_dir, f"jasper_memory_{timestamp}.db")
    shutil.copy2(db_path, backup_path)
    print(f"Backed up to {backup_path}")

if __name__ == "__main__":
    backup_db()
