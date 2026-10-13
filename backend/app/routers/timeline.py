from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CampusEventModel, PrepTaskModel
from ..schemas import TimelineItem
from ..auth import get_current_demo_user, DemoAccountInfo

router = APIRouter(prefix="/api/timeline", tags=["Timeline"])

@router.get("", response_model=List[TimelineItem])
def get_timeline(
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db)
):
    """
    Returns a unified chronological timeline feed combining event session dates,
    registration deadlines, and preparation task due dates isolated to current demo user.
    """
    events = db.query(CampusEventModel).filter(CampusEventModel.user_id == current_user.id).all()
    tasks = db.query(PrepTaskModel).filter(PrepTaskModel.user_id == current_user.id).all()

    items: List[TimelineItem] = []

    # 1. Event Days
    for e in events:
        items.append(
            TimelineItem(
                id=f"tl_evt_{e.id}",
                type="event",
                date=e.start_date,
                time=e.start_time,
                title=e.title,
                event_id=e.id,
                event_title=e.title,
                category=e.category,
                status=e.registration_status,
            )
        )

        # 2. Registration Deadlines
        if e.registration_deadline:
            items.append(
                TimelineItem(
                    id=f"tl_dl_{e.id}",
                    type="deadline",
                    date=e.registration_deadline,
                    time="11:59 PM",
                    title=f"RSVP Deadline: {e.title}",
                    event_id=e.id,
                    event_title=e.title,
                    category=e.category,
                    status=e.registration_status,
                )
            )

    # 3. Preparation Tasks
    for t in tasks:
        items.append(
            TimelineItem(
                id=f"tl_tsk_{t.id}",
                type="task",
                date=t.due_date,
                time=t.due_time or "EOD",
                title=t.title,
                event_id=t.event_id,
                event_title=t.event_title,
                priority=t.priority,
                is_completed=t.is_completed,
            )
        )

    # Sort items chronologically by date and time
    items.sort(key=lambda x: (x.date, x.time or ""))

    return items
