"""
Demo Authentication and Session Management for MyCampus
-------------------------------------------------------
Lightweight, signed session token implementation designed exclusively for
judging and demonstration purposes.

Features:
- Fixed demo accounts (Demo 1: Explorer, Demo 2: Organizer, Demo 3: AI Tester)
- Signed session tokens with HMAC-SHA256 and expiration
- Strict payload verification
- Dependency injection for protected endpoints
- Explicit rejection of admin privileges for demo accounts
"""

import os
import hmac
import hashlib
import base64
import json
import time
from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)

def get_jwt_secret() -> str:
    from dotenv import load_dotenv
    load_dotenv()
    return os.getenv(
        "DEMO_JWT_SECRET", 
        "mycampus_demo_secret_2026_collegiate_judges_evaluation"
    ).strip().strip('"\'')

TOKEN_EXPIRY_SECONDS = 24 * 60 * 60  # 24 hours

class DemoAccountInfo(BaseModel):
    id: str
    email: str
    password: str
    name: str
    role: str
    role_title: str
    department: str
    student_id: str
    year_of_study: str
    avatar_url: str
    is_admin: bool = False

class DemoLoginRequest(BaseModel):
    email: str
    password: str

class DemoLoginResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    expires_in: int
    user: DemoAccountInfo

# Fixed demo accounts for judging and demonstration
DEMO_ACCOUNTS: Dict[str, DemoAccountInfo] = {
    "demo1@mycampus.demo": DemoAccountInfo(
        id="demo_user_1",
        email="demo1@mycampus.demo",
        password="demo123",
        name="Jordan Lee",
        role="explorer",
        role_title="Campus Explorer",
        department="Computer Science & Interactive Media",
        student_id="EXP-2026-1042",
        year_of_study="2nd Year (Sophomore)",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        is_admin=False,
    ),
    "demo2@mycampus.demo": DemoAccountInfo(
        id="demo_user_2",
        email="demo2@mycampus.demo",
        password="demo123",
        name="Maya Patel",
        role="organizer",
        role_title="Event Organizer (ACM Vice Chair)",
        department="Software Systems & Management",
        student_id="ORG-2026-4481",
        year_of_study="3rd Year (Junior)",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
        is_admin=False,
    ),
    "demo3@mycampus.demo": DemoAccountInfo(
        id="demo_user_3",
        email="demo3@mycampus.demo",
        password="demo123",
        name="Devon Brooks",
        role="ai_tester",
        role_title="AI Feature Tester",
        department="Artificial Intelligence & Data Systems",
        student_id="AI-2026-9901",
        year_of_study="4th Year (Senior)",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        is_admin=False,
    ),
}

def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

def _b64decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding < 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data)

def create_demo_token(user: DemoAccountInfo) -> str:
    """Creates an HMAC-SHA256 signed session token for a demo user."""
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    payload = {
        "sub": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "role_title": user.role_title,
        "is_admin": user.is_admin,
        "iat": now,
        "exp": now + TOKEN_EXPIRY_SECONDS,
    }

    header_b64 = _b64encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")

    signature = hmac.new(
        get_jwt_secret().encode("utf-8"),
        signing_input,
        hashlib.sha256
    ).digest()
    signature_b64 = _b64encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"

def verify_demo_token(token: str) -> Dict[str, Any]:
    """Verifies HMAC-SHA256 signature and expiration on demo session tokens."""
    if not token or not isinstance(token, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token is missing."
        )

    parts = token.split(".")
    if len(parts) != 3:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed session token."
        )

    header_b64, payload_b64, signature_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    expected_sig = hmac.new(
        get_jwt_secret().encode("utf-8"),
        signing_input,
        hashlib.sha256
    ).digest()
    expected_sig_b64 = _b64encode(expected_sig)

    if not hmac.compare_digest(signature_b64, expected_sig_b64):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid demo session signature."
        )

    try:
        payload_bytes = _b64decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session payload encoding."
        )

    # Expiry verification
    now = int(time.time())
    if "exp" in payload and payload["exp"] < now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Demo session has expired. Please sign in again."
        )

    return payload

def get_current_demo_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> DemoAccountInfo:
    """
    FastAPI dependency that validates the demo session token from the Authorization header.
    Rejects unauthenticated or invalid requests with 401 Unauthorized.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in via demo login.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_demo_token(credentials.credentials)
    user_id = payload.get("sub")
    email = payload.get("email")

    # Match against demo accounts
    matched_account = None
    for account in DEMO_ACCOUNTS.values():
        if account.id == user_id or account.email == email:
            matched_account = account
            break

    if not matched_account:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Demo account identity could not be verified."
        )

    return matched_account

def require_admin_user(
    current_user: DemoAccountInfo = Depends(get_current_demo_user)
) -> DemoAccountInfo:
    """
    Strictly verifies admin privileges.
    Demo accounts are explicitly non-admin and rejected with 403 Forbidden.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Demo accounts do not have administrator privileges."
        )
    return current_user

