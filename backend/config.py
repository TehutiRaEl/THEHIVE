"""
Sovereign Hive Configuration
Uses Pydantic Settings for validation and fail-fast behavior.
"""
import os
import secrets
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Config(BaseSettings):
    """Hive configuration with validation."""

    # LLM
    ollama_base_url: str = Field(default="http://localhost:11434", env="OLLAMA_BASE_URL")
    ollama_model: str = Field(default="llama3:8b", env="OLLAMA_MODEL")
    llm_provider: str = Field(default="ollama", env="LLM_PROVIDER")
    anthropic_api_key: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")

    # Security — NO auto-generated fallbacks. Must be explicitly set.
    jwt_secret_key: str = Field(..., env="JWT_SECRET_KEY")
    api_key: str = Field(..., env="JASPER_API_KEY")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Economy
    soul_to_usd_rate: float = Field(default=0.10, env="SOUL_TO_USD_RATE")
    staking_apy: float = Field(default=0.05, env="STAKING_APY")
    doubling_threshold: float = Field(default=0.707, env="DOUBLING_THRESHOLD")
    trust_split: float = Field(default=0.10, env="TRUST_SPLIT")
    treasury_split: float = Field(default=0.20, env="TREASURY_SPLIT")
    agent_split: float = Field(default=0.70, env="AGENT_SPLIT")

    # Rate Limiting
    rate_limit_requests: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=60, env="RATE_LIMIT_WINDOW")

    # CORS
    cors_origins: List[str] = Field(default=["http://localhost:8080"], env="CORS_ORIGINS")

    # Phase control
    hive_phase: int = Field(default=0, env="HIVE_PHASE")
    enable_guilds: List[str] = Field(default=["constitutional", "audit", "treasury"], env="ENABLE_GUILDS")

    # Paths
    db_path: str = Field(default="jasper_memory.db", env="DB_PATH")
    chroma_path: str = Field(default="chroma_db", env="CHROMA_PATH")
    secrets_path: str = Field(default=".secrets", env="SECRETS_PATH")

    @validator("jwt_secret_key", "api_key")
    def validate_not_default(cls, v, values, **kwargs):
        if not v or len(v) < 16:
            raise ValueError("Secret keys must be at least 16 characters. Set them in .env")
        return v

    @validator("cors_origins", pre=True, always=True)
    def parse_cors(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @validator("enable_guilds", pre=True, always=True)
    def parse_guilds(cls, v):
        if isinstance(v, str):
            return [g.strip() for g in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Singleton instance
settings = Config()
