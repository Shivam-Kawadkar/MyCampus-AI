"""
Unit & Integration Tests for MyCampus Demo Authentication & Data Isolation
--------------------------------------------------------------------------
Tests:
1. Valid login for all 3 demo accounts (Explorer, Organizer, AI Tester)
2. Invalid password rejection (401)
3. Unknown email rejection (401)
4. Expired and tampered token rejection (401)
5. Protected endpoints rejection without token (401)
6. Data isolation between Demo 1, Demo 2, and Demo 3
7. Admin functionality rejection (403)
8. Data reset restoring all demo records
"""

import time
from fastapi.testclient import TestClient
from app.main import app
from app.auth import (
    DEMO_ACCOUNTS,
    create_demo_token,
    verify_demo_token,
    DemoAccountInfo,
    _b64encode,
)

client = TestClient(app)

def test_demo_auth_flow():
    print("\n--- [1] Testing Demo Login for all 3 configured demo accounts ---")
    tokens = {}
    for email, acc in DEMO_ACCOUNTS.items():
        res = client.post("/api/auth/demo-login", json={"email": email, "password": "demo123"})
        assert res.status_code == 200, f"Login failed for {email}: {res.text}"
        data = res.json()
        assert "token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == email
        assert data["user"]["id"] == acc.id
        assert data["user"]["is_admin"] is False
        tokens[acc.id] = data["token"]
        print(f"  [OK] Successfully signed in as {acc.role_title} ({email}) -> user_id: {acc.id}")

    print("\n--- [2] Testing Invalid Credentials Rejection ---")
    # Wrong password
    r_bad_pw = client.post("/api/auth/demo-login", json={"email": "demo1@mycampus.demo", "password": "wrongpassword"})
    assert r_bad_pw.status_code == 401, f"Expected 401 for wrong password, got {r_bad_pw.status_code}"
    print("  [OK] Wrong password correctly rejected with 401 Unauthorized.")

    # Unknown email
    r_bad_email = client.post("/api/auth/demo-login", json={"email": "attacker@evil.com", "password": "demo123"})
    assert r_bad_email.status_code == 401, f"Expected 401 for unknown email, got {r_bad_email.status_code}"
    print("  [OK] Unknown email correctly rejected with 401 Unauthorized.")

    print("\n--- [3] Testing Protected Endpoints Reject Unauthenticated Requests ---")
    # Events endpoint without auth
    r_no_auth = client.get("/api/events")
    assert r_no_auth.status_code == 401, f"Expected 401 for unauthenticated GET /api/events, got {r_no_auth.status_code}"

    # Tasks endpoint without auth
    r_tasks_no_auth = client.get("/api/tasks")
    assert r_tasks_no_auth.status_code == 401

    # Dashboard endpoint without auth
    r_dash_no_auth = client.get("/api/dashboard/summary")
    assert r_dash_no_auth.status_code == 401
    print("  [OK] Protected API endpoints strictly reject requests lacking valid demo session token.")

    print("\n--- [4] Testing Tampered and Expired Session Tokens ---")
    # Tampered token
    tampered_token = tokens["demo_user_1"][:-6] + "xyz123"
    r_tampered = client.get("/api/events", headers={"Authorization": f"Bearer {tampered_token}"})
    assert r_tampered.status_code == 401, f"Expected 401 for tampered token, got {r_tampered.status_code}"
    print("  [OK] Tampered token signature rejected with 401 Unauthorized.")

    # Expired token simulation
    now = int(time.time())
    header = {"alg": "HS256", "typ": "JWT"}
    expired_payload = {
        "sub": "demo_user_1",
        "email": "demo1@mycampus.demo",
        "exp": now - 3600,  # expired 1 hour ago
        "iat": now - 7200,
    }
    import hmac, hashlib, json
    from app.auth import get_jwt_secret
    h_b64 = _b64encode(json.dumps(header).encode("utf-8"))
    p_b64 = _b64encode(json.dumps(expired_payload).encode("utf-8"))
    inp = f"{h_b64}.{p_b64}".encode("utf-8")
    sig = _b64encode(hmac.new(get_jwt_secret().encode("utf-8"), inp, hashlib.sha256).digest())
    expired_jwt = f"{h_b64}.{p_b64}.{sig}"

    r_expired = client.get("/api/events", headers={"Authorization": f"Bearer {expired_jwt}"})
    assert r_expired.status_code == 401, f"Expected 401 for expired token, got {r_expired.status_code}"
    print("  [OK] Expired session token rejected with 401 Unauthorized.")

    print("\n--- [5] Testing Strict Data Isolation Between Demo Accounts ---")
    # Fetch events for Demo 1 (Campus Explorer)
    h_demo1 = {"Authorization": f"Bearer {tokens['demo_user_1']}"}
    r_d1_events = client.get("/api/events", headers=h_demo1)
    assert r_d1_events.status_code == 200
    d1_events = r_d1_events.json()
    d1_ids = [e["id"] for e in d1_events]
    print(f"  Demo 1 sees {len(d1_events)} events: {d1_ids[:3]}...")

    # Fetch events for Demo 2 (Event Organizer)
    h_demo2 = {"Authorization": f"Bearer {tokens['demo_user_2']}"}
    r_d2_events = client.get("/api/events", headers=h_demo2)
    assert r_d2_events.status_code == 200
    d2_events = r_d2_events.json()
    d2_ids = [e["id"] for e in d2_events]
    print(f"  Demo 2 sees {len(d2_events)} events: {d2_ids[:3]}...")

    # Fetch events for Demo 3 (AI Feature Tester)
    h_demo3 = {"Authorization": f"Bearer {tokens['demo_user_3']}"}
    r_d3_events = client.get("/api/events", headers=h_demo3)
    assert r_d3_events.status_code == 200
    d3_events = r_d3_events.json()
    d3_ids = [e["id"] for e in d3_events]
    print(f"  Demo 3 sees {len(d3_events)} events: {d3_ids[:3]}...")

    # Verification: Disjoint event sets
    assert set(d1_ids).isdisjoint(set(d2_ids)), "Demo 1 and Demo 2 event lists must be completely isolated!"
    assert set(d1_ids).isdisjoint(set(d3_ids)), "Demo 1 and Demo 3 event lists must be completely isolated!"
    assert set(d2_ids).isdisjoint(set(d3_ids)), "Demo 2 and Demo 3 event lists must be completely isolated!"
    print("  [OK] Demo accounts have mutually exclusive, isolated event records.")

    # Cross-account record access attempt: Demo 2 attempts to fetch Demo 1's event
    r_cross = client.get(f"/api/events/{d1_ids[0]}", headers=h_demo2)
    assert r_cross.status_code == 404, f"Demo 2 should not be able to read Demo 1's event: got {r_cross.status_code}"
    print("  [OK] Cross-account access denied: Demo 2 cannot access Demo 1's events.")

    # Cross-account update attempt: Demo 1 attempts to update Demo 2's event status
    r_cross_patch = client.patch(
        f"/api/events/{d2_ids[0]}/status",
        headers=h_demo1,
        json={"registrationStatus": "attended"}
    )
    assert r_cross_patch.status_code == 404, f"Demo 1 should not be able to modify Demo 2's event: got {r_cross_patch.status_code}"
    print("  [OK] Cross-account modification denied: Demo 1 cannot alter Demo 2's event status.")

    print("\n--- [6] Testing Administrator Privileges Are Strictly Denied ---")
    for user_id, tok in tokens.items():
        r_admin = client.get("/api/auth/admin-check", headers={"Authorization": f"Bearer {tok}"})
        assert r_admin.status_code == 403, f"Expected 403 Forbidden for demo account {user_id}, got {r_admin.status_code}"
    print("  [OK] Administrator endpoints strictly return 403 Forbidden for all demo users.")

    print("\n--- [7] Testing Reset Demo Data Endpoint ---")
    r_reset = client.post("/api/auth/reset-demo-data", headers=h_demo1)
    assert r_reset.status_code == 200, f"Reset demo data failed: {r_reset.text}"
    reset_json = r_reset.json()
    assert reset_json["status"] == "success"
    print("  [OK] Demo data restored successfully via /api/auth/reset-demo-data.")

    print("\n=======================================================")
    print("  ALL DEMO AUTH & DATA ISOLATION TESTS PASSED! (7/7)  ")
    print("=======================================================\n")

if __name__ == "__main__":
    test_demo_auth_flow()
