"""
Agent Identity — Ed25519 key generation, action signing, and verification.
Implements tamper-evident audit chain for all agent actions.
"""
import base64
import hashlib
import json
from typing import Dict, Optional, Tuple
from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey, Ed25519PublicKey
)
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

from backend.database import Database


class AgentIdentity:
    """Manages Ed25519 cryptographic identities for agents."""

    def __init__(self, db: Database = None):
        self.db = db or Database()

    def generate_keypair(self) -> Tuple[str, str]:
        """Generate a new Ed25519 keypair. Returns (private_key_pem, public_key_pem)."""
        private_key = Ed25519PrivateKey.generate()
        public_key = private_key.public_key()

        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode("utf-8")

        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode("utf-8")

        return private_pem, public_pem

    def sign_action(self, private_key_pem: str, action: Dict) -> str:
        """Sign an action dict with the agent's private key."""
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode(), password=None, backend=default_backend()
        )

        action_bytes = json.dumps(action, sort_keys=True).encode("utf-8")
        signature = private_key.sign(action_bytes)
        return base64.b64encode(signature).decode("utf-8")

    def verify_action(self, public_key_pem: str, action: Dict, signature_b64: str) -> bool:
        """Verify an action signature against the agent's public key."""
        try:
            public_key = serialization.load_pem_public_key(
                public_key_pem.encode(), backend=default_backend()
            )
            action_bytes = json.dumps(action, sort_keys=True).encode("utf-8")
            signature = base64.b64decode(signature_b64)
            public_key.verify(signature, action_bytes)
            return True
        except Exception:
            return False

    async def register_agent(self, agent_name: str) -> Dict:
        """Register a new agent with generated keys."""
        private_pem, public_pem = self.generate_keypair()

        await self.db.create_agent(
            name=agent_name,
            description="Auto-generated agent",
            public_key=public_pem,
            private_key_encrypted=private_pem  # TODO: encrypt with sheaf
        )

        return {
            "agent_name": agent_name,
            "public_key": public_pem,
            "registered": True
        }

    def compute_action_hash(self, action: Dict) -> str:
        """Compute SHA-256 hash of an action for audit chain."""
        action_bytes = json.dumps(action, sort_keys=True).encode("utf-8")
        return hashlib.sha256(action_bytes).hexdigest()


# Singleton
agent_identity = AgentIdentity()
