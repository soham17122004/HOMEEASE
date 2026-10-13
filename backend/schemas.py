"""
Pydantic Validation Schemas for HomeEase Junagadh
"""

from typing import Optional, List
from pydantic import BaseModel, Field, validator
import re


# -------------------------------------------------------------
# Public & Customer Schemas
# -------------------------------------------------------------

class ServiceOut(BaseModel):
    id: str
    category_id: str
    name: str
    slug: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    duration_minutes: int
    rating: float
    reviews_count: int
    image_url: Optional[str] = None
    icon: str
    is_active: bool
    is_popular: bool
    included_items: Optional[str] = None

    class Config:
        orm_mode = True


class ServiceCategoryOut(BaseModel):
    id: str
    name: str
    icon: str
    description: Optional[str] = None
    display_order: int
    is_active: bool
    services: List[ServiceOut] = []

    class Config:
        orm_mode = True


class CreateBookingRequest(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_phone: str = Field(..., min_length=10, max_length=15)
    customer_email: Optional[str] = None
    service_id: str
    city: str = Field("Junagadh")
    locality: str = Field(..., min_length=2)
    address: str = Field(..., min_length=5)
    pincode: str = Field(..., min_length=6, max_length=6)
    scheduled_date: str
    scheduled_time: str
    notes: Optional[str] = None

    @validator("city")
    def validate_city(cls, v):
        if v.strip().lower() != "junagadh":
            raise ValueError("HomeEase currently only serves Junagadh, Gujarat. Other cities are coming soon!")
        return "Junagadh"

    @validator("customer_phone")
    def validate_phone(cls, v):
        clean = re.sub(r"[^\d]", "", v)
        if len(clean) < 10:
            raise ValueError("Please provide a valid 10-digit mobile number.")
        return clean[-10:]

    @validator("pincode")
    def validate_pincode(cls, v):
        clean = v.strip()
        if not (clean.startswith("362") and len(clean) == 6):
            raise ValueError("Pincode must be a valid Junagadh pincode starting with 362 (e.g., 362001, 362002).")
        return clean


class BookingConfirmationOut(BaseModel):
    booking_code: str
    status: str
    customer_name: str
    customer_phone: str
    service_name: str
    total_amount: float
    scheduled_date: str
    scheduled_time: str
    address: str
    locality: str
    pincode: str
    message: str


class TrackBookingResponse(BaseModel):
    booking_code: str
    service_name: str
    customer_name: str
    customer_phone: str
    address: str
    locality: str
    pincode: str
    scheduled_date: str
    scheduled_time: str
    status: str
    total_amount: float
    payment_status: str
    technician_name: Optional[str] = None
    technician_phone: Optional[str] = None
    created_at: str


class ServiceAreaOut(BaseModel):
    id: int
    city: str
    locality: str
    pincode: str
    is_active: bool
    delivery_fee: float
    min_order_amount: float

    class Config:
        orm_mode = True


# -------------------------------------------------------------
# Admin Schemas
# -------------------------------------------------------------

class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminLoginResponse(BaseModel):
    token: str
    email: str
    message: str


class UpdateBookingStatusRequest(BaseModel):
    status: str  # pending, confirmed, in_progress, completed, cancelled, rejected
    reason: Optional[str] = None


class AssignTechnicianRequest(BaseModel):
    technician_id: str
    notes: Optional[str] = None


class RescheduleBookingRequest(BaseModel):
    scheduled_date: str
    scheduled_time: str
    notes: Optional[str] = None


class TechnicianOut(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    specialties: str
    experience_years: int
    rating: float
    completed_jobs: int
    is_active: bool
    is_available: bool

    class Config:
        orm_mode = True


class CreateTechnicianRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    specialties: str
    experience_years: int = 3
    is_active: bool = True
    is_available: bool = True


class UpdateTechnicianRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    specialties: Optional[str] = None
    experience_years: Optional[int] = None
    is_active: Optional[bool] = None
    is_available: Optional[bool] = None


class CreateServiceRequest(BaseModel):
    id: str
    category_id: str
    name: str
    slug: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    duration_minutes: int = 60
    rating: Optional[float] = 4.8
    reviews_count: Optional[int] = 0
    image_url: Optional[str] = None
    icon: str = "Sparkles"
    is_active: bool = True
    is_popular: bool = False
    included_items: Optional[str] = None


class UpdateServiceRequest(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    duration_minutes: Optional[int] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None
    is_popular: Optional[bool] = None
    included_items: Optional[str] = None


class ServiceAreaCreateRequest(BaseModel):
    locality: str
    pincode: str
    is_active: bool = True
    delivery_fee: float = 0.0
    min_order_amount: float = 0.0


class ServiceAreaUpdateRequest(BaseModel):
    locality: Optional[str] = None
    pincode: Optional[str] = None
    is_active: Optional[bool] = None
    delivery_fee: Optional[float] = None
    min_order_amount: Optional[float] = None


class WebsiteSettingsUpdate(BaseModel):
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    operating_hours: Optional[str] = None
    emergency_contact: Optional[str] = None
    service_status: Optional[str] = None


class CustomerContactOut(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str] = None
    city: str = "Junagadh"
    locality: Optional[str] = None
    full_address: Optional[str] = None
    pincode: Optional[str] = None
    total_bookings: int = 0
    total_spend: float = 0.0
    last_booking_at: Optional[str] = None
    created_at: Optional[str] = None

