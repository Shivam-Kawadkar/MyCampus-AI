import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import PrepTaskModel, CampusEventModel
from ..schemas import PrepTaskResponse, PrepTaskCreate, PrepTaskUpdate
from ..auth import get_current_demo_user, DemoAccountInfo

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("", response_model=List[PrepTaskResponse])
def get_all_tasks(
    event_id: Optional[str] = Query(None, description="Filter tasks by associated event ID"),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """Retrieve all event preparation checklist tasks for authenticated user."""
    query = db.query(PrepTaskModel).filter(PrepTaskModel.user_id == current_user.id)

    if event_id:
        query = query.filter(PrepTaskModel.event_id == event_id)

    if completed is not None:
        query = query.filter(PrepTaskModel.is_completed == completed)

    # Order tasks by due date
    tasks = query.order_by(PrepTaskModel.due_date.asc()).all()
    return tasks


@router.get("/{task_id}", response_model=PrepTaskResponse)
def get_task_by_id(
    task_id: str,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """Retrieve a single task by ID for authenticated user."""
    task = db.query(PrepTaskModel).filter(
        PrepTaskModel.id == task_id,
        PrepTaskModel.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found."
        )
    return task


@router.post("", response_model=PrepTaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: PrepTaskCreate,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """Create a new event preparation task isolated to current demo user."""
    task_id = task_in.id or f"tsk_{int(time.time() * 1000)}"

    # If associated event exists and title not set, fetch event title
    event_title = task_in.event_title
    if task_in.event_id and not event_title:
        linked_event = db.query(CampusEventModel).filter(
            CampusEventModel.id == task_in.event_id,
            CampusEventModel.user_id == current_user.id
        ).first()
        if linked_event:
            event_title = linked_event.title

    task_dict = task_in.model_dump(by_alias=False)
    task_dict["id"] = task_id
    task_dict["event_title"] = event_title
    task_dict["user_id"] = current_user.id

    new_task = PrepTaskModel(**task_dict)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@router.put("/{task_id}", response_model=PrepTaskResponse)
def update_task(
    task_id: str,
    task_update: PrepTaskUpdate,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """Update task details belonging to current user."""
    task = db.query(PrepTaskModel).filter(
        PrepTaskModel.id == task_id,
        PrepTaskModel.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found."
        )

    update_data = task_update.model_dump(exclude_unset=True, by_alias=False)
    for key, value in update_data.items():
        if key != "user_id":
            setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task


@router.post("/{task_id}/toggle", response_model=PrepTaskResponse)
def toggle_task_completion(
    task_id: str,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """Toggle completion status of a task for authenticated user."""
    task = db.query(PrepTaskModel).filter(
        PrepTaskModel.id == task_id,
        PrepTaskModel.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found."
        )

    task.is_completed = not task.is_completed
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
    db: Session = Depends(get_db),
):
    """Delete a task belonging to current user."""
    task = db.query(PrepTaskModel).filter(
        PrepTaskModel.id == task_id,
        PrepTaskModel.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found."
        )

    db.delete(task)
    db.commit()
    return None
