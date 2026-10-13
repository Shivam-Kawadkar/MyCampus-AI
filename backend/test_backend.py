"""
Sanity check script to test database initialization, seeding, and scheduler logic.
"""
from app.database import init_db, SessionLocal
from app.models import CampusEventModel, PrepTaskModel, UserPreferenceModel
from app.seed import seed_database_if_empty
from app.services.scheduler import detect_schedule_conflicts, validate_event_time_range
from app.services.ai_service import AIExtractorService

def main():
    print("1. Initializing database...")
    init_db()
    print("   Database initialized.")

    print("2. Seeding database if empty...")
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
        event_count = db.query(CampusEventModel).count()
        task_count = db.query(PrepTaskModel).count()
        pref = db.query(UserPreferenceModel).filter(UserPreferenceModel.id == "current_user").first()
        print(f"   Events in DB: {event_count}")
        print(f"   Tasks in DB: {task_count}")
        print(f"   User in DB: {pref.name} ({pref.student_id}) - Theme: {pref.theme}")

        assert event_count >= 8, f"Expected at least 8 events, got {event_count}"
        assert task_count >= 6, f"Expected at least 6 tasks, got {task_count}"
        assert pref is not None, "Expected user preference record"

        print("3. Testing scheduler conflict detection...")
        events = db.query(CampusEventModel).all()
        conflicts = detect_schedule_conflicts(events, only_registered=True)
        print(f"   Detected {len(conflicts)} schedule conflicts among registered events.")

        is_valid, err = validate_event_time_range("2026-10-17", "10:00 AM", "2026-10-17", "09:00 AM")
        assert not is_valid, "Expected validation failure for end time before start time"
        print("   Date validation correctly caught invalid time range.")

        print("4. Testing AI Extractor service interface...")
        import asyncio
        ai_res = asyncio.run(AIExtractorService.parse_announcement("🚀 Hackathon 2026: Code Challenge! Win $5,000 in prizes."))
        assert ai_res.category == "Hackathon"
        print(f"   AI announcement extraction parsed category: {ai_res.category}, title: {ai_res.title}")

        print("\nAll database and service sanity tests passed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    main()
