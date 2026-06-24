"""
Authentication Module — Sovereign Hive v11.0
JWT + API key authentication for all endpoints.
"""

import jwt
import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader

from backend.core.config import settings

security_jwt = HTTPBearer(auto_error=False)
security_api_key = APIKeyHeader(name="X-API-Key", auto_error=False)

def create_access_token(user_id: str, role: str = "user") -> str:
    """Create a JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expire},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )

def verify_websocket_auth(token: str) -> bool:
    """Verify WebSocket authentication token."""
    if token == settings.api_key:
        return True
    try:
        jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return True
    except jwt.JWTError:
        return False

async def verify_auth(
    jwt_creds: Optional[HTTPAuthorizationCredentials] = Depends(security_jwt),
    api_key: Optional[str] = Depends(security_api_key)
) -> Dict:
    """
    Verify JWT or API key on ALL endpoints.
    Returns authenticated user info.
    """
    # Try JWT first
    if jwt_creds:
        try:
            payload = jwt.decode(
                jwt_creds.credentials,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
                options={"verify_exp": True}
            )
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expired",
                    headers={"X-Token-Expired": "true", "WWW-Authenticate": "Bearer"}
                )
            return {
                "authenticated": True,
                "method": "jwt",
                "user": payload.get("sub", "unknown"),
                "role": payload.get("role", "user")
            }
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"X-Token-Expired": "true", "WWW-Authenticate": "Bearer"}
            )
        except jwt.JWTError:
            pass

    # Try API key
    if api_key:
        if secrets.compare_digest(api_key, settings.api_key):
            return {"authenticated": True, "method": "api_key", "user": "system", "role": "admin"}

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required"
    )

async def get_current_user(auth: Dict = Depends(verify_auth)) -> str:
    """Get the current authenticated user ID."""
    return auth.get("user", "unknown")

async def get_current_role(auth: Dict = Depends(verify_auth)) -> str:
    """Get the current authenticated user's role."""
    return auth.get("role", "user")
