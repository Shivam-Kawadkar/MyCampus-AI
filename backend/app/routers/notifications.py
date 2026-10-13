from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CampusNotificationModel, CampusEventModel
from ..schemas import CampusNotificationResponse, PendingDeadlineResponse
from ..auth import get_current_demo_user, DemoAccountInfo

router = APIRouter(tags=["Notifications & Deadlines"])

@router.get("/api/notifications", response_model=List[CampusNotificationResponse])
def get_notifications(
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db)
):
    """Retrieve all notifications for the authenticated demo user."""
    return (
        db.query(CampusNotificationModel)
        .filter(CampusNotificationModel.user_id == current_user.id)
        .order_by(CampusNotificationModel.id.desc())
        .all()
    )

@router.post("/api/notifications/{notification_id}/read", status_code=status.HTTP_200_OK)
def mark_notification_read(
    notification_id: str,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db)
):
    """Mark a single notification as read for authenticated user."""
    notif = db.query(CampusNotificationModel).filter(
        CampusNotificationModel.id == notification_id,
        CampusNotificationModel.user_id == current_user.id
    ).first()
    if notif:
        notif.read = True
        db.commit()
    return {"status": "success"}

@router.post("/api/notifications/read-all", status_code=status.HTTP_200_OK)
def mark_all_notifications_read(
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for authenticated user."""
    db.query(CampusNotificationModel).filter(
        CampusNotificationModel.user_id == current_user.id
    ).update({"read": True})
    db.commit()
    return {"status": "success"}

@router.get("/api/deadlines", response_model=List[PendingDeadlineResponse])
def get_deadlines(
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db)
):
    """Retrieve all upcoming event deadlines for authenticated demo user."""
    events = db.query(CampusEventModel).filter(
        CampusEventModel.user_id == current_user.id,
        CampusEventModel.registration_deadline.isnot(None)
    ).all()
    deadlines: List[PendingDeadlineResponse] = []
    for e in events:
        deadlines.append(
            PendingDeadlineResponse(
                id=f"dl_{e.id}",
                event_id=e.id,
                event_title=e.title,
                category=e.category,
                title=f"Registration closes for {e.title}",
                deadline_date=e.registration_deadline,
                deadline_time="11:59 PM",
                is_urgent=e.registration_status != "registered",
                action_url=e.external_url,
            )
        )
    deadlines.sort(key=lambda d: d.deadline_date)
    return deadlines
