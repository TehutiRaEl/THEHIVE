import pytest
from backend.auth import create_access_token, verify_auth, hash_password, verify_password
from jose import jwt

def test_password_hashing():
    password = "test_password"
    hashed = hash_password(password)
    assert verify_password(password, hashed)
    assert not verify_password("wrong", hashed)

def test_jwt_token():
    token = create_access_token("user123", "user")
    assert token is not None
    payload = jwt.get_unverified_claims(token)
    assert payload["sub"] == "user123"
    assert payload["role"] == "user"
