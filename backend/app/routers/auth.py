from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import (
    DEMO_ACCOUNTS,
    DemoAccountInfo,
    DemoLoginRequest,
    DemoLoginResponse,
    create_demo_token,
    get_current_demo_user,
    require_admin_user,
    TOKEN_EXPIRY_SECONDS,
)
from ..seed import reset_all_demo_data

router = APIRouter(prefix="/api/auth", tags=["Demo Authentication"])

@router.post("/demo-login", response_model=DemoLoginResponse)
def demo_login(req: DemoLoginRequest):
    """
    Demo authentication endpoint for judges.
    Validates credentials against configured demo accounts (demo1, demo2, demo3).
    Issues signed HMAC-SHA256 session token.
    """
    email_clean = req.email.strip().lower()
    account = DEMO_ACCOUNTS.get(email_clean)

    if not account or account.password != req.password.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid demo credentials. Please select one of the three demo accounts.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_demo_token(account)
    return DemoLoginResponse(
        token=token,
        token_type="bearer",
        expires_in=TOKEN_EXPIRY_SECONDS,
        user=account,
    )

@router.get("/me", response_model=DemoAccountInfo)
def get_current_user(
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
):
    """Returns the authenticated demo user profile."""
    return current_user

@router.post("/reset-demo-data")
def reset_demo_data(
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """Restores sample fictional demo data for all 3 demo accounts."""
    reset_all_demo_data(db)
    return {
        "status": "success",
        "message": "Demo data restored to initial state for all accounts.",
        "active_user": current_user.email,
    }

@router.get("/admin-check")
def admin_check(
    admin: DemoAccountInfo = Depends(require_admin_user),
):
    """Admin-only endpoint. Demo accounts are rejected with 403 Forbidden."""
    return {"status": "ok", "admin": True}
