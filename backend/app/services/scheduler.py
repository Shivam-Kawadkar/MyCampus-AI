import re
from datetime import datetime
from typing import List, Tuple, Optional
from ..models import CampusEventModel
from ..schemas import ScheduleConflict

def parse_time_str(time_str: str) -> Tuple[int, int]:
    """
    Parses time strings like '09:00 AM', '2:30 PM', '14:00' into (hour, minute) 24h format.
    """
    cleaned = time_str.strip().upper()
    match_12h = re.match(r"^(\d{1,2}):(\d{2})\s*(AM|PM)?$", cleaned)
    if match_12h:
        hour = int(match_12h.group(1))
        minute = int(match_12h.group(2))
        period = match_12h.group(3)
        if period == "PM" and hour < 12:
            hour += 12
        elif period == "AM" and hour == 12:
            hour = 0
        return hour, minute
    
    # Fallback default
    return 9, 0

def parse_event_datetime(date_str: str, time_str: str) -> datetime:
    """
    Combines date ('YYYY-MM-DD') and time ('10:00 AM') into a datetime object.
    """
    try:
        # Standard YYYY-MM-DD
        base_date = datetime.strptime(date_str.strip()[:10], "%Y-%m-%d")
    except Exception:
        base_date = datetime(2026, 1, 1)

    hour, minute = parse_time_str(time_str)
    return base_date.replace(hour=hour, minute=minute)

def validate_event_time_range(
    start_date: str, 
    start_time: str, 
    end_date: str, 
    end_time: str
) -> Tuple[bool, Optional[str]]:
    """
    Validates that the end datetime is equal to or after the start datetime.
    """
    try:
        dt_start = parse_event_datetime(start_date, start_time)
        dt_end = parse_event_datetime(end_date, end_time)
        if dt_end < dt_start:
            return False, "Event end time cannot be earlier than its start time."
        return True, None
    except Exception as e:
        return False, f"Invalid date or time format: {str(e)}"

def detect_schedule_conflicts(
    events: List[CampusEventModel],
    only_registered: bool = True
) -> List[ScheduleConflict]:
    """
    Deterministic rule-based scheduling logic to identify overlapping events.
    - Avoids duplicate pairs by ordering IDs.
    - Flags overlaps when start1 < end2 and start2 < end1.
    """
    if only_registered:
        target_events = [
            e for e in events 
            if e.registration_status in ("registered", "attended", "waitlisted")
        ]
    else:
        target_events = list(events)

    conflicts: List[ScheduleConflict] = []
    n = len(target_events)

    for i in range(n):
        e1 = target_events[i]
        try:
            start1 = parse_event_datetime(e1.start_date, e1.start_time)
            end1 = parse_event_datetime(e1.end_date, e1.end_time)
        except Exception:
            continue

        for j in range(i + 1, n):
            e2 = target_events[j]
            try:
                start2 = parse_event_datetime(e2.start_date, e2.start_time)
                end2 = parse_event_datetime(e2.end_date, e2.end_time)
            except Exception:
                continue

            # Deterministic overlap check: start1 < end2 AND start2 < end1
            if start1 < end2 and start2 < end1:
                # Format conflict date and explanation
                overlap_date = e1.start_date if e1.start_date == e2.start_date else f"{e1.start_date} / {e2.start_date}"
                reason = (
                    f"'{e1.title}' ({e1.start_time} - {e1.end_time}) overlaps with "
                    f"'{e2.title}' ({e2.start_time} - {e2.end_time})"
                )
                
                # Order IDs consistently to prevent duplicates
                first, second = (e1, e2) if e1.id < e2.id else (e2, e1)
                t1 = first.start_time
                t2 = second.start_time

                conflicts.append(ScheduleConflict(
                    event1_id=first.id,
                    event1_title=first.title,
                    event2_id=second.id,
                    event2_title=second.title,
                    conflict_date=overlap_date,
                    event1_time=t1,
                    event2_time=t2,
                    conflict_reason=reason
                ))

    return conflicts
