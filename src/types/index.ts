export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  addressCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  imageUrl: string;
  serviceCount?: number;
  isPopular?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description?: string;
}

export interface Service {
  id: string;
  categoryId: string;
  categorySlug?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  durationMinutes: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  galleryUrls?: string[];
  isPopular?: boolean;
  isActive: boolean;
  includedItems: string[];
  excludedItems: string[];
  faqList: { question: string; answer: string }[];
  addOns?: AddOn[];
}

export interface Address {
  id?: string;
  houseNumber: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
  addressType: 'home' | 'work' | 'other';
  notesForPro?: string;
  // Precise Google Maps & Geocoding fields
  address_line?: string;
  apartment_or_house_number?: string;
  building_name?: string;
  floor_number?: string;
  locality?: string;
  district?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  google_place_id?: string;
  location_accuracy_meters?: number;
  location_confirmed?: boolean;
  location_instructions?: string;
}

export interface ServiceArea {
  id: string;
  city: string;
  district: string;
  locality: string;
  pincode: string;
  isActive: boolean;
  supportedServiceCategories: string[]; // e.g., 'cat-sofa', 'cat-cleaning', 'cat-ac', 'cat-appliances'
  latitude: number;
  longitude: number;
  radiusKm: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceEnquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceCategory: string;
  fullAddress: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'contacted';
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'upi' | 'card';

export interface BookingItem {
  serviceId: string;
  serviceTitle: string;
  servicePrice: number;
  quantity: number;
  imageUrl?: string;
  selectedAddOns?: {
    id: string;
    name: string;
    price: number;
  }[];
}

export interface Booking {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingCode: string; // e.g. HE-9281
  items: BookingItem[];
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  platformFee: number;
  taxAmount: number;
  couponCode?: string;
  address: Address;
  // Precise location snapshot
  address_line?: string;
  apartment_or_house_number?: string;
  building_name?: string;
  floor_number?: string;
  landmark?: string;
  locality?: string;
  city?: string;
  district?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  google_place_id?: string;
  location_accuracy_meters?: number;
  location_confirmed?: boolean;
  location_instructions?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTimeSlot: string; // e.g. "09:00 AM - 11:00 AM"
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  technicianId?: string;
  assignedProfessional?: {
    name: string;
    phone: string;
    rating: number;
    completedJobs: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  serviceTitle?: string;
  createdAt: string;
  verifiedBooking: boolean;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  description: string;
}

export interface AdminAnalytics {
  totalRevenue: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalCustomers: number;
  averageRating: number;
  monthlyRevenue: { month: string; amount: number }[];
  statusDistribution: { status: BookingStatus; count: number }[];
  categoryBreakdown: { category: string; count: number; revenue: number }[];
}

export interface Technician {
  id: string;
  fullName: string;
  name?: string;
  phone: string;
  email?: string;
  specialties: string[]; // e.g., 'cat-cleaning', 'cat-sofa', 'cat-ac', 'cat-appliances'
  experienceYears: number;
  rating: number;
  totalJobs: number;
  completedJobs?: number;
  isActive: boolean;
  assignedAreas: string[]; // Junagadh localities e.g., ['Zanzarda Road', 'Moti Baug']
  createdAt: string;
}

export interface WebsiteSettings {
  businessName: string;
  companyName?: string;
  contactPhone: string;
  supportPhone?: string;
  supportEmail: string;
  whatsappNumber: string;
  address: string;
  officeAddress?: string;
  tagline?: string;
  operatingHours: string;
  availableSlots: string[];
  activeSlots?: string[];
  isBookingEnabled: boolean;
  autoAssignTechnicians: boolean;
  serviceCity: string;
  smsAlerts?: boolean;
  whatsappAlerts?: boolean;
  adminEmailAlerts?: boolean;
}

