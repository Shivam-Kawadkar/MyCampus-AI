import io
import base64
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.services.ai_service import (
    validate_iso_date,
    validate_url,
    sanitize_and_validate_extraction,
    AIExtractorService,
    UnconfiguredAIProvider,
)

client = TestClient(app)

def create_test_image_data_uri(width=100, height=100, color="blue", format="PNG") -> str:
    """Creates a real in-memory image and returns a base64 Data URI."""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format=format)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/{format.lower()};base64,{b64}"

def test_validators():
    print("[1] Testing date and URL validators...")
    # Date validation
    assert validate_iso_date("2026-11-20") is True
    assert validate_iso_date("2026-02-29") is False  # 2026 is not a leap year
    assert validate_iso_date("invalid-date") is False
    assert validate_iso_date("Nov 20, 2026") is False
    assert validate_iso_date(None) is False

    # URL validation
    assert validate_url("https://campus.edu/events/register") is True
    assert validate_url("http://devpost.com/hacknova") is True
    assert validate_url("ftp://invalid.com") is False
    assert validate_url("just a string") is False
    assert validate_url(None) is False
    print("  -> Date and URL validators passed.")

def test_ai_status_endpoint():
    print("\n[2] Testing GET /api/ai/status...")
    r = client.get("/api/ai/status")
    assert r.status_code == 200, f"/api/ai/status failed: {r.text}"
    data = r.json()
    assert "configured" in data
    assert "provider" in data
    assert "supportedInputs" in data
    assert "message" in data
    print(f"  -> AI Status: configured={data['configured']}, provider={data['provider']}")

def test_text_extraction_validation_and_unconfigured_mode():
    print("\n[3] Testing POST /api/ai/parse-event...")
    # 1. Empty text check
    r_empty = client.post("/api/ai/parse-event", json={"announcementText": "   "})
    assert r_empty.status_code == 422, f"Expected 422 for empty text, got {r_empty.status_code}"

    # 2. Extract from announcement with URL but no deadline
    announcement = """
    HackNova Collegiate Sprint 2026
    Join us for 24 hours of autonomous agent engineering.
    Venue: Engineering Quad Hall A
    RSVP Link: https://hacknova.campus.edu/apply
    """
    r = client.post("/api/ai/parse-event", json={"announcementText": announcement})
    assert r.status_code == 200, f"Extraction failed: {r.text}"
    result = r.json()

    assert "title" in result
    assert "missingFields" in result
    assert "uncertainFields" in result
    assert "confidenceScore" in result
    # Registration deadline was not specified in text -> must be null, not fabricated!
    assert result["registrationDeadline"] is None
    assert "registration_deadline" in result["missingFields"]
    # URL was present -> captured
    assert result["registrationLink"] == "https://hacknova.campus.edu/apply"
    print(f"  -> Extracted title: '{result['title']}' without fabricated deadline (missingFields={result['missingFields']})")

def test_image_extraction_validation():
    print("\n[4] Testing POST /api/ai/parse-image validation...")
    # 1. Empty data
    r_empty = client.post("/api/ai/parse-image", json={"imageUrl": "", "imageName": "test.png"})
    assert r_empty.status_code == 422

    # 2. Corrupted base64
    r_corrupt = client.post("/api/ai/parse-image", json={"imageUrl": "data:image/png;base64,invalid_corrupt_data", "imageName": "bad.png"})
    assert r_corrupt.status_code == 422

    # 3. Valid real image
    valid_data_uri = create_test_image_data_uri(width=200, height=300, color="purple", format="PNG")
    r_valid = client.post("/api/ai/parse-image", json={"imageUrl": valid_data_uri, "imageName": "Campus Robotics Expo.png"})
    assert r_valid.status_code == 200, f"Valid image extraction failed: {r_valid.text}"
    img_result = r_valid.json()
    assert "title" in img_result
    assert "Campus Robotics Expo" in (img_result["title"] or "")
    print(f"  -> Extracted poster image result: title='{img_result['title']}'")

def test_event_persistence_workflow():
    print("\n[5] Testing End-to-End Save to SQLite Database...")
    # Simulate saving the extracted event
    event_payload = {
        "id": "evt_ai_test_roundtrip",
        "title": "Autonomous Agent AI Summit 2026",
        "shortDescription": "Extracted via AI importer workflow.",
        "fullDescription": "Deep dive into multi-agent systems and verifiable inference.",
        "category": "Tech Talk",
        "organizer": "AI Student Association",
        "bannerImage": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
        "startDate": "2026-11-19",
        "startTime": "02:00 PM",
        "endDate": "2026-11-19",
        "endTime": "05:00 PM",
        "venue": "Gates Computer Science Hall",
        "registrationStatus": "registered",
        "registrationDeadline": "2026-11-17",
        "externalUrl": "https://campus.edu/ai-summit",
        "tags": ["AI", "Agents", "Research"],
        "checklistTasks": [
            "Review pre-reading paper",
            "Set reminder for 1 hour before session"
        ]
    }

    # 1. Create event
    r_create = client.post("/api/events", json=event_payload)
    assert r_create.status_code == 201, f"Failed to create event: {r_create.text}"
    created_evt = r_create.json()
    assert created_evt["id"] == "evt_ai_test_roundtrip"
    print("  -> Event saved to SQLite:", created_evt["title"])

    # 2. Create suggested task linked to event
    task_payload = {
        "id": "tsk_ai_test_roundtrip",
        "eventId": "evt_ai_test_roundtrip",
        "title": "Review pre-reading paper",
        "dueDate": "2026-11-18",
        "priority": "medium",
        "category": "prep"
    }
    r_task = client.post("/api/tasks", json=task_payload)
    assert r_task.status_code == 201
    print("  -> Associated task created in SQLite:", r_task.json()["title"])

    # 3. Retrieve event
    r_get = client.get("/api/events/evt_ai_test_roundtrip")
    assert r_get.status_code == 200
    assert r_get.json()["title"] == "Autonomous Agent AI Summit 2026"

    # 4. Clean up
    client.delete("/api/tasks/tsk_ai_test_roundtrip")
    client.delete("/api/events/evt_ai_test_roundtrip")
    print("  -> Test records verified and cleaned up successfully.")

def run_all():
    test_validators()
    test_ai_status_endpoint()
    test_text_extraction_validation_and_unconfigured_mode()
    test_image_extraction_validation()
    test_event_persistence_workflow()
    print("\n[SUCCESS] ALL AI IMPORTER TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_all()
