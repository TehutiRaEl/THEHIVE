"""
Pydantic models for API request/response validation.
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any


class AgentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=64, pattern=r"^[a-zA-Z0-9_]+$")
    description: str = Field(default="", max_length=512)

    @validator("name")
    def validate_name(cls, v):
        if v.lower() in ("admin", "system", "root", "null", "none"):
            raise ValueError("Reserved name not allowed")
        return v


class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=4096)
    system: str = Field(default="", max_length=2048)
    max_tokens: int = Field(default=500, ge=1, le=4096)


class ArenaChallenge(BaseModel):
    agent1: str = Field(..., min_length=1, max_length=64)
    agent2: str = Field(..., min_length=1, max_length=64)
    topic: str = Field(default="", max_length=256)


class GuildAction(BaseModel):
    guild: str
    action: str
    params: Dict[str, Any] = Field(default_factory=dict)


class PhaseInfo(BaseModel):
    current_phase: int
    phase_name: str
    triggers: Dict[str, Any]
    next_phase: Optional[int]
