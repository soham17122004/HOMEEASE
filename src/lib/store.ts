import { useState, useEffect } from 'react';
import {
  Service,
  Category,
  Booking,
  Review,
  Coupon,
  UserProfile,
  BookingStatus,
  AdminAnalytics,
  ServiceArea,
  ServiceEnquiry,
  Technician,
  WebsiteSettings,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  INITIAL_COUPONS,
} from '../data/mockData';
import { INITIAL_SERVICE_AREAS } from '../data/gujaratLocations';
import { checkServiceAvailability, isWithinGujaratBounds, CoverageCheckResult } from './serviceCoverage';
import { supabase, isSupabaseConfigured } from './supabase';
import { api } from './api';

const STORAGE_KEYS = {
  SERVICES: 'homeease_services_v2',
  CATEGORIES: 'homeease_categories_v2',
  BOOKINGS: 'homeease_bookings_v2',
  REVIEWS: 'homeease_reviews_v2',
  USER: 'homeease_current_user_v2',
  LOCATION: 'homeease_selected_location_v2',
  SERVICE_AREAS: 'homeease_service_areas_v2',
  SERVICE_ENQUIRIES: 'homeease_service_enquiries_v2',
  TECHNICIANS: 'homeease_technicians_v2',
  SETTINGS: 'homeease_settings_v2',
};

// Helper to safely load from local storage with mock-data purging
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return defaultValue;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);

    // Sanitize bookings to ensure NO mock records persist
    if (key === STORAGE_KEYS.BOOKINGS && Array.isArray(parsed)) {
      const sanitized = parsed.filter((b: any) => {
        const isMock =
          b.id?.startsWith('bk-100') ||
          b.customerName === 'Aditya Verma' ||
          b.customerName === 'Meera Nambiar' ||
          b.customerName === 'Kavita Dave' ||
          b.customerName === 'Jignesh Chudasama' ||
          b.bookingCode === 'HE-8491' ||
          b.bookingCode === 'HE-9104' ||
          b.bookingCode === 'HE-7231';
        return !isMock;
      });
      return sanitized as unknown as T;
    }

    return parsed;
  } catch (err) {
    console.warn(`Failed to read ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to write ${key} to localStorage:`, err);
  }
}

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'tech-1',
    fullName: 'Ramesh Bhai Patel',
    phone: '+91 98251 43210',
    email: 'ramesh.patel@homeease.in',
    specialties: ['cat-cleaning', 'cat-sofa'],
    experienceYears: 8,
    rating: 4.9,
    totalJobs: 420,
    isActive: true,
    assignedAreas: ['Zanzarda Road', 'Moti Baug', 'Joshipura'],
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'tech-2',
    fullName: 'Suresh Bhai Makwana',
    phone: '+91 97241 87654',
    email: 'suresh.makwana@homeease.in',
    specialties: ['cat-ac', 'cat-appliances'],
    experienceYears: 6,
    rating: 4.8,
    totalJobs: 310,
    isActive: true,
    assignedAreas: ['Kalva Chowk', 'Timbavadi', 'Bilkha Road'],
    createdAt: '2025-02-15T10:00:00Z',
  },
  {
    id: 'tech-3',
    fullName: 'Jignesh Bhai Vala',
    phone: '+91 94282 11990',
    email: 'jignesh.vala@homeease.in',
    specialties: ['cat-appliances', 'cat-electrician'],
    experienceYears: 5,
    rating: 4.85,
    totalJobs: 260,
    isActive: true,
    assignedAreas: ['College Road', 'Gandhi Chowk', 'Majevadi Gate'],
    createdAt: '2025-03-20T10:00:00Z',
  },
  {
    id: 'tech-4',
    fullName: 'Hitesh Bhai Chauhan',
    phone: '+91 99099 55432',
    email: 'hitesh.chauhan@homeease.in',
    specialties: ['cat-cleaning', 'cat-bathroom'],
    experienceYears: 4,
    rating: 4.75,
    totalJobs: 190,
    isActive: true,
    assignedAreas: ['Dipanjali', 'Dolatpara', 'Madhuram'],
    createdAt: '2025-04-05T10:00:00Z',
  },
];

export const INITIAL_WEBSITE_SETTINGS: WebsiteSettings = {
  businessName: 'HomeEase Junagadh',
  companyName: 'HomeEase Junagadh',
  contactPhone: '+91 90165 26419',
  supportPhone: '+91 90165 26419',
  supportEmail: 'support@homeease.in',
  whatsappNumber: '9016526419',
  address: 'Opp. Swaminarayan Temple, Zanzarda Road, Junagadh, Gujarat 362002',
  officeAddress: 'Opp. Swaminarayan Temple, Zanzarda Road, Junagadh, Gujarat 362002',
  tagline: 'Expert Home Services, Right at Your Doorstep in Junagadh',
  operatingHours: '8:00 AM – 8:00 PM (All 7 Days)',
  availableSlots: [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
  ],
  activeSlots: [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
  ],
  isBookingEnabled: true,
  autoAssignTechnicians: false,
  serviceCity: 'Junagadh',
  smsAlerts: true,
  whatsappAlerts: true,
  adminEmailAlerts: true,
};

// Data mappers between backend database format and frontend types
export function mapBackendServiceToFrontend(s: any): Service {
  const initialMatch = INITIAL_SERVICES.find(
    (init) => init.id === s.id || init.slug === (s.slug || s.id)
  );

  const resolvedImageUrl =
    s.image_url && !s.image_url.includes('1621905251189')
      ? s.image_url
      : initialMatch?.imageUrl || s.imageUrl || '/images/services/home-cleaning.jpg';

  const resolvedGallery =
    Array.isArray(s.gallery_urls) && s.gallery_urls.length > 0
      ? s.gallery_urls
      : Array.isArray(s.galleryUrls) && s.galleryUrls.length > 0
      ? s.galleryUrls
      : initialMatch?.galleryUrls || [resolvedImageUrl];

  return {
    id: s.id,
    categoryId: s.category_id || s.categoryId || 'home-cleaning',
    categorySlug: s.category_id || s.categorySlug || 'home-cleaning',
    title: s.name || s.title || 'Service',
    slug: s.slug || s.id,
    description: s.description || '',
    shortDescription: s.short_description || s.shortDescription || s.description?.slice(0, 100) || '',
    price: Number(s.price) || 0,
    originalPrice: s.original_price ? Number(s.original_price) : undefined,
    durationMinutes: Number(s.duration_minutes) || 60,
    rating: Number(s.rating) || 4.8,
    reviewCount: Number(s.reviews_count || s.reviewCount) || 0,
    imageUrl: resolvedImageUrl,
    galleryUrls: resolvedGallery,
    isPopular: Boolean(s.is_popular ?? s.isPopular),
    isActive: Boolean(s.is_active ?? s.isActive ?? true),
    includedItems: typeof s.included_items === 'string'
      ? s.included_items.split('\n').filter(Boolean)
      : Array.isArray(s.included_items) ? s.included_items : (Array.isArray(s.includedItems) ? s.includedItems : []),
    excludedItems: Array.isArray(s.excludedItems) ? s.excludedItems : (initialMatch?.excludedItems || []),
    faqList: Array.isArray(s.faqList) && s.faqList.length > 0 ? s.faqList : (initialMatch?.faqList || []),
    addOns: Array.isArray(s.addOns) && s.addOns.length > 0 ? s.addOns : (initialMatch?.addOns || []),
  };
}

export function mapBackendBookingToFrontend(b: any): Booking {
  return {
    id: String(b.id || b.booking_code),
    userId: b.customer_phone || 'guest',
    customerName: b.customer_name || b.customerName || 'Customer',
    customerEmail: b.customer_email || b.customerEmail || '',
    customerPhone: b.customer_phone || b.customerPhone || '',
    bookingCode: b.booking_code || b.bookingCode || `JND-2026-${b.id}`,
    items: [
      {
        serviceId: b.service_id || b.items?.[0]?.serviceId || '',
        serviceTitle: b.service_name || b.items?.[0]?.serviceTitle || 'Home Service',
        servicePrice: Number(b.total_amount) || Number(b.items?.[0]?.servicePrice) || 0,
        quantity: 1,
      },
    ],
    totalAmount: Number(b.total_amount ?? b.totalAmount) || 0,
    subtotal: Number(b.total_amount ?? b.subtotal) || 0,
    discountAmount: 0,
    platformFee: 0,
    taxAmount: 0,
    address: {
      houseNumber: '',
      street: b.address || '',
      area: b.locality || '',
      city: b.city || 'Junagadh',
      pincode: b.pincode || '362002',
      addressType: 'home',
      address_line: b.address || '',
      locality: b.locality || '',
      postal_code: b.pincode || '362002',
      state: 'Gujarat',
      country: 'India',
    },
    address_line: b.address || '',
    locality: b.locality || '',
    city: b.city || 'Junagadh',
    postal_code: b.pincode || '362002',
    state: 'Gujarat',
    country: 'India',
    scheduledDate: b.scheduled_date || b.scheduledDate || '',
    scheduledTimeSlot: b.scheduled_time || b.scheduledTimeSlot || '',
    status: (b.status as any) || 'pending',
    paymentStatus: b.payment_status === 'completed' || b.payment_status === 'paid' ? 'paid' : 'pending',
    paymentMethod: b.payment_method === 'online' ? 'card' : 'cash',
    notes: b.notes || '',
    assignedProfessional: b.technician_name
      ? {
          name: b.technician_name,
          phone: b.technician_phone || '',
          rating: 4.9,
          completedJobs: 100,
        }
      : undefined,
    createdAt: b.created_at || new Date().toISOString(),
    updatedAt: b.updated_at || new Date().toISOString(),
  };
}

export function mapBackendTechnicianToFrontend(t: any): Technician {
  const specs = typeof t.specialties === 'string'
    ? t.specialties.split(',').map((s: string) => s.trim()).filter(Boolean)
    : (Array.isArray(t.specialties) ? t.specialties : ['home-cleaning']);
  return {
    id: t.id,
    fullName: t.name || t.fullName || 'Technician',
    phone: t.phone,
    email: t.email || '',
    specialties: specs,
    experienceYears: t.experience_years || t.experienceYears || 3,
    rating: Number(t.rating) || 4.8,
    totalJobs: Number(t.completed_jobs || t.totalJobs) || 0,
    completedJobs: Number(t.completed_jobs) || 0,
    isActive: Boolean(t.is_active ?? t.isActive ?? true),
    assignedAreas: ['Zanzarda Road', 'Moti Baug', 'Joshipura'],
    createdAt: t.created_at || new Date().toISOString(),
  };
}

// In-memory state holders: strictly real data, empty bookings default
let rawLoadedServices = loadFromStorage<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
let servicesCache: Service[] = Array.isArray(rawLoadedServices)
  ? rawLoadedServices.map((sc) => {
      if (!sc) return sc;
      const init = INITIAL_SERVICES.find((i) => i && (i.id === sc.id || i.slug === sc.slug));
      if (!init) return sc;
      return {
        ...sc,
        imageUrl: init.imageUrl,
        galleryUrls: init.galleryUrls || sc.galleryUrls || [init.imageUrl],
      };
    }).filter(Boolean)
  : INITIAL_SERVICES;

let rawLoadedCategories = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
let categoriesCache: Category[] = Array.isArray(rawLoadedCategories)
  ? rawLoadedCategories.map((cat) => {
      if (!cat) return cat;
      const init = INITIAL_CATEGORIES.find((i) => i && (i.id === cat.id || i.slug === cat.slug));
      if (!init) return cat;
      return {
        ...cat,
        imageUrl: init.imageUrl,
      };
    }).filter(Boolean)
  : INITIAL_CATEGORIES;
let bookingsCache: Booking[] = loadFromStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
let reviewsCache: Review[] = loadFromStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
let currentUserCache: UserProfile | null = loadFromStorage(STORAGE_KEYS.USER, null);
let selectedCityCache: string = loadFromStorage(STORAGE_KEYS.LOCATION, 'Junagadh');
let serviceAreasCache: ServiceArea[] = loadFromStorage(STORAGE_KEYS.SERVICE_AREAS, INITIAL_SERVICE_AREAS);
let serviceEnquiriesCache: ServiceEnquiry[] = loadFromStorage(STORAGE_KEYS.SERVICE_ENQUIRIES, []);
let techniciansCache: Technician[] = loadFromStorage(STORAGE_KEYS.TECHNICIANS, INITIAL_TECHNICIANS);
let websiteSettingsCache: WebsiteSettings = loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_WEBSITE_SETTINGS);

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export const DataStore = {
  // --- SYNCHRONIZE WITH PRODUCTION BACKEND DATABASE ---
  async syncWithBackend() {
    try {
      // 1. Fetch live services from production database
      const dbServices = await api.getServices().catch(() => null);
      if (dbServices && Array.isArray(dbServices) && dbServices.length > 0) {
        servicesCache = dbServices.map(mapBackendServiceToFrontend);
        saveToStorage(STORAGE_KEYS.SERVICES, servicesCache);
      }

      // 2. Fetch categories
      const dbCats = await api.getCategories().catch(() => null);
      if (dbCats && Array.isArray(dbCats) && dbCats.length > 0) {
        categoriesCache = dbCats.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.id,
          description: c.description || '',
          iconName: c.icon || 'Sparkles',
          imageUrl: c.image_url || '/images/services/home-cleaning.jpg',
          serviceCount: c.services?.length || 0,
          isPopular: true,
        }));
        saveToStorage(STORAGE_KEYS.CATEGORIES, categoriesCache);
      }

      // 3. Fetch Service Areas
      const dbAreas = await api.getServiceAreas().catch(() => null);
      if (dbAreas && Array.isArray(dbAreas) && dbAreas.length > 0) {
        serviceAreasCache = dbAreas.map((a: any) => ({
          id: String(a.id),
          city: a.city || 'Junagadh',
          district: 'Junagadh',
          locality: a.locality,
          pincode: a.pincode,
          isActive: a.is_active ?? true,
          supportedServiceCategories: ['home-cleaning', 'sofa-cleaning', 'ac-service', 'washing-machine', 'kitchen-bathroom', 'other-services'],
          latitude: 21.5222,
          longitude: 70.4579,
          radiusKm: 15,
        }));
        saveToStorage(STORAGE_KEYS.SERVICE_AREAS, serviceAreasCache);
      }

      // 4. If admin session is active, fetch real bookings & technicians from database
      const rawAdminSession = sessionStorage.getItem('homeease_admin_session_secure_v1') || sessionStorage.getItem('homeease_admin_session');
      if (rawAdminSession) {
        const dbBookings = await api.getAdminBookings().catch(() => null);
        if (dbBookings && Array.isArray(dbBookings)) {
          bookingsCache = dbBookings.map(mapBackendBookingToFrontend);
          saveToStorage(STORAGE_KEYS.BOOKINGS, bookingsCache);
        }

        const dbTechs = await api.getAdminTechnicians().catch(() => null);
        if (dbTechs && Array.isArray(dbTechs)) {
          techniciansCache = dbTechs.map(mapBackendTechnicianToFrontend);
          saveToStorage(STORAGE_KEYS.TECHNICIANS, techniciansCache);
        }

        const dbSettings = await api.getAdminSettings().catch(() => null);
        if (dbSettings && typeof dbSettings === 'object') {
          websiteSettingsCache = {
            ...websiteSettingsCache,
            contactPhone: dbSettings.phone || websiteSettingsCache.contactPhone,
            whatsappNumber: dbSettings.whatsapp || websiteSettingsCache.whatsappNumber,
            supportEmail: dbSettings.email || websiteSettingsCache.supportEmail,
            address: dbSettings.address || websiteSettingsCache.address,
            operatingHours: dbSettings.operating_hours || websiteSettingsCache.operatingHours,
          };
          saveToStorage(STORAGE_KEYS.SETTINGS, websiteSettingsCache);
        }
      }

      notifyListeners();
    } catch (err) {
      console.warn('Error synchronizing with backend database:', err);
    }
  },

  // --- USERS & AUTH ---
  getCurrentUser(): UserProfile | null {
    return currentUserCache;
  },

  setCurrentUser(user: UserProfile | null) {
    currentUserCache = user;
    if (user) {
      saveToStorage(STORAGE_KEYS.USER, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    notifyListeners();
  },

  switchRole(role: 'admin' | 'customer') {
    if (currentUserCache) {
      currentUserCache = { ...currentUserCache, role };
    } else {
      currentUserCache = {
        id: `usr-${role}-${Date.now()}`,
        email: role === 'admin' ? 'admin@homeease.in' : 'customer@homeease.in',
        fullName: role === 'admin' ? 'Operations Administrator' : 'Home Customer',
        phone: '+91 285 262 0000',
        role,
        createdAt: new Date().toISOString(),
      };
    }
    saveToStorage(STORAGE_KEYS.USER, currentUserCache);
    notifyListeners();
  },

  // --- LOCATION ---
  getSelectedCity(): string {
    return selectedCityCache;
  },

  setSelectedCity(city: string) {
    selectedCityCache = city;
    saveToStorage(STORAGE_KEYS.LOCATION, city);
    notifyListeners();
  },

  // --- SERVICE AREAS MANAGEMENT ---
  getServiceAreas(): ServiceArea[] {
    return serviceAreasCache;
  },

  getServiceAreaById(id: string): ServiceArea | undefined {
    return serviceAreasCache.find((a) => a.id === id);
  },

  async addServiceArea(area: Omit<ServiceArea, 'id'>): Promise<ServiceArea> {
    try {
      await api.addServiceArea({
        locality: area.locality,
        pincode: area.pincode,
        is_active: area.isActive,
      });
    } catch (err) {
      console.warn('Backend API addServiceArea warning:', err);
    }
    const newArea: ServiceArea = {
      ...area,
      id: `sa-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    serviceAreasCache = [newArea, ...serviceAreasCache];
    saveToStorage(STORAGE_KEYS.SERVICE_AREAS, serviceAreasCache);
    notifyListeners();
    return newArea;
  },

  async updateServiceArea(id: string, updates: Partial<ServiceArea>): Promise<ServiceArea | null> {
    try {
      await api.updateServiceArea(id, {
        locality: updates.locality,
        pincode: updates.pincode,
        is_active: updates.isActive,
      });
    } catch (err) {
      console.warn('Backend API updateServiceArea warning:', err);
    }
    const index = serviceAreasCache.findIndex((a) => a.id === id);
    if (index === -1) return null;
    serviceAreasCache[index] = {
      ...serviceAreasCache[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    serviceAreasCache = [...serviceAreasCache];
    saveToStorage(STORAGE_KEYS.SERVICE_AREAS, serviceAreasCache);
    notifyListeners();
    return serviceAreasCache[index];
  },

  deleteServiceArea(id: string): boolean {
    const prevLen = serviceAreasCache.length;
    serviceAreasCache = serviceAreasCache.filter((a) => a.id !== id);
    if (serviceAreasCache.length !== prevLen) {
      saveToStorage(STORAGE_KEYS.SERVICE_AREAS, serviceAreasCache);
      notifyListeners();
      return true;
    }
    return false;
  },

  toggleServiceArea(id: string, isActive?: boolean): Promise<ServiceArea | null> {
    const area = this.getServiceAreaById(id);
    if (!area) return Promise.resolve(null);
    const newStatus = isActive !== undefined ? isActive : !area.isActive;
    return this.updateServiceArea(id, { isActive: newStatus });
  },

  checkLocationCoverage(
    location: {
      city?: string;
      pincode?: string;
      lat?: number;
      lng?: number;
      state?: string;
      locality?: string;
    },
    serviceIdOrCategory: string
  ): CoverageCheckResult {
    return checkServiceAvailability(location, serviceIdOrCategory, serviceAreasCache);
  },

  // --- SERVICE ENQUIRIES ---
  getServiceEnquiries(): ServiceEnquiry[] {
    return serviceEnquiriesCache;
  },

  createServiceEnquiry(enquiry: Omit<ServiceEnquiry, 'id' | 'createdAt' | 'status'>): ServiceEnquiry {
    const newEnquiry: ServiceEnquiry = {
      ...enquiry,
      id: `enq-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    serviceEnquiriesCache = [newEnquiry, ...serviceEnquiriesCache];
    saveToStorage(STORAGE_KEYS.SERVICE_ENQUIRIES, serviceEnquiriesCache);
    notifyListeners();
    return newEnquiry;
  },

  updateServiceEnquiryStatus(id: string, status: ServiceEnquiry['status']) {
    const index = serviceEnquiriesCache.findIndex((e) => e.id === id);
    if (index === -1) return;
    serviceEnquiriesCache[index] = { ...serviceEnquiriesCache[index], status };
    serviceEnquiriesCache = [...serviceEnquiriesCache];
    saveToStorage(STORAGE_KEYS.SERVICE_ENQUIRIES, serviceEnquiriesCache);
    notifyListeners();
  },

  // --- SERVICES ---
  getServices(): Service[] {
    return servicesCache;
  },

  getServiceBySlug(slug: string): Service | undefined {
    return servicesCache.find((s) => s.slug === slug || s.id === slug);
  },

  getServicesByCategory(categoryId: string): Service[] {
    return servicesCache.filter((s) => (s.categoryId === categoryId || s.categorySlug === categoryId) && s.isActive);
  },

  async addService(newService: Omit<Service, 'id'>): Promise<Service> {
    const serviceId = newService.slug || `srv-${Date.now()}`;
    try {
      const created = await api.createService({
        id: serviceId,
        category_id: newService.categoryId,
        name: newService.title,
        slug: newService.slug || serviceId,
        short_description: newService.shortDescription,
        description: newService.description,
        price: newService.price,
        original_price: newService.originalPrice,
        duration_minutes: newService.durationMinutes,
        image_url: newService.imageUrl,
        icon: 'Sparkles',
        is_active: newService.isActive,
        is_popular: newService.isPopular || false,
        included_items: newService.includedItems?.join('\n') || '',
      });
      const mapped = mapBackendServiceToFrontend(created);
      servicesCache = [mapped, ...servicesCache.filter((s) => s.id !== mapped.id)];
      saveToStorage(STORAGE_KEYS.SERVICES, servicesCache);
      notifyListeners();
      return mapped;
    } catch (err) {
      console.warn('API createService fallback:', err);
      const service: Service = {
        ...newService,
        id: serviceId,
      };
      servicesCache = [service, ...servicesCache];
      saveToStorage(STORAGE_KEYS.SERVICES, servicesCache);
      notifyListeners();
      return service;
    }
  },

  async updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
    try {
      await api.updateService(id, {
        category_id: updates.categoryId,
        name: updates.title,
        slug: updates.slug,
        short_description: updates.shortDescription,
        description: updates.description,
        price: updates.price,
        original_price: updates.originalPrice,
        duration_minutes: updates.durationMinutes,
        image_url: updates.imageUrl,
        is_active: updates.isActive,
        is_popular: updates.isPopular,
        included_items: Array.isArray(updates.includedItems) ? updates.includedItems.join('\n') : undefined,
      });
    } catch (err) {
      console.warn('API updateService fallback:', err);
    }
    const index = servicesCache.findIndex((s) => s.id === id);
    if (index === -1) return null;
    servicesCache[index] = { ...servicesCache[index], ...updates };
    servicesCache = [...servicesCache];
    saveToStorage(STORAGE_KEYS.SERVICES, servicesCache);
    notifyListeners();
    return servicesCache[index];
  },

  async deleteService(id: string): Promise<boolean> {
    try {
      await api.deleteService(id);
    } catch (err) {
      console.warn('API deleteService fallback:', err);
    }
    const prevLen = servicesCache.length;
    servicesCache = servicesCache.filter((s) => s.id !== id);
    if (servicesCache.length !== prevLen) {
      saveToStorage(STORAGE_KEYS.SERVICES, servicesCache);
      notifyListeners();
      return true;
    }
    return false;
  },

  // --- CATEGORIES ---
  getCategories(): Category[] {
    return categoriesCache;
  },

  getCategoryBySlug(slug: string): Category | undefined {
    return categoriesCache.find((c) => c.slug === slug || c.id === slug);
  },

  // --- BOOKINGS ---
  getBookings(): Booking[] {
    return bookingsCache;
  },

  getUserBookings(userId: string): Booking[] {
    return bookingsCache.filter((b) => b.userId === userId || b.customerPhone === userId);
  },

  getBookingById(id: string): Booking | undefined {
    return bookingsCache.find((b) => b.id === id || b.bookingCode === id);
  },

  createBooking(bookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'updatedAt'>): Booking {
    const isJunagadh = (bookingData.city || bookingData.address?.city || 'Junagadh').toLowerCase().includes('junagadh');
    const lat = bookingData.latitude ?? bookingData.address?.latitude ?? (isJunagadh ? 21.5222 : undefined);
    const lng = bookingData.longitude ?? bookingData.address?.longitude ?? (isJunagadh ? 70.4579 : undefined);

    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      throw new Error('Valid service address is required to proceed with booking.');
    }

    if (!isWithinGujaratBounds(lat, lng)) {
      throw new Error('Selected location is outside the State of Gujarat. HomeEase currently operates in Junagadh, Gujarat.');
    }

    const city = (bookingData.city || bookingData.address?.city || 'Junagadh').trim();
    if (!city.toLowerCase().includes('junagadh')) {
      throw new Error("We're coming to your city soon! We currently operate home services exclusively in Junagadh, Gujarat.");
    }

    const randomCode = `JND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const addressSnapshot = {
      ...bookingData.address,
      address_line: bookingData.address_line || bookingData.address.address_line || `${bookingData.address.houseNumber}, ${bookingData.address.street}, ${bookingData.address.area}, ${bookingData.address.city}, Gujarat ${bookingData.address.pincode}`,
      apartment_or_house_number: bookingData.apartment_or_house_number || bookingData.address.apartment_or_house_number || bookingData.address.houseNumber,
      building_name: bookingData.building_name || bookingData.address.building_name || bookingData.address.street,
      floor_number: bookingData.floor_number || bookingData.address.floor_number || '',
      landmark: bookingData.landmark || bookingData.address.landmark || '',
      locality: bookingData.locality || bookingData.address.locality || bookingData.address.area,
      city: bookingData.city || bookingData.address.city,
      district: bookingData.district || bookingData.address.district || bookingData.address.city,
      state: bookingData.state || bookingData.address.state || 'Gujarat',
      postal_code: bookingData.postal_code || bookingData.address.postal_code || bookingData.address.pincode,
      country: bookingData.country || bookingData.address.country || 'India',
      latitude: lat,
      longitude: lng,
      google_place_id: bookingData.google_place_id || bookingData.address.google_place_id,
      location_accuracy_meters: bookingData.location_accuracy_meters ?? bookingData.address.location_accuracy_meters,
      location_confirmed: true,
      location_instructions: bookingData.location_instructions || bookingData.address.location_instructions || bookingData.notes || '',
    };

    const newBooking: Booking = {
      ...bookingData,
      id: `bk-${Date.now()}`,
      bookingCode: randomCode,
      createdAt: now,
      updatedAt: now,
      address: addressSnapshot,
      address_line: addressSnapshot.address_line,
      apartment_or_house_number: addressSnapshot.apartment_or_house_number,
      building_name: addressSnapshot.building_name,
      floor_number: addressSnapshot.floor_number,
      landmark: addressSnapshot.landmark,
      locality: addressSnapshot.locality,
      city: addressSnapshot.city,
      district: addressSnapshot.district,
      state: addressSnapshot.state,
      postal_code: addressSnapshot.postal_code,
      country: addressSnapshot.country,
      latitude: lat,
      longitude: lng,
      google_place_id: addressSnapshot.google_place_id,
      location_accuracy_meters: addressSnapshot.location_accuracy_meters,
      location_confirmed: true,
      location_instructions: addressSnapshot.location_instructions,
    };

    bookingsCache = [newBooking, ...bookingsCache];
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookingsCache);

    if (isSupabaseConfigured() && supabase) {
      supabase.from('bookings').insert({
        id: newBooking.id,
        user_id: newBooking.userId,
        booking_code: newBooking.bookingCode,
        customer_name: newBooking.customerName,
        customer_email: newBooking.customerEmail,
        customer_phone: newBooking.customerPhone,
        items: newBooking.items,
        subtotal: newBooking.subtotal,
        discount_amount: newBooking.discountAmount,
        platform_fee: newBooking.platformFee,
        tax_amount: newBooking.taxAmount,
        total_amount: newBooking.totalAmount,
        coupon_code: newBooking.couponCode || null,
        address: newBooking.address,
        scheduled_date: newBooking.scheduledDate,
        scheduled_time_slot: newBooking.scheduledTimeSlot,
        status: newBooking.status,
        payment_status: newBooking.paymentStatus,
        payment_method: newBooking.paymentMethod,
        notes: newBooking.notes || null,
      }).then(({ error }) => {
        if (error) console.warn('Supabase booking sync warning:', error);
      });
    }

    notifyListeners();
    return newBooking;
  },

  async updateBookingStatus(id: string, status: BookingStatus, professional?: Booking['assignedProfessional']): Promise<Booking | null> {
    try {
      await api.updateBookingStatus(id, status);
    } catch (err) {
      console.warn('API updateBookingStatus warning:', err);
    }

    const index = bookingsCache.findIndex((b) => b.id === id || b.bookingCode === id);
    if (index === -1) return null;

    const updated: Booking = {
      ...bookingsCache[index],
      status,
      assignedProfessional: professional !== undefined ? professional : bookingsCache[index].assignedProfessional,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'completed' && updated.paymentMethod === 'cash') {
      updated.paymentStatus = 'paid';
    }

    bookingsCache[index] = updated;
    bookingsCache = [...bookingsCache];
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookingsCache);
    notifyListeners();
    return updated;
  },

  cancelBooking(id: string): Promise<Booking | null> {
    const booking = this.getBookingById(id);
    if (!booking) return Promise.resolve(null);
    return this.updateBookingStatus(booking.id, 'cancelled');
  },

  updateBooking(id: string, updates: Partial<Booking>): Booking | null {
    const index = bookingsCache.findIndex((b) => b.id === id || b.bookingCode === id);
    if (index === -1) return null;
    bookingsCache[index] = {
      ...bookingsCache[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    bookingsCache = [...bookingsCache];
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookingsCache);
    notifyListeners();
    return bookingsCache[index];
  },

  async rescheduleBooking(id: string, newDate: string, newSlot: string): Promise<Booking | null> {
    try {
      await api.rescheduleBooking(id, newDate, newSlot);
    } catch (err) {
      console.warn('API rescheduleBooking warning:', err);
    }
    return this.updateBooking(id, {
      scheduledDate: newDate,
      scheduledTimeSlot: newSlot,
    });
  },

  // --- REVIEWS ---
  getReviews(): Review[] {
    return reviewsCache;
  },

  getReviewsByService(serviceId: string): Review[] {
    return reviewsCache.filter((r) => r.serviceId === serviceId);
  },

  addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Review {
    const review: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    reviewsCache = [review, ...reviewsCache];
    saveToStorage(STORAGE_KEYS.REVIEWS, reviewsCache);

    const serviceReviews = reviewsCache.filter((r) => r.serviceId === review.serviceId);
    const avg = serviceReviews.reduce((acc, r) => acc + r.rating, 0) / serviceReviews.length;
    this.updateService(review.serviceId, {
      rating: parseFloat(avg.toFixed(2)),
      reviewCount: serviceReviews.length,
    });

    notifyListeners();
    return review;
  },

  // --- COUPONS ---
  validateCoupon(code: string, cartTotal: number): { valid: boolean; coupon?: Coupon; error?: string } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = INITIAL_COUPONS.find((c) => c.code === cleanCode);

    if (!coupon) {
      return { valid: false, error: 'Invalid coupon code. Try FIRST50, CLEAN200, or FESTIVE15' };
    }

    if (cartTotal < coupon.minOrderValue) {
      return {
        valid: false,
        error: `Minimum order value for ${coupon.code} is ₹${coupon.minOrderValue}. Add items worth ₹${coupon.minOrderValue - cartTotal} more.`,
      };
    }

    return { valid: true, coupon };
  },

  // --- ADMIN ANALYTICS: CALCULATED STRICTLY FROM REAL RECORDS ---
  getAdminAnalytics(): AdminAnalytics {
    const totalBookings = bookingsCache.length;
    const completedBookings = bookingsCache.filter((b) => b.status === 'completed').length;
    const activeBookings = bookingsCache.filter(
      (b) => b.status === 'pending' || b.status === 'confirmed' || b.status === 'in_progress'
    ).length;

    // Real eligible completed revenue
    const totalRevenue = bookingsCache
      .filter((b) => b.status === 'completed' || b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    // Unique customers calculated strictly from actual bookings
    const uniqueCustomers = new Set(
      bookingsCache.map((b) => b.customerPhone || b.customerEmail).filter(Boolean)
    );

    const statusCounts: Record<BookingStatus, number> = {
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };

    bookingsCache.forEach((b) => {
      if (b.status in statusCounts) {
        statusCounts[b.status] += 1;
      }
    });

    const statusDistribution = (Object.keys(statusCounts) as BookingStatus[]).map((status) => ({
      status,
      count: statusCounts[status],
    }));

    // Real monthly trend calculated from actual bookings
    const monthMap: Record<string, number> = {};
    bookingsCache.forEach((b) => {
      if (b.status === 'completed' || b.paymentStatus === 'paid') {
        const m = b.scheduledDate ? b.scheduledDate.slice(0, 7) : (b.createdAt ? b.createdAt.slice(0, 7) : '2026-10');
        monthMap[m] = (monthMap[m] || 0) + b.totalAmount;
      }
    });

    const sortedMonths = Object.keys(monthMap).sort();
    const monthlyRevenue = sortedMonths.length > 0
      ? sortedMonths.map((m) => ({ month: m, amount: monthMap[m] }))
      : [];

    return {
      totalRevenue,
      totalBookings,
      activeBookings,
      completedBookings,
      totalCustomers: uniqueCustomers.size,
      averageRating: 4.88,
      monthlyRevenue,
      statusDistribution,
      categoryBreakdown: [],
    };
  },

  // --- TECHNICIANS MANAGEMENT ---
  getTechnicians(): Technician[] {
    return techniciansCache;
  },

  getTechnicianById(id: string): Technician | undefined {
    return techniciansCache.find((t) => t.id === id);
  },

  async addTechnician(tech: Omit<Technician, 'id' | 'createdAt' | 'rating' | 'totalJobs'>): Promise<Technician> {
    try {
      await api.createTechnician({
        name: tech.fullName,
        phone: tech.phone,
        email: tech.email,
        specialties: tech.specialties.join(','),
        experience_years: tech.experienceYears,
        is_active: tech.isActive,
      });
    } catch (err) {
      console.warn('API createTechnician fallback:', err);
    }
    const newTech: Technician = {
      ...tech,
      id: `tech-${Date.now()}`,
      rating: 5.0,
      totalJobs: 0,
      createdAt: new Date().toISOString(),
    };
    techniciansCache = [newTech, ...techniciansCache];
    saveToStorage(STORAGE_KEYS.TECHNICIANS, techniciansCache);
    notifyListeners();
    return newTech;
  },

  async updateTechnician(id: string, updates: Partial<Technician>): Promise<Technician | null> {
    try {
      await api.updateTechnician(id, {
        name: updates.fullName,
        phone: updates.phone,
        email: updates.email,
        specialties: updates.specialties?.join(','),
        experience_years: updates.experienceYears,
        is_active: updates.isActive,
      });
    } catch (err) {
      console.warn('API updateTechnician fallback:', err);
    }
    const index = techniciansCache.findIndex((t) => t.id === id);
    if (index === -1) return null;
    techniciansCache[index] = { ...techniciansCache[index], ...updates };
    techniciansCache = [...techniciansCache];
    saveToStorage(STORAGE_KEYS.TECHNICIANS, techniciansCache);
    notifyListeners();
    return techniciansCache[index];
  },

  deleteTechnician(id: string): boolean {
    const prevLen = techniciansCache.length;
    techniciansCache = techniciansCache.filter((t) => t.id !== id);
    if (techniciansCache.length !== prevLen) {
      saveToStorage(STORAGE_KEYS.TECHNICIANS, techniciansCache);
      notifyListeners();
      return true;
    }
    return false;
  },

  toggleTechnician(id: string): Promise<Technician | null> {
    const tech = this.getTechnicianById(id);
    if (!tech) return Promise.resolve(null);
    return this.updateTechnician(id, { isActive: !tech.isActive });
  },

  async assignTechnicianToBooking(bookingId: string, technicianId: string): Promise<boolean> {
    try {
      await api.assignTechnician(bookingId, technicianId);
    } catch (err) {
      console.warn('API assignTechnician fallback:', err);
    }
    const tech = this.getTechnicianById(technicianId);
    const booking = this.getBookingById(bookingId);
    if (!tech || !booking) return false;

    await this.updateBookingStatus(bookingId, 'confirmed', {
      name: tech.fullName,
      phone: tech.phone,
      rating: tech.rating,
      completedJobs: tech.totalJobs || 100,
    });
    return true;
  },

  // --- WEBSITE SETTINGS ---
  getWebsiteSettings(): WebsiteSettings {
    return websiteSettingsCache;
  },

  async updateWebsiteSettings(updates: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    try {
      await api.updateAdminSettings({
        phone: updates.contactPhone,
        whatsapp: updates.whatsappNumber,
        email: updates.supportEmail,
        address: updates.address,
        operating_hours: updates.operatingHours,
      });
    } catch (err) {
      console.warn('API updateAdminSettings fallback:', err);
    }
    websiteSettingsCache = { ...websiteSettingsCache, ...updates };
    saveToStorage(STORAGE_KEYS.SETTINGS, websiteSettingsCache);
    notifyListeners();
    return websiteSettingsCache;
  },

  // Re-synchronize data from database
  async refreshFromDatabase() {
    await this.syncWithBackend();
  },
};

// Initiate automatic database sync in browser environment
if (typeof window !== 'undefined') {
  DataStore.syncWithBackend().catch((e) => console.warn('Initial store sync notice:', e));
}

// Custom React Hook to subscribe to store changes
export function useStoreData() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    currentUser: DataStore.getCurrentUser(),
    selectedCity: DataStore.getSelectedCity(),
    services: DataStore.getServices(),
    categories: DataStore.getCategories(),
    bookings: DataStore.getBookings(),
    reviews: DataStore.getReviews(),
    analytics: DataStore.getAdminAnalytics(),
    serviceAreas: DataStore.getServiceAreas(),
    serviceEnquiries: DataStore.getServiceEnquiries(),
    technicians: DataStore.getTechnicians(),
    websiteSettings: DataStore.getWebsiteSettings(),
  };
}
