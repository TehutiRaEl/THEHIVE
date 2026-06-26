"""
Configuration Module — Sovereign Hive v11.0
Centralizes all settings with environment variable override.
"""

import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # ─── Security ──────────────────────────────────────────────
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "super-secret-change-me")
    api_key: str = os.getenv("JASPER_API_KEY", "dev-api-key")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # ─── Database ──────────────────────────────────────────────
    db_path: str = os.getenv("DB_PATH", "jasper_memory.db")
    chroma_path: str = os.getenv("CHROMA_PATH", "./chroma_db")
    
    # ─── Rate Limiting ──────────────────────────────────────────
    rate_limit_requests: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    rate_limit_window: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))
    
    # ─── Economy ────────────────────────────────────────────────
    soul_to_usd_rate: float = float(os.getenv("SOUL_TO_USD_RATE", "0.10"))
    staking_apy: float = float(os.getenv("STAKING_APY", "0.05"))
    staking_lock_days: int = int(os.getenv("STAKING_LOCK_DAYS", "30"))
    staking_min_amount: float = float(os.getenv("STAKING_MIN_AMOUNT", "1.0"))
    doubling_threshold: float = float(os.getenv("DOUBLING_THRESHOLD", "0.707"))
    decay_rate: float = float(os.getenv("DECAY_RATE", "0.95"))
    
    # ─── LLM ────────────────────────────────────────────────────
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model: str = os.getenv("OLLAMA_MODEL", "llama3:8b")
    llm_provider: str = os.getenv("LLM_PROVIDER", "auto")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # ─── CORS ────────────────────────────────────────────────────
    cors_origins: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:8080,http://localhost:3000").split(",")
    
    # ─── Tier 3 ──────────────────────────────────────────────────
    ibmq_token: str = os.getenv("IBMQ_TOKEN", "")
    ipfs_api_url: str = os.getenv("IPFS_API_URL", "http://localhost:5001")

    # ─── Phase ──────────────────────────────────────────────────
    hive_phase: int = int(os.getenv("HIVE_PHASE", "0"))
    enable_guilds: List[str] = os.getenv("ENABLE_GUILDS", "constitutional,audit,treasury").split(",")

    # ─── Colony / Multi-Repo Hive ────────────────────────────────
    colony_name: str = os.getenv("COLONY_NAME", "THEHIVE")
    colony_role: str = os.getenv("COLONY_ROLE", "core")
    meta_repo_url: str = os.getenv("META_REPO_URL", "https://github.com/TehutiRaEl/sovereign-hive-meta")
    known_colonies: List[str] = os.getenv(
        "KNOWN_COLONIES",
        "THEHIVE|core|http://localhost:8080|"
        "aether|revenue|https://aether.vercel.app|"
        "automatisch|automation|http://localhost:3001|"
        "kimi-gateway|llm|http://localhost:8181|"
        "academy|knowledge|https://github.com/TehutiRaEl/free-programming-books",
    ).split(",")

    # ─── LLM Gateway ─────────────────────────────────────────────
    llm_gateway_url: str = os.getenv("LLM_GATEWAY_URL", "http://localhost:8181")

    # ─── Free LLM API Keys (all optional) ──────────────────────
    moonshot_api_key: str = os.getenv("MOONSHOT_API_KEY", "")
    siliconflow_api_key: str = os.getenv("SILICONFLOW_API_KEY", "")
    deepseek_api_key: str = os.getenv("DEEPSEEK_API_KEY", "")
    zhipu_api_key: str = os.getenv("ZHIPU_API_KEY", "")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    
    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"

settings = Settings()
