from fastapi.testclient import TestClient
from app.main import app

def test_api():
    client = TestClient(app)

    print("Authenticating with demo account (demo1@mycampus.demo)...")
    login_res = client.post("/api/auth/demo-login", json={"email": "demo1@mycampus.demo", "password": "demo123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["token"]
    client.headers["Authorization"] = f"Bearer {token}"
    print("[OK] Authenticated successfully with token.")

    print("\nTesting /health...")
    r = client.get("/health")
    assert r.status_code == 200, f"/health failed: {r.text}"
    assert r.json()["status"] == "ok"
    print("[OK] /health passed:", r.json())

    print("\nTesting GET /api/events...")
    r = client.get("/api/events")
    assert r.status_code == 200, f"GET /api/events failed: {r.text}"
    events = r.json()
    assert len(events) >= 8, f"Expected at least 8 events, got {len(events)}"
    # Check camelCase fields
    assert "startDate" in events[0]
    assert "shortDescription" in events[0]
    assert "registrationStatus" in events[0]
    print(f"[OK] GET /api/events returned {len(events)} events with camelCase schema.")

    print("\nTesting GET /api/events/evt_1...")
    r = client.get("/api/events/evt_1")
    assert r.status_code == 200
    evt1 = r.json()
    assert evt1["id"] == "evt_1"
    assert "HackNova" in evt1["title"]
    print("[OK] GET /api/events/evt_1 passed:", evt1["title"])

    print("\nTesting POST /api/events...")
    new_event_payload = {
        "title": "Quantum Algorithm Sprint 2026",
        "shortDescription": "24-hour quantum computing circuit challenge.",
        "fullDescription": "Hands-on quantum hackathon exploring Qiskit circuits.",
        "category": "Hackathon",
        "organizer": "Quantum Students Association",
        "bannerImage": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000",
        "startDate": "2026-11-28",
        "startTime": "09:00 AM",
        "endDate": "2026-11-29",
        "endTime": "05:00 PM",
        "venue": "Varian Physics Hall",
        "registrationStatus": "registered",
        "registrationDeadline": "2026-11-25",
        "tags": ["Quantum", "Hackathon"]
    }
    r = client.post("/api/events", json=new_event_payload)
    assert r.status_code == 201, f"POST /api/events failed: {r.text}"
    created_evt = r.json()
    created_id = created_evt["id"]
    print("[OK] POST /api/events created:", created_id, created_evt["title"])

    print("\nTesting PATCH /api/events/{id}/status...")
    r = client.patch(f"/api/events/{created_id}/status", json={"registrationStatus": "waitlisted"})
    assert r.status_code == 200
    assert r.json()["registrationStatus"] == "waitlisted"
    print("[OK] PATCH /api/events/{id}/status updated to waitlisted.")

    print("\nTesting GET /api/tasks...")
    r = client.get("/api/tasks")
    assert r.status_code == 200
    tasks = r.json()
    assert len(tasks) >= 6
    print(f"[OK] GET /api/tasks returned {len(tasks)} tasks.")

    print("\nTesting POST /api/tasks...")
    new_task_payload = {
        "eventId": created_id,
        "title": "Prepare quantum simulator Jupyter notebook",
        "dueDate": "2026-11-27",
        "dueTime": "06:00 PM",
        "priority": "high",
        "category": "prep"
    }
    r = client.post("/api/tasks", json=new_task_payload)
    assert r.status_code == 201
    created_task = r.json()
    task_id = created_task["id"]
    print("[OK] POST /api/tasks created task:", task_id)

    print("\nTesting POST /api/tasks/{id}/toggle...")
    r = client.post(f"/api/tasks/{task_id}/toggle")
    assert r.status_code == 200
    assert r.json()["isCompleted"] is True
    print("[OK] POST /api/tasks/{id}/toggle toggled task to completed: True.")

    print("\nTesting GET /api/dashboard/summary...")
    r = client.get("/api/dashboard/summary")
    assert r.status_code == 200
    summary = r.json()
    assert "eventsCount" in summary
    assert "registeredCount" in summary
    assert "conflicts" in summary
    print(f"[OK] GET /api/dashboard/summary passed (events: {summary['eventsCount']}, registered: {summary['registeredCount']}).")

    print("\nTesting GET /api/timeline...")
    r = client.get("/api/timeline")
    assert r.status_code == 200
    timeline = r.json()
    assert len(timeline) >= 10
    print(f"[OK] GET /api/timeline returned {len(timeline)} milestones.")

    print("\nTesting GET /api/preferences...")
    r = client.get("/api/preferences")
    assert r.status_code == 200
    pref = r.json()
    assert "theme" in pref
    assert "profile" in pref
    print(f"[OK] GET /api/preferences passed: theme={pref['theme']}, user={pref['profile']['name']}")

    print("\nTesting PUT /api/preferences...")
    r = client.put("/api/preferences", json={"theme": "clean-light", "customAccent": "#1E5E2E"})
    assert r.status_code == 200
    assert r.json()["theme"] == "clean-light"
    assert r.json()["customAccent"] == "#1E5E2E"
    print("[OK] PUT /api/preferences updated theme.")

    # Reset theme back to midnight-pulse
    client.put("/api/preferences", json={"theme": "midnight-pulse", "customAccent": None})

    print("\nTesting POST /api/ai/parse-event...")
    r = client.post("/api/ai/parse-event", json={"announcementText": "CyberDefend Collegiate CTF 2026\nDate: Nov 21 10:00 AM\nVenue: Security Lab"})
    assert r.status_code == 200
    ai_event = r.json()
    assert "CyberDefend" in ai_event["title"]
    print(f"[OK] POST /api/ai/parse-event extracted title: '{ai_event['title']}', category: '{ai_event['category']}'")

    print("\nTesting POST /api/ai/parse-image...")
    r = client.post("/api/ai/parse-image", json={"imageUrl": "https://example.com/robotics.png", "imageName": "Robotics Expo Flyer.png"})
    assert r.status_code == 200
    ai_img = r.json()
    assert "Robotics" in ai_img["title"] or "Flyer" in ai_img["title"]
    print(f"[OK] POST /api/ai/parse-image extracted flyer title: '{ai_img['title']}'")

    print("\nTesting DELETE /api/tasks/{id} and DELETE /api/events/{id}...")
    r = client.delete(f"/api/tasks/{task_id}")
    assert r.status_code == 204
    r = client.delete(f"/api/events/{created_id}")
    assert r.status_code == 204
    print("[OK] DELETE endpoints successfully cleaned up test records.")

    print("\n[SUCCESS] ALL REST API ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api()
