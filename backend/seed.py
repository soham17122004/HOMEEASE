"""
Database Seed Script for HomeEase Junagadh
Initializes:
- Admin user with hashed credentials for AUTHORIZED_ADMIN_EMAIL
- Service categories & services
- Junagadh service areas & pincodes
- Availability time slots
- Technicians
- Website settings
- Initial demonstration bookings
"""

import os
from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
from models import (
    AdminUser,
    ServiceCategory,
    Service,
    Technician,
    ServiceArea,
    AvailabilitySlot,
    Booking,
    CustomerContact,
    WebsiteSetting
)
from auth import hash_password, AUTHORIZED_ADMIN_EMAIL

ADMIN_INITIAL_PASSWORD = os.getenv("ADMIN_PASSWORD", "Soham@1712")


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Admin User
        admin = db.query(AdminUser).filter(AdminUser.email == AUTHORIZED_ADMIN_EMAIL).first()
        if not admin:
            hashed = hash_password(ADMIN_INITIAL_PASSWORD)
            admin = AdminUser(
                email=AUTHORIZED_ADMIN_EMAIL,
                password_hash=hashed,
                full_name="Junagadh Admin Manager",
                is_active=True
            )
            db.add(admin)
            print(f"[Seed] Created authorized admin user: {AUTHORIZED_ADMIN_EMAIL}")
        else:
            admin.password_hash = hash_password(ADMIN_INITIAL_PASSWORD)
            db.commit()

        # 2. Service Categories
        categories_data = [
            {
                "id": "home-cleaning",
                "name": "Home Cleaning",
                "icon": "Sparkles",
                "description": "Complete residential deep cleaning and dusting solutions for homes in Junagadh.",
                "display_order": 1
            },
            {
                "id": "sofa-cleaning",
                "name": "Sofa & Upholstery Cleaning",
                "icon": "Armchair",
                "description": "Shampooing and sanitized extraction for sofas, couches, and upholstery.",
                "display_order": 2
            },
            {
                "id": "ac-service",
                "name": "AC Service & Repair",
                "icon": "Wind",
                "description": "Jet pump cleaning, gas charging, filter wash, and breakdown troubleshooting.",
                "display_order": 3
            },
            {
                "id": "washing-machine",
                "name": "Washing Machine Repair",
                "icon": "Disc",
                "description": "Prompt inspection and repair for top load, front load, and semi-automatic machines.",
                "display_order": 4
            },
            {
                "id": "kitchen-bathroom",
                "name": "Kitchen & Bathroom Cleaning",
                "icon": "Droplet",
                "description": "Intensive degreasing, descaling, floor tile buffing, and hygienic sanitization.",
                "display_order": 5
            },
            {
                "id": "other-services",
                "name": "Other Home Services",
                "icon": "Wrench",
                "description": "Expert electrical fittings, switchboard maintenance, fan repairs, and plumbing.",
                "display_order": 6
            }
        ]

        for cat in categories_data:
            existing = db.query(ServiceCategory).filter(ServiceCategory.id == cat["id"]).first()
            if not existing:
                db.add(ServiceCategory(**cat))
        db.commit()

        # 3. Services
        services_data = [
            # Home Cleaning
            {
                "id": "full-home-deep-cleaning",
                "category_id": "home-cleaning",
                "name": "Full Home Deep Cleaning (2 BHK / 3 BHK)",
                "description": "Intensive scrubbing, floor buffing, window cleaning, ceiling dusting, and sanitization across all rooms.",
                "price": 1799.0,
                "original_price": 2499.0,
                "duration_minutes": 180,
                "rating": 4.9,
                "reviews_count": 184,
                "icon": "Sparkles",
                "image_url": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
                "is_popular": True
            },
            {
                "id": "classic-cleaning-1bhk",
                "category_id": "home-cleaning",
                "name": "Standard Home Cleaning (1 BHK / Tenement)",
                "description": "Comprehensive vacuuming, dry and wet mopping, kitchen wiping, and dust removal.",
                "price": 1099.0,
                "original_price": 1499.0,
                "duration_minutes": 120,
                "rating": 4.8,
                "reviews_count": 92,
                "icon": "Home",
                "image_url": "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
                "is_popular": False
            },
            # Sofa Cleaning
            {
                "id": "sofa-shampooing-3seater",
                "category_id": "sofa-cleaning",
                "name": "3-Seater Fabric Sofa Shampooing",
                "description": "Deep foam extraction, fabric stain treatment, deodorization, and allergen removal.",
                "price": 599.0,
                "original_price": 899.0,
                "duration_minutes": 60,
                "rating": 4.9,
                "reviews_count": 142,
                "icon": "Armchair",
                "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
                "is_popular": True
            },
            {
                "id": "sofa-shampooing-5seater",
                "category_id": "sofa-cleaning",
                "name": "5-Seater Sofa & Cushion Deep Cleaning",
                "description": "Complete wet shampoo treatment for 3+1+1 setup with backrest steam sanitization.",
                "price": 899.0,
                "original_price": 1299.0,
                "duration_minutes": 90,
                "rating": 4.8,
                "reviews_count": 110,
                "icon": "Armchair",
                "image_url": "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
                "is_popular": False
            },
            # AC Service
            {
                "id": "ac-deep-clean-jet",
                "category_id": "ac-service",
                "name": "AC Foam & Jet Spray Deep Clean",
                "description": "High-pressure jet wash for cooling coils, blower fan, drain tray, and exterior filter flush.",
                "price": 499.0,
                "original_price": 799.0,
                "duration_minutes": 45,
                "rating": 4.9,
                "reviews_count": 312,
                "icon": "Wind",
                "image_url": "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
                "is_popular": True
            },
            {
                "id": "ac-repair-diagnosis",
                "category_id": "ac-service",
                "name": "AC Inspection & Gas Leak Diagnosis",
                "description": "Complete electrical check, compressor current assessment, refrigerant pressure check, and diagnosis.",
                "price": 299.0,
                "original_price": 499.0,
                "duration_minutes": 45,
                "rating": 4.7,
                "reviews_count": 87,
                "icon": "Wrench",
                "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
                "is_popular": False
            },
            # Washing Machine
            {
                "id": "wm-service-checkup",
                "category_id": "washing-machine",
                "name": "Washing Machine Comprehensive Checkup",
                "description": "Drum balance inspection, inlet filter de-scaling, motor belt check, and vibration analysis.",
                "price": 299.0,
                "original_price": 499.0,
                "duration_minutes": 45,
                "rating": 4.8,
                "reviews_count": 76,
                "icon": "Disc",
                "image_url": "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
                "is_popular": False
            },
            {
                "id": "wm-drum-descaling",
                "category_id": "washing-machine",
                "name": "Washing Machine Drum Chemical Descaling",
                "description": "Removes hard water salt buildup, bad odors, and lint deposits for improved washing performance.",
                "price": 549.0,
                "original_price": 799.0,
                "duration_minutes": 60,
                "rating": 4.9,
                "reviews_count": 64,
                "icon": "Disc",
                "image_url": "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
                "is_popular": True
            },
            # Kitchen & Bathroom
            {
                "id": "kitchen-deep-degreasing",
                "category_id": "kitchen-bathroom",
                "name": "Kitchen Deep Degreasing & Chimney Scrub",
                "description": "Oil stain removal, platform cleaning, cabinet exterior wiping, sink polishing, and tile descaling.",
                "price": 899.0,
                "original_price": 1299.0,
                "duration_minutes": 90,
                "rating": 4.8,
                "reviews_count": 98,
                "icon": "Droplet",
                "image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
                "is_popular": True
            },
            {
                "id": "bathroom-intensive-clean",
                "category_id": "kitchen-bathroom",
                "name": "Bathroom Intensive Descaling & Sanitization",
                "description": "Hard water stain removal on tiles, taps, shower head, mirror polishing, and disinfectant spray.",
                "price": 449.0,
                "original_price": 699.0,
                "duration_minutes": 60,
                "rating": 4.9,
                "reviews_count": 215,
                "icon": "Droplet",
                "image_url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
                "is_popular": True
            },
            # Other Home Services
            {
                "id": "electrician-on-demand",
                "category_id": "other-services",
                "name": "Electrician Visit & Diagnostic Repair",
                "description": "Ceiling fan installation, switchboard repair, MCB replacement, and wiring continuity check.",
                "price": 199.0,
                "original_price": 349.0,
                "duration_minutes": 45,
                "rating": 4.8,
                "reviews_count": 130,
                "icon": "Zap",
                "image_url": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
                "is_popular": False
            }
        ]

        for s in services_data:
            existing = db.query(Service).filter(Service.id == s["id"]).first()
            if not existing:
                db.add(Service(**s))
            else:
                for k, v in s.items():
                    setattr(existing, k, v)
        db.commit()

        # 4. Technicians
        techs_data = [
            {
                "id": "tech-1",
                "name": "Ramesh Bhai Patel",
                "phone": "+91 98251 43210",
                "email": "ramesh.patel@homeease.in",
                "specialties": "ac-service,washing-machine",
                "experience_years": 8,
                "rating": 4.9,
                "completed_jobs": 420,
                "is_active": True,
                "is_available": True
            },
            {
                "id": "tech-2",
                "name": "Suresh Bhai Makwana",
                "phone": "+91 97241 87654",
                "email": "suresh.makwana@homeease.in",
                "specialties": "home-cleaning,kitchen-bathroom",
                "experience_years": 6,
                "rating": 4.8,
                "completed_jobs": 310,
                "is_active": True,
                "is_available": True
            },
            {
                "id": "tech-3",
                "name": "Jignesh Bhai Vala",
                "phone": "+91 94282 11990",
                "email": "jignesh.vala@homeease.in",
                "specialties": "other-services",
                "experience_years": 5,
                "rating": 4.85,
                "completed_jobs": 260,
                "is_active": True,
                "is_available": True
            },
            {
                "id": "tech-4",
                "name": "Hitesh Bhai Chauhan",
                "phone": "+91 99099 55432",
                "email": "hitesh.chauhan@homeease.in",
                "specialties": "sofa-cleaning,home-cleaning",
                "experience_years": 4,
                "rating": 4.75,
                "completed_jobs": 190,
                "is_active": True,
                "is_available": True
            }
        ]

        for t in techs_data:
            existing = db.query(Technician).filter(Technician.id == t["id"]).first()
            if not existing:
                db.add(Technician(**t))
        db.commit()

        # 5. Service Areas (Junagadh Localities)
        areas_data = [
            {"city": "Junagadh", "locality": "Zanzarda Road", "pincode": "362002", "is_active": True},
            {"city": "Junagadh", "locality": "Joshipura", "pincode": "362002", "is_active": True},
            {"city": "Junagadh", "locality": "Moti Baug", "pincode": "362001", "is_active": True},
            {"city": "Junagadh", "locality": "College Road", "pincode": "362001", "is_active": True},
            {"city": "Junagadh", "locality": "Girnar Darshan / Taleti Road", "pincode": "362004", "is_active": True},
            {"city": "Junagadh", "locality": "Bilkha Road", "pincode": "362001", "is_active": True},
            {"city": "Junagadh", "locality": "Majevadi Gate", "pincode": "362001", "is_active": True},
            {"city": "Junagadh", "locality": "Gandhi Chowk & Station Road", "pincode": "362001", "is_active": True},
            {"city": "Junagadh", "locality": "Rayji Baug", "pincode": "362001", "is_active": True},
            {"city": "Junagadh", "locality": "Madhuram Bypass", "pincode": "362015", "is_active": True},
            {"city": "Junagadh", "locality": "Timbavadi", "pincode": "362015", "is_active": True},
            {"city": "Junagadh", "locality": "Khamdhrol Road", "pincode": "362001", "is_active": True}
        ]

        for a in areas_data:
            existing = db.query(ServiceArea).filter(
                ServiceArea.locality == a["locality"],
                ServiceArea.pincode == a["pincode"]
            ).first()
            if not existing:
                db.add(ServiceArea(**a))
        db.commit()

        # 6. Availability Slots
        slots = [
            "08:00 AM - 10:00 AM",
            "10:00 AM - 12:00 PM",
            "12:00 PM - 02:00 PM",
            "02:00 PM - 04:00 PM",
            "04:00 PM - 06:00 PM",
            "06:00 PM - 08:00 PM"
        ]
        for slot in slots:
            existing = db.query(AvailabilitySlot).filter(AvailabilitySlot.time_slot == slot).first()
            if not existing:
                db.add(AvailabilitySlot(time_slot=slot, is_active=True, max_bookings=5))
        db.commit()

        # 7. Website Settings
        settings_defaults = {
            "business_name": "HomeEase Junagadh",
            "phone": "+91 90165 26419",
            "whatsapp": "+91 90165 26419",
            "email": "support@homeease.in",
            "address": "Opp. Swaminarayan Temple, Zanzarda Road, Junagadh, Gujarat 362002",
            "operating_hours": "Mon - Sun: 8:00 AM - 8:30 PM",
            "emergency_contact": "+91 90165 26419",
            "service_city": "Junagadh, Gujarat",
            "service_status": "Operational"
        }
        for k, v in settings_defaults.items():
            existing = db.query(WebsiteSetting).filter(WebsiteSetting.key == k).first()
            if not existing:
                db.add(WebsiteSetting(key=k, value=v, description=k.replace('_', ' ').title()))
        db.commit()

        # Bookings & customer contacts are never artificially seeded with mock data.
        # Only authentic bookings placed through the application will be recorded.
        print("[Seed] Database configuration and catalog seeded successfully (No sample bookings).")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
