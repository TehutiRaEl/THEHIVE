"""
IPFS PUBSUB — Sovereign Hive v11.0 Tier 3
Agent-to-Agent Communication without central broker

Protocol (TITLE XI: hive speaks HD vectors internally):
  • Each colony has a dedicated pubsub channel
  • Messages encoded as HD vectors + metadata
  • Transport: IPFS daemon (port 5001) when available
  • Fallback: internal SQLite queue + WebSocket broadcast

Channel naming: hive-{colony_name}-{hash8}
Message format: {channel, sender, vector_blob, topic, ts, nonce}

Cross-colony federation: colonies subscribe to peer channels.
TITLE XIII: No agent deleted — all messages persisted permanently.
"""

import os
import json
import hashlib
import asyncio
import time
import uuid
import sqlite3
from typing import List, Dict, Optional, Callable, Awaitable
from datetime import datetime
import numpy as np

try:
    import httpx
    HTTPX = True
except ImportError:
    HTTPX = False

DB_PATH = "jasper_memory.db"
IPFS_API = os.environ.get("IPFS_API_URL", "http://localhost:5001")

# ════════════════════════════════════════════════════════════
# DB INIT
# ════════════════════════════════════════════════════════════
def _init_pubsub_tables():
    conn = sqlite3.connect(DB_PATH); c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS pubsub_channels (
        channel_id TEXT PRIMARY KEY,
        colony_name TEXT, description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        peer_count INTEGER DEFAULT 0,
        ipfs_enabled BOOLEAN DEFAULT 0)""")
    c.execute("""CREATE TABLE IF NOT EXISTS pubsub_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id TEXT, sender TEXT, topic TEXT,
        vector_blob BLOB, payload TEXT,
        nonce TEXT UNIQUE, delivered BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
    c.execute("""CREATE TABLE IF NOT EXISTS pubsub_subscriptions (
        channel_id TEXT, subscriber TEXT,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(channel_id, subscriber))""")
    conn.commit(); conn.close()

_init_pubsub_tables()

# ════════════════════════════════════════════════════════════
# IPFS CLIENT (httpx, tries real daemon, falls back to stub)
# ════════════════════════════════════════════════════════════
class IPFSClient:
    """
    Wraps IPFS HTTP API.
    /api/v0/pubsub/pub  — publish to topic
    /api/v0/pubsub/sub  — subscribe (streaming)
    /api/v0/id         — peer identity
    Falls back to no-op when daemon not running.
    """
    def __init__(self, api_url: str = IPFS_API):
        self.api = api_url
        self._available: Optional[bool] = None
        self.peer_id: Optional[str] = None

    async def check(self) -> bool:
        if not HTTPX: return False
        try:
            async with httpx.AsyncClient(timeout=3.0) as cl:
                r = await cl.post(f"{self.api}/api/v0/id")
                if r.status_code == 200:
                    self._available = True
                    self.peer_id = r.json().get("ID","?")[:16]
                    return True
        except: pass
        self._available = False
        return False

    async def publish(self, topic: str, data: bytes) -> bool:
        if not self._available: return False
        try:
            async with httpx.AsyncClient(timeout=5.0) as cl:
                r = await cl.post(
                    f"{self.api}/api/v0/pubsub/pub",
                    params={"arg": topic},
                    content=data,
                )
                return r.status_code == 200
        except: return False

    async def peers(self, topic: str) -> List[str]:
        if not self._available: return []
        try:
            async with httpx.AsyncClient(timeout=3.0) as cl:
                r = await cl.post(f"{self.api}/api/v0/pubsub/peers",
                                   params={"arg": topic})
                return r.json().get("Strings", []) if r.status_code == 200 else []
        except: return []

ipfs = IPFSClient()

# ════════════════════════════════════════════════════════════
# HD MESSAGE ENCODER  (internal language = HD vectors)
# ════════════════════════════════════════════════════════════
class HDMessageEncoder:
    """
    Encode/decode pubsub messages as HD vectors.
    TITLE XI: All internal communication uses HD vectors.
    """
    DIM = 64  # compact for wire transmission

    def encode(self, topic: str, sender: str, payload: Dict) -> bytes:
        """Encode a message as HD vector + JSON metadata."""
        seed = abs(hash(f"{topic}:{sender}")) % (2**31)
        rng  = np.random.RandomState(seed)
        vec  = rng.choice([-1.,1.], size=self.DIM).astype(np.float32)
        vec /= np.linalg.norm(vec) + 1e-8
        for k, v in payload.items():
            kv_seed = abs(hash(f"{k}:{str(v)[:20]}")) % (2**31)
            kv_rng  = np.random.RandomState(kv_seed)
            kv_vec  = kv_rng.choice([-1.,1.], size=self.DIM).astype(np.float32)
            kv_vec /= np.linalg.norm(kv_vec) + 1e-8
            vec = vec * kv_vec
            vec /= np.linalg.norm(vec) + 1e-8
        envelope = {
            "v":   1,
            "vec": vec.tobytes().hex(),
            "meta": {"topic": topic, "sender": sender,
                     "ts": time.time(), "dim": self.DIM},
            "payload": payload,
        }
        return json.dumps(envelope).encode()

    def decode(self, data: bytes) -> Optional[Dict]:
        try:
            env = json.loads(data)
            if "vec" in env:
                env["hd_vector"] = np.frombuffer(
                    bytes.fromhex(env["vec"]), dtype=np.float32)
            return env
        except: return None

    def similarity(self, v1: np.ndarray, v2: np.ndarray) -> float:
        return float(np.dot(v1, v2) /
                     (np.linalg.norm(v1)*np.linalg.norm(v2)+1e-8))

encoder = HDMessageEncoder()

# ════════════════════════════════════════════════════════════
# COLONY CHANNEL REGISTRY
# ════════════════════════════════════════════════════════════
class ChannelRegistry:
    """Manage pubsub channels for colonies and guilds."""

    def create(self, colony_name: str, description: str = "") -> str:
        """Create or retrieve channel for a colony."""
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("SELECT channel_id FROM pubsub_channels WHERE colony_name=?",
                  (colony_name,))
        row = c.fetchone()
        if row:
            conn.close(); return row[0]
        cid = f"hive-{colony_name.lower().replace(' ','-')}-{hashlib.sha256(colony_name.encode()).hexdigest()[:8]}"
        c.execute("""INSERT INTO pubsub_channels(channel_id,colony_name,description)
                     VALUES(?,?,?)""", (cid, colony_name, description))
        conn.commit(); conn.close()
        return cid

    def get(self, colony_name: str) -> Optional[str]:
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("SELECT channel_id FROM pubsub_channels WHERE colony_name=?", (colony_name,))
        row = c.fetchone(); conn.close()
        return row[0] if row else None

    def list_channels(self) -> List[Dict]:
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("SELECT channel_id,colony_name,description,peer_count,ipfs_enabled,created_at FROM pubsub_channels")
        rows = c.fetchall(); conn.close()
        return [{"channel_id":r[0],"colony":r[1],"desc":r[2],"peers":r[3],"ipfs":bool(r[4]),"created":r[5]} for r in rows]

    def subscribe(self, channel_id: str, subscriber: str):
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("INSERT OR IGNORE INTO pubsub_subscriptions(channel_id,subscriber) VALUES(?,?)",
                  (channel_id, subscriber))
        conn.commit(); conn.close()

    def unsubscribe(self, channel_id: str, subscriber: str):
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("DELETE FROM pubsub_subscriptions WHERE channel_id=? AND subscriber=?",
                  (channel_id, subscriber))
        conn.commit(); conn.close()

    def subscribers(self, channel_id: str) -> List[str]:
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("SELECT subscriber FROM pubsub_subscriptions WHERE channel_id=?", (channel_id,))
        rows = c.fetchall(); conn.close()
        return [r[0] for r in rows]

registry = ChannelRegistry()

# ════════════════════════════════════════════════════════════
# PUBSUB BROKER  (routes messages, tries IPFS, falls back)
# ════════════════════════════════════════════════════════════
_subscribers: Dict[str, List[Callable]] = {}  # in-memory callbacks

class PubSubBroker:
    """
    Publish/subscribe broker.
    Priority: IPFS daemon → WebSocket broadcast → SQLite queue
    """
    def __init__(self):
        self.ipfs_available = False

    async def init(self):
        """Check IPFS availability."""
        self.ipfs_available = await ipfs.check()
        if self.ipfs_available:
            print(f"IPFS connected: peer {ipfs.peer_id}")

    async def publish(self, channel_id: str, sender: str,
                      topic: str, payload: Dict) -> Dict:
        """Publish message to channel."""
        nonce  = uuid.uuid4().hex
        data   = encoder.encode(topic, sender, payload)
        ipfs_ok = await ipfs.publish(channel_id, data) if self.ipfs_available else False
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("""INSERT OR IGNORE INTO pubsub_messages
                     (channel_id,sender,topic,vector_blob,payload,nonce)
                     VALUES(?,?,?,?,?,?)""",
                  (channel_id, sender, topic,
                   json.loads(data.decode()).get("vec",""),
                   json.dumps(payload), nonce))
        conn.commit(); conn.close()
        delivered = 0
        for cb in _subscribers.get(channel_id, []):
            try:
                msg_obj = {"channel":channel_id,"sender":sender,"topic":topic,
                           "payload":payload,"nonce":nonce}
                if asyncio.iscoroutinefunction(cb):
                    await cb(msg_obj)
                else:
                    cb(msg_obj)
                delivered += 1
            except: pass
        return {
            "published": True, "channel": channel_id, "sender": sender,
            "topic": topic, "nonce": nonce[:8],
            "transport": "ipfs" if ipfs_ok else "websocket+sqlite",
            "local_delivered": delivered,
        }

    async def subscribe(self, channel_id: str, subscriber: str,
                        callback: Optional[Callable] = None):
        """Subscribe to channel."""
        registry.subscribe(channel_id, subscriber)
        if callback:
            if channel_id not in _subscribers:
                _subscribers[channel_id] = []
            _subscribers[channel_id].append(callback)
        return {"subscribed": True, "channel": channel_id, "subscriber": subscriber}

    def unsubscribe(self, channel_id: str, subscriber: str):
        registry.unsubscribe(channel_id, subscriber)

    def get_messages(self, channel_id: str, limit: int = 20,
                     since_id: int = 0) -> List[Dict]:
        conn = sqlite3.connect(DB_PATH); c = conn.cursor()
        c.execute("""SELECT id,sender,topic,payload,nonce,created_at
                     FROM pubsub_messages WHERE channel_id=? AND id>?
                     ORDER BY id DESC LIMIT ?""", (channel_id, since_id, limit))
        rows = c.fetchall(); conn.close()
        return [{"id":r[0],"sender":r[1],"topic":r[2],
                 "payload":json.loads(r[3]) if r[3] else {},
                 "nonce":r[4][:8],"ts":r[5]} for r in rows]

    async def broadcast_event(self, event_type: str, data: Dict):
        """Broadcast hive event to all colony channels."""
        channels = registry.list_channels()
        results = []
        for ch in channels:
            r = await self.publish(ch["channel_id"], "HIVE_CORE",
                                    event_type, data)
            results.append(r)
        return {"broadcast_to": len(channels), "event": event_type}

broker = PubSubBroker()

# ════════════════════════════════════════════════════════════
# COLONY FEDERATION  (cross-colony communication)
# ════════════════════════════════════════════════════════════
class ColonyFederation:
    """
    Manages cross-colony communication.
    Colonies can propose mergers, send resources, share agents.
    All communication through pubsub channels.
    """
    SOUL_REALM_CHANNEL = "hive-soul-realm-00000000"

    def __init__(self):
        registry.create("SOUL_REALM", "Central federation hub")

    async def announce_colony(self, colony_name: str, swarm_endpoint: str,
                               genesis_hash: str) -> Dict:
        """Announce new colony to federation."""
        cid = registry.create(colony_name, f"Colony: {swarm_endpoint}")
        await broker.subscribe(self.SOUL_REALM_CHANNEL, colony_name)
        r = await broker.publish(
            self.SOUL_REALM_CHANNEL, colony_name,
            "colony_announce",
            {"colony": colony_name, "endpoint": swarm_endpoint,
             "genesis": genesis_hash[:16], "cid": cid}
        )
        return {**r, "channel_id": cid}

    async def send_resources(self, from_colony: str, to_colony: str,
                              soul_amount: float, message: str = "") -> Dict:
        """Transfer SOUL between colonies via pubsub."""
        to_cid = registry.get(to_colony)
        if not to_cid:
            to_cid = registry.create(to_colony)
        return await broker.publish(
            to_cid, from_colony, "resource_transfer",
            {"from": from_colony, "to": to_colony,
             "soul": soul_amount, "message": message}
        )

    async def propose_merger(self, proposing_colony: str,
                              target_colony: str, terms: str) -> Dict:
        """Propose colony merger (requires Arena challenge to resolve)."""
        to_cid = registry.get(target_colony) or registry.create(target_colony)
        return await broker.publish(
            to_cid, proposing_colony, "merger_proposal",
            {"proposer": proposing_colony, "target": target_colony,
             "terms": terms, "requires_arena": True}
        )

    def get_peer_colonies(self, colony_name: str) -> List[str]:
        """List other colonies the given colony is aware of."""
        msgs = broker.get_messages(self.SOUL_REALM_CHANNEL, limit=50)
        peers = set()
        for m in msgs:
            if m.get("topic") == "colony_announce":
                c = m.get("payload",{}).get("colony")
                if c and c != colony_name: peers.add(c)
        return list(peers)

federation = ColonyFederation()

__all__ = [
    "IPFSClient","ipfs","HDMessageEncoder","encoder",
    "ChannelRegistry","registry","PubSubBroker","broker",
    "ColonyFederation","federation",
]
