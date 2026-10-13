"""
SQLAlchemy ORM Models for HomeEase Junagadh
Entities:
- AdminUser
- ServiceCategory
- Service
- CustomerContact
- Booking
- Technician
- TechnicianAssignment
- ServiceArea
- AvailabilitySlot
- PaymentTransaction
- AdminActivityLog
- WebsiteSetting
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    Index,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), default="Administrator")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id = Column(String(64), primary_key=True)  # slug or id (e.g. 'home-cleaning')
    name = Column(String(100), nullable=False)
    icon = Column(String(50), default="Wrench")
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    services = relationship("Service", back_populates="category", cascade="all, delete-orphan")


class Service(Base):
    __tablename__ = "services"

    id = Column(String(64), primary_key=True)
    category_id = Column(String(64), ForeignKey("service_categories.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), nullable=True, index=True)
    short_description = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    duration_minutes = Column(Integer, default=60)
    rating = Column(Float, default=4.8)
    reviews_count = Column(Integer, default=0)
    image_url = Column(String(500), nullable=True)
    icon = Column(String(50), default="Sparkles")
    is_active = Column(Boolean, default=True)
    is_popular = Column(Boolean, default=False)
    included_items = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("ServiceCategory", back_populates="services")
    bookings = relationship("Booking", back_populates="service")


class CustomerContact(Base):
    """Stores customer contact details from guest bookings without requiring an account or password."""
    __tablename__ = "customer_contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=False, index=True)
    email = Column(String(150), nullable=True)
    city = Column(String(50), default="Junagadh")
    locality = Column(String(100), nullable=True)
    full_address = Column(Text, nullable=True)
    pincode = Column(String(10), nullable=True)
    total_bookings = Column(Integer, default=1)
    last_booking_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class Technician(Base):
    __tablename__ = "technicians"

    id = Column(String(64), primary_key=True)  # e.g. 'tech-1'
    name = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(150), nullable=True)
    specialties = Column(String(255), default="")  # comma-separated categories
    experience_years = Column(Integer, default=3)
    rating = Column(Float, default=4.8)
    completed_jobs = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="technician")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_code = Column(String(32), unique=True, nullable=False, index=True)  # e.g. 'JND-2026-4821'
    service_id = Column(String(64), ForeignKey("services.id"), nullable=False, index=True)
    service_name = Column(String(150), nullable=False)

    # Customer Guest Info
    customer_name = Column(String(120), nullable=False)
    customer_phone = Column(String(20), nullable=False, index=True)
    customer_email = Column(String(150), nullable=True)

    # Junagadh Location Info
    city = Column(String(50), default="Junagadh")
    locality = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    pincode = Column(String(10), nullable=False)

    # Scheduling
    scheduled_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    scheduled_time = Column(String(50), nullable=False)  # e.g. '10:00 AM - 12:00 PM'
    notes = Column(Text, nullable=True)

    # Status: pending, confirmed, in_progress, completed, cancelled, rejected
    status = Column(String(30), default="pending", index=True)
    total_amount = Column(Float, nullable=False)
    payment_status = Column(String(30), default="pending")  # pending, paid, cod
    payment_method = Column(String(30), default="Cash after Service")

    # Technician Assignment
    technician_id = Column(String(64), ForeignKey("technicians.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    service = relationship("Service", back_populates="bookings")
    technician = relationship("Technician", back_populates="bookings")

    # Composite index for fast availability queries (date + service lookups)
    __table_args__ = (
        Index(
            "ix_bookings_date_service_status",
            "scheduled_date",
            "service_id",
            "status"
        ),
    )


class TechnicianAssignment(Base):
    __tablename__ = "technician_assignments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    technician_id = Column(String(64), ForeignKey("technicians.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)


class ServiceArea(Base):
    __tablename__ = "service_areas"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(50), default="Junagadh", nullable=False)
    locality = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)
    is_active = Column(Boolean, default=True)
    delivery_fee = Column(Float, default=0.0)
    min_order_amount = Column(Float, default=0.0)


class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    id = Column(Integer, primary_key=True, index=True)
    time_slot = Column(String(50), nullable=False, unique=True)  # e.g. '09:00 AM - 11:00 AM'
    is_active = Column(Boolean, default=True)
    max_bookings = Column(Integer, default=5)


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), default="Cash / UPI on Visit")
    payment_status = Column(String(30), default="completed")
    transaction_ref = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AdminActivityLog(Base):
    __tablename__ = "admin_activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)  # e.g. 'ACCEPT_BOOKING', 'ASSIGN_TECH'
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class WebsiteSetting(Base):
    __tablename__ = "website_settings"

    key = Column(String(80), primary_key=True)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
