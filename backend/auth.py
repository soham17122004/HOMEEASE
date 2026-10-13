"""
Authentication & Authorization for Admin Panel
- PBKDF2-HMAC-SHA256 password hashing with random salt
- HMAC-SHA256 signed bearer session tokens
- Strict ADMIN_EMAIL enforcement
- Failed login rate-limiting (5 failed attempts locks out for 15 minutes)
- Admin dependency for protecting FastAPI endpoints
"""

import os
import time
import json
import base64
import hmac
import hashlib
from typing import Optional
from datetime import datetime
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db

# Authorized Administrator Email/ID configuration (supports 'junagadh' and 'admin@homeease.in')
AUTHORIZED_ADMIN_IDENTIFIERS = {
    os.getenv("ADMIN_EMAIL", "junagadh").strip().lower(),
    os.getenv("ADMIN_ID", "junagadh").strip().lower(),
    "junagadh",
    "junagadh@homeease.in",
    "admin@homeease.in",
}
AUTHORIZED_ADMIN_EMAIL = "junagadh"


def is_authorized_admin_identifier(identifier: str) -> bool:
    """Checks whether an identifier (email or username) is authorized for admin access."""
    if not identifier:
        return False
    return identifier.strip().lower() in AUTHORIZED_ADMIN_IDENTIFIERS

# Secret key for HMAC token signing
TOKEN_SECRET = os.getenv("ADMIN_TOKEN_SECRET", "homeease_junagadh_secret_key_2026_super_secure").encode("utf-8")
TOKEN_EXPIRY_SECONDS = 24 * 3600  # 24 hours

# Rate limiting in-memory tracking: { email_or_ip: {"attempts": int, "locked_until": float} }
LOGIN_ATTEMPTS = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_SECONDS = 15 * 60  # 15 minutes

# Blacklisted invalidated tokens on logout: set of token signatures
REVOKED_TOKENS = set()

security_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hashes password with PBKDF2-HMAC-SHA256 using 100,000 iterations and random salt."""
    salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}:{key}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verifies plain password against salt:key stored hash."""
    try:
        salt, key = stored_hash.split(":")
        computed = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return hmac.compare_digest(computed, key)
    except Exception:
        return False


def create_admin_token(email: str) -> str:
    """Creates an HMAC-SHA256 signed session token for the authorized admin."""
    payload = {
        "sub": email.lower(),
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_EXPIRY_SECONDS,
        "nonce": os.urandom(8).hex()
    }
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8")).decode("utf-8")
    signature = hmac.new(TOKEN_SECRET, payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{signature}"


def verify_admin_token(token: str) -> Optional[dict]:
    """Verifies HMAC token signature, revocation, and expiration."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_b64, signature = parts

        # Check revocation
        if signature in REVOKED_TOKENS:
            return None

        # Verify signature
        expected_sig = hmac.new(TOKEN_SECRET, payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None

        # Decode payload
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))

        # Verify expiration
        if time.time() > payload.get("exp", 0):
            return None

        return payload
    except Exception:
        return None


def revoke_token(token: str) -> None:
    """Revokes token signature upon logout."""
    try:
        parts = token.split(".")
        if len(parts) == 2:
            REVOKED_TOKENS.add(parts[1])
    except Exception:
        pass


def check_rate_limit(key: str) -> None:
    """Checks if key is currently locked out."""
    now = time.time()
    record = LOGIN_ATTEMPTS.get(key)
    if record and record.get("locked_until", 0) > now:
        remaining = int(record["locked_until"] - now)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Account temporarily locked for security. Please try again in {remaining // 60 + 1} minutes."
        )


def record_failed_attempt(key: str) -> None:
    """Increments failed attempt count and locks if threshold is reached."""
    now = time.time()
    record = LOGIN_ATTEMPTS.get(key, {"attempts": 0, "locked_until": 0})
    record["attempts"] += 1
    if record["attempts"] >= MAX_FAILED_ATTEMPTS:
        record["locked_until"] = now + LOCKOUT_DURATION_SECONDS
        record["attempts"] = 0
    LOGIN_ATTEMPTS[key] = record


def clear_failed_attempts(key: str) -> None:
    """Clears attempt counter on successful login."""
    if key in LOGIN_ATTEMPTS:
        del LOGIN_ATTEMPTS[key]


def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
):
    """
    FastAPI dependency that protects endpoints.
    Rejects missing tokens, invalid signatures, expired tokens, or emails not matching AUTHORIZED_ADMIN_EMAIL.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required. Please login.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = credentials.credentials
    payload = verify_admin_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or is invalid. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    email = payload.get("sub", "").lower()
    if not is_authorized_admin_identifier(email):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: This account is not authorized as an administrator."
        )

    return {"email": email, "token": token}
