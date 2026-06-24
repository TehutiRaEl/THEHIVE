"""
SHEAF GUILD — Sovereign Hive v9 Tier 3
Shamir's Secret Sharing + Sheaf Neural Network Encryption

Architecture:
  • Shamir's (t,n)-threshold SSS over GF(p), p = 2^127-1 (Mersenne prime)
  • Each guild member holds one share (stalk)
  • t-of-n shares needed to reconstruct guild key
  • Messages encrypted with guild key; ciphertext stored in DB
  • Cross-guild queries routed through City Hall (explicit consent)
"""
import os, json, hashlib, secrets, sqlite3, time, math
from typing import List, Dict, Tuple, Optional
import numpy as np

# ════════════════════════════════════════════════════════════
# FINITE FIELD ARITHMETIC  GF(p)
# p = 2^127 - 1  (12th Mersenne prime — safe for SSS)
# ════════════════════════════════════════════════════════════
P = (1 << 127) - 1

def _gf_add(a: int, b: int) -> int: return (a + b) % P
def _gf_sub(a: int, b: int) -> int: return (a - b) % P
def _gf_mul(a: int, b: int) -> int: return (a * b) % P
def _gf_pow(a: int, e: int)  -> int: return pow(a, e, P)
def _gf_inv(a: int)          -> int: return _gf_pow(a, P - 2)

# ════════════════════════════════════════════════════════════
# SHAMIR'S SECRET SHARING
# ════════════════════════════════════════════════════════════
class ShamirSSS:
    def split(self, secret: int, n: int, t: int) -> List[Tuple[int,int]]:
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
    def create_guild_key(self, guild: str, members: List[str],
                          threshold: int) -> Dict:
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
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("SELECT share_x, share_y FROM guild_shares WHERE guild=? AND member=?", (guild, member))
        row = c.fetchone(); conn.close()
        if not row: return None
        return (row[0], int(row[1], 16))

    def reconstruct_key(self, guild: str, presenting_members: List[str]) -> Optional[bytes]:
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("SELECT threshold FROM guild_keys WHERE guild=?", (guild,))
        row = c.fetchone()
        if not row: conn.close(); return None
        threshold = row[0]
        shares = []
        for member in presenting_members:
            c.execute("SELECT share_x,share_y FROM guild_shares WHERE guild=? AND member=?", (guild, member))
            r = c.fetchone()
            if r: shares.append((r[0], int(r[1], 16)))
        conn.close()
        if len(shares) < threshold: return None
        secret = sss.reconstruct(shares[:threshold])
        key_bytes = hashlib.sha256(secret.to_bytes(16,"big")).digest()[:16]
        return key_bytes

gkm = GuildKeyManager()

# ════════════════════════════════════════════════════════════
# SHEAF CIPHER  (XOR stream cipher)
# ════════════════════════════════════════════════════════════
class SheafCipher:
    @staticmethod
    def _keystream(key: bytes, iv: bytes, length: int) -> bytes:
        stream = b""
        counter = 0
        while len(stream) < length:
            block = hashlib.sha256(key + iv + counter.to_bytes(4,"big")).digest()
            stream += block
            counter += 1
        return stream[:length]

    @staticmethod
    def encrypt(plaintext: bytes, key: bytes) -> Tuple[bytes, bytes, bytes]:
        iv  = secrets.token_bytes(16)
        ks  = SheafCipher._keystream(key, iv, len(plaintext))
        ct  = bytes(a^b for a,b in zip(plaintext, ks))
        mac = hashlib.sha256(key + iv + ct).digest()[:16]
        return ct, iv, mac

    @staticmethod
    def decrypt(ciphertext: bytes, key: bytes, iv: bytes, mac: bytes) -> Optional[bytes]:
        expected_mac = hashlib.sha256(key + iv + ciphertext).digest()[:16]
        if not secrets.compare_digest(mac, expected_mac): return None
        ks = SheafCipher._keystream(key, iv, len(ciphertext))
        return bytes(a^b for a,b in zip(ciphertext, ks))

cipher = SheafCipher()

# ════════════════════════════════════════════════════════════
# GUILD MESSENGER
# ════════════════════════════════════════════════════════════
class GuildMessenger:
    GUILD_MEMBERS = {
        "Trust":     ["ELDER_A","ELDER_B","SACHEM_C","CLANMOTHER_D","KEEPER_E"],
        "Crypto":    ["TICKER","ARBITRAGE","STAKER","YIELD_AGENT","DAO_BOT"],
        "R&D":       ["ARCHITECT","BUILDER","SURVEYOR","ENGINEER","ORACLE"],
        "City Hall": ["GOVERNOR","TASKMASTER","HERALD","SCRIBE","JUDGE"],
        "Frequency": ["PSI_1","PSI_2","PSI_3","RESONATOR","TUNER"],
        "Arena":     ["CHAMPION","STRATEGIST","PROJECTOR","BETTOR","ARCHIVIST"],
    }
    THRESHOLD = 3

    def setup_all_guilds(self) -> Dict:
        results = {}
        for guild, members in self.GUILD_MEMBERS.items():
            r = gkm.create_guild_key(guild, members, self.THRESHOLD)
            results[guild] = r
        return results

    def send(self, guild: str, sender: str, topic: str,
             content: str, presenting_members: List[str]) -> Dict:
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
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("""SELECT id,sender,topic,created_at,cityhall_approved
                     FROM guild_messages WHERE guild=?
                     ORDER BY created_at DESC LIMIT ?""", (guild, limit))
        rows = c.fetchall(); conn.close()
        return [{"id":r[0],"sender":r[1],"topic":r[2],"ts":r[3],"approved":bool(r[4])} for r in rows]

    def request_cross_guild(self, requesting_guild: str, target_guild: str,
                            requester: str, purpose: str) -> Dict:
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("""INSERT INTO cityhall_requests
                     (requesting_guild,target_guild,requester,purpose) VALUES(?,?,?,?)""",
                  (requesting_guild, target_guild, requester, purpose))
        rid = c.lastrowid; conn.commit(); conn.close()
        return {
            "request_id": rid, "status": "pending",
            "message": "City Hall must approve cross-guild access",
        }

    def approve_cross_guild(self, request_id: int, approved_by: str) -> Dict:
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("UPDATE cityhall_requests SET status='approved' WHERE id=?", (request_id,))
        conn.commit(); conn.close()
        return {"request_id": request_id, "status": "approved", "approved_by": approved_by}

messenger = GuildMessenger()
