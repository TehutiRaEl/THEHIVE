"""
Genesis — Generative Mechanism — Sovereign Hive
Gap Analysis + Emergent Self-Organization.
Nanuet identifies under-explored areas in the tree and spawns mission templates.
Children can propose new structures; Nanuet formalizes viable ones.
"""

import uuid
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Any, Dict, List, Optional

from backend.core.db import get_db
from backend.core.protocol import hive_protocol, MISSION_GENERATED


@dataclass
class Gap:
    id: str
    description: str
    gap_type: str           # "isolated_node" | "sparse_cluster" | "unmet_need"
    severity: float         # 0.0 – 1.0
    evidence: str
    detected_at: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class MissionTemplate:
    id: str
    title: str
    gap_id: str
    description: str
    status: str             # "proposed" | "formalized" | "active" | "archived"
    origin: str             # "gap_analysis" | "child_proposal"
    created_at: str
    formalized_at: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class GapDetector:
    """
    Scans the hive's map and episodic memory for under-explored areas.
    Identifies nodes with no edges, sparse clusters, and unfulfilled patterns.
    """

    # Cluster density threshold below which we flag a gap
    SPARSE_THRESHOLD = 2

    def scan(self) -> List[Gap]:
        """Scan for gaps and return a list of detected Gap objects."""
        conn = get_db()
        gaps: List[Gap] = []

        # Gap type 1: agents that have never been involved in any interaction
        try:
            rows = conn.execute(
                """SELECT a.name FROM agents a
                   WHERE a.status != 'dormant'
                   AND NOT EXISTS (
                       SELECT 1 FROM episodic_memory em WHERE em.agent_name = a.name
                   )
                   LIMIT 20"""
            ).fetchall()
            for row in rows:
                gaps.append(Gap(
                    id=str(uuid.uuid4()),
                    description=f"Agent '{row['name']}' has no episodic memory — fully isolated node.",
                    gap_type="isolated_node",
                    severity=0.7,
                    evidence=f"agent={row['name']}, episodic_count=0",
                    detected_at=datetime.now().isoformat(),
                ))
        except Exception:
            pass

        # Gap type 2: guilds with fewer than SPARSE_THRESHOLD active agents
        try:
            rows = conn.execute(
                """SELECT role, COUNT(*) as cnt FROM agents
                   WHERE status = 'active' GROUP BY role
                   HAVING cnt < ?""",
                (self.SPARSE_THRESHOLD,),
            ).fetchall()
            for row in rows:
                gaps.append(Gap(
                    id=str(uuid.uuid4()),
                    description=(
                        f"Guild/role '{row['role']}' has only {row['cnt']} active agent(s). "
                        "Sparse cluster detected."
                    ),
                    gap_type="sparse_cluster",
                    severity=0.5,
                    evidence=f"role={row['role']}, active_count={row['cnt']}",
                    detected_at=datetime.now().isoformat(),
                ))
        except Exception:
            pass

        # Gap type 3: missions table is empty — no active missions
        try:
            count = conn.execute("SELECT COUNT(*) FROM missions WHERE status = 'active'").fetchone()[0]
            if count == 0:
                gaps.append(Gap(
                    id=str(uuid.uuid4()),
                    description="No active missions detected. The tree has no active growth fronts.",
                    gap_type="unmet_need",
                    severity=0.9,
                    evidence="missions.active_count=0",
                    detected_at=datetime.now().isoformat(),
                ))
        except Exception:
            pass

        return gaps


class MissionGenerator:
    """
    Generates mission templates from detected gaps (strategic layer — Nanuet).
    Also receives and formalizes child proposals (emergent layer).
    """

    _TEMPLATES = {
        "isolated_node": (
            "Integrate {evidence} into the active swarm",
            "An isolated node has been detected. Mission: establish connections, "
            "assign tasks, and integrate this node into the mycelial network."
        ),
        "sparse_cluster": (
            "Grow the {evidence} cluster",
            "A sparse cluster has been detected. Mission: recruit or activate agents "
            "to strengthen this area of the tree."
        ),
        "unmet_need": (
            "Establish new active mission front",
            "The tree has no active growth fronts. Mission: identify the highest-priority "
            "gap in the hive's capabilities and launch a new mission to address it."
        ),
    }

    def generate(self, gap: Gap) -> MissionTemplate:
        """Generate a mission template for a detected gap."""
        title_tmpl, desc_tmpl = self._TEMPLATES.get(
            gap.gap_type,
            ("Address gap: {evidence}", "Unclassified gap detected. Investigate and respond.")
        )
        mission = MissionTemplate(
            id=str(uuid.uuid4()),
            title=title_tmpl.format(evidence=gap.evidence[:60]),
            gap_id=gap.id,
            description=desc_tmpl,
            status="proposed",
            origin="gap_analysis",
            created_at=datetime.now().isoformat(),
        )
        self._persist(mission)
        hive_protocol.publish_sync(MISSION_GENERATED, mission.to_dict())
        return mission

    def receive_child_proposal(self, title: str, description: str, proposer: str) -> MissionTemplate:
        """Accept a mission proposal from a child agent (emergent layer)."""
        mission = MissionTemplate(
            id=str(uuid.uuid4()),
            title=title[:200],
            gap_id="child_proposal",
            description=description,
            status="proposed",
            origin=f"child_proposal:{proposer}",
            created_at=datetime.now().isoformat(),
        )
        self._persist(mission)
        return mission

    def formalize(self, mission_id: str) -> Optional[MissionTemplate]:
        """Nanuet formalizes a proposed mission — it becomes active."""
        conn = get_db()
        conn.execute(
            "UPDATE missions SET status = 'active', formalized_at = ? WHERE id = ?",
            (datetime.now().isoformat(), mission_id),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM missions WHERE id = ?", (mission_id,)).fetchone()
        if not row:
            return None
        d = dict(row)
        return MissionTemplate(**{k: d[k] for k in MissionTemplate.__dataclass_fields__})

    def list_missions(self, status: Optional[str] = None) -> List[Dict]:
        conn = get_db()
        if status:
            rows = conn.execute(
                "SELECT * FROM missions WHERE status = ? ORDER BY created_at DESC LIMIT 100",
                (status,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM missions ORDER BY created_at DESC LIMIT 100"
            ).fetchall()
        return [dict(r) for r in rows]

    def _persist(self, mission: MissionTemplate):
        try:
            conn = get_db()
            conn.execute(
                """INSERT INTO missions
                   (id, title, gap_id, description, status, origin, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    mission.id, mission.title, mission.gap_id,
                    mission.description, mission.status, mission.origin, mission.created_at,
                ),
            )
            conn.commit()
        except Exception:
            pass


gap_detector = GapDetector()
mission_generator = MissionGenerator()
