from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

class CamelModel(BaseModel):
    """Base Pydantic model with automatic camelCase JSON aliasing and ORM support."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

# -----------------------------------------------------------------------------
# Event Schemas
# -----------------------------------------------------------------------------
EventCategoryLiteral = Literal[
    'Hackathon',
    'Tech Talk',
    'Workshop',
    'Cultural',
    'Career',
    'Sports',
    'Academic'
]

RegistrationStatusLiteral = Literal[
    'registered',
    'waitlisted',
    'attended',
    'not_registered',
    'saved'
]

class EventSpeakerSchema(CamelModel):
    name: str
    role: str
    organization: Optional[str] = None
    avatar_url: Optional[str] = None

class EventScheduleItemSchema(CamelModel):
    time: str
    title: str
    description: Optional[str] = None
    venue: Optional[str] = None

class CampusEventBase(CamelModel):
    title: str
    short_description: str
    full_description: str
    category: str
    organizer: str
    organizer_email: Optional[str] = None
    club_logo: Optional[str] = None
    banner_image: str
    start_date: str
    start_time: str
    end_date: str
    end_time: str
    venue: str
    room: Optional[str] = None
    is_virtual: bool = False
    virtual_meeting_url: Optional[str] = None
    registration_status: str = "not_registered"
    registration_deadline: str
    registration_fee: Optional[str] = None
    attendees_count: int = 0
    capacity: Optional[int] = None
    tags: List[str] = Field(default_factory=list)
    speakers: Optional[List[EventSpeakerSchema]] = None
    schedule: Optional[List[EventScheduleItemSchema]] = None
    checklist_tasks: Optional[List[str]] = None
    external_url: Optional[str] = None
    is_featured: bool = False

class CampusEventCreate(CampusEventBase):
    id: Optional[str] = None

class CampusEventUpdate(CamelModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    category: Optional[str] = None
    organizer: Optional[str] = None
    organizer_email: Optional[str] = None
    club_logo: Optional[str] = None
    banner_image: Optional[str] = None
    start_date: Optional[str] = None
    start_time: Optional[str] = None
    end_date: Optional[str] = None
    end_time: Optional[str] = None
    venue: Optional[str] = None
    room: Optional[str] = None
    is_virtual: Optional[bool] = None
    virtual_meeting_url: Optional[str] = None
    registration_status: Optional[str] = None
    registration_deadline: Optional[str] = None
    registration_fee: Optional[str] = None
    attendees_count: Optional[int] = None
    capacity: Optional[int] = None
    tags: Optional[List[str]] = None
    speakers: Optional[List[EventSpeakerSchema]] = None
    schedule: Optional[List[EventScheduleItemSchema]] = None
    checklist_tasks: Optional[List[str]] = None
    external_url: Optional[str] = None
    is_featured: Optional[bool] = None

class CampusEventResponse(CampusEventBase):
    id: str

class EventStatusUpdate(CamelModel):
    registration_status: str

# -----------------------------------------------------------------------------
# Task Schemas
# -----------------------------------------------------------------------------
class PrepTaskBase(CamelModel):
    event_id: Optional[str] = None
    event_title: Optional[str] = None
    title: str
    description: Optional[str] = None
    due_date: str
    due_time: Optional[str] = None
    is_completed: bool = False
    priority: Literal['low', 'medium', 'high'] = 'medium'
    category: Optional[str] = 'prep'

class PrepTaskCreate(PrepTaskBase):
    id: Optional[str] = None

class PrepTaskUpdate(CamelModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[Literal['low', 'medium', 'high']] = None
    category: Optional[str] = None
    event_id: Optional[str] = None
    event_title: Optional[str] = None

class PrepTaskResponse(PrepTaskBase):
    id: str

# -----------------------------------------------------------------------------
# Deadlines & Notifications
# -----------------------------------------------------------------------------
class PendingDeadlineResponse(CamelModel):
    id: str
    event_id: str
    event_title: str
    category: str
    title: str
    deadline_date: str
    deadline_time: str
    is_urgent: bool = False
    action_url: Optional[str] = None

class CampusNotificationResponse(CamelModel):
    id: str
    title: str
    message: str
    timestamp: str
    read: bool
    type: str
    event_id: Optional[str] = None

# -----------------------------------------------------------------------------
# Preferences & Profile Schemas
# -----------------------------------------------------------------------------
class NotificationSettings(CamelModel):
    email_reminders: bool = True
    deadline_alerts: bool = True
    ai_recommendations: bool = True
    weekly_digest: bool = False
    browser_push: bool = True

class CalendarSyncSettings(CamelModel):
    google: bool = True
    apple: bool = False
    outlook: bool = False

class UserProfileSchema(CamelModel):
    id: str = "current_user"
    name: str = "Alex Rivera"
    email: str = "alex.rivera@campus.edu"
    student_id: str = "CS2023-8841"
    department: str = "Computer Science & Engineering"
    year_of_study: str = "3rd Year (Junior)"
    avatar_url: str = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
    campus_name: str = "Stanford Center for Technology & Arts"
    interests: List[str] = Field(default_factory=list)
    notification_settings: NotificationSettings = Field(default_factory=NotificationSettings)
    calendar_sync: CalendarSyncSettings = Field(default_factory=CalendarSyncSettings)

class UserProfileUpdate(CamelModel):
    name: Optional[str] = None
    email: Optional[str] = None
    student_id: Optional[str] = None
    department: Optional[str] = None
    year_of_study: Optional[str] = None
    avatar_url: Optional[str] = None
    campus_name: Optional[str] = None
    interests: Optional[List[str]] = None
    notification_settings: Optional[Dict[str, bool]] = None
    calendar_sync: Optional[Dict[str, bool]] = None

class UserPreferencesResponse(CamelModel):
    theme: str
    custom_accent: Optional[str] = None
    profile: UserProfileSchema

class UserPreferencesUpdate(CamelModel):
    theme: Optional[str] = None
    custom_accent: Optional[str] = None
    profile: Optional[UserProfileUpdate] = None

# -----------------------------------------------------------------------------
# Timeline & Dashboard Schemas
# -----------------------------------------------------------------------------
class TimelineItem(CamelModel):
    id: str
    type: Literal['event', 'deadline', 'task']
    date: str
    time: Optional[str] = None
    title: str
    event_id: Optional[str] = None
    event_title: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    is_completed: Optional[bool] = None

class ScheduleConflict(CamelModel):
    event1_id: str
    event1_title: str
    event2_id: str
    event2_title: str
    conflict_date: str
    event1_time: str
    event2_time: str
    conflict_reason: str

class DashboardSummaryResponse(CamelModel):
    events_count: int
    registered_count: int
    pending_deadlines_count: int
    tasks_count: int
    completed_tasks_count: int
    upcoming_registered: List[CampusEventResponse]
    pending_deadlines: List[PendingDeadlineResponse]
    weekly_tasks: List[PrepTaskResponse]
    conflicts: List[ScheduleConflict]

# -----------------------------------------------------------------------------
# AI Importer Service Schemas
# -----------------------------------------------------------------------------
class AIStatusResponse(CamelModel):
    configured: bool
    provider: str
    model: Optional[str] = None
    supported_inputs: List[str] = Field(default_factory=lambda: ["text", "image"])
    message: str

class AIParsedAnnouncementRequest(CamelModel):
    announcement_text: str

class AIParsedImageRequest(CamelModel):
    image_url: str
    image_name: Optional[str] = "flyer.png"

class AIParseResult(CamelModel):
    title: Optional[str] = None
    category: Optional[str] = None
    organizer: Optional[str] = None
    start_date: Optional[str] = None
    start_time: Optional[str] = None
    end_date: Optional[str] = None
    end_time: Optional[str] = None
    venue: Optional[str] = None
    room: Optional[str] = None
    description: Optional[str] = None
    registration_deadline: Optional[str] = None
    registration_link: Optional[str] = None
    registration_fee: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    suggested_tasks: List[str] = Field(default_factory=list)
    confidence_score: float = 0.0
    banner_image: Optional[str] = None
    extracted_text: Optional[str] = None
    missing_fields: List[str] = Field(default_factory=list)
    uncertain_fields: List[str] = Field(default_factory=list)
    is_ai_powered: bool = False
    provider: str = "none"
    model: Optional[str] = None
    error_message: Optional[str] = None
