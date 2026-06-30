"""
Authentication Module — Sovereign Hive v11.0
JWT + API key authentication for all endpoints.
"""

from jose import jwt
import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader

from backend.core.config import settings
from backend.core.db import get_db, close_db

# ─── Security Schemas ──────────────────────────────────────────
security_jwt = HTTPBearer(auto_error=False)
security_api_key = APIKeyHeader(name="X-API-Key", auto_error=False)

def create_access_token(user_id: str, role: str = "user") -> str:
    """Create a JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    if len(settings.jwt_secret_key) < 32:
        import logging
        logging.getLogger("jasper.auth").warning(
            "JWT secret is shorter than 32 chars — use a strong secret in production"
        )
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expire, "iss": "sovereign-hive"},
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
                options={"verify_exp": True},
                issuer="sovereign-hive",
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
            return {
                "authenticated": True,
                "method": "api_key",
                "user": "system",
                "role": "admin"
            }
        # Check rotated keys
        try:
            conn = get_db()
            c = conn.cursor()
            c.execute("""
                SELECT key_hash FROM api_key_rotation
                WHERE is_active=1 AND expires_at > datetime('now', '-1 hour')
            """)
            for row in c.fetchall():
                if secrets.compare_digest(api_key, row[0]):
                    return {
                        "authenticated": True,
                        "method": "api_key_rotated",
                        "user": "system",
                        "role": "admin"
                    }
        except Exception:
            pass
        finally:
            close_db()

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

async def require_admin(auth: Dict = Depends(verify_auth)) -> bool:
    """Require admin role for access."""
    if auth.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return True

async def get_current_user_id(auth: Dict = Depends(verify_auth)) -> str:
    """Get the current user ID."""
    return auth.get("user", "unknown")

def create_refresh_token(user_id: str, role: str = "user") -> str:
    """Create a refresh token with longer expiry."""
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expire, "refresh": True, "iss": "sovereign-hive"},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )

def decode_token(token: str) -> Optional[Dict]:
    """Decode a JWT token without verification."""
    try:
        return jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"verify_exp": False}
        )
    except jwt.JWTError:
        return None

def is_token_expired(token: str) -> bool:
    """Check if a token is expired."""
    payload = decode_token(token)
    if not payload:
        return True
    exp = payload.get("exp")
    if not exp:
        return True
    return datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc)

async def optional_auth(
    jwt_creds: Optional[HTTPAuthorizationCredentials] = Depends(security_jwt),
    api_key: Optional[str] = Depends(security_api_key)
) -> Dict:
    """
    Optional authentication — returns user info if provided, else guest.
    """
    try:
        return await verify_auth(jwt_creds, api_key)
    except HTTPException:
        return {
            "authenticated": False,
            "method": "guest",
            "user": "guest",
            "role": "guest"
        }
