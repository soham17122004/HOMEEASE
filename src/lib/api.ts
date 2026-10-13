/**
 * API Client for HomeEase Junagadh Backend
 * Connects frontend to FastAPI backend via Vite proxy (/api)
 * Automatically attaches Admin Bearer tokens for admin endpoints
 */

const API_BASE = (import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') : '') || '/api';

function getAdminToken(): string | null {
  try {
    const raw = sessionStorage.getItem('homeease_admin_session_secure_v1') || sessionStorage.getItem('homeease_admin_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.token || null;
    }
  } catch {
    // fallback
  }
  return null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getAdminToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.detail || data.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  // Public
  getHealth: () => request<{ status: string; service: string; city: string }>('/health'),
  getCategories: () => request<any[]>('/categories'),
  getServices: (category?: string) => request<any[]>(`/services${category ? `?category=${category}` : ''}`),
  getService: (id: string) => request<any>(`/services/${id}`),
  getServiceAreas: () => request<any[]>('/service-areas'),
  getTimeSlots: () => request<any[]>('/time-slots'),
  getAvailability: (date: string, serviceId?: string) =>
    request<{
      date: string;
      is_today: boolean;
      server_time_ist: string;
      total_slots: number;
      available_count: number;
      slots: Array<{
        id: number;
        slot: string;
        status: 'available' | 'booked' | 'past';
        is_available: boolean;
        reason?: string;
      }>;
    }>(`/availability?date=${encodeURIComponent(date)}${serviceId ? `&service_id=${encodeURIComponent(serviceId)}` : ''}`),
  getPublicSettings: () => request<any>('/settings/public'),

  createBooking: (payload: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    service_id: string;
    city: string;
    locality: string;
    address: string;
    pincode: string;
    scheduled_date: string;
    scheduled_time: string;
    notes?: string;
  }) =>
    request<{
      booking_code: string;
      status: string;
      customer_name: string;
      customer_phone: string;
      service_name: string;
      total_amount: number;
      scheduled_date: string;
      scheduled_time: string;
      address: string;
      locality: string;
      pincode: string;
      message: string;
    }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  trackBookings: (params: { code?: string; phone?: string }) => {
    const query = new URLSearchParams();
    if (params.code) query.set('code', params.code);
    if (params.phone) query.set('phone', params.phone);
    return request<any[]>(`/bookings/track?${query.toString()}`);
  },

  // Admin Auth
  adminLogin: (email: string, password: string) =>
    request<{ token: string; email: string; message: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  adminLogout: () =>
    request<{ message: string }>('/admin/logout', {
      method: 'POST',
    }),

  getAdminProfile: () => request<{ email: string; full_name: string; last_login: string | null }>('/admin/me'),

  // Admin Dashboard & Bookings
  getAdminDashboard: () =>
    request<{
      total_bookings: number;
      pending_requests: number;
      confirmed_bookings: number;
      in_progress_bookings: number;
      completed_bookings: number;
      cancelled_bookings: number;
      status_distribution: Array<{ status: string; count: number }>;
      gross_booking_value: number;
      eligible_completed_revenue: number;
      total_revenue: number;
      pending_payments: number;
      cancelled_revenue: number;
      collected_payments: number;
      refunds: number;
      net_revenue: number;
      revenue_calculation_definition: string;
      today_bookings_count: number;
      today_bookings: any[];
      upcoming_bookings_count: number;
      upcoming_bookings: any[];
      total_customers: number;
      active_services_count: number;
      active_services: any[];
      slots_summary: Array<{
        slot: string;
        max_capacity: number;
        booked_count: number;
        completed_count: number;
        cancelled_count: number;
        available_count: number;
      }>;
      monthly_trend: Array<{
        month: string;
        bookings: number;
        revenue: number;
        completed: number;
      }>;
      recent_bookings: any[];
    }>('/admin/dashboard'),

  getAdminBookings: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    return request<any[]>(`/admin/bookings?${query.toString()}`);
  },

  updateBookingStatus: (bookingId: number | string, status: string, reason?: string) =>
    request<{ message: string; status: string }>(`/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),

  assignTechnician: (bookingId: number | string, technicianId: string, notes?: string) =>
    request<{ message: string; technician_name: string }>(`/admin/bookings/${bookingId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ technician_id: technicianId, notes }),
    }),

  rescheduleBooking: (bookingId: number | string, date: string, time: string, notes?: string) =>
    request<{ message: string }>(`/admin/bookings/${bookingId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduled_date: date, scheduled_time: time, notes }),
    }),

  // Admin Services
  getAdminServices: () => request<any[]>('/admin/services'),
  createService: (payload: any) =>
    request<any>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateService: (serviceId: string, payload: any) =>
    request<{ message: string }>(`/admin/services/${serviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteService: (serviceId: string) =>
    request<{ message: string; deactivated?: boolean; deleted?: boolean }>(`/admin/services/${serviceId}`, {
      method: 'DELETE',
    }),

  // Admin Customers
  getAdminCustomers: (search?: string) =>
    request<any[]>(`/admin/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  // Admin Technicians
  getAdminTechnicians: () => request<any[]>('/admin/technicians'),
  createTechnician: (payload: any) =>
    request<any>('/admin/technicians', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTechnician: (techId: string, payload: any) =>
    request<{ message: string }>(`/admin/technicians/${techId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Admin Service Areas
  getAdminServiceAreas: () => request<any[]>('/admin/service-areas'),
  addServiceArea: (payload: any) =>
    request<any>('/admin/service-areas', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateServiceArea: (areaId: number | string, payload: any) =>
    request<{ message: string }>(`/admin/service-areas/${areaId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Admin Reports & Settings
  getAdminReports: () => request<any>('/admin/reports'),
  getAdminSettings: () => request<any>('/admin/settings'),
  updateAdminSettings: (payload: any) =>
    request<{ message: string }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};
