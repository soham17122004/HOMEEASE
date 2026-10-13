# HomeEase Junagadh — Professional Home Services Booking Platform

A complete, production-ready home services booking platform inspired by Urban Company, exclusively engineered for **Junagadh, Gujarat, India**.

Built with a clean, minimalist light theme, responsive layout, green primary actions, dark charcoal typography, and practical operational workflows.

---

## 🏛 Architecture Overview: One Website, Two Separate Areas

```
PROJECT DIWALI/
├── backend/                  # FastAPI Secure Python Backend
│   ├── main.py              # Public & Protected Admin REST API Endpoints
│   ├── models.py            # SQLAlchemy Database Models (11 Tables)
│   ├── auth.py              # Admin Authentication, PBKDF2 Hashing, HMAC Tokens & Rate Limiting
│   ├── database.py          # SQLite / PostgreSQL Connection Engine
│   ├── schemas.py           # Pydantic Schemas & Request/Response Validation
│   ├── seed.py              # Database Initialization & Junagadh Localities Seeding
│   ├── test_api.py          # 12-Step Automated Acceptance Test Suite
│   └── run.py               # Uvicorn Execution Entrypoint
│
├── src/                     # React 19 + TypeScript + Vite + Tailwind CSS Frontend
│   ├── components/          # Reusable Components (Customer Layout, Admin Guard, Headers)
│   ├── pages/               # Customer Pages (Zero Login Required)
│   │   ├── HomePage.tsx
│   │   ├── ServicesPage.tsx
│   │   ├── ServiceDetailPage.tsx
│   │   ├── BookingPage.tsx
│   │   ├── BookingSuccessPage.tsx
│   │   ├── MyBookingsPage.tsx
│   │   ├── BookingDetailPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── FaqPage.tsx
│   │   └── LegalPage.tsx (Privacy Policy & Terms)
│   │
│   ├── pages/admin/         # Private Admin Console (Strict Email Authorization)
│   │   ├── AdminLoginPage.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── AdminDashboardPage.tsx
│   │   ├── AdminBookingsPage.tsx
│   │   ├── AdminServicesPage.tsx
│   │   ├── AdminTechniciansPage.tsx
│   │   ├── AdminServiceAreasPage.tsx
│   │   ├── AdminReportsPage.tsx
│   │   ├── AdminCustomersPage.tsx
│   │   └── AdminSettingsPage.tsx
│   │
│   ├── lib/                 # Core Clients & Stores
│   │   ├── api.ts           # Centralized Backend REST API Client
│   │   ├── adminAuth.ts     # Admin Authentication State & Token Storage
│   │   ├── store.ts         # Reactive Application Data Store
│   │   └── serviceCoverage.ts # Junagadh Location Restrictions & Geofencing
│   └── config/              # Branding and Junagadh Configuration
```

---

## 🔒 1. Admin Authentication & Strict Authorization

1. **Email Authorization via Environment Variable**:
   - Access to `/admin` is restricted exclusively to the email defined by `ADMIN_EMAIL`.
   - Any login attempt with an unauthorized email address is immediately rejected with HTTP 401.
   - Example configuration in `.env`:
     ```env
     ADMIN_EMAIL=your-admin-email@example.com
     VITE_ADMIN_EMAIL=your-admin-email@example.com
     ADMIN_PASSWORD=YourSecurePassword123!
     ADMIN_TOKEN_SECRET=homeease_junagadh_secret_key_2026_super_secure
     ```

2. **Security Implementations**:
   - **Password Hashing**: PBKDF2-HMAC-SHA256 with 100,000 iterations and random salt.
   - **HMAC Session Tokens**: Cryptographically signed HMAC-SHA256 bearer tokens with 24-hour expiration.
   - **Rate Limiting**: Accounts lock for 15 minutes after 5 consecutive failed login attempts.
   - **Protected Endpoints**: Admin APIs are guarded with `get_current_admin` dependency; unauthenticated requests are rejected.
   - **Session Revocation**: Logout securely invalidates active session signatures.

---

## 👥 2. Public Customer Experience (No Login Required)

- **Browse & Check Prices**: Browse all configured services, transparent prices, ratings, and inclusions.
- **Strict Location Restrictions**: Exclusively serves **Junagadh, Gujarat**. Bookings from outside Junagadh are rejected by both frontend validation and backend APIs with a friendly "Coming Soon" notification.
- **Guest Bookings**: Customers only provide name, phone, address, and preferred time slot. **No account creation or password required**.
- **Supported Localities**: Zanzarda Road, Joshipura, Moti Baug, College Road, Girnar Darshan / Taleti Road, Bilkha Road, Majevadi Gate, Gandhi Chowk, Rayji Baug, Madhuram Bypass, Timbavadi, and Khamdhrol Road.
- **Live Status Tracking**: Customers can check the real-time status of their booking at any time via `/bookings` using their reference ID (e.g., `JND-2026-4821`) or registered mobile number.

---

## 📊 3. Private Admin Panel Features

- **Dashboard**: Aggregate metrics for Total Bookings, Pending Requests, Confirmed, Completed, Cancelled, and Gross Revenue.
- **Booking Management**: Accept, reject (with reason), assign certified technicians, reschedule date/time, and filter by status, locality, phone, or reference ID.
- **Service Management**: Add, edit, activate/deactivate services, pricing, durations, and categories.
- **Technician Management**: Maintain technician profiles, ratings, contact numbers, and service assignments.
- **Service Areas**: Manage supported Junagadh localities, pincodes, delivery fees, and minimum order values.
- **Reports & Export**: Service distribution breakdowns, revenue analytics, and one-click CSV export.
- **Settings**: Update operating hours, business addresses, helpline numbers, and notification preferences.

---

## 🗄 4. Database Schema (11 Tables)

1. `admin_users` — Administrator credentials (salted PBKDF2 hash) and session records.
2. `service_categories` — Service categories (Home Cleaning, Sofa, AC Service, Washing Machine, etc.).
3. `services` — Service catalog with pricing, duration, ratings, and availability status.
4. `customer_contacts` — Guest customer contact directory compiled from bookings.
5. `bookings` — Service booking records with reference code, address, schedule, and status.
6. `technicians` — Service personnel profiles, ratings, and specialties.
7. `technician_assignments` — Audit log of technician-to-booking assignments.
8. `service_areas` — Supported Junagadh localities and pincodes.
9. `availability_slots` — Daily operational time windows.
10. `payment_transactions` — Recorded revenue and payment audit records.
11. `admin_activity_logs` — Security and administrative action audit trail.
12. `website_settings` — Customer-facing business hours, phone, and address settings.

---

## 🚀 5. How to Run Locally

### Step 1: Start Backend (FastAPI)
```powershell
# From the project root:
python -m uvicorn main:app --app-dir backend --port 8000
```
Backend will be live at `http://127.0.0.1:8000`. API documentation is available at `http://127.0.0.1:8000/docs`.

### Step 2: Start Frontend (Vite)
```powershell
npm run dev
```
Frontend will be live at `http://localhost:5173`. Vite automatically proxies `/api` requests to the FastAPI backend.

### Step 3: Run Acceptance Tests
```powershell
python backend/test_api.py
```
Validates all 12 core criteria end-to-end:
1. Health Check
2. Service Retrieval
3. Location Restriction (rejection of non-Junagadh bookings)
4. Guest Booking Creation without Account
5. Customer Booking Tracking
6. Unauthorized Admin Rejection
7. Unauthenticated Admin API Protection
8. Configured Admin Email Login
9. Admin Dashboard Access
10. Admin Booking Acceptance
11. Technician Assignment
12. Revenue Reports Retrieval

---

## 🔐 Credentials for Local Testing

- **Authorized Admin ID / Email**: `junagadh` (or `admin@homeease.in`, configurable in `.env`)
- **Default Admin Password**: `Soham@1712`
- **Customer Portal**: No credentials needed! Browse and book directly.
