import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Integer,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from .database import Base

class CampusEventModel(Base):
    """SQLAlchemy model for campus events."""
    __tablename__ = "events"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), nullable=False, default="demo_user_1", index=True)
    title = Column(String(255), nullable=False, index=True)
    short_description = Column(Text, nullable=False)
    full_description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    organizer = Column(String(150), nullable=False)
    organizer_email = Column(String(150), nullable=True)
    club_logo = Column(String(500), nullable=True)
    banner_image = Column(String(500), nullable=False)
    start_date = Column(String(20), nullable=False, index=True)
    start_time = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=False)
    venue = Column(String(255), nullable=False)
    room = Column(String(100), nullable=True)
    is_virtual = Column(Boolean, default=False, nullable=False)
    virtual_meeting_url = Column(String(500), nullable=True)
    registration_status = Column(String(50), default="not_registered", nullable=False, index=True)
    registration_deadline = Column(String(20), nullable=False, index=True)
    registration_fee = Column(String(50), nullable=True)
    attendees_count = Column(Integer, default=0, nullable=False)
    capacity = Column(Integer, nullable=True)
    tags = Column(JSON, default=list, nullable=False)
    speakers = Column(JSON, default=list, nullable=True)
    schedule = Column(JSON, default=list, nullable=True)
    checklist_tasks = Column(JSON, default=list, nullable=True)
    external_url = Column(String(500), nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    tasks = relationship("PrepTaskModel", back_populates="event", cascade="all, delete-orphan")


class PrepTaskModel(Base):
    """SQLAlchemy model for event preparation tasks."""
    __tablename__ = "tasks"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), nullable=False, default="demo_user_1", index=True)
    event_id = Column(String(64), ForeignKey("events.id", ondelete="CASCADE"), nullable=True, index=True)
    event_title = Column(String(255), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(String(20), nullable=False, index=True)
    due_time = Column(String(20), nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False, index=True)
    priority = Column(String(20), default="medium", nullable=False)
    category = Column(String(50), default="prep", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    event = relationship("CampusEventModel", back_populates="tasks")


class UserPreferenceModel(Base):
    """SQLAlchemy model for student profile & theme preferences."""
    __tablename__ = "preferences"

    id = Column(String(64), primary_key=True, default="demo_user_1")
    theme = Column(String(50), default="midnight-pulse", nullable=False)
    custom_accent = Column(String(30), nullable=True)
    name = Column(String(120), default="Alex Rivera", nullable=False)
    email = Column(String(150), default="alex.rivera@campus.edu", nullable=False)
    student_id = Column(String(50), default="CS2023-8841", nullable=False)
    department = Column(String(120), default="Computer Science & Engineering", nullable=False)
    year_of_study = Column(String(50), default="3rd Year (Junior)", nullable=False)
    campus_name = Column(String(150), default="Stanford Center for Technology & Arts", nullable=False)
    avatar_url = Column(String(500), default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", nullable=False)
    interests = Column(JSON, default=list, nullable=False)
    notification_settings = Column(JSON, default=dict, nullable=False)
    calendar_sync = Column(JSON, default=dict, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)


class CampusNotificationModel(Base):
    """SQLAlchemy model for campus announcements and task alerts."""
    __tablename__ = "notifications"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), nullable=False, default="demo_user_1", index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(String(50), nullable=False)
    read = Column(Boolean, default=False, nullable=False)
    type = Column(String(50), default="update", nullable=False)
    event_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
