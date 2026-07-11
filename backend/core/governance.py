"""
Governance Engine — Sovereign Hive
Policy-check orchestration layer wrapping ConstitutionalValidator (F-001..F-006).
Provides audit log, vote tracking, and governance status for the GOVERN tab.
Does NOT reimplement fixed laws — delegates to validator.py.
"""

import json
import threading
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional

from backend.core.db import get_db
from backend.core.validator import ConstitutionalValidator, ValidationResult


@dataclass
class PolicyDecision:
    allowed: bool
    action: str
    requestor: str
    rationale: str
    violated_law: Optional[str] = None
    severity: str = "info"
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "allowed": self.allowed,
            "action": self.action,
            "requestor": self.requestor,
            "rationale": self.rationale,
            "violated_law": self.violated_law,
            "severity": self.severity,
            "timestamp": self.timestamp,
        }


@dataclass
class AuditEntry:
    id: int
    timestamp: str
    action_type: str
    actor: str
    violation: Optional[str]
    decision: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "action_type": self.action_type,
            "actor": self.actor,
            "violation": self.violation,
            "decision": self.decision,
        }


@dataclass
class VoteRecord:
    vote_id: str
    proposal_id: str
    voter: str
    vote: str  # "approve" | "reject" | "abstain"
    rationale: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "vote_id": self.vote_id,
            "proposal_id": self.proposal_id,
            "voter": self.voter,
            "vote": self.vote,
            "rationale": self.rationale,
            "timestamp": self.timestamp,
        }


@dataclass
class VoteTally:
    proposal_id: str
    approve: int
    reject: int
    abstain: int
    total: int
    result: str  # "approved" | "rejected" | "pending"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "proposal_id": self.proposal_id,
            "approve": self.approve,
            "reject": self.reject,
            "abstain": self.abstain,
            "total": self.total,
            "result": self.result,
        }


@dataclass
class GovernanceStatus:
    total_decisions: int
    violations_last_24h: int
    critical_violations: int
    active_proposals: int
    constitution_version: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_decisions": self.total_decisions,
            "violations_last_24h": self.violations_last_24h,
            "critical_violations": self.critical_violations,
            "active_proposals": self.active_proposals,
            "constitution_version": self.constitution_version,
            "timestamp": self.timestamp,
        }


class GovernanceEngine:
    """
    Orchestrates policy decisions across the hive.
    Wraps ConstitutionalValidator — does not reimplement F-001..F-006.
    Maintains vote ledger in SQLite (governance_votes table).
    Reads audit log from constitution_log table (written by validator.py).
    """

    def __init__(self):
        self._validator = ConstitutionalValidator()
        self._lock = threading.Lock()
        self._ensure_vote_table()

    def _ensure_vote_table(self) -> None:
        try:
            conn = get_db()
            conn.execute("""
                CREATE TABLE IF NOT EXISTS governance_votes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    vote_id TEXT UNIQUE NOT NULL,
                    proposal_id TEXT NOT NULL,
                    voter TEXT NOT NULL,
                    vote TEXT NOT NULL,
                    rationale TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_votes_proposal ON governance_votes(proposal_id)"
            )
            conn.commit()
        except Exception:
            pass

    def policy_check(
        self, action: str, context: Dict[str, Any], requestor: str
    ) -> PolicyDecision:
        """Run action through constitutional validator and return a PolicyDecision."""
        result: ValidationResult = self._validator.validate(
            action=action,
            context=context,
            actor=requestor,
        )
        return PolicyDecision(
            allowed=result.allowed,
            action=action,
            requestor=requestor,
            rationale=result.rationale,
            violated_law=result.violated_law,
            severity=result.severity,
            timestamp=result.timestamp,
        )

    def get_audit_log(self, limit: int = 50) -> List[AuditEntry]:
        """Read audit entries from constitution_log, newest first."""
        try:
            conn = get_db()
            rows = conn.execute(
                """SELECT id, timestamp, action_type, actor, violation, decision
                   FROM constitution_log
                   ORDER BY timestamp DESC
                   LIMIT ?""",
                (limit,),
            ).fetchall()
            return [
                AuditEntry(
                    id=r["id"],
                    timestamp=r["timestamp"],
                    action_type=r["action_type"] or "",
                    actor=r["actor"] or "unknown",
                    violation=r["violation"],
                    decision=r["decision"] or "unknown",
                )
                for r in rows
            ]
        except Exception:
            return []

    def submit_vote(
        self, proposal_id: str, voter: str, vote: str, rationale: str
    ) -> VoteRecord:
        """Record a vote on a governance proposal. vote must be approve/reject/abstain."""
        if vote not in ("approve", "reject", "abstain"):
            vote = "abstain"
        record = VoteRecord(
            vote_id=str(uuid.uuid4()),
            proposal_id=proposal_id,
            voter=voter,
            vote=vote,
            rationale=rationale,
        )
        try:
            conn = get_db()
            conn.execute(
                """INSERT INTO governance_votes (vote_id, proposal_id, voter, vote, rationale, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    record.vote_id,
                    record.proposal_id,
                    record.voter,
                    record.vote,
                    record.rationale,
                    record.timestamp,
                ),
            )
            conn.commit()
        except Exception:
            pass
        self.log_governance_event(
            "vote_submitted",
            voter,
            {"proposal_id": proposal_id, "vote": vote},
        )
        return record

    def get_vote_tally(self, proposal_id: str) -> VoteTally:
        """Return vote counts for a proposal."""
        try:
            conn = get_db()
            rows = conn.execute(
                "SELECT vote FROM governance_votes WHERE proposal_id = ?",
                (proposal_id,),
            ).fetchall()
            counts: Dict[str, int] = {"approve": 0, "reject": 0, "abstain": 0}
            for r in rows:
                v = r["vote"]
                if v in counts:
                    counts[v] += 1
            total = sum(counts.values())
            if total == 0:
                result = "pending"
            elif counts["approve"] > counts["reject"]:
                result = "approved"
            elif counts["reject"] > counts["approve"]:
                result = "rejected"
            else:
                result = "pending"
            return VoteTally(
                proposal_id=proposal_id,
                approve=counts["approve"],
                reject=counts["reject"],
                abstain=counts["abstain"],
                total=total,
                result=result,
            )
        except Exception:
            return VoteTally(
                proposal_id=proposal_id,
                approve=0,
                reject=0,
                abstain=0,
                total=0,
                result="pending",
            )

    def log_governance_event(
        self, event_type: str, actor: str, payload: Dict[str, Any]
    ) -> None:
        """Write a governance event to constitution_log."""
        try:
            conn = get_db()
            conn.execute(
                """INSERT INTO constitution_log (timestamp, action_type, actor, violation, decision)
                   VALUES (?, ?, ?, ?, ?)""",
                (
                    datetime.now().isoformat(),
                    event_type,
                    actor,
                    None,
                    json.dumps(payload),
                ),
            )
            conn.commit()
        except Exception:
            pass

    def get_governance_status(self) -> GovernanceStatus:
        """Return high-level governance health metrics."""
        try:
            conn = get_db()
            total = conn.execute(
                "SELECT COUNT(*) as c FROM constitution_log"
            ).fetchone()["c"]

            from datetime import timedelta
            cutoff = (datetime.now() - timedelta(hours=24)).isoformat()
            violations_24h = conn.execute(
                """SELECT COUNT(*) as c FROM constitution_log
                   WHERE timestamp > ? AND violation IS NOT NULL""",
                (cutoff,),
            ).fetchone()["c"]

            critical = conn.execute(
                """SELECT COUNT(*) as c FROM constitution_log
                   WHERE decision LIKE '%critical%'"""
            ).fetchone()["c"]

            active_proposals = conn.execute(
                """SELECT COUNT(DISTINCT proposal_id) as c FROM governance_votes"""
            ).fetchone()["c"]

            constitution_version = "v4.0"
            try:
                import hashlib, os
                soul_path = os.path.join(os.path.dirname(__file__), "../../soul.md")
                if os.path.exists(soul_path):
                    data = open(soul_path, "rb").read()
                    constitution_version = hashlib.sha256(data).hexdigest()[:8]
            except Exception:
                pass

            return GovernanceStatus(
                total_decisions=total,
                violations_last_24h=violations_24h,
                critical_violations=critical,
                active_proposals=active_proposals,
                constitution_version=constitution_version,
            )
        except Exception:
            return GovernanceStatus(
                total_decisions=0,
                violations_last_24h=0,
                critical_violations=0,
                active_proposals=0,
                constitution_version="unknown",
            )


governance_engine = GovernanceEngine()
