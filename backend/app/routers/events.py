import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import CampusEventModel
from ..schemas import (
    CampusEventResponse,
    CampusEventCreate,
    CampusEventUpdate,
    EventStatusUpdate,
    ScheduleConflict,
)
from ..services.scheduler import validate_event_time_range, detect_schedule_conflicts
from ..auth import get_current_demo_user, DemoAccountInfo

router = APIRouter(prefix="/api/events", tags=["Events"])

@router.get("", response_model=List[CampusEventResponse])
def get_all_events(
    category: Optional[str] = Query(None, description="Filter by event category"),
    status: Optional[str] = Query(None, description="Filter by registration status"),
    search: Optional[str] = Query(None, description="Search by title, organizer, or venue"),
    limit: Optional[int] = Query(100, ge=1, le=500),
    offset: Optional[int] = Query(0, ge=0),
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """Retrieve all campus events for the authenticated demo user."""
    query = db.query(CampusEventModel).filter(CampusEventModel.user_id == current_user.id)

    if category and category.lower() != "all":
        query = query.filter(CampusEventModel.category == category)

    if status and status.lower() != "all":
        query = query.filter(CampusEventModel.registration_status == status)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                CampusEventModel.title.ilike(search_filter),
                CampusEventModel.organizer.ilike(search_filter),
                CampusEventModel.venue.ilike(search_filter),
                CampusEventModel.short_description.ilike(search_filter),
            )
        )

    # Order by start_date ascending
    events = query.order_by(CampusEventModel.start_date.asc()).offset(offset).limit(limit).all()
    return events


@router.get("/conflicts", response_model=List[ScheduleConflict])
def get_event_schedule_conflicts(
    only_registered: bool = Query(True, description="Check only registered events for conflicts"),
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """
    Deterministic rule-based scheduling logic:
    Returns any overlapping events in the authenticated user's schedule.
    """
    events = db.query(CampusEventModel).filter(CampusEventModel.user_id == current_user.id).all()
    conflicts = detect_schedule_conflicts(events, only_registered=only_registered)
    return conflicts


@router.get("/{event_id}", response_model=CampusEventResponse)
def get_event_by_id(
    event_id: str,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """Retrieve single event details by event ID for authenticated demo user."""
    event = db.query(CampusEventModel).filter(
        CampusEventModel.id == event_id,
        CampusEventModel.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found."
        )
    return event


@router.post("", response_model=CampusEventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: CampusEventCreate,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """Create a new campus event with date/time range validation isolated to current user."""
    # Deterministic date validation
    is_valid, error_msg = validate_event_time_range(
        event_in.start_date,
        event_in.start_time,
        event_in.end_date,
        event_in.end_time,
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=error_msg or "Invalid event date or time range."
        )

    event_id = event_in.id or f"evt_{int(time.time() * 1000)}"
    
    # Check duplicate ID
    if db.query(CampusEventModel).filter(CampusEventModel.id == event_id).first():
        event_id = f"evt_{int(time.time() * 1000)}"

    event_dict = event_in.model_dump(by_alias=False)
    event_dict["id"] = event_id
    event_dict["user_id"] = current_user.id

    # Normalize nested structures for JSON columns
    if "speakers" in event_dict and event_dict["speakers"]:
        event_dict["speakers"] = [s if isinstance(s, dict) else s.model_dump(by_alias=True) for s in event_dict["speakers"]]
    if "schedule" in event_dict and event_dict["schedule"]:
        event_dict["schedule"] = [s if isinstance(s, dict) else s.model_dump(by_alias=True) for s in event_dict["schedule"]]

    new_event = CampusEventModel(**event_dict)
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event


@router.put("/{event_id}", response_model=CampusEventResponse)
def update_event(
    event_id: str,
    event_update: CampusEventUpdate,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """Update event fields belonging to current user."""
    event = db.query(CampusEventModel).filter(
        CampusEventModel.id == event_id,
        CampusEventModel.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found."
        )

    update_data = event_update.model_dump(exclude_unset=True, by_alias=False)

    # If date/time updated, re-validate
    s_date = update_data.get("start_date", event.start_date)
    s_time = update_data.get("start_time", event.start_time)
    e_date = update_data.get("end_date", event.end_date)
    e_time = update_data.get("end_time", event.end_time)
    is_valid, error_msg = validate_event_time_range(s_date, s_time, e_date, e_time)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=error_msg
        )

    for key, value in update_data.items():
        if key != "user_id":
            setattr(event, key, value)

    db.commit()
    db.refresh(event)
    return event


@router.patch("/{event_id}/status", response_model=CampusEventResponse)
def update_event_status(
    event_id: str,
    status_update: EventStatusUpdate,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """Update only registration status (e.g., registered, not_registered, waitlisted)."""
    event = db.query(CampusEventModel).filter(
        CampusEventModel.id == event_id,
        CampusEventModel.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found."
        )

    event.registration_status = status_update.registration_status
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: str,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """Delete an event and its associated prep tasks."""
    event = db.query(CampusEventModel).filter(
        CampusEventModel.id == event_id,
        CampusEventModel.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found."
        )

    db.delete(event)
    db.commit()
    return None
