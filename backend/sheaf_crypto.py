"""
Sheaf Encryption — Fernet-based encryption for guild secrets.
Uses cryptography library for secure secret storage.
"""
import os
import base64
from typing import Dict, Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from backend.database import Database
from backend.config import settings


class SheafCrypto:
    """Encrypts and decrypts guild secrets using Fernet (AES-128-CBC + HMAC)."""

    def __init__(self, master_key: bytes = None):
        if master_key is None:
            # Derive from JWT secret (in production, use dedicated key)
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=b"sovereign_hive_sheaf_v1",
                iterations=480000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(settings.jwt_secret_key.encode()))
        else:
            key = base64.urlsafe_b64encode(master_key)

        self.fernet = Fernet(key)

    def encrypt(self, plaintext: str) -> str:
        """Encrypt a string, return base64 ciphertext."""
        return self.fernet.encrypt(plaintext.encode()).decode()

    def decrypt(self, ciphertext: str) -> str:
        """Decrypt base64 ciphertext back to string."""
        return self.fernet.decrypt(ciphertext.encode()).decode()

    async def store_secret(self, guild_name: str, secret: str) -> Dict:
        """Encrypt and store a guild secret."""
        encrypted = self.encrypt(secret)

        import aiosqlite
        async with aiosqlite.connect(settings.db_path) as conn:
            await conn.execute(
                """INSERT OR REPLACE INTO guild_secrets 
                   (guild_name, secret_encrypted, updated) VALUES (?, ?, datetime('now'))""",
                (guild_name, encrypted)
            )
            await conn.commit()

        return {"guild": guild_name, "stored": True}

    async def retrieve_secret(self, guild_name: str) -> Optional[str]:
        """Retrieve and decrypt a guild secret."""
        import aiosqlite

        async with aiosqlite.connect(settings.db_path) as conn:
            async with conn.execute(
                "SELECT secret_encrypted FROM guild_secrets WHERE guild_name = ?",
                (guild_name,)
            ) as cursor:
                row = await cursor.fetchone()
                if not row:
                    return None
                return self.decrypt(row[0])


# Singleton
sheaf_crypto = SheafCrypto()
