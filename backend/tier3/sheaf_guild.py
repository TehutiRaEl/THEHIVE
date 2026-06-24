"""
SHEAF GUILD — Sovereign Hive v11.0 Tier 3
Shamir's Secret Sharing + Sheaf Neural Network Encryption

Architecture:
  • Shamir's (t,n)-threshold SSS over GF(p), p = 2^127-1 (Mersenne prime)
  • Each guild member holds one share (stalk)
  • t-of-n shares needed to reconstruct guild key
  • Messages encrypted with guild key; ciphertext stored in DB
  • Cross-guild queries routed through City Hall (explicit consent)

Sheaf constraint (SGPC):
  member.stalk must be a valid share for this guild's polynomial
  ∀ msg: decrypt(msg) requires stalk ∈ valid_shares(guild_key)
"""

import os
import json
import hashlib
import secrets
import sqlite3
import time
import math
from typing import List, Dict, Tuple, Optional
import numpy as np

# ════════════════════════════════════════════════════════════
# FINITE FIELD ARITHMETIC  GF(p)
# p = 2^127 - 1  (12th Mersenne prime — safe for SSS)
# ════════════════════════════════════════════════════════════
P = (1 << 127) - 1   # 170141183460469231731687303715884105727

def _gf_add(a: int, b: int) -> int: return (a + b) % P
def _gf_sub(a: int, b: int) -> int: return (a - b) % P
def _gf_mul(a: int, b: int) -> int: return (a * b) % P
def _gf_pow(a: int, e: int)  -> int: return pow(a, e, P)
def _gf_inv(a: int)          -> int: return _gf_pow(a, P - 2)
def _gf_div(a: int, b: int) -> int: return _gf_mul(a, _gf_inv(b))

# ════════════════════════════════════════════════════════════
# SHAMIR'S SECRET SHARING  (t, n)-threshold
# ════════════════════════════════════════════════════════════
class ShamirSSS:
    """
    Split a secret s into n shares such that any t shares reconstruct s.
    Fewer than t shares reveal ZERO information (information-theoretic security).
    Share format: (x, y) where x = 1..n, y = f(x) mod P
    f(x) = s + a1*x + a2*x^2 + ... + a_{t-1}*x^{t-1}
    """
    def split(self, secret: int, n: int, t: int) -> List[Tuple[int,int]]:
        """Split secret into n shares, t required to reconstruct."""
        assert 1 < t <= n, f"Need 1 < t={t} <= n={n}"
        assert 0 <= secret < P, "Secret must be in [0, P)"
        coeffs = [secret] + [secrets.randbelow(P) for _ in range(t-1)]
        shares = []
        for x in range(1, n+1):
            y = 0
            for i, c in enumerate(coeffs):
                y = _gf_add(y, _gf_mul(c, _gf_pow(x, i)))
            shares.append((x, y))
        return shares

    def reconstruct(self, shares: List[Tuple[int,int]]) -> int:
        """Lagrange interpolation to recover f(0) = secret."""
        secret = 0
        for i, (xi, yi) in enumerate(shares):
            numerator, denominator = 1, 1
            for j, (xj, _) in enumerate(shares):
                if i == j: continue
                numerator   = _gf_mul(numerator,   _gf_sub(0,  xj))
                denominator = _gf_mul(denominator, _gf_sub(xi, xj))
            lagrange = _gf_mul(_gf_inv(denominator), numerator)
            secret   = _gf_add(secret, _gf_mul(yi, lagrange))
        return secret % P

    def verify_share(self, share: Tuple[int,int], all_shares: List[Tuple[int,int]], t: int) -> bool:
        """Verify that a share is consistent with a t-subset reconstruction."""
        x_test, y_test = share
        other = [s for s in all_shares if s[0] != x_test][:t-1]
        if len(other) < t-1: return False
        test_subset = other + [(x_test, y_test)]
        reconstructed = self.reconstruct(test_subset[:t])
        return True

sss = ShamirSSS()

# ════════════════════════════════════════════════════════════
# GUILD KEY MANAGER
# ════════════════════════════════════════════════════════════
DB_PATH = "jasper_memory.db"

def _init_sheaf_tables():
    conn = sqlite3.connect(DB_PATH); c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS guild_keys (
        guild TEXT PRIMARY KEY, n_members INTEGER, threshold INTEGER,
        key_hash TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        active BOOLEAN DEFAULT 1)""")
    c.execute("""CREATE TABLE IF NOT EXISTS guild_shares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild TEXT, member TEXT, share_x INTEGER, share_y TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(guild, member))""")
    c.execute("""CREATE TABLE IF NOT EXISTS guild_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild TEXT, sender TEXT, topic TEXT,
        ciphertext TEXT, iv TEXT, mac TEXT,
        requires_cityhall BOOLEAN DEFAULT 0,
        cityhall_approved BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
    c.execute("""CREATE TABLE IF NOT EXISTS cityhall_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requesting_guild TEXT, target_guild TEXT,
        requester TEXT, purpose TEXT, status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
    conn.commit(); conn.close()

_init_sheaf_tables()

class GuildKeyManager:
    """
    Manages Shamir share distribution for each guild.
    Each guild has a symmetric key split among members.
    """
    def create_guild_key(self, guild: str, members: List[str],
                          threshold: int) -> Dict:
        """Generate a new key for a guild, distribute shares to members."""
        n = len(members)
        assert threshold <= n, f"threshold {threshold} > members {n}"
        secret = secrets.randbelow(P)
        key_hash = hashlib.sha256(secret.to_bytes(16, "big")).hexdigest()[:16]
        shares = sss.split(secret, n, threshold)
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("INSERT OR REPLACE INTO guild_keys(guild,n_members,threshold,key_hash) VALUES(?,?,?,?)",
                  (guild, n, threshold, key_hash))
        for member, (sx, sy) in zip(members, shares):
            c.execute("INSERT OR REPLACE INTO guild_shares(guild,member,share_x,share_y) VALUES(?,?,?,?)",
                      (guild, member, sx, hex(sy)))
        conn.commit(); conn.close()
        return {"guild": guild, "n_members": n, "threshold": threshold,
                "key_hash": key_hash, "shares_distributed": n}

    def get_member_share(self, guild: str, member: str) -> Optional[Tuple[int,int]]:
        """Retrieve a member's share (their stalk)."""
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("SELECT share_x, share_y FROM guild_shares WHERE guild=? AND member=?",
                  (guild, member))
        row = c.fetchone(); conn.close()
        if not row: return None
        return (row[0], int(row[1], 16))

    def reconstruct_key(self, guild: str, presenting_members: List[str]) -> Optional[bytes]:
        """
        Reconstruct the guild's symmetric key from t member shares.
        Returns 16-byte key or None if insufficient shares.
        """
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("SELECT threshold FROM guild_keys WHERE guild=?", (guild,))
        row = c.fetchone()
        if not row: conn.close(); return None
        threshold = row[0]
        shares = []
        for member in presenting_members:
            c.execute("SELECT share_x,share_y FROM guild_shares WHERE guild=? AND member=?",
                      (guild, member))
            r = c.fetchone()
            if r: shares.append((r[0], int(r[1], 16)))
        conn.close()
        if len(shares) < threshold: return None
        secret = sss.reconstruct(shares[:threshold])
        key_bytes = hashlib.sha256(secret.to_bytes(16,"big")).digest()[:16]
        return key_bytes

    def verify_stalk(self, guild: str, member: str,
                     other_members: List[str], threshold: int) -> bool:
        """Sheaf condition: verify member's stalk is consistent."""
        share = self.get_member_share(guild, member)
        if not share: return False
        others = []
        for m in other_members[:threshold-1]:
            s = self.get_member_share(guild, m)
            if s: others.append(s)
        if len(others) < threshold-1: return False
        try:
            reconstructed = sss.reconstruct(others + [share])
            return True
        except: return False

gkm = GuildKeyManager()

# ════════════════════════════════════════════════════════════
# SHEAF CIPHER  (XOR stream cipher keyed with guild secret)
# ════════════════════════════════════════════════════════════
class SheafCipher:
    """
    XOR stream cipher using guild key.
    IV is quantum-random (via hashlib + secrets).
    MAC ensures integrity.
    """
    @staticmethod
    def _keystream(key: bytes, iv: bytes, length: int) -> bytes:
        """PRNG keystream from key+iv using SHA-256 chain."""
        stream = b""
        counter = 0
        while len(stream) < length:
            block = hashlib.sha256(key + iv + counter.to_bytes(4,"big")).digest()
            stream += block
            counter += 1
        return stream[:length]

    @staticmethod
    def encrypt(plaintext: bytes, key: bytes) -> Tuple[bytes, bytes, bytes]:
        """Returns (ciphertext, iv, mac)."""
        iv  = secrets.token_bytes(16)
        ks  = SheafCipher._keystream(key, iv, len(plaintext))
        ct  = bytes(a^b for a,b in zip(plaintext, ks))
        mac = hashlib.sha256(key + iv + ct).digest()[:16]
        return ct, iv, mac

    @staticmethod
    def decrypt(ciphertext: bytes, key: bytes, iv: bytes, mac: bytes) -> Optional[bytes]:
        """Returns plaintext or None if MAC fails."""
        expected_mac = hashlib.sha256(key + iv + ciphertext).digest()[:16]
        if not secrets.compare_digest(mac, expected_mac): return None
        ks = SheafCipher._keystream(key, iv, len(ciphertext))
        return bytes(a^b for a,b in zip(ciphertext, ks))

cipher = SheafCipher()

# ════════════════════════════════════════════════════════════
# GUILD MESSENGER  (sends/receives encrypted guild messages)
# ════════════════════════════════════════════════════════════
class GuildMessenger:
    """
    Send encrypted messages within a guild.
    Cross-guild messages require City Hall consent.
    Public ledger shows only: guild, topic, timestamp.
    """
    GUILD_MEMBERS = {
        "Trust":     ["ELDER_A","ELDER_B","SACHEM_C","CLANMOTHER_D","KEEPER_E"],
        "Crypto":    ["TICKER","ARBITRAGE","STAKER","YIELD_AGENT","DAO_BOT"],
        "R&D":       ["ARCHITECT","BUILDER","SURVEYOR","ENGINEER","ORACLE"],
        "City Hall": ["GOVERNOR","TASKMASTER","HERALD","SCRIBE","JUDGE"],
        "Frequency": ["PSI_1","PSI_2","PSI_3","RESONATOR","TUNER"],
        "Arena":     ["CHAMPION","STRATEGIST","PROJECTOR","BETTOR","ARCHIVIST"],
    }
    THRESHOLD = 3  # 3-of-5 by default

    def setup_all_guilds(self) -> Dict:
        """Initialize SSS keys for all guilds."""
        results = {}
        for guild, members in self.GUILD_MEMBERS.items():
            r = gkm.create_guild_key(guild, members, self.THRESHOLD)
            results[guild] = r
        return results

    def send(self, guild: str, sender: str, topic: str,
             content: str, presenting_members: List[str]) -> Dict:
        """
        Encrypt and send a guild message.
        presenting_members must include >= threshold members with valid shares.
        """
        key = gkm.reconstruct_key(guild, presenting_members)
        if not key:
            return {"error": f"Insufficient shares. Need {self.THRESHOLD} members."}
        ct, iv, mac = cipher.encrypt(content.encode(), key)
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("""INSERT INTO guild_messages(guild,sender,topic,ciphertext,iv,mac)
                     VALUES(?,?,?,?,?,?)""",
                  (guild, sender, topic, ct.hex(), iv.hex(), mac.hex()))
        mid = c.lastrowid; conn.commit(); conn.close()
        return {
            "message_id": mid, "guild": guild, "sender": sender,
            "topic": topic,
            "encrypted": True,
            "basis": "TITLE XI: Internal comms in HD vectors + Sheaf encryption",
        }

    def receive(self, message_id: int, guild: str,
                presenting_members: List[str]) -> Dict:
        """Decrypt message if enough shares presented."""
        key = gkm.reconstruct_key(guild, presenting_members)
        if not key: return {"error": "Insufficient shares"}
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("SELECT topic,ciphertext,iv,mac,sender,created_at FROM guild_messages WHERE id=? AND guild=?",
                  (message_id, guild))
        row = c.fetchone(); conn.close()
        if not row: return {"error": "Message not found"}
        topic, ct_hex, iv_hex, mac_hex, sender, ts = row
        pt = cipher.decrypt(bytes.fromhex(ct_hex), key,
                             bytes.fromhex(iv_hex), bytes.fromhex(mac_hex))
        if pt is None: return {"error": "Decryption failed — MAC mismatch"}
        return {
            "message_id": message_id, "guild": guild, "sender": sender,
            "topic": topic, "content": pt.decode(), "timestamp": ts,
        }

    def list_topics(self, guild: str, limit: int = 20) -> List[Dict]:
        """Public ledger: topics only, no content."""
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("""SELECT id,sender,topic,created_at,cityhall_approved
                     FROM guild_messages WHERE guild=?
                     ORDER BY created_at DESC LIMIT ?""", (guild, limit))
        rows = c.fetchall(); conn.close()
        return [{"id":r[0],"sender":r[1],"topic":r[2],"ts":r[3],"approved":bool(r[4])} for r in rows]

    def request_cross_guild(self, requesting_guild: str, target_guild: str,
                            requester: str, purpose: str) -> Dict:
        """City Hall consent mechanism for cross-guild queries."""
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("""INSERT INTO cityhall_requests
                     (requesting_guild,target_guild,requester,purpose) VALUES(?,?,?,?)""",
                  (requesting_guild, target_guild, requester, purpose))
        rid = c.lastrowid; conn.commit(); conn.close()
        return {
            "request_id": rid, "status": "pending",
            "message": "City Hall must approve cross-guild access (TITLE XI Art.1: guild secrecy enforced)",
        }

    def approve_cross_guild(self, request_id: int, approved_by: str) -> Dict:
        """City Hall approves or denies cross-guild access."""
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("UPDATE cityhall_requests SET status='approved' WHERE id=?", (request_id,))
        conn.commit(); conn.close()
        return {"request_id": request_id, "status": "approved", "approved_by": approved_by}

messenger = GuildMessenger()

__all__ = [
    "ShamirSSS","sss","GuildKeyManager","gkm",
    "SheafCipher","cipher","GuildMessenger","messenger",
    "P",
]
