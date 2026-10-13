from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import UserPreferenceModel
from ..schemas import (
    UserPreferencesResponse,
    UserPreferencesUpdate,
    UserProfileSchema,
    UserProfileUpdate,
)
from ..auth import get_current_demo_user, DemoAccountInfo

router = APIRouter(tags=["Preferences & Profile"])

def get_or_create_preferences(db: Session, user: DemoAccountInfo) -> UserPreferenceModel:
    pref = db.query(UserPreferenceModel).filter(UserPreferenceModel.id == user.id).first()
    if not pref:
        pref = UserPreferenceModel(
            id=user.id,
            theme="midnight-pulse",
            custom_accent=None,
            name=user.name,
            email=user.email,
            student_id=user.student_id,
            department=user.department,
            year_of_study=user.year_of_study,
            campus_name="Stanford Center for Technology & Arts",
            avatar_url=user.avatar_url,
            interests=["Hackathon", "Tech Talk", "Workshop", "Career"],
            notification_settings={
                "email_reminders": True,
                "deadline_alerts": True,
                "ai_recommendations": True,
                "weekly_digest": False,
                "browser_push": True,
            },
            calendar_sync={
                "google": True,
                "apple": False,
                "outlook": False,
            },
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

def to_profile_schema(pref: UserPreferenceModel) -> UserProfileSchema:
    return UserProfileSchema(
        id=pref.id,
        name=pref.name,
        email=pref.email,
        student_id=pref.student_id,
        department=pref.department,
        year_of_study=pref.year_of_study,
        avatar_url=pref.avatar_url,
        campus_name=pref.campus_name,
        interests=pref.interests or [],
        notification_settings=pref.notification_settings or {},
        calendar_sync=pref.calendar_sync or {},
    )

@router.get("/api/preferences", response_model=UserPreferencesResponse)
def get_preferences(
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db)
):
    """Retrieve full user theme preferences and profile settings for authenticated demo user."""
    pref = get_or_create_preferences(db, current_user)
    return UserPreferencesResponse(
        theme=pref.theme,
        custom_accent=pref.custom_accent,
        profile=to_profile_schema(pref)
    )

@router.put("/api/preferences", response_model=UserPreferencesResponse)
def update_preferences(
    updates: UserPreferencesUpdate,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db)
):
    """Update user theme preferences and nested profile details for authenticated user."""
    pref = get_or_create_preferences(db, current_user)

    if updates.theme is not None:
        pref.theme = updates.theme
    if updates.custom_accent is not None:
        pref.custom_accent = updates.custom_accent

    if updates.profile:
        prof_data = updates.profile.model_dump(exclude_unset=True, by_alias=False)
        for key, val in prof_data.items():
            if hasattr(pref, key) and key != "id":
                setattr(pref, key, val)

    db.commit()
    db.refresh(pref)
    return UserPreferencesResponse(
        theme=pref.theme,
        custom_accent=pref.custom_accent,
        profile=to_profile_schema(pref)
    )

@router.get("/api/user/profile", response_model=UserProfileSchema)
def get_user_profile(
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db)
):
    """Retrieve current student profile for authenticated demo user."""
    pref = get_or_create_preferences(db, current_user)
    return to_profile_schema(pref)

@router.patch("/api/user/profile", response_model=UserProfileSchema)
def update_user_profile(
    updates: UserProfileUpdate,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db)
):
    """Update student profile for authenticated demo user."""
    pref = get_or_create_preferences(db, current_user)
    prof_data = updates.model_dump(exclude_unset=True, by_alias=False)
    for key, val in prof_data.items():
        if hasattr(pref, key) and key != "id":
            setattr(pref, key, val)
    db.commit()
    db.refresh(pref)
    return to_profile_schema(pref)
