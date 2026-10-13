"""
End-to-End API Test Suite for HomeEase Junagadh
"""

import urllib.request
import urllib.error
import json

BASE = "http://127.0.0.1:8000/api"


def make_request(path, method="GET", data=None, token=None):
    url = f"{BASE}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = {"detail": err_body}
        return e.code, parsed


def run_tests():
    print("=" * 60)
    print("RUNNING END-TO-END ACCEPTANCE TESTS")
    print("=" * 60)

    # 1. Health check
    status, res = make_request("/health")
    assert status == 200, f"Health check failed: {res}"
    print(f"[OK] [PASS] Health Check: {res['service']} ({res['city']})")

    # 2. Get Services
    status, services = make_request("/services")
    assert status == 200 and len(services) > 0, "Failed to load services"
    print(f"[OK] [PASS] Loaded {len(services)} active configured services.")

    # 3. Location restriction: Non-Junagadh booking rejection
    bad_booking = {
        "customer_name": "Rajkot Customer",
        "customer_phone": "9825012345",
        "service_id": "full-home-deep-cleaning",
        "city": "Rajkot",
        "locality": "Kalawad Road",
        "address": "Near Crystal Mall",
        "pincode": "360005",
        "scheduled_date": "2026-10-18",
        "scheduled_time": "10:00 AM - 12:00 PM"
    }
    status, res = make_request("/bookings", method="POST", data=bad_booking)
    assert status == 422 or status == 400, f"Expected rejection but got: {status} {res}"
    print("[OK] [PASS] Non-Junagadh booking was correctly rejected by backend.")

    # 4. Valid guest booking in Junagadh (No login required)
    import random
    rand_day = random.randint(20, 28)
    test_slot = random.choice([
        "08:00 AM - 10:00 AM",
        "10:00 AM - 12:00 PM",
        "12:00 PM - 02:00 PM",
        "02:00 PM - 04:00 PM",
        "04:00 PM - 06:00 PM",
        "06:00 PM - 08:00 PM"
    ])
    good_booking = {
        "customer_name": "Bhavin Bhai Vora",
        "customer_phone": "9825198765",
        "customer_email": "bhavin.vora@example.com",
        "service_id": "full-home-deep-cleaning",
        "city": "Junagadh",
        "locality": "Zanzarda Road",
        "address": "Flat 201, Shanti Niketan, Zanzarda Road",
        "pincode": "362002",
        "scheduled_date": f"2026-10-{rand_day}",
        "scheduled_time": test_slot,
        "notes": "First floor flat, please bring extra vacuum nozzles"
    }
    status, booking_res = make_request("/bookings", method="POST", data=good_booking)
    assert status == 201, f"Booking creation failed: {booking_res}"
    booking_code = booking_res["booking_code"]
    print(f"[OK] [PASS] Guest booking created without login: {booking_code} (Status: {booking_res['status']})")

    # 5. Customer track booking without login
    status, track_res = make_request(f"/bookings/track?code={booking_code}")
    assert status == 200 and len(track_res) > 0, f"Tracking failed: {track_res}"
    print(f"[OK] [PASS] Customer tracked booking {booking_code} without login (Current status: {track_res[0]['status']})")

    # 6. Admin Security: Unauthorized email rejection
    unauth_login = {
        "email": "hacker@evil.com",
        "password": "Password123"
    }
    status, res = make_request("/admin/login", method="POST", data=unauth_login)
    assert status == 401, f"Expected 401 for unauthorized email, got {status}: {res}"
    print("[OK] [PASS] Non-authorized email strictly rejected by admin authentication.")

    # 7. Admin Security: Unauthenticated request to protected admin endpoint
    status, res = make_request("/admin/dashboard")
    assert status == 401, f"Expected 401 for unauthenticated admin access, got {status}: {res}"
    print("[OK] [PASS] Direct request to protected admin endpoint /admin/dashboard was rejected (HTTP 401).")

    # 8. Authorized Admin Login with environment configured email/ID
    auth_login = {
        "email": "junagadh",
        "password": "Soham@1712"
    }
    status, login_res = make_request("/admin/login", method="POST", data=auth_login)
    assert status == 200 and "token" in login_res, f"Admin login failed: {login_res}"
    admin_token = login_res["token"]
    print(f"[OK] [PASS] Authorized admin logged in successfully. HMAC token issued.")

    # 9. Access protected Admin Dashboard with token
    status, dash_res = make_request("/admin/dashboard", token=admin_token)
    assert status == 200, f"Admin dashboard request failed: {dash_res}"
    print(f"[OK] [PASS] Admin dashboard accessed: {dash_res['total_bookings']} total bookings, {dash_res['pending_requests']} pending.")

    # 10. Admin accepts booking
    # Find the id of our new booking
    status, admin_bookings = make_request("/admin/bookings", token=admin_token)
    new_b = next((b for b in admin_bookings if b["booking_code"] == booking_code), None)
    assert new_b is not None, "Booking not found in admin bookings list"

    status, patch_res = make_request(f"/admin/bookings/{new_b['id']}/status", method="PATCH", data={"status": "confirmed"}, token=admin_token)
    assert status == 200, f"Failed to confirm booking: {patch_res}"
    print(f"[OK] [PASS] Admin confirmed booking {booking_code}.")

    # 11. Admin assigns technician
    status, assign_res = make_request(f"/admin/bookings/{new_b['id']}/assign", method="PATCH", data={"technician_id": "tech-1"}, token=admin_token)
    assert status == 200, f"Failed to assign technician: {assign_res}"
    print(f"[OK] [PASS] Admin assigned technician to booking {booking_code} ({assign_res['technician_name']}).")

    # 12. Admin Reports
    status, reports_res = make_request("/admin/reports", token=admin_token)
    assert status == 200, f"Failed to get reports: {reports_res}"
    print(f"[OK] [PASS] Admin reports retrieved: {reports_res['summary']['total_bookings']} bookings recorded.")

    # 13. Smart Past Slot Availability (Asia/Kolkata IST)
    from datetime import datetime, timezone, timedelta
    IST = timezone(timedelta(hours=5, minutes=30))
    now_ist = datetime.now(IST)
    today_str = now_ist.strftime("%Y-%m-%d")

    status, avail_res = make_request(f"/availability?date={today_str}")
    assert status == 200, f"Availability check failed: {avail_res}"
    print(f"[OK] [PASS] Real-time IST availability fetched for {today_str} (Server IST: {avail_res['server_time_ist']}).")

    # If current hour >= 10, then "08:00 AM - 10:00 AM" must be marked as "past"
    slot_8am = next((s for s in avail_res["slots"] if "08:00 AM" in s["slot"]), None)
    if slot_8am and now_ist.hour >= 10:
        assert slot_8am["status"] == "past" and not slot_8am["is_available"], "Expected 8 AM slot to be disabled as past"
        print(f"[OK] [PASS] Morning past slot ({slot_8am['slot']}) correctly disabled with status: '{slot_8am['status']}'.")

    # 14. Real-Time Slot Collision & Double-Booking Prevention
    # Pick a random future date so slots are open
    future_offset = random.randint(1, 25)
    tomorrow_str = (now_ist + timedelta(days=future_offset)).strftime("%Y-%m-%d")
    target_slot = random.choice([
        "10:00 AM - 12:00 PM",
        "12:00 PM - 02:00 PM",
        "02:00 PM - 04:00 PM",
        "04:00 PM - 06:00 PM"
    ])
    test_service_id = "full-home-deep-cleaning"

    # Customer A books tomorrow's 2 PM slot
    cust_a_booking = {
        "customer_name": "Customer A (Junagadh)",
        "customer_phone": "9825000001",
        "service_id": test_service_id,
        "city": "Junagadh",
        "locality": "Zanzarda Road",
        "address": "Block A, Shreenathji Residency",
        "pincode": "362002",
        "scheduled_date": tomorrow_str,
        "scheduled_time": target_slot
    }
    status, res_a = make_request("/bookings", method="POST", data=cust_a_booking)
    assert status == 201, f"Customer A booking failed: {res_a}"
    booking_a_code = res_a["booking_code"]
    print(f"[OK] [PASS] Customer A successfully booked {tomorrow_str} {target_slot} (Code: {booking_a_code}).")

    # Verify slot is now immediately marked as "booked" in availability endpoint for Customer B
    status, avail_tomorrow = make_request(f"/availability?date={tomorrow_str}&service_id={test_service_id}")
    assert status == 200, f"Failed to check tomorrow availability: {avail_tomorrow}"
    booked_slot_obj = next((s for s in avail_tomorrow["slots"] if s["slot"] == target_slot), None)
    assert booked_slot_obj is not None and booked_slot_obj["status"] == "booked" and not booked_slot_obj["is_available"], \
        f"Expected slot to be 'booked', but got {booked_slot_obj}"
    print(f"[OK] [PASS] Real-time blocking verified: slot {target_slot} is immediately marked as 'booked' for other customers.")

    # 15. Customer B attempts to book the same slot -> Must receive 409 Conflict
    cust_b_booking = {
        "customer_name": "Customer B (Junagadh)",
        "customer_phone": "9825000002",
        "service_id": test_service_id,
        "city": "Junagadh",
        "locality": "Joshipura",
        "address": "Street 4, Near Temple",
        "pincode": "362002",
        "scheduled_date": tomorrow_str,
        "scheduled_time": target_slot
    }
    status, res_b = make_request("/bookings", method="POST", data=cust_b_booking)
    assert status == 409, f"Expected 409 Conflict for double booking attempt, got {status}: {res_b}"
    print(f"[OK] [PASS] Simultaneous double-booking strictly prevented! Backend returned HTTP 409 Conflict: '{res_b.get('detail')}'.")

    # 16. Past time slot rejection on backend
    past_booking = {
        "customer_name": "Test Customer",
        "customer_phone": "9825000003",
        "service_id": test_service_id,
        "city": "Junagadh",
        "locality": "Zanzarda Road",
        "address": "Zanzarda Road",
        "pincode": "362002",
        "scheduled_date": today_str,
        "scheduled_time": "08:00 AM - 10:00 AM" # past slot
    }
    status, res_past = make_request("/bookings", method="POST", data=past_booking)
    assert status == 400, f"Expected 400 for past slot, got {status}: {res_past}"
    print(f"[OK] [PASS] Booking past time slot on today's date strictly rejected by server: '{res_past.get('detail')}'.")

    # 17. Cancellation restores slot availability immediately
    # Admin cancels Customer A's booking
    status, all_admin_b = make_request("/admin/bookings", token=admin_token)
    b_a = next((b for b in all_admin_b if b["booking_code"] == booking_a_code), None)
    assert b_a is not None
    status, cancel_res = make_request(f"/admin/bookings/{b_a['id']}/status", method="PATCH", data={"status": "cancelled"}, token=admin_token)
    assert status == 200, f"Failed to cancel booking: {cancel_res}"

    # Verify slot is available again!
    status, avail_after_cancel = make_request(f"/availability?date={tomorrow_str}&service_id={test_service_id}")
    unbooked_slot_obj = next((s for s in avail_after_cancel["slots"] if s["slot"] == target_slot), None)
    assert unbooked_slot_obj is not None and unbooked_slot_obj["status"] == "available" and unbooked_slot_obj["is_available"], \
        f"Expected slot to be 'available' after cancellation, got {unbooked_slot_obj}"
    print(f"[OK] [PASS] Cancellation dynamically restored slot availability! Slot {target_slot} is now 'available' again.")

    print("=" * 60)
    print("ALL 17 ACCEPTANCE & REAL-TIME SLOT TESTS PASSED (100% VERIFIED)!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()

