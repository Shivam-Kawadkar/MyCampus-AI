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

def get_demo_auth_headers() -> dict:
    """Logs in with demo1@mycampus.demo to obtain an isolated evaluation token."""
    res = client.post("/api/auth/demo-login", json={"email": "demo1@mycampus.demo", "password": "demo123"})
    assert res.status_code == 200, f"Demo login failed: {res.text}"
    token = res.json()["token"]
    return {"Authorization": f"Bearer {token}"}

def test_unauthenticated_requests():
    print("\n[3] Testing Unauthenticated Requests Rejection (HTTP 401)...")
    # Verify protected AI endpoints reject requests completely lacking authorization token
    r_no_auth_text = client.post("/api/ai/parse-event", json={"announcementText": "Valid text but no token"})
    assert r_no_auth_text.status_code == 401, f"Expected 401 for unauthenticated text, got {r_no_auth_text.status_code}"

    r_no_auth_img = client.post("/api/ai/parse-image", json={"imageUrl": "data:image/png;base64,abc", "imageName": "test.png"})
    assert r_no_auth_img.status_code == 401, f"Expected 401 for unauthenticated image, got {r_no_auth_img.status_code}"

    # Verify requests with invalid/malformed bearer tokens are also rejected with 401
    bad_headers = {"Authorization": "Bearer invalid_malformed_token_9999"}
    r_bad_token_text = client.post("/api/ai/parse-event", json={"announcementText": "Valid text with bad token"}, headers=bad_headers)
    assert r_bad_token_text.status_code == 401, f"Expected 401 for bad token text, got {r_bad_token_text.status_code}"

    r_bad_token_img = client.post("/api/ai/parse-image", json={"imageUrl": "data:image/png;base64,abc", "imageName": "test.png"}, headers=bad_headers)
    assert r_bad_token_img.status_code == 401, f"Expected 401 for bad token image, got {r_bad_token_img.status_code}"
    print("  -> Verified: protected AI endpoints strictly require valid demo authorization (HTTP 401).")

def test_invalid_inputs_with_authentication():
    print("\n[4] Testing Invalid Input Handling With Valid Demo Authentication (HTTP 422)...")
    auth_headers = get_demo_auth_headers()

    # 1. Empty announcement text
    r_empty_text = client.post("/api/ai/parse-event", json={"announcementText": ""}, headers=auth_headers)
    assert r_empty_text.status_code == 422, f"Expected 422 for empty text, got {r_empty_text.status_code}"

    # 2. Whitespace-only announcement text
    r_whitespace = client.post("/api/ai/parse-event", json={"announcementText": "     \n\t  "}, headers=auth_headers)
    assert r_whitespace.status_code == 422, f"Expected 422 for whitespace text, got {r_whitespace.status_code}"

    # 3. Missing required fields in announcement payload
    r_missing_field = client.post("/api/ai/parse-event", json={}, headers=auth_headers)
    assert r_missing_field.status_code == 422, f"Expected 422 for missing payload fields, got {r_missing_field.status_code}"

    # 4. Empty image URL
    r_empty_img = client.post("/api/ai/parse-image", json={"imageUrl": "", "imageName": "test.png"}, headers=auth_headers)
    assert r_empty_img.status_code == 422, f"Expected 422 for empty image, got {r_empty_img.status_code}"

    # 5. Corrupted base64 image data
    r_corrupt_img = client.post("/api/ai/parse-image", json={"imageUrl": "data:image/png;base64,invalid_corrupt_data", "imageName": "bad.png"}, headers=auth_headers)
    assert r_corrupt_img.status_code == 422, f"Expected 422 for corrupt image, got {r_corrupt_img.status_code}"

    print("  -> Verified: invalid input payloads are rejected with HTTP 422 when properly authenticated.")

def test_text_extraction_validation_and_unconfigured_mode():
    print("\n[5] Testing Valid POST /api/ai/parse-event with demo authentication...")
    auth_headers = get_demo_auth_headers()

    # Extract from announcement with URL but no deadline
    announcement = """
    HackNova Collegiate Sprint 2026
    Join us for 24 hours of autonomous agent engineering.
    Venue: Engineering Quad Hall A
    RSVP Link: https://hacknova.campus.edu/apply
    """
    r = client.post("/api/ai/parse-event", json={"announcementText": announcement}, headers=auth_headers)
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
    print("\n[6] Testing Valid POST /api/ai/parse-image with demo authentication...")
    auth_headers = get_demo_auth_headers()

    # Valid real image
    valid_data_uri = create_test_image_data_uri(width=200, height=300, color="purple", format="PNG")
    r_valid = client.post("/api/ai/parse-image", json={"imageUrl": valid_data_uri, "imageName": "Campus Robotics Expo.png"}, headers=auth_headers)
    assert r_valid.status_code == 200, f"Valid image extraction failed: {r_valid.text}"
    img_result = r_valid.json()
    assert "title" in img_result
    assert "Campus Robotics Expo" in (img_result["title"] or "")
    print(f"  -> Extracted poster image result: title='{img_result['title']}'")

def test_event_persistence_workflow():
    print("\n[7] Testing End-to-End Save to SQLite Database with demo authentication...")
    auth_headers = get_demo_auth_headers()

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
    r_create = client.post("/api/events", json=event_payload, headers=auth_headers)
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
    r_task = client.post("/api/tasks", json=task_payload, headers=auth_headers)
    assert r_task.status_code == 201
    print("  -> Associated task created in SQLite:", r_task.json()["title"])

    # 3. Retrieve event
    r_get = client.get("/api/events/evt_ai_test_roundtrip", headers=auth_headers)
    assert r_get.status_code == 200
    assert r_get.json()["title"] == "Autonomous Agent AI Summit 2026"

    # 4. Clean up
    client.delete("/api/tasks/tsk_ai_test_roundtrip", headers=auth_headers)
    client.delete("/api/events/evt_ai_test_roundtrip", headers=auth_headers)
    print("  -> Test records verified and cleaned up successfully.")

def run_all():
    test_validators()
    test_ai_status_endpoint()
    test_unauthenticated_requests()
    test_invalid_inputs_with_authentication()
    test_text_extraction_validation_and_unconfigured_mode()
    test_image_extraction_validation()
    test_event_persistence_workflow()
    print("\n[SUCCESS] ALL AI IMPORTER TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_all()

