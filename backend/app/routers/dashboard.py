from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CampusEventModel, PrepTaskModel
from ..schemas import (
    DashboardSummaryResponse,
    PendingDeadlineResponse,
    CampusEventResponse,
    PrepTaskResponse,
)
from ..services.scheduler import detect_schedule_conflicts
from ..auth import get_current_demo_user, DemoAccountInfo

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated metrics, upcoming registered events, pending registration deadlines,
    active preparation tasks, and schedule conflicts isolated to the authenticated demo user.
    """
    all_events = (
        db.query(CampusEventModel)
        .filter(CampusEventModel.user_id == current_user.id)
        .order_by(CampusEventModel.start_date.asc())
        .all()
    )
    all_tasks = (
        db.query(PrepTaskModel)
        .filter(PrepTaskModel.user_id == current_user.id)
        .order_by(PrepTaskModel.due_date.asc())
        .all()
    )

    registered_events = [
        e for e in all_events 
        if e.registration_status in ("registered", "attended", "waitlisted")
    ]

    # Synthesize pending deadlines for events that require registration
    pending_deadlines: List[PendingDeadlineResponse] = []
    for e in all_events:
        if e.registration_deadline and e.registration_status != "attended":
            pending_deadlines.append(
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

    # Sort deadlines by date
    pending_deadlines.sort(key=lambda d: d.deadline_date)

    # Weekly active tasks
    weekly_tasks = [t for t in all_tasks if not t.is_completed][:8]
    completed_tasks = [t for t in all_tasks if t.is_completed]

    # Detect conflicts among registered events using deterministic scheduler
    conflicts = detect_schedule_conflicts(all_events, only_registered=True)

    return DashboardSummaryResponse(
        events_count=len(all_events),
        registered_count=len(registered_events),
        pending_deadlines_count=len(pending_deadlines),
        tasks_count=len(all_tasks),
        completed_tasks_count=len(completed_tasks),
        upcoming_registered=[CampusEventResponse.model_validate(e) for e in registered_events[:6]],
        pending_deadlines=pending_deadlines[:6],
        weekly_tasks=[PrepTaskResponse.model_validate(t) for t in weekly_tasks],
        conflicts=conflicts,
    )
