import time
import httpx
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import CampusEventModel, PrepTaskModel

BASE_URL = "http://127.0.0.1:8000"

def get_client():
    # If live server running, use httpx, otherwise TestClient(app)
    try:
        r = httpx.get(f"{BASE_URL}/health", timeout=1.0)
        if r.status_code == 200:
            c = httpx.Client(base_url=BASE_URL, timeout=10)
            auth_r = c.post("/api/auth/demo-login", json={"email": "demo1@mycampus.demo", "password": "demo123"})
            c.headers["Authorization"] = f"Bearer {auth_r.json()['token']}"
            return c
    except Exception:
        pass
    
    tc = TestClient(app)
    auth_r = tc.post("/api/auth/demo-login", json={"email": "demo1@mycampus.demo", "password": "demo123"})
    tc.headers["Authorization"] = f"Bearer {auth_r.json()['token']}"
    return tc

def test_persistence():
    print("[1] Creating a test event and task via HTTP REST API...")
    event_payload = {
        "id": "evt_persist_check_99",
        "title": "Persistent Data Verification Summit",
        "shortDescription": "Verifying SQLite persistence across app restarts.",
        "fullDescription": "Ensures that data is preserved in local SQLite database across restarts.",
        "category": "Tech Talk",
        "organizer": "Backend Systems Lab",
        "bannerImage": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000",
        "startDate": "2026-11-30",
        "startTime": "03:00 PM",
        "endDate": "2026-11-30",
        "endTime": "05:00 PM",
        "venue": "Turing Memorial Auditorium",
        "registrationStatus": "registered",
        "registrationDeadline": "2026-11-28",
        "tags": ["Persistence", "Verification"]
    }
    
    task_payload = {
        "id": "tsk_persist_check_99",
        "eventId": "evt_persist_check_99",
        "title": "Verify SQLite durability",
        "dueDate": "2026-11-29",
        "dueTime": "10:00 PM",
        "priority": "high",
        "category": "prep"
    }

    client = get_client()

    # 1. Post records to client
    r_evt = client.post("/api/events", json=event_payload)
    assert r_evt.status_code == 201, f"Failed to post event: {r_evt.text}"
    print("  -> Created event:", r_evt.json()["id"])

    r_tsk = client.post("/api/tasks", json=task_payload)
    assert r_tsk.status_code == 201, f"Failed to post task: {r_tsk.text}"
    print("  -> Created task:", r_tsk.json()["id"])

    # 2. Check local database directly through SQLAlchemy session
    print("[2] Directly inspecting SQLite database file...")
    db = SessionLocal()
    try:
        found_evt = db.query(CampusEventModel).filter(CampusEventModel.id == "evt_persist_check_99").first()
        found_tsk = db.query(PrepTaskModel).filter(PrepTaskModel.id == "tsk_persist_check_99").first()
        assert found_evt is not None, "Event not found in SQLite file!"
        assert found_tsk is not None, "Task not found in SQLite file!"
        print("  -> Confirmed event & task directly in SQLite database:", found_evt.title)
    finally:
        db.close()

    # 3. Verify reading via API
    r = client.get("/api/events/evt_persist_check_99")
    assert r.status_code == 200
    assert r.json()["title"] == "Persistent Data Verification Summit"

    r_del_t = client.delete("/api/tasks/tsk_persist_check_99")
    assert r_del_t.status_code == 204
    r_del_e = client.delete("/api/events/evt_persist_check_99")
    assert r_del_e.status_code == 204
    print("[3] Test event and task verified and cleaned up successfully.")

    print("\n[SUCCESS] SQLite persistence verified successfully!")

if __name__ == "__main__":
    test_persistence()
