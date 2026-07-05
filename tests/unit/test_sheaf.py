"""
Unit tests for Sheaf Guild module
"""

import pytest
from backend.tier3.sheaf_guild import (
    ShamirSSS, sss, GuildKeyManager, SheafCipher, GuildMessenger, P
)

class TestShamirSSS:
    def test_split_reconstruct(self):
        secret = 0xDEADBEEFCAFEBABE
        shares = sss.split(secret, n=5, t=3)
        assert len(shares) == 5
        
        # Reconstruct from 3 shares
        reconstructed = sss.reconstruct(shares[:3])
        assert reconstructed == secret
        
        # Reconstruct from different 3 shares
        reconstructed = sss.reconstruct([shares[1], shares[3], shares[4]])
        assert reconstructed == secret

    def test_threshold_failure(self):
        secret = 123456
        shares = sss.split(secret, n=5, t=3)
        # With fewer than threshold shares, reconstruction returns wrong value
        # (Lagrange interpolation completes but is incorrect - no exception raised)
        result = sss.reconstruct(shares[:2])
        assert result != secret

class TestGuildKeyManager:
    def test_create_guild_key(self):
        gkm = GuildKeyManager()
        members = ["ALICE", "BOB", "CHARLIE", "DAVE", "EVE"]
        result = gkm.create_guild_key("TEST_GUILD", members, 3)
        assert result["guild"] == "TEST_GUILD"
        assert result["n_members"] == 5
        assert result["threshold"] == 3

    def test_get_member_share(self):
        gkm = GuildKeyManager()
        members = ["ALICE", "BOB", "CHARLIE"]
        gkm.create_guild_key("TEST_GUILD_2", members, 2)
        share = gkm.get_member_share("TEST_GUILD_2", "ALICE")
        assert share is not None
        assert len(share) == 2  # (x, y)

    def test_reconstruct_key(self):
        gkm = GuildKeyManager()
        members = ["ALICE", "BOB", "CHARLIE"]
        gkm.create_guild_key("TEST_GUILD_3", members, 2)
        key = gkm.reconstruct_key("TEST_GUILD_3", ["ALICE", "BOB"])
        assert key is not None
        assert len(key) == 16  # 16-byte AES key

class TestSheafCipher:
    def test_encrypt_decrypt(self):
        cipher = SheafCipher()
        key = b"0123456789abcdef"
        plaintext = b"Hello, Sovereign Hive!"
        ct, iv, mac = cipher.encrypt(plaintext, key)
        decrypted = cipher.decrypt(ct, key, iv, mac)
        assert decrypted == plaintext

    def test_mac_failure(self):
        cipher = SheafCipher()
        key = b"0123456789abcdef"
        plaintext = b"Hello, Sovereign Hive!"
        ct, iv, mac = cipher.encrypt(plaintext, key)
        # Tamper with ciphertext
        tampered = bytearray(ct)
        tampered[0] ^= 0x01
        decrypted = cipher.decrypt(bytes(tampered), key, iv, mac)
        assert decrypted is None

class TestGuildMessenger:
    def test_setup_guilds(self):
        messenger = GuildMessenger()
        result = messenger.setup_all_guilds()
        assert "Trust" in result
        assert "Crypto" in result
        assert "R&D" in result

    def test_send_receive(self):
        messenger = GuildMessenger()
        members = messenger.GUILD_MEMBERS["Trust"][:3]
        result = messenger.send(
            "Trust", "ELDER_A", "Test Topic",
            "This is a secret message.", members
        )
        assert "message_id" in result
        assert result["encrypted"] is True

        received = messenger.receive(
            result["message_id"], "Trust", members
        )
        assert received["content"] == "This is a secret message."
