"""
Response Models — Sovereign Hive v11.0
Pydantic models for typed FastAPI responses.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    # /v11/health fields
    version: Optional[str] = None
    phase: Optional[int] = None
    # /colony/health fields
    colony: Optional[str] = None
    role: Optional[str] = None
    uptime_seconds: Optional[int] = None
    soul_md_hash: Optional[str] = None
    timestamp: Optional[str] = None
    db: Optional[str] = None


class ColonyInfoResponse(BaseModel):
    name: str
    role: str
    version: str
    soul_md_hash: Optional[str] = None
    guilds: List[str] = []
    phase: Optional[int] = None
    meta_repo: Optional[str] = None
    api_base: Optional[str] = None
    status: Optional[str] = None


class HiveStatusResponse(BaseModel):
    colonies: Dict[str, Any]
    timestamp: str
    queen: str = "THEHIVE"


class ValidationResponse(BaseModel):
    allowed: bool
    violated_law: Optional[str] = None
    rationale: str = ""
    action: Optional[str] = None
    timestamp: Optional[str] = None
    severity: Optional[str] = None


class WealthResponse(BaseModel):
    user_id: str
    tww: float
    vww: float
    w_total: float
    computed_at: str


class AgencyDecisionResponse(BaseModel):
    agent_id: str
    action: str
    level: str
    allowed: bool
    reason: str
    decision_id: str


class HiveEventResponse(BaseModel):
    event_id: str
    status: str
    colony_id: Optional[str] = None
    dispatched_to: Optional[Dict[str, str]] = None
