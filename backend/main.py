"""
FastAPI Backend Application for HomeEase Junagadh
Includes:
- Public customer endpoints (zero login required, Junagadh validation, tracking)
- Secure admin endpoints (strictly protected with AUTHORIZED_ADMIN_EMAIL validation)
- CORS middleware
- Automatic database schema creation & seeding on startup
"""

import os
import random
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from sqlalchemy.exc import IntegrityError

IST = timezone(timedelta(hours=5, minutes=30))

def get_current_ist_datetime():
    return datetime.now(IST)

def parse_slot_start(slot_str: str) -> tuple:
    """Parses start time of a slot e.g. '08:00 AM - 10:00 AM' -> (8, 0)"""
    try:
        start_part = slot_str.split("-")[0].strip()
        t = datetime.strptime(start_part, "%I:%M %p").time()
        return t.hour, t.minute
    except Exception:
        return 0, 0


from database import engine, get_db, Base
from models import (
    AdminUser,
    ServiceCategory,
    Service,
    Technician,
    ServiceArea,
    AvailabilitySlot,
    Booking,
    CustomerContact,
    PaymentTransaction,
    AdminActivityLog,
    WebsiteSetting
)
from auth import (
    AUTHORIZED_ADMIN_EMAIL,
    hash_password,
    verify_password,
    create_admin_token,
    revoke_token,
    check_rate_limit,
    record_failed_attempt,
    clear_failed_attempts,
    get_current_admin,
    is_authorized_admin_identifier
)
import schemas
from seed import seed_database

app = FastAPI(
    title="HomeEase Junagadh API",
    description="Backend API for HomeEase Home Services Booking Platform - Junagadh, Gujarat",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Ensure database tables exist and are seeded on server boot."""
    Base.metadata.create_all(bind=engine)
    seed_database()


# ============================================================================
# 1. PUBLIC CUSTOMER ENDPOINTS (No authentication required)
# ============================================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HomeEase Junagadh",
        "city": "Junagadh, Gujarat",
        "authorized_admin": AUTHORIZED_ADMIN_EMAIL
    }


@app.get("/api/categories", response_model=List[schemas.ServiceCategoryOut])
def get_categories(db: Session = Depends(get_db)):
    """Fetch all active service categories along with their active services."""
    categories = db.query(ServiceCategory).filter(ServiceCategory.is_active == True).order_by(ServiceCategory.display_order).all()
    # Populate services per category
    result = []
    for cat in categories:
        services = db.query(Service).filter(
            Service.category_id == cat.id,
            Service.is_active == True
        ).all()
        result.append({
            "id": cat.id,
            "name": cat.name,
            "icon": cat.icon,
            "description": cat.description,
            "display_order": cat.display_order,
            "is_active": cat.is_active,
            "services": services
        })
    return result


@app.get("/api/services", response_model=List[schemas.ServiceOut])
def get_services(category: Optional[str] = None, db: Session = Depends(get_db)):
    """Fetch active services, optionally filtered by category slug."""
    query = db.query(Service).filter(Service.is_active == True)
    if category and category != "all":
        query = query.filter(Service.category_id == category)
    return query.all()


@app.get("/api/services/{service_id}", response_model=schemas.ServiceOut)
def get_service(service_id: str, db: Session = Depends(get_db)):
    """Fetch details of a specific service."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found.")
    return service


@app.get("/api/service-areas", response_model=List[schemas.ServiceAreaOut])
def get_service_areas(db: Session = Depends(get_db)):
    """List all configured service localities and pincodes in Junagadh."""
    return db.query(ServiceArea).filter(ServiceArea.is_active == True).all()


@app.get("/api/time-slots")
def get_time_slots(db: Session = Depends(get_db)):
    """List active service booking time slots."""
    slots = db.query(AvailabilitySlot).filter(AvailabilitySlot.is_active == True).all()
    return [{"id": s.id, "slot": s.time_slot} for s in slots]


@app.get("/api/availability")
def get_slot_availability(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    service_id: Optional[str] = Query(None, description="Service ID"),
    db: Session = Depends(get_db)
):
    """
    Real-Time Slot Availability in Indian Standard Time (Asia/Kolkata):
    - Automatically disables past dates and past time slots on today's date.
    - Real-time blocking: marks slot as 'booked' if another customer has an active booking.
    - Preserves customer privacy: returns only availability status, never personal booker data.
    """
    now_ist = get_current_ist_datetime()
    today_ist = now_ist.strftime("%Y-%m-%d")
    date_clean = date.strip()

    is_past_date = date_clean < today_ist
    is_today = date_clean == today_ist

    # Query all active time slots ordered
    slots = db.query(AvailabilitySlot).filter(AvailabilitySlot.is_active == True).all()

    # Query active bookings for this date (excluding cancelled/rejected)
    query = db.query(Booking).filter(
        Booking.scheduled_date == date_clean,
        Booking.status.notin_(["cancelled", "rejected"])
    )
    if service_id and service_id != "all":
        query = query.filter(Booking.service_id == service_id)
    
    active_bookings = query.all()
    booked_slots = set(b.scheduled_time for b in active_bookings)

    results = []
    for s in slots:
        slot_label = s.time_slot
        sh, sm = parse_slot_start(slot_label)

        if is_past_date:
            slot_status = "past"
            is_available = False
            reason = "Selected date has passed"
        elif is_today and ((sh < now_ist.hour) or (sh == now_ist.hour and sm <= now_ist.minute)):
            slot_status = "past"
            is_available = False
            reason = "Unavailable (Time Passed)"
        elif slot_label in booked_slots:
            slot_status = "booked"
            is_available = False
            reason = "Booked by another customer"
        else:
            slot_status = "available"
            is_available = True
            reason = None

        results.append({
            "id": s.id,
            "slot": slot_label,
            "status": slot_status,
            "is_available": is_available,
            "reason": reason
        })

    return {
        "date": date_clean,
        "is_today": is_today,
        "server_time_ist": now_ist.strftime("%Y-%m-%d %I:%M %p"),
        "total_slots": len(results),
        "available_count": sum(1 for r in results if r["is_available"]),
        "slots": results
    }


@app.get("/api/settings/public")
def get_public_settings(db: Session = Depends(get_db)):
    """Return customer-facing contact details and hours."""
    settings = db.query(WebsiteSetting).all()
    data = {s.key: s.value for s in settings}
    return {
        "business_name": data.get("business_name", "HomeEase Junagadh"),
        "phone": data.get("phone", "+91 90165 26419"),
        "whatsapp": data.get("whatsapp", "+91 90165 26419"),
        "email": data.get("email", "support@homeease.in"),
        "address": data.get("address", "Opp. Swaminarayan Temple, Zanzarda Road, Junagadh, Gujarat 362002"),
        "operating_hours": data.get("operating_hours", "Mon - Sun: 8:00 AM - 8:30 PM"),
        "service_city": "Junagadh, Gujarat",
        "service_status": data.get("service_status", "Operational")
    }


@app.post("/api/bookings", response_model=schemas.BookingConfirmationOut, status_code=status.HTTP_201_CREATED)
def create_guest_booking(req: schemas.CreateBookingRequest, db: Session = Depends(get_db)):
    """
    Public Customer Booking Endpoint:
    - Zero registration or login required.
    - Validates service exists and Junagadh location eligibility.
    - Server-side past slot blocking in Asia/Kolkata timezone.
    - Atomic real-time slot concurrency check: prevents double booking.
    - Generates unique reference code JND-2026-XXXX.
    - Stores contact record and booking in database.
    """
    # 1. Validate service
    service = db.query(Service).filter(Service.id == req.service_id, Service.is_active == True).first()
    if not service:
        raise HTTPException(status_code=400, detail="The selected service is currently unavailable.")

    # 2. Validate location is within Junagadh service area
    if req.city.strip().lower() != "junagadh":
        raise HTTPException(
            status_code=400,
            detail="HomeEase is currently exclusive to Junagadh, Gujarat. Bookings from other cities cannot be accepted."
        )

    # 3. Server-side IST date and past time slot validation
    now_ist = get_current_ist_datetime()
    today_ist = now_ist.strftime("%Y-%m-%d")
    sched_date = req.scheduled_date.strip()
    sched_slot = req.scheduled_time.strip()

    if sched_date < today_ist:
        raise HTTPException(
            status_code=400,
            detail="Cannot book an appointment for a date in the past. Please select today or a future date."
        )

    if sched_date == today_ist:
        sh, sm = parse_slot_start(sched_slot)
        if (sh < now_ist.hour) or (sh == now_ist.hour and sm <= now_ist.minute):
            raise HTTPException(
                status_code=400,
                detail=f"The selected time slot ({sched_slot}) has already started or passed today. Please choose an upcoming available time slot."
            )

    # 4. Atomic Concurrency & Real-Time Slot Collision Check
    # Use with_for_update() to lock matching rows so that two simultaneous
    # requests cannot both pass this check before either commits.
    # SQLite serializes writes by default; for PostgreSQL this issues SELECT FOR UPDATE.
    conflict_booking = db.query(Booking).filter(
        Booking.scheduled_date == sched_date,
        Booking.scheduled_time == sched_slot,
        Booking.service_id == service.id,
        Booking.status.notin_(["cancelled", "rejected"])
    ).with_for_update().first()

    if conflict_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Sorry, this slot has just been booked. Please select another available time."
        )

    # 5. Generate unique booking code
    random_num = random.randint(1000, 9999)
    booking_code = f"JND-2026-{random_num}"
    while db.query(Booking).filter(Booking.booking_code == booking_code).first():
        random_num = random.randint(1000, 9999)
        booking_code = f"JND-2026-{random_num}"

    # 6. Create Booking
    new_booking = Booking(
        booking_code=booking_code,
        service_id=service.id,
        service_name=service.name,
        customer_name=req.customer_name.strip(),
        customer_phone=req.customer_phone.strip(),
        customer_email=req.customer_email.strip() if req.customer_email else None,
        city="Junagadh",
        locality=req.locality.strip(),
        address=req.address.strip(),
        pincode=req.pincode.strip(),
        scheduled_date=sched_date,
        scheduled_time=sched_slot,
        notes=req.notes.strip() if req.notes else None,
        status="pending",
        total_amount=service.price,
        payment_status="pending",
        payment_method="Cash after Service"
    )
    db.add(new_booking)

    # 5. Upsert Customer Contact
    contact = db.query(CustomerContact).filter(CustomerContact.phone == req.customer_phone.strip()).first()
    if contact:
        contact.name = req.customer_name.strip()
        contact.locality = req.locality.strip()
        contact.full_address = req.address.strip()
        contact.pincode = req.pincode.strip()
        contact.total_bookings += 1
        contact.last_booking_at = datetime.utcnow()
    else:
        contact = CustomerContact(
            name=req.customer_name.strip(),
            phone=req.customer_phone.strip(),
            email=req.customer_email.strip() if req.customer_email else None,
            city="Junagadh",
            locality=req.locality.strip(),
            full_address=req.address.strip(),
            pincode=req.pincode.strip(),
            total_bookings=1
        )
        db.add(contact)

    # 7. Commit with IntegrityError protection (final safety net for race conditions)
    try:
        db.commit()
        db.refresh(new_booking)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot was just taken by another customer. Please choose a different slot."
        )

    return {
        "booking_code": new_booking.booking_code,
        "status": new_booking.status,
        "customer_name": new_booking.customer_name,
        "customer_phone": new_booking.customer_phone,
        "service_name": new_booking.service_name,
        "total_amount": new_booking.total_amount,
        "scheduled_date": new_booking.scheduled_date,
        "scheduled_time": new_booking.scheduled_time,
        "address": new_booking.address,
        "locality": new_booking.locality,
        "pincode": new_booking.pincode,
        "message": f"Your booking request for Junagadh has been registered successfully with Reference ID {booking_code}."
    }


@app.get("/api/bookings/track")
def track_bookings(
    code: Optional[str] = Query(None, description="Booking Reference e.g. JND-2026-1001"),
    phone: Optional[str] = Query(None, description="10-digit Customer Phone Number"),
    db: Session = Depends(get_db)
):
    """
    Allow customers to look up and track their service requests in real-time
    by either their Booking Reference ID or registered Mobile Number.
    No login required.
    """
    if not code and not phone:
        raise HTTPException(status_code=400, detail="Please provide either a Booking Reference ID or Mobile Number.")

    query = db.query(Booking)
    if code:
        query = query.filter(Booking.booking_code.ilike(code.strip()))
    elif phone:
        clean_phone = "".join(filter(str.isdigit, phone))[-10:]
        query = query.filter(Booking.customer_phone.endswith(clean_phone))

    bookings = query.order_by(desc(Booking.created_at)).all()
    if not bookings:
        raise HTTPException(
            status_code=404,
            detail="No booking found matching your details in Junagadh. Please verify your reference ID or phone number."
        )

    results = []
    for b in bookings:
        tech_name = b.technician.name if b.technician else None
        tech_phone = b.technician.phone if b.technician else None
        results.append({
            "booking_code": b.booking_code,
            "service_name": b.service_name,
            "customer_name": b.customer_name,
            "customer_phone": b.customer_phone,
            "address": b.address,
            "locality": b.locality,
            "pincode": b.pincode,
            "scheduled_date": b.scheduled_date,
            "scheduled_time": b.scheduled_time,
            "status": b.status,
            "total_amount": b.total_amount,
            "payment_status": b.payment_status,
            "technician_name": tech_name,
            "technician_phone": tech_phone,
            "created_at": b.created_at.strftime("%Y-%m-%d %H:%M") if b.created_at else ""
        })
    return results


# ============================================================================
# 2. PRIVATE ADMIN ENDPOINTS (Protected with AUTHORIZED_ADMIN_EMAIL validation)
# ============================================================================

@app.post("/api/admin/login", response_model=schemas.AdminLoginResponse)
def admin_login(req: schemas.AdminLoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Secure Admin Login:
    - Enforces rate limiting (5 failed attempts -> 15 min lock).
    - Checks email strictly against AUTHORIZED_ADMIN_EMAIL.
    - Verifies password using PBKDF2 hash.
    - Issues HMAC-SHA256 bearer token.
    """
    client_ip = request.client.host if request.client else "unknown"
    rate_key = f"{req.email.lower().strip()}_{client_ip}"
    check_rate_limit(rate_key)

    email_clean = req.email.strip().lower()

    # Reject non-authorized email/ID immediately
    if not is_authorized_admin_identifier(email_clean):
        record_failed_attempt(rate_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrator credentials or unauthorized administrator identifier."
        )

    admin = db.query(AdminUser).filter(AdminUser.email == email_clean, AdminUser.is_active == True).first()
    if not admin:
        admin = db.query(AdminUser).filter(AdminUser.email == "junagadh", AdminUser.is_active == True).first()
    if not admin:
        admin = db.query(AdminUser).filter(AdminUser.is_active == True).first()

    if not admin or not verify_password(req.password, admin.password_hash):
        record_failed_attempt(rate_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrator credentials. Please check your password."
        )

    # Success: clear failed attempts, update login timestamp, generate signed token
    clear_failed_attempts(rate_key)
    admin.last_login = datetime.utcnow()
    db.commit()

    token = create_admin_token(admin.email)

    # Log action
    log = AdminActivityLog(
        admin_email=admin.email,
        action="LOGIN",
        details="Admin logged in successfully",
        ip_address=client_ip
    )
    db.add(log)
    db.commit()

    return {
        "token": token,
        "email": admin.email,
        "message": "Authenticated successfully as administrator."
    }


@app.post("/api/admin/logout")
def admin_logout(admin: dict = Depends(get_current_admin)):
    """Invalidates the active admin session token."""
    revoke_token(admin["token"])
    return {"message": "Admin session logged out and token invalidated."}


@app.get("/api/admin/me")
def get_admin_profile(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Fetch profile of current authenticated administrator."""
    record = db.query(AdminUser).filter(AdminUser.email == admin["email"]).first()
    return {
        "email": admin["email"],
        "full_name": record.full_name if record else "Administrator",
        "last_login": record.last_login.strftime("%Y-%m-%d %H:%M:%S") if record and record.last_login else None
    }


@app.get("/api/admin/dashboard")
def get_dashboard_summary(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    """
    Returns real, database-backed aggregate stats for the Admin Dashboard:
    - Total bookings and bookings by status (pending, confirmed, in_progress, completed, cancelled)
    - Today's bookings and upcoming appointments
    - Actual revenue from eligible completed/paid bookings with clearly defined calculations
    - Total registered customers
    - Active services and their configured prices
    - Available, booked, cancelled, and completed appointment slots
    - Real booking trends calculated from actual records
    """
    all_bookings = db.query(Booking).order_by(desc(Booking.created_at)).all()
    total = len(all_bookings)
    pending = len([b for b in all_bookings if b.status == "pending"])
    confirmed = len([b for b in all_bookings if b.status == "confirmed"])
    in_progress = len([b for b in all_bookings if b.status == "in_progress"])
    completed = len([b for b in all_bookings if b.status == "completed"])
    cancelled = len([b for b in all_bookings if b.status in ["cancelled", "rejected"]])

    # Revenue calculations clearly defined:
    # 1. Eligible Completed Revenue: only completed bookings
    completed_bookings = [b for b in all_bookings if b.status == "completed"]
    eligible_completed_revenue = float(sum(b.total_amount for b in completed_bookings))

    # 2. Gross booking value (all non-cancelled)
    non_cancelled_bookings = [b for b in all_bookings if b.status not in ["cancelled", "rejected"]]
    gross_booking_value = float(sum(b.total_amount for b in non_cancelled_bookings))

    # 3. Pending payments
    pending_payments = float(sum(b.total_amount for b in non_cancelled_bookings if b.payment_status != "completed" and b.status != "completed"))

    # 4. Cancelled value (excluded from revenue)
    cancelled_bookings = [b for b in all_bookings if b.status in ["cancelled", "rejected"]]
    cancelled_value = float(sum(b.total_amount for b in cancelled_bookings))

    # Net revenue is strictly eligible completed revenue
    net_revenue = eligible_completed_revenue

    # Today's date in IST
    now_ist = get_current_ist_datetime()
    today_ist = now_ist.strftime("%Y-%m-%d")

    today_bookings = [
        {
            "id": b.id,
            "booking_code": b.booking_code,
            "service_name": b.service_name,
            "customer_name": b.customer_name,
            "customer_phone": b.customer_phone,
            "locality": b.locality,
            "scheduled_date": b.scheduled_date,
            "scheduled_time": b.scheduled_time,
            "status": b.status,
            "total_amount": b.total_amount
        }
        for b in all_bookings
        if b.scheduled_date == today_ist and b.status not in ["cancelled", "rejected"]
    ]

    upcoming_bookings = [
        {
            "id": b.id,
            "booking_code": b.booking_code,
            "service_name": b.service_name,
            "customer_name": b.customer_name,
            "customer_phone": b.customer_phone,
            "locality": b.locality,
            "scheduled_date": b.scheduled_date,
            "scheduled_time": b.scheduled_time,
            "status": b.status,
            "total_amount": b.total_amount
        }
        for b in all_bookings
        if b.scheduled_date >= today_ist and b.status in ["pending", "confirmed", "in_progress"]
    ]

    # Total registered/contacted customers from database
    total_customers = db.query(CustomerContact).count()
    if total_customers == 0:
        unique_phones = {b.customer_phone for b in all_bookings}
        total_customers = len(unique_phones)

    # Active services and configured prices
    services_db = db.query(Service).order_by(Service.price.asc()).all()
    active_services_count = len([s for s in services_db if s.is_active])
    active_services_summary = [
        {
            "id": s.id,
            "name": s.name,
            "category_id": s.category_id,
            "price": s.price,
            "original_price": s.original_price,
            "duration_minutes": s.duration_minutes,
            "is_active": s.is_active,
            "is_popular": s.is_popular
        }
        for s in services_db
    ]

    # Slot utilization: available, booked, completed, cancelled
    db_slots = db.query(AvailabilitySlot).filter(AvailabilitySlot.is_active == True).all()
    slots_summary = []
    for slot_obj in db_slots:
        s_text = slot_obj.time_slot
        booked_cnt = len([b for b in all_bookings if b.scheduled_time == s_text and b.status in ["pending", "confirmed", "in_progress"]])
        comp_cnt = len([b for b in all_bookings if b.scheduled_time == s_text and b.status == "completed"])
        canc_cnt = len([b for b in all_bookings if b.scheduled_time == s_text and b.status in ["cancelled", "rejected"]])
        max_cap = slot_obj.max_bookings or 5
        avail_cnt = max(0, max_cap - booked_cnt)
        slots_summary.append({
            "slot": s_text,
            "max_capacity": max_cap,
            "booked_count": booked_cnt,
            "completed_count": comp_cnt,
            "cancelled_count": canc_cnt,
            "available_count": avail_cnt
        })

    # Real monthly trend calculated from actual bookings
    month_data = {}
    for b in all_bookings:
        month_str = b.scheduled_date[:7] if b.scheduled_date and len(b.scheduled_date) >= 7 else (b.created_at.strftime("%Y-%m") if b.created_at else "2026-10")
        if month_str not in month_data:
            month_data[month_str] = {"month": month_str, "bookings": 0, "revenue": 0.0, "completed": 0}
        month_data[month_str]["bookings"] += 1
        if b.status == "completed":
            month_data[month_str]["revenue"] += b.total_amount
            month_data[month_str]["completed"] += 1

    sorted_months = sorted(month_data.keys())
    monthly_trend = [
        {
            "month": m,
            "bookings": month_data[m]["bookings"],
            "revenue": round(month_data[m]["revenue"], 2),
            "completed": month_data[m]["completed"]
        }
        for m in sorted_months
    ]

    recent_bookings = [
        {
            "id": b.id,
            "booking_code": b.booking_code,
            "service_id": b.service_id,
            "service_name": b.service_name,
            "customer_name": b.customer_name,
            "customer_phone": b.customer_phone,
            "customer_email": b.customer_email,
            "locality": b.locality,
            "address": b.address,
            "pincode": b.pincode,
            "scheduled_date": b.scheduled_date,
            "scheduled_time": b.scheduled_time,
            "status": b.status,
            "payment_status": b.payment_status,
            "payment_method": b.payment_method,
            "total_amount": b.total_amount,
            "technician_name": b.technician.name if b.technician else None,
            "created_at": b.created_at.strftime("%Y-%m-%d %H:%M") if b.created_at else ""
        }
        for b in all_bookings[:8]
    ]

    return {
        "total_bookings": total,
        "pending_requests": pending,
        "confirmed_bookings": confirmed,
        "in_progress_bookings": in_progress,
        "completed_bookings": completed,
        "cancelled_bookings": cancelled,
        "status_distribution": [
            {"status": "pending", "count": pending},
            {"status": "confirmed", "count": confirmed},
            {"status": "in_progress", "count": in_progress},
            {"status": "completed", "count": completed},
            {"status": "cancelled", "count": cancelled},
        ],
        "gross_booking_value": gross_booking_value,
        "eligible_completed_revenue": eligible_completed_revenue,
        "total_revenue": eligible_completed_revenue,
        "pending_payments": pending_payments,
        "cancelled_revenue": cancelled_value,
        "collected_payments": eligible_completed_revenue,
        "refunds": 0.0,
        "net_revenue": net_revenue,
        "revenue_calculation_definition": "Net Revenue is calculated strictly from eligible completed bookings. Cancelled and pending bookings are excluded.",
        "today_bookings_count": len(today_bookings),
        "today_bookings": today_bookings,
        "upcoming_bookings_count": len(upcoming_bookings),
        "upcoming_bookings": upcoming_bookings,
        "total_customers": total_customers,
        "active_services_count": active_services_count,
        "active_services": active_services_summary,
        "slots_summary": slots_summary,
        "monthly_trend": monthly_trend,
        "recent_bookings": recent_bookings,
    }


@app.get("/api/admin/reports")
def get_admin_reports(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Audited reports computed strictly from real database records.
    Distinguishes realized completed revenue, pending collections, and cancelled values.
    """
    all_bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()
    total = len(all_bookings)
    completed_bookings = [b for b in all_bookings if b.status == "completed"]
    cancelled_bookings = [b for b in all_bookings if b.status in ["cancelled", "rejected"]]
    pending_bookings = [b for b in all_bookings if b.status == "pending"]
    confirmed_bookings = [b for b in all_bookings if b.status in ["confirmed", "in_progress"]]

    gross_booking_value = round(sum(b.total_amount for b in all_bookings), 2)
    eligible_completed_revenue = round(sum(b.total_amount for b in completed_bookings), 2)
    pending_payments = round(sum(b.total_amount for b in pending_bookings + confirmed_bookings), 2)
    cancelled_value = round(sum(b.total_amount for b in cancelled_bookings), 2)
    avg_order_value = round(eligible_completed_revenue / len(completed_bookings), 2) if completed_bookings else 0.0

    # Top services performance from real records
    service_map = {}
    for b in all_bookings:
        s_name = b.service_name or "General Service"
        if s_name not in service_map:
            service_map[s_name] = {
                "name": s_name,
                "total_bookings": 0,
                "completed_bookings": 0,
                "cancelled_bookings": 0,
                "completed_revenue": 0.0,
                "gross_value": 0.0,
            }
        service_map[s_name]["total_bookings"] += 1
        service_map[s_name]["gross_value"] = round(service_map[s_name]["gross_value"] + b.total_amount, 2)
        if b.status == "completed":
            service_map[s_name]["completed_bookings"] += 1
            service_map[s_name]["completed_revenue"] = round(service_map[s_name]["completed_revenue"] + b.total_amount, 2)
        elif b.status in ["cancelled", "rejected"]:
            service_map[s_name]["cancelled_bookings"] += 1

    top_services = sorted(service_map.values(), key=lambda x: x["total_bookings"], reverse=True)

    status_distribution = [
        {"status": "pending", "count": len(pending_bookings)},
        {"status": "confirmed", "count": len([b for b in all_bookings if b.status == "confirmed"])},
        {"status": "in_progress", "count": len([b for b in all_bookings if b.status == "in_progress"])},
        {"status": "completed", "count": len(completed_bookings)},
        {"status": "cancelled", "count": len(cancelled_bookings)},
    ]

    export_rows = [
        {
            "booking_code": b.booking_code,
            "service": b.service_name,
            "customer": b.customer_name,
            "phone": b.customer_phone,
            "email": b.customer_email or "",
            "locality": b.locality or "",
            "address": b.address or "",
            "pincode": b.pincode or "",
            "date": b.scheduled_date,
            "time": b.scheduled_time,
            "status": b.status,
            "payment_status": b.payment_status or "pending",
            "payment_method": b.payment_method or "cash",
            "amount": b.total_amount,
        }
        for b in all_bookings
    ]

    return {
        "metrics": {
            "total_bookings": total,
            "completed_bookings": len(completed_bookings),
            "cancelled_bookings": len(cancelled_bookings),
            "pending_bookings": len(pending_bookings),
            "confirmed_bookings": len(confirmed_bookings),
            "gross_booking_value": gross_booking_value,
            "eligible_completed_revenue": eligible_completed_revenue,
            "total_revenue": eligible_completed_revenue,
            "pending_payments": pending_payments,
            "cancelled_value": cancelled_value,
            "avg_order_value": avg_order_value,
            "revenue_calculation_definition": "Net Revenue is calculated strictly from eligible completed bookings. Cancelled, pending, and unverified payments are strictly excluded."
        },
        "top_services": top_services,
        "status_distribution": status_distribution,
        "export_rows": export_rows,
    }


@app.get("/api/admin/bookings")
def list_admin_bookings(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List bookings with optional status filtering and full search across reference, phone, and customer name."""
    query = db.query(Booking)
    if status and status != "all":
        query = query.filter(Booking.status == status)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Booking.booking_code.ilike(s),
                Booking.customer_phone.ilike(s),
                Booking.customer_name.ilike(s),
                Booking.service_name.ilike(s),
                Booking.locality.ilike(s)
            )
        )

    bookings = query.order_by(desc(Booking.created_at)).all()
    results = []
    for b in bookings:
        tech_name = b.technician.name if b.technician else None
        results.append({
            "id": b.id,
            "booking_code": b.booking_code,
            "service_id": b.service_id,
            "service_name": b.service_name,
            "customer_name": b.customer_name,
            "customer_phone": b.customer_phone,
            "customer_email": b.customer_email,
            "city": b.city,
            "locality": b.locality,
            "address": b.address,
            "pincode": b.pincode,
            "scheduled_date": b.scheduled_date,
            "scheduled_time": b.scheduled_time,
            "notes": b.notes,
            "status": b.status,
            "total_amount": b.total_amount,
            "payment_status": b.payment_status,
            "payment_method": b.payment_method,
            "technician_id": b.technician_id,
            "technician_name": tech_name,
            "rejection_reason": b.rejection_reason,
            "created_at": b.created_at.strftime("%Y-%m-%d %H:%M") if b.created_at else ""
        })
    return results


@app.patch("/api/admin/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    req: schemas.UpdateBookingStatusRequest,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Accept, reject, complete, or cancel a booking."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    booking.status = req.status
    booking.updated_at = datetime.utcnow()
    if req.status == "rejected" and req.reason:
        booking.rejection_reason = req.reason
    if req.status == "completed":
        booking.payment_status = "completed"

    db.add(AdminActivityLog(
        admin_email=admin["email"],
        action="UPDATE_STATUS",
        details=f"Updated booking {booking.booking_code} status to {req.status}"
    ))
    db.commit()
    return {"message": f"Booking {booking.booking_code} status updated to {req.status}.", "status": booking.status}


@app.patch("/api/admin/bookings/{booking_id}/assign")
def assign_technician(
    booking_id: int,
    req: schemas.AssignTechnicianRequest,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Assign an authorized Junagadh technician to a booking."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    tech = db.query(Technician).filter(Technician.id == req.technician_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found.")

    booking.technician_id = tech.id
    if booking.status == "pending":
        booking.status = "confirmed"

    db.add(AdminActivityLog(
        admin_email=admin["email"],
        action="ASSIGN_TECH",
        details=f"Assigned technician {tech.name} to booking {booking.booking_code}"
    ))
    db.commit()
    return {"message": f"Technician {tech.name} assigned successfully.", "technician_name": tech.name}


@app.patch("/api/admin/bookings/{booking_id}/reschedule")
def reschedule_booking(
    booking_id: int,
    req: schemas.RescheduleBookingRequest,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Reschedule date and time slot for a booking."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    # Check target slot conflict
    now_ist = get_current_ist_datetime()
    today_ist = now_ist.strftime("%Y-%m-%d")
    target_date = req.scheduled_date.strip()
    target_slot = req.scheduled_time.strip()

    if target_date < today_ist:
        raise HTTPException(status_code=400, detail="Cannot reschedule to a date in the past.")

    if target_date == today_ist:
        sh, sm = parse_slot_start(target_slot)
        if (sh < now_ist.hour) or (sh == now_ist.hour and sm <= now_ist.minute):
            raise HTTPException(status_code=400, detail="Cannot reschedule to a past time slot today.")

    conflict = db.query(Booking).filter(
        Booking.id != booking_id,
        Booking.scheduled_date == target_date,
        Booking.scheduled_time == target_slot,
        Booking.service_id == booking.service_id,
        Booking.status.notin_(["cancelled", "rejected"])
    ).first()
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The target slot is already booked by another active appointment."
        )

    booking.scheduled_date = target_date
    booking.scheduled_time = target_slot
    if req.notes:
        booking.notes = f"{booking.notes or ''} [Rescheduled: {req.notes}]"

    db.add(AdminActivityLog(
        admin_email=admin["email"],
        action="RESCHEDULE",
        details=f"Rescheduled {booking.booking_code} to {target_date} {target_slot}"
    ))
    db.commit()
    return {"message": f"Booking {booking.booking_code} rescheduled successfully to {target_date} {target_slot}."}


@app.get("/api/admin/technicians", response_model=List[schemas.TechnicianOut])
def get_technicians(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    """List all registered service technicians in Junagadh."""
    return db.query(Technician).all()


@app.post("/api/admin/technicians", response_model=schemas.TechnicianOut)
def create_technician(
    req: schemas.CreateTechnicianRequest,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new technician."""
    tech_id = f"tech-{random.randint(100, 999)}"
    tech = Technician(
        id=tech_id,
        name=req.name,
        phone=req.phone,
        email=req.email,
        specialties=req.specialties,
        experience_years=req.experience_years,
        is_active=req.is_active,
        is_available=req.is_available
    )
    db.add(tech)
    db.commit()
    db.refresh(tech)
    return tech


@app.patch("/api/admin/technicians/{tech_id}")
def update_technician(
    tech_id: str,
    req: schemas.UpdateTechnicianRequest,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update technician profile, active status, or availability."""
    tech = db.query(Technician).filter(Technician.id == tech_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found.")

    for k, v in req.dict(exclude_unset=True).items():
        setattr(tech, k, v)
    db.commit()
    return {"message": "Technician profile updated successfully."}


@app.get("/api/admin/service-areas")
def list_admin_service_areas(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    """List all configured service areas."""
    return db.query(ServiceArea).all()


@app.post("/api/admin/service-areas")
def add_service_area(
    req: schemas.ServiceAreaCreateRequest,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new supported locality / pincode in Junagadh."""
    area = ServiceArea(
        city="Junagadh",
        locality=req.locality,
        pincode=req.pincode,
        is_active=req.is_active,
        delivery_fee=req.delivery_fee,
        min_order_amount=req.min_order_amount
    )
    db.add(area)
    db.commit()
    db.refresh(area)
    return area


@app.patch("/api/admin/service-areas/{area_id}")
def update_service_area(
    area_id: int,
    req: schemas.ServiceAreaUpdateRequest,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update service area configuration or toggle coverage."""
    area = db.query(ServiceArea).filter(ServiceArea.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Service area not found.")
    for k, v in req.dict(exclude_unset=True).items():
        setattr(area, k, v)
    db.commit()
    return {"message": "Service area updated."}


@app.get("/api/admin/services")
def list_admin_services(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    """List all services including inactive ones for catalog management."""
    return db.query(Service).all()


@app.post("/api/admin/services")
def add_service(
    req: schemas.CreateServiceRequest,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new service to the catalog."""
    if db.query(Service).filter(Service.id == req.id).first():
        raise HTTPException(status_code=400, detail="Service with this ID already exists.")
    svc = Service(**req.dict())
    db.add(svc)
    db.commit()
    db.refresh(svc)
    return svc


@app.patch("/api/admin/services/{service_id}")
@app.put("/api/admin/services/{service_id}")
def update_service(
    service_id: str,
    req: schemas.UpdateServiceRequest,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update service pricing, details, or active status."""
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found.")
    for k, v in req.dict(exclude_unset=True).items():
        setattr(svc, k, v)
    db.commit()
    db.refresh(svc)
    return {
        "message": "Service updated successfully.",
        "id": svc.id,
        "name": svc.name,
        "price": svc.price,
        "is_active": svc.is_active,
        "is_popular": svc.is_popular
    }



@app.delete("/api/admin/services/{service_id}")
def delete_service(
    service_id: str,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a service or safely deactivate if historical bookings exist."""
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found.")

    # Check if there are active or historical bookings
    booking_count = db.query(Booking).filter(Booking.service_id == service_id).count()
    if booking_count > 0:
        svc.is_active = False
        db.commit()
        return {
            "message": f"Service '{svc.name}' is linked to {booking_count} booking(s). It has been deactivated to preserve historical integrity.",
            "deactivated": True
        }

    db.delete(svc)
    db.commit()
    return {"message": f"Service '{svc.name}' deleted successfully.", "deleted": True}


@app.get("/api/admin/customers")
def list_admin_customers(
    search: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Returns actual customer directory retrieved from database CustomerContact and Booking records.
    Computes real booking count, completed count, and total spend for each customer.
    """
    contacts = db.query(CustomerContact).all()
    all_bookings = db.query(Booking).all()

    # Create mapping by phone number
    customer_dict = {}

    for c in contacts:
        clean_phone = c.phone.strip()
        customer_dict[clean_phone] = {
            "id": c.id,
            "name": c.name,
            "phone": c.phone,
            "email": c.email or "",
            "city": c.city or "Junagadh",
            "locality": c.locality or "",
            "full_address": c.full_address or "",
            "pincode": c.pincode or "",
            "booking_count": 0,
            "completed_count": 0,
            "total_spend": 0.0,
            "last_booking_date": c.last_booking_at.strftime("%Y-%m-%d") if c.last_booking_at else "",
            "last_booking_code": "",
            "created_at": c.created_at.strftime("%Y-%m-%d") if c.created_at else ""
        }

    for b in all_bookings:
        phone = b.customer_phone.strip()
        if phone not in customer_dict:
            customer_dict[phone] = {
                "id": b.id,
                "name": b.customer_name,
                "phone": b.customer_phone,
                "email": b.customer_email or "",
                "city": b.city or "Junagadh",
                "locality": b.locality or "",
                "full_address": b.address or "",
                "pincode": b.pincode or "",
                "booking_count": 0,
                "completed_count": 0,
                "total_spend": 0.0,
                "last_booking_date": b.scheduled_date or "",
                "last_booking_code": b.booking_code,
                "created_at": b.created_at.strftime("%Y-%m-%d") if b.created_at else ""
            }

        customer_dict[phone]["booking_count"] += 1
        if b.status == "completed":
            customer_dict[phone]["completed_count"] += 1
            customer_dict[phone]["total_spend"] += b.total_amount

        if b.scheduled_date and (not customer_dict[phone]["last_booking_date"] or b.scheduled_date > customer_dict[phone]["last_booking_date"]):
            customer_dict[phone]["last_booking_date"] = b.scheduled_date
            customer_dict[phone]["last_booking_code"] = b.booking_code

    customers = list(customer_dict.values())

    if search:
        s = search.strip().lower()
        customers = [
            c for c in customers
            if s in c["name"].lower() or s in c["phone"].lower() or s in c["email"].lower() or s in c["locality"].lower()
        ]

    customers.sort(key=lambda x: x["last_booking_date"] or "", reverse=True)
    return customers


@app.get("/api/admin/reports")
def get_reports_data(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    """
    Generate accurate booking reports, revenue breakdowns, and performance analytics.
    Strictly excludes cancelled bookings and uncollected pending payments from revenue.
    """
    bookings = db.query(Booking).order_by(desc(Booking.created_at)).all()
    completed_bookings = [b for b in bookings if b.status == "completed"]
    pending_bookings = [b for b in bookings if b.status == "pending"]
    in_progress_bookings = [b for b in bookings if b.status == "in_progress"]
    cancelled_bookings = [b for b in bookings if b.status in ["cancelled", "rejected"]]
    active_bookings = [b for b in bookings if b.status not in ["cancelled", "rejected"]]

    eligible_revenue = float(sum(b.total_amount for b in completed_bookings))
    gross_booking_value = float(sum(b.total_amount for b in active_bookings))
    pending_payments = float(sum(b.total_amount for b in active_bookings if b.status != "completed" and b.payment_status != "completed"))
    cancelled_value = float(sum(b.total_amount for b in cancelled_bookings))

    completed_count = len(completed_bookings)
    avg_order_value = round(eligible_revenue / completed_count, 2) if completed_count > 0 else 0.0

    # Service performance breakdown
    service_stats = {}
    for b in bookings:
        s_name = b.service_name
        if s_name not in service_stats:
            service_stats[s_name] = {
                "name": s_name,
                "total_bookings": 0,
                "completed_bookings": 0,
                "cancelled_bookings": 0,
                "completed_revenue": 0.0,
                "gross_value": 0.0
            }
        service_stats[s_name]["total_bookings"] += 1
        if b.status == "completed":
            service_stats[s_name]["completed_bookings"] += 1
            service_stats[s_name]["completed_revenue"] += b.total_amount
        elif b.status in ["cancelled", "rejected"]:
            service_stats[s_name]["cancelled_bookings"] += 1
        else:
            service_stats[s_name]["gross_value"] += b.total_amount

    # Status distribution
    status_distribution = [
        {"status": "pending", "count": len(pending_bookings)},
        {"status": "confirmed", "count": len([b for b in bookings if b.status == "confirmed"])},
        {"status": "in_progress", "count": len(in_progress_bookings)},
        {"status": "completed", "count": completed_count},
        {"status": "cancelled", "count": len(cancelled_bookings)},
    ]

    return {
        "summary": {
            "total_bookings": len(bookings),
            "completed_bookings": completed_count,
            "pending_bookings": len(pending_bookings),
            "in_progress_bookings": len(in_progress_bookings),
            "cancelled_bookings": len(cancelled_bookings),
            "gross_booking_value": gross_booking_value,
            "eligible_completed_revenue": eligible_revenue,
            "total_revenue": eligible_revenue,
            "pending_payments": pending_payments,
            "cancelled_value": cancelled_value,
            "avg_order_value": avg_order_value,
            "revenue_calculation_definition": "Eligible Completed Revenue includes only verified completed bookings. Cancelled requests (₹" + str(cancelled_value) + ") and pending payments (₹" + str(pending_payments) + ") are excluded."
        },
        "top_services": sorted(
            list(service_stats.values()),
            key=lambda x: x["total_bookings"],
            reverse=True
        ),
        "status_distribution": status_distribution,
        "export_rows": [
            {
                "booking_code": b.booking_code,
                "service": b.service_name,
                "customer": b.customer_name,
                "phone": b.customer_phone,
                "email": b.customer_email or "",
                "locality": b.locality,
                "address": b.address,
                "pincode": b.pincode,
                "date": b.scheduled_date,
                "time": b.scheduled_time,
                "status": b.status,
                "payment_status": b.payment_status,
                "payment_method": b.payment_method,
                "amount": b.total_amount
            }
            for b in bookings
        ]
    }


@app.get("/api/admin/settings")
def get_admin_settings(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Fetch website settings."""
    settings = db.query(WebsiteSetting).all()
    data = {s.key: s.value for s in settings}
    data["authorized_admin_email"] = AUTHORIZED_ADMIN_EMAIL
    return data


@app.put("/api/admin/settings")
def update_admin_settings(
    req: schemas.WebsiteSettingsUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update website settings."""
    for k, v in req.dict(exclude_unset=True).items():
        setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == k).first()
        if setting:
            setting.value = v
        else:
            db.add(WebsiteSetting(key=k, value=v))
    db.commit()
    return {"message": "Settings updated successfully."}
