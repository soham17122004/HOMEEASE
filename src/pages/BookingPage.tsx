import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Tag,
  Check,
  Plus,
  Minus,
  AlertCircle,
  Lock,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useStoreData, DataStore } from '../lib/store';
import { BookingItem, PaymentMethod } from '../types';
import { LocationPicker, LocationPickerValue } from '../components/common/LocationPicker';
import { openWhatsApp, WHATSAPP_DISPLAY } from '../lib/whatsapp';
import { api } from '../lib/api';

// Zod schema for Customer contact & basic info (Guest-friendly, no login required)
const bookingFormSchema = z.object({
  fullName: z.string().min(2, 'Customer name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9+ -]{10,14}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  addressType: z.enum(['home', 'work', 'other']).optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

const SOFA_RATE_PER_SEAT = 149;

interface SofaVariant {
  seats: number;
  label: string;
  tag?: string;
  popular?: boolean;
}

const SOFA_SEATER_VARIANTS: SofaVariant[] = [
  { seats: 2, label: '2 Seater', tag: 'Loveseat' },
  { seats: 3, label: '3 Seater', tag: 'Standard Sofa', popular: true },
  { seats: 4, label: '4 Seater', tag: 'Extended 4-Seat' },
  { seats: 5, label: '5 Seater', tag: '3+1+1 Set' },
  { seats: 6, label: '6 Seater', tag: 'L-Shape / 3+2+1' },
  { seats: 7, label: '7 Seater', tag: '7-Seat Sectional' },
  { seats: 8, label: '8 Seater', tag: '8-Seat Sectional' },
  { seats: 9, label: '9 Seater', tag: '9-Seat U-Shape' },
  { seats: 10, label: '10 Seater', tag: '10-Seat Jumbo' },
  { seats: 1, label: '1 Seater', tag: 'Single Recliner' },
];

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { services, currentUser, selectedCity } = useStoreData();

  const initialServiceId = searchParams.get('serviceId') || services[0]?.id;
  const initialAddOns = searchParams.get('addOns')?.split(',').filter(Boolean) || [];

  const initialCustomPrice = searchParams.get('price') ? Number(searchParams.get('price')) : null;
  const initialCustomTier = searchParams.get('tier') || '';

  // Steps: 1: Service Customization, 2: Date & Slot, 3: Address, 4: Payment & Review
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selected Service & Quantity
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>(initialAddOns);

  // Scheduling state: Next 7 days
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM - 12:00 PM');

  // Coupon state
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string>('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find active service
  const activeService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Sofa Seater detection & state (₹149/seat)
  const isSofaService = Boolean(
    activeService?.categoryId === 'cat-sofa' ||
    activeService?.slug?.includes('sofa') ||
    activeService?.title?.toLowerCase().includes('sofa')
  );

  const [sofaSeats, setSofaSeats] = useState<number>(() => {
    if (initialCustomTier) {
      const match = initialCustomTier.match(/(\d+)[- ]?seater/i);
      if (match) return parseInt(match[1], 10);
    }
    const seatsParam = searchParams.get('seats');
    if (seatsParam) {
      const parsed = parseInt(seatsParam, 10);
      if (parsed >= 1 && parsed <= 10) return parsed;
    }
    return 3;
  });

  // React Hook Form for Customer Info
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      addressType: 'home',
    },
  });

  // Precise Doorstep Location Snapshot state (Junagadh, Gujarat Coverage)
  const [pickedLocation, setPickedLocation] = useState<LocationPickerValue>({
    address_line: '',
    apartment_or_house_number: '',
    building_name: '',
    floor_number: '',
    landmark: '',
    locality: 'Zanzarda Road',
    city: 'Junagadh',
    district: 'Junagadh',
    state: 'Gujarat',
    postal_code: '362002',
    country: 'India',
    latitude: 21.5222,
    longitude: 70.4579,
    location_accuracy_meters: 10,
    location_confirmed: true,
    location_instructions: '',
  });

  const [isLocationServiceable, setIsLocationServiceable] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string>('');

  // Generate the next 7 days in Indian Standard Time (Asia/Kolkata)
  const availableDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' });
      const formattedDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
      const displayDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
      return { dayName, formattedDate, displayDate };
    });
  }, []);

  // Real-time slot availability state
  const [slotList, setSlotList] = useState<Array<{
    id: string | number;
    slot: string;
    timeOfDay: string;
    status: 'available' | 'booked' | 'past';
    is_available: boolean;
    reason?: string;
  }>>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string>('');
  const [serverTimeIST, setServerTimeIST] = useState<string>('');

  // Fallback IST past-slot checker
  const isSlotPastInIST = useCallback((slotLabel: string, dateStr: string): boolean => {
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });
    const todayIST = formatter.format(new Date());
    if (dateStr < todayIST) return true;
    if (dateStr > todayIST) return false;

    const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const curH = istNow.getHours();
    const curM = istNow.getMinutes();

    const match = slotLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return false;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const meridiem = match[3].toUpperCase();
    if (meridiem === 'PM' && h !== 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;

    return (h < curH) || (h === curH && m <= curM);
  }, []);

  // Fetch live slot availability from FastAPI backend with reactive DataStore fallback
  const fetchAvailability = useCallback(async (targetDate: string, autoSelectFirst = false) => {
    if (!targetDate) return;
    setIsLoadingSlots(true);
    setSlotError('');
    try {
      const data = await api.getAvailability(targetDate, activeService?.id);
      setServerTimeIST(data.server_time_ist || '');

      const mapped = data.slots.map((s) => {
        // Determine time-of-day from slot start hour (works for all 6 slots)
        const hourMatch = s.slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        let tod = 'Morning';
        if (hourMatch) {
          let h = parseInt(hourMatch[1], 10);
          const meridiem = hourMatch[3].toUpperCase();
          if (meridiem === 'PM' && h !== 12) h += 12;
          if (meridiem === 'AM' && h === 12) h = 0;
          if (h >= 12 && h < 17) tod = 'Afternoon';
          else if (h >= 17) tod = 'Evening';
        }

        return {
          id: s.id,
          slot: s.slot,
          timeOfDay: tod,
          status: s.status,
          is_available: s.is_available,
          reason: s.reason,
        };
      });

      setSlotList(mapped);

      // Auto select or maintain valid slot selection
      setSelectedSlot((prev) => {
        const found = mapped.find((m) => m.slot === prev);
        if (found && found.is_available) {
          return prev;
        }
        if (autoSelectFirst || !prev || (found && !found.is_available)) {
          const firstAvail = mapped.find((m) => m.is_available);
          return firstAvail ? firstAvail.slot : '';
        }
        return prev;
      });
    } catch {
      // Local fallback calculation using active bookings in DataStore
      const existingBookings = DataStore.getBookings().filter(
        (b) => b.scheduledDate === targetDate && (b.status as string) !== 'cancelled' && (b.status as string) !== 'rejected'
      );
      const bookedSet = new Set(existingBookings.map((b) => b.scheduledTimeSlot));

      const fallbackSlots = [
        { id: 'slot-1', slot: '08:00 AM - 10:00 AM', timeOfDay: 'Morning' },
        { id: 'slot-2', slot: '10:00 AM - 12:00 PM', timeOfDay: 'Morning' },
        { id: 'slot-3', slot: '12:00 PM - 02:00 PM', timeOfDay: 'Afternoon' },
        { id: 'slot-4', slot: '02:00 PM - 04:00 PM', timeOfDay: 'Afternoon' },
        { id: 'slot-5', slot: '04:00 PM - 06:00 PM', timeOfDay: 'Evening' },
        { id: 'slot-6', slot: '06:00 PM - 08:00 PM', timeOfDay: 'Evening' },
      ].map((item) => {
        const isPast = isSlotPastInIST(item.slot, targetDate);
        const isBooked = bookedSet.has(item.slot);

        let status: 'available' | 'booked' | 'past' = 'available';
        let isAvail = true;
        let reason: string | undefined = undefined;

        if (isPast) {
          status = 'past';
          isAvail = false;
          reason = 'Unavailable (Time Passed)';
        } else if (isBooked) {
          status = 'booked';
          isAvail = false;
          reason = 'Booked by another customer';
        }

        return {
          id: item.id,
          slot: item.slot,
          timeOfDay: item.timeOfDay,
          status,
          is_available: isAvail,
          reason,
        };
      });

      setSlotList(fallbackSlots);
      setSelectedSlot((prev) => {
        const found = fallbackSlots.find((m) => m.slot === prev);
        if (found && found.is_available) return prev;
        const firstAvail = fallbackSlots.find((m) => m.is_available);
        return firstAvail ? firstAvail.slot : '';
      });
    } finally {
      setIsLoadingSlots(false);
    }
  }, [activeService?.id, isSlotPastInIST]);

  // Initial date selection
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      const initialDate = availableDates[0].formattedDate;
      setSelectedDate(initialDate);
      fetchAvailability(initialDate, true);
    }
  }, [availableDates, selectedDate, fetchAvailability]);

  // Poll availability every 4 seconds for live real-time slot blocking across clients
  useEffect(() => {
    if (!selectedDate) return;
    fetchAvailability(selectedDate);
    const interval = setInterval(() => {
      fetchAvailability(selectedDate);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedDate, fetchAvailability]);

  // Dynamic Title, Duration, and Unit Rate (₹149 per seat for sofa variants)
  const currentServiceTitle = isSofaService
    ? `${sofaSeats}-Seater Fabric Sofa Deep Cleaning & Sanitization`
    : (initialCustomTier || activeService?.title || 'Home Service');

  const currentDuration = isSofaService
    ? 30 + (sofaSeats * 15)
    : (activeService?.durationMinutes || 60);

  // Cost calculations
  const unitRate = isSofaService
    ? sofaSeats * SOFA_RATE_PER_SEAT
    : (initialCustomPrice || (activeService ? activeService.price : 0));
  const baseServicePrice = unitRate * quantity;
  const addOnsTotal = (activeService?.addOns || [])
    .filter((a) => selectedAddOnIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const subtotal = baseServicePrice + addOnsTotal;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const platformFee = subtotal >= BRAND_CONFIG.fees.freePlatformFeeThreshold ? 0 : BRAND_CONFIG.fees.platformFee;
  const taxAmount = Math.round((discountedSubtotal * BRAND_CONFIG.fees.taxRatePercentage) / 100);
  const grandTotal = discountedSubtotal + platformFee + taxAmount;

  // Coupon application handler
  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) return;

    const res = DataStore.validateCoupon(couponCode, subtotal);
    if (!res.valid || !res.coupon) {
      setCouponError(res.error || 'Invalid coupon code');
      setAppliedCoupon(null);
      return;
    }

    let calculatedDiscount = 0;
    if (res.coupon.discountType === 'percentage') {
      calculatedDiscount = Math.round((subtotal * res.coupon.discountValue) / 100);
      if (res.coupon.maxDiscount && calculatedDiscount > res.coupon.maxDiscount) {
        calculatedDiscount = res.coupon.maxDiscount;
      }
    } else {
      calculatedDiscount = res.coupon.discountValue;
    }

    setAppliedCoupon({
      code: res.coupon.code,
      discount: calculatedDiscount,
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Step 3 Validation before advancing to Step 4
  const handleProceedFromAddress = async () => {
    setLocationError('');
    const isContactValid = await trigger();
    if (!isContactValid) return;

    if (!pickedLocation.city || pickedLocation.city.toLowerCase() !== 'junagadh') {
      setLocationError('We currently only accept bookings in Junagadh, Gujarat. Other cities are coming soon!');
      return;
    }

    if (!pickedLocation.postal_code?.startsWith('362')) {
      setLocationError('Invalid pincode. We service Junagadh pincodes starting with 362 (e.g. 362001, 362002).');
      return;
    }

    // Validate that basic doorstep address is present
    if (!pickedLocation.apartment_or_house_number?.trim() || !pickedLocation.locality?.trim()) {
      setLocationError('Please provide your flat/house number and locality in Junagadh before proceeding.');
      return;
    }

    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct WhatsApp Booking Handler (Number: 9016526419)
  const handleWhatsAppDirectBooking = () => {
    openWhatsApp({
      serviceTitle: currentServiceTitle,
      seats: isSofaService ? sofaSeats : undefined,
      quantity,
      price: grandTotal,
      date: selectedDate,
      timeSlot: selectedSlot,
      city: pickedLocation.city,
      customerName: currentUser?.fullName || 'Customer',
      phone: currentUser?.phone,
      address: pickedLocation.address_line,
      notes: pickedLocation.location_instructions,
    });
  };

  // Final Order Submission
  const handleConfirmBooking = async (formData: BookingFormData) => {
    setIsSubmitting(true);
    setLocationError('');

    try {
      const bookingItem: BookingItem = {
        serviceId: activeService.id,
        serviceTitle: currentServiceTitle,
        servicePrice: unitRate,
        quantity,
        imageUrl: activeService.imageUrl,
        selectedAddOns: (activeService.addOns || [])
          .filter((a) => selectedAddOnIds.includes(a.id))
          .map((a) => ({ id: a.id, name: a.name, price: a.price })),
      };

      const newBooking = DataStore.createBooking({
        userId: currentUser?.id || `user-guest-${Date.now()}`,
        customerName: formData.fullName,
        customerEmail: formData.email || '',
        customerPhone: formData.phone,
        items: [bookingItem],
        subtotal,
        discountAmount,
        platformFee,
        taxAmount,
        totalAmount: grandTotal,
        couponCode: appliedCoupon?.code,
        // Legacy and structured address fields
        address: {
          houseNumber: pickedLocation.apartment_or_house_number,
          street: pickedLocation.building_name,
          area: pickedLocation.locality,
          city: pickedLocation.city,
          pincode: pickedLocation.postal_code,
          landmark: pickedLocation.landmark,
          addressType: formData.addressType || 'home',
          notesForPro: pickedLocation.location_instructions,
          address_line: pickedLocation.address_line,
          apartment_or_house_number: pickedLocation.apartment_or_house_number,
          building_name: pickedLocation.building_name,
          floor_number: pickedLocation.floor_number,
          locality: pickedLocation.locality,
          district: pickedLocation.district,
          state: pickedLocation.state,
          postal_code: pickedLocation.postal_code,
          country: pickedLocation.country,
          latitude: pickedLocation.latitude,
          longitude: pickedLocation.longitude,
          google_place_id: pickedLocation.google_place_id,
          location_accuracy_meters: pickedLocation.location_accuracy_meters,
          location_confirmed: true,
          location_instructions: pickedLocation.location_instructions,
        },
        // Immutable top-level location snapshot
        address_line: pickedLocation.address_line,
        apartment_or_house_number: pickedLocation.apartment_or_house_number,
        building_name: pickedLocation.building_name,
        floor_number: pickedLocation.floor_number,
        landmark: pickedLocation.landmark,
        locality: pickedLocation.locality,
        city: pickedLocation.city,
        district: pickedLocation.district,
        state: pickedLocation.state,
        postal_code: pickedLocation.postal_code,
        country: pickedLocation.country,
        latitude: pickedLocation.latitude,
        longitude: pickedLocation.longitude,
        google_place_id: pickedLocation.google_place_id,
        location_accuracy_meters: pickedLocation.location_accuracy_meters,
        location_confirmed: true,
        location_instructions: pickedLocation.location_instructions,
        scheduledDate: selectedDate,
        scheduledTimeSlot: selectedSlot,
        status: 'pending',
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
        paymentMethod,
        notes: pickedLocation.location_instructions || 'Customer requested service in Junagadh.',
      });

      // Persist to backend FastAPI database with atomic concurrency verification
      const backendRes = await api.createBooking({
        customer_name: formData.fullName,
        customer_phone: formData.phone,
        customer_email: formData.email || undefined,
        service_id: activeService.id,
        city: pickedLocation.city || 'Junagadh',
        locality: pickedLocation.locality || 'Zanzarda Road',
        address: pickedLocation.address_line || `${pickedLocation.apartment_or_house_number || ''} ${pickedLocation.building_name || ''}`.trim() || 'Junagadh, Gujarat',
        pincode: pickedLocation.postal_code || '362002',
        scheduled_date: selectedDate,
        scheduled_time: selectedSlot,
        notes: pickedLocation.location_instructions || undefined,
      });

      // Synchronize booking code
      if (backendRes?.booking_code) {
        newBooking.bookingCode = backendRes.booking_code;
      }

      setIsSubmitting(false);
      navigate(`/booking-success/${backendRes?.booking_code || newBooking.id}`);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Failed to finalize booking.';
      if (
        msg.toLowerCase().includes('slot') ||
        msg.toLowerCase().includes('booked') ||
        msg.toLowerCase().includes('passed') ||
        msg.toLowerCase().includes('time')
      ) {
        setSlotError(msg);
        setCurrentStep(2); // Take user back to slot picker immediately
        fetchAvailability(selectedDate);
      } else {
        setLocationError(msg);
        setCurrentStep(3);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 pb-28 lg:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Wizard Header / Breadcrumb */}
        <div className="mb-8">
          <Link to="/services" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 mb-2 font-medium">
            <ArrowLeft size={14} />
            <span>Back to services catalog</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Schedule Home Service
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Book verified technicians in {selectedCity} with 100% money-back guarantee.
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-8">
          {[
            { num: 1, title: 'Package' },
            { num: 2, title: 'Date & Slot' },
            { num: 3, title: 'Address' },
            { num: 4, title: 'Review & Pay' },
          ].map((step) => {
            const isPassed = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <div
                key={step.num}
                onClick={() => {
                  if (isPassed) setCurrentStep(step.num);
                }}
                className={`p-3 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                  isCurrent
                    ? 'border-slate-900 bg-white shadow-xs ring-1 ring-slate-900'
                    : isPassed
                    ? 'border-slate-300 bg-slate-50 cursor-pointer text-slate-800'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold mb-1 ${
                    isCurrent
                      ? 'bg-slate-900 text-white'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isPassed ? <Check size={11} strokeWidth={3} /> : step.num}
                </div>
                <span className="text-[11px] sm:text-xs font-semibold">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit(handleConfirmBooking)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* MAIN INTERACTIVE STEP CONTENT (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* STEP 1: SERVICE & ADD-ONS */}
              {currentStep === 1 && (
                <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">1. Confirm Service Package</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Customize service units and add-ons.</p>
                  </div>

                  {/* Sofa Seater Variant Selector (2 to 10 Seater, ₹149/seater) */}
                  {isSofaService && (
                    <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">Select Sofa Variant (2 to 10 Seater)</h3>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ₹{SOFA_RATE_PER_SEAT} / Seater Fixed Rate
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Flat transparent rate of ₹149 per seat. Choose your exact sofa seating setup below.
                          </p>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                          Selected: <strong className="text-slate-900">{sofaSeats} Seater</strong> ({BRAND_CONFIG.currency.symbol}{unitRate})
                        </div>
                      </div>

                      {/* Seater Variant Grid (2 to 10 seaters + 1 seater) */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {SOFA_SEATER_VARIANTS.map((variant) => {
                          const isSelected = sofaSeats === variant.seats;
                          const variantTotal = variant.seats * SOFA_RATE_PER_SEAT;
                          return (
                            <button
                              key={variant.seats}
                              type="button"
                              onClick={() => setSofaSeats(variant.seats)}
                              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                                isSelected
                                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                    {variant.label}
                                  </span>
                                  {variant.popular && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      Popular
                                    </span>
                                  )}
                                </div>
                                <p className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                  {variant.tag}
                                </p>
                              </div>
                              <div className="mt-2.5 pt-2 border-t border-slate-100/20 flex items-baseline justify-between">
                                <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                  {BRAND_CONFIG.currency.symbol}{variantTotal}
                                </span>
                                <span className={`text-[9px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                  ₹{SOFA_RATE_PER_SEAT}/seat
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Main Selected Service Card */}
                  <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={activeService.imageUrl}
                        alt={currentServiceTitle}
                        className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200"
                      />
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900">{currentServiceTitle}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{currentDuration} mins per unit</p>
                        <div className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-2">
                          <span>{BRAND_CONFIG.currency.symbol}{unitRate}</span>
                          {isSofaService && (
                            <span className="text-[11px] font-normal text-slate-500">
                              ({sofaSeats} seats × ₹{SOFA_RATE_PER_SEAT})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-40"
                        disabled={quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm text-slate-900 w-4 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Optional Add-Ons */}
                  {activeService.addOns && activeService.addOns.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Select Enhancements (Optional)
                      </h4>
                      <div className="space-y-2.5">
                        {activeService.addOns.map((addon) => {
                          const isSelected = selectedAddOnIds.includes(addon.id);
                          return (
                            <div
                              key={addon.id}
                              onClick={() => {
                                setSelectedAddOnIds((prev) =>
                                  prev.includes(addon.id)
                                    ? prev.filter((id) => id !== addon.id)
                                    : [...prev, addon.id]
                                );
                              }}
                              className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-slate-900 bg-slate-50'
                                  : 'border-slate-200 hover:bg-slate-50/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded flex items-center justify-center text-xs ${
                                    isSelected ? 'bg-slate-900 text-white' : 'border border-slate-300'
                                  }`}
                                >
                                  {isSelected && <Check size={11} strokeWidth={3} />}
                                </div>
                                <span className="text-xs font-medium text-slate-800">{addon.name}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-900">
                                +{BRAND_CONFIG.currency.symbol}{addon.price}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2.5 rounded-lg bg-[#176B52] hover:bg-[#135742] text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-xs"
                    >
                      <span>Proceed to Date & Slot</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DATE & TIME SLOT PICKER (Smart IST Past Slot & Real-Time Blocking) */}
              {currentStep === 2 && (
                <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">2. Choose Service Date & Slot</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Technicians in Junagadh are available 7 days a week.</p>
                    </div>

                    {/* Live IST Sync Indicator */}
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>Live Availability (Asia/Kolkata)</span>
                      {serverTimeIST && (
                        <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2">
                          {serverTimeIST.split(' ')[1]} {serverTimeIST.split(' ')[2]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Slot Error Banner */}
                  {slotError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-semibold animate-fadeIn">
                      <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span>{slotError}</span>
                        <div className="text-[11px] font-normal text-rose-600 mt-0.5">
                          Availability has been refreshed with live appointments. Please choose another open time window.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visual Status Legend */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600 pb-1 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Legend:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-600 bg-emerald-100"></span>
                      <span className="font-semibold text-slate-800">Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span>Booked (Full)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                      <span>Unavailable (Passed)</span>
                    </div>
                  </div>

                  {/* 7 Days Selector */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">Select Date</label>
                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                      {availableDates.map((item) => {
                        const isSelected = selectedDate === item.formattedDate;
                        return (
                          <button
                            type="button"
                            key={item.formattedDate}
                            onClick={() => {
                              setSelectedDate(item.formattedDate);
                              setSlotError('');
                              fetchAvailability(item.formattedDate);
                            }}
                            className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'border-[#176B52] bg-[#176B52] text-white font-semibold shadow-xs ring-2 ring-[#176B52]/20'
                                : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-[10px] uppercase tracking-wider font-medium opacity-80">
                              {item.dayName}
                            </span>
                            <span className="text-xs font-bold mt-0.5">{item.displayDate}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2-Hour Time Slots with Real-Time Blocking */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Select Preferred 2-Hour Window
                      </label>
                      <button
                        type="button"
                        onClick={() => fetchAvailability(selectedDate)}
                        className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1"
                        title="Refresh live slot availability"
                      >
                        <RefreshCw size={11} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Loading skeleton overlay — shown during background polling refresh */}
                      {isLoadingSlots && slotList.length === 0 && (
                        Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={`skel-${i}`}
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-100 animate-pulse flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-4 h-4 rounded-full bg-slate-200" />
                              <div className="space-y-1.5">
                                <div className="h-2.5 w-32 rounded bg-slate-200" />
                                <div className="h-2 w-20 rounded bg-slate-200" />
                              </div>
                            </div>
                            <div className="h-5 w-14 rounded-full bg-slate-200" />
                          </div>
                        ))
                      )}
                      {/* Subtle refresh shimmer on top of existing slots */}
                      {isLoadingSlots && slotList.length > 0 && (
                        <div className="absolute inset-0 rounded-xl bg-white/40 backdrop-blur-[1px] pointer-events-none z-10 flex items-center justify-center">
                          <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
                            <RefreshCw size={11} className="animate-spin text-emerald-600" />
                            <span className="text-[10px] text-slate-500 font-medium">Updating…</span>
                          </div>
                        </div>
                      )}
                      {slotList.map((slotItem) => {
                        const isSelected = selectedSlot === slotItem.slot;
                        const isPast = slotItem.status === 'past';
                        const isBooked = slotItem.status === 'booked';
                        const isAvailable = slotItem.is_available;

                        // 1. PAST SLOT (Disabled, grayed out with Unavailable label)
                        if (isPast) {
                          return (
                            <div
                              key={slotItem.id}
                              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-100/60 text-slate-400 cursor-not-allowed flex items-center justify-between select-none opacity-60"
                              title={slotItem.reason || 'This time slot has already passed'}
                            >
                              <div className="flex items-center gap-2.5">
                                <Clock size={15} className="text-slate-300" />
                                <div>
                                  <div className="text-xs font-medium line-through text-slate-400">{slotItem.slot}</div>
                                  <div className="text-[10px] text-slate-400">Time Passed</div>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-500">
                                Unavailable
                              </span>
                            </div>
                          );
                        }

                        // 2. BOOKED SLOT (Disabled, red label with lock icon)
                        if (isBooked) {
                          return (
                            <div
                              key={slotItem.id}
                              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed flex items-center justify-between select-none opacity-80"
                              title="This slot has already been booked by another customer"
                            >
                              <div className="flex items-center gap-2.5">
                                <Clock size={15} className="text-slate-300" />
                                <div>
                                  <div className="text-xs font-medium text-slate-500">{slotItem.slot}</div>
                                  <div className="text-[10px] text-slate-400">{slotItem.timeOfDay} Arrival</div>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                                <Lock size={10} />
                                <span>Booked</span>
                              </span>
                            </div>
                          );
                        }

                        // 3. AVAILABLE SLOT (Selectable, green highlights)
                        return (
                          <button
                            type="button"
                            key={slotItem.id}
                            onClick={() => {
                              setSelectedSlot(slotItem.slot);
                              setSlotError('');
                            }}
                            className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-2 border-[#176B52] bg-emerald-50/80 text-[#176B52] font-semibold ring-2 ring-[#176B52]/20 shadow-xs'
                                : 'border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Clock size={15} className={isSelected ? 'text-[#176B52]' : 'text-slate-400'} />
                              <div>
                                <div className="text-xs font-semibold">{slotItem.slot}</div>
                                <div className="text-[10px] text-slate-400">{slotItem.timeOfDay} Arrival</div>
                              </div>
                            </div>

                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-[#176B52] text-white flex items-center justify-center shadow-xs">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Available
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedSlot) {
                          setSlotError('Please choose an available appointment time window.');
                          return;
                        }
                        const currentObj = slotList.find((s) => s.slot === selectedSlot);
                        if (!currentObj || !currentObj.is_available) {
                          setSlotError('The selected slot is unavailable or has already been booked. Please pick an open time.');
                          return;
                        }
                        setSlotError('');
                        setCurrentStep(3);
                      }}
                      className="px-6 py-2.5 rounded-lg bg-[#176B52] hover:bg-[#135742] text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Proceed to Address</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ADDRESS & CONTACT DETAILS */}
              {currentStep === 3 && (
                <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">3. Service Address & Contact Details</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Enter your doorstep service address in Gujarat for verified technician arrival.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleWhatsAppDirectBooking}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
                      title={`Book directly on WhatsApp: ${WHATSAPP_DISPLAY}`}
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.301-.15-1.783-.879-2.06-.979-.277-.1-.479-.15-.68.15-.202.301-.78 1.002-.956 1.203-.176.201-.353.226-.653.075s-1.27-.468-2.42-1.493c-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.151-.176.201-.301.302-.502.1-.201.05-.376-.025-.526-.075-.15-.68-1.639-.93-2.242-.244-.588-.493-.508-.68-.518-.176-.008-.377-.01-.578-.01-.201 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511s1.08 2.912 1.231 3.113c.151.201 2.126 3.245 5.15 4.552.72.311 1.282.497 1.72.636.724.23 1.383.198 1.904.12.58-.087 1.783-.728 2.034-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351z"/>
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.981-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.642 0-3.167-.487-4.453-1.326l-.32-.208-2.955.836.84-2.882-.218-.337A8.17 8.17 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2z"/>
                      </svg>
                      <span>Book on WhatsApp</span>
                    </button>
                  </div>

                  {locationError && (
                    <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-fadeIn">
                      <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                      <div>
                        <span className="font-semibold block">Location Verification Required</span>
                        <span>{locationError}</span>
                      </div>
                    </div>
                  )}

                  {/* Customer Contact Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-lg bg-slate-50/70 border border-slate-200">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Full Name *</label>
                      <input
                        {...register('fullName')}
                        type="text"
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-900"
                        placeholder="e.g. Aditya Verma"
                      />
                      {errors.fullName && (
                        <p className="text-[10px] text-rose-500 mt-0.5">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Mobile Number *</label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-900"
                        placeholder="e.g. 9820154321"
                      />
                      {errors.phone && (
                        <p className="text-[10px] text-rose-500 mt-0.5">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Email Address *</label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-900"
                        placeholder="e.g. name@example.com"
                      />
                      {errors.email && (
                        <p className="text-[10px] text-rose-500 mt-0.5">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Interactive Google Maps Location Picker with Gujarat Coverage Validation */}
                  <LocationPicker
                    serviceIdOrCategory={activeService.categoryId || activeService.id}
                    initialValue={pickedLocation}
                    onLocationChange={(val, serviceable) => {
                      setPickedLocation(val);
                      setIsLocationServiceable(serviceable);
                      if (val.location_confirmed) {
                        setLocationError('');
                      }
                    }}
                  />

                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedFromAddress}
                      className="px-6 py-2.5 rounded-lg bg-[#176B52] hover:bg-[#135742] text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-xs"
                    >
                      <span>Proceed to Payment Review</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & PAYMENT METHOD */}
              {currentStep === 4 && (
                <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">4. Review & Payment Method</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Inspect your schedule and doorstep location snapshot before confirming.</p>
                  </div>

                  {/* Schedule Recap Card */}
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 text-white">
                        <CalendarIcon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                        <div className="text-[11px] text-slate-600">{selectedSlot}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  {/* Doorstep Address Recap Card */}
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 text-white shrink-0 mt-0.5">
                        <MapPin size={16} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            Service Delivery Address
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            Gujarat ✓
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium">
                          {pickedLocation.address_line}
                        </p>
                        {pickedLocation.landmark && (
                          <div className="text-[11px] text-slate-500">
                            Landmark: <strong className="text-slate-700">{pickedLocation.landmark}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs text-blue-600 font-semibold hover:underline shrink-0 self-end sm:self-center"
                    >
                      Edit Address
                    </button>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-700 block">Payment Options</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      
                      {/* Option 1: Cash After Service (Default & Recommended) */}
                      <div
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                          paymentMethod === 'cash'
                            ? 'border-slate-900 bg-slate-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-900">Cash Post-Service</span>
                          {paymentMethod === 'cash' && <Check size={14} className="text-slate-900" />}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Pay directly to technician via Cash/UPI after service completion.
                        </p>
                      </div>

                      {/* Option 2: Instant UPI */}
                      <div
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                          paymentMethod === 'upi'
                            ? 'border-slate-900 bg-slate-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-900">Online UPI</span>
                          {paymentMethod === 'upi' && <Check size={14} className="text-slate-900" />}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          GPay, PhonePe, Paytm, or BHIM secure simulator.
                        </p>
                      </div>

                      {/* Option 3: Credit/Debit Card */}
                      <div
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                          paymentMethod === 'card'
                            ? 'border-slate-900 bg-slate-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-900">Credit / Debit Card</span>
                          {paymentMethod === 'card' && <Check size={14} className="text-slate-900" />}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Visa, Mastercard, RuPay with zero surcharge.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Final Submit Buttons */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 w-full sm:w-auto"
                    >
                      Back
                    </button>
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleWhatsAppDirectBooking}
                        className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                        title={`Send booking directly to WhatsApp: ${WHATSAPP_DISPLAY}`}
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.301-.15-1.783-.879-2.06-.979-.277-.1-.479-.15-.68.15-.202.301-.78 1.002-.956 1.203-.176.201-.353.226-.653.075s-1.27-.468-2.42-1.493c-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.151-.176.201-.301.302-.502.1-.201.05-.376-.025-.526-.075-.15-.68-1.639-.93-2.242-.244-.588-.493-.508-.68-.518-.176-.008-.377-.01-.578-.01-.201 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511s1.08 2.912 1.231 3.113c.151.201 2.126 3.245 5.15 4.552.72.311 1.282.497 1.72.636.724.23 1.383.198 1.904.12.58-.087 1.783-.728 2.034-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351z"/>
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.981-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.642 0-3.167-.487-4.453-1.326l-.32-.208-2.955.836.84-2.882-.218-.337A8.17 8.17 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2z"/>
                        </svg>
                        <span>Book on WhatsApp</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-7 py-3 rounded-lg bg-[#176B52] hover:bg-[#135742] text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting ? (
                          <span>Confirming Booking...</span>
                        ) : (
                          <>
                            <span>Confirm & Schedule ({BRAND_CONFIG.currency.symbol}{grandTotal})</span>
                            <CheckCircle2 size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* SIDEBAR SUMMARY & COUPON PROMO (4 COLS) */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
              
              {/* Order Breakdown Box */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
                <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
                  Booking Summary
                </h3>

                {/* Service Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-start text-slate-800">
                    <div>
                      <div className="font-bold">{currentServiceTitle}</div>
                      <div className="text-[11px] text-slate-400">Qty: {quantity} unit(s)</div>
                      {isSofaService && (
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          {sofaSeats} Seater ({BRAND_CONFIG.currency.symbol}{SOFA_RATE_PER_SEAT}/seat)
                        </div>
                      )}
                    </div>
                    <span className="font-bold">{BRAND_CONFIG.currency.symbol}{baseServicePrice}</span>
                  </div>

                  {selectedAddOnIds.map((id) => {
                    const addon = activeService.addOns?.find((a) => a.id === id);
                    if (!addon) return null;
                    return (
                      <div key={id} className="flex justify-between text-slate-500 text-[11px]">
                        <span>+ {addon.name}</span>
                        <span>{BRAND_CONFIG.currency.symbol}{addon.price}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code Input */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon (e.g. FIRST50)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-3 py-2 rounded-xl bg-slate-100 text-rose-600 text-xs font-bold hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-3.5 py-2 rounded-xl bg-[#176B52] text-white text-xs font-bold hover:bg-[#135742] shadow-xs"
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {couponError && (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-600 mt-2">
                      <AlertCircle size={13} />
                      <span>{couponError}</span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold mt-2">
                      <CheckCircle2 size={13} />
                      <span>Coupon {appliedCoupon.code} applied! (-{BRAND_CONFIG.currency.symbol}{appliedCoupon.discount})</span>
                    </div>
                  )}
                </div>

                {/* Financial Totals Breakdown */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{BRAND_CONFIG.currency.symbol}{subtotal}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount Voucher</span>
                      <span>-{BRAND_CONFIG.currency.symbol}{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <div className="flex items-center gap-1">
                      <span>Platform Safety Fee</span>
                    </div>
                    <span>
                      {platformFee === 0 ? (
                        <span className="text-emerald-600 font-semibold">FREE</span>
                      ) : (
                        `${BRAND_CONFIG.currency.symbol}${platformFee}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Applicable GST (18%)</span>
                    <span>{BRAND_CONFIG.currency.symbol}{taxAmount}</span>
                  </div>

                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span className="text-lg text-emerald-700">
                      {BRAND_CONFIG.currency.symbol}{grandTotal}
                    </span>
                  </div>
                </div>

                {/* Safety Guarantee Footnote */}
                <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>HomeEase Standard of Safety</span>
                  </div>
                  <div>Includes 30-day rework guarantee & ₹10,000 damage coverage.</div>
                </div>

                {/* Direct WhatsApp Assistance Card */}
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-center space-y-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5">
                    <span>Quick Booking via WhatsApp</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Prefer talking directly? Chat with our manager on WhatsApp at <strong>{WHATSAPP_DISPLAY}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={handleWhatsAppDirectBooking}
                    className="w-full py-2.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.301-.15-1.783-.879-2.06-.979-.277-.1-.479-.15-.68.15-.202.301-.78 1.002-.956 1.203-.176.201-.353.226-.653.075s-1.27-.468-2.42-1.493c-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.151-.176.201-.301.302-.502.1-.201.05-.376-.025-.526-.075-.15-.68-1.639-.93-2.242-.244-.588-.493-.508-.68-.518-.176-.008-.377-.01-.578-.01-.201 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511s1.08 2.912 1.231 3.113c.151.201 2.126 3.245 5.15 4.552.72.311 1.282.497 1.72.636.724.23 1.383.198 1.904.12.58-.087 1.783-.728 2.034-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351z"/>
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.981-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.642 0-3.167-.487-4.453-1.326l-.32-.208-2.955.836.84-2.882-.218-.337A8.17 8.17 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2z"/>
                    </svg>
                    <span>Instant Booking via WhatsApp</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Mobile Sticky Checkout Bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E6E8EC] p-3 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Total Payable</div>
              <div className="text-base font-extrabold text-[#176B52] leading-tight">
                {BRAND_CONFIG.currency.symbol}{grandTotal}
              </div>
            </div>
            <div>
              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#176B52] hover:bg-[#135742] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <span>Select Slot</span>
                  <ArrowRight size={14} />
                </button>
              )}
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(3);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#176B52] hover:bg-[#135742] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <span>Add Address</span>
                  <ArrowRight size={14} />
                </button>
              )}
              {currentStep === 3 && (
                <button
                  type="button"
                  onClick={handleProceedFromAddress}
                  className="px-5 py-2.5 rounded-xl bg-[#176B52] hover:bg-[#135742] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <span>Review & Pay</span>
                  <ArrowRight size={14} />
                </button>
              )}
              {currentStep === 4 && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#176B52] hover:bg-[#135742] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Confirming...' : 'Book Now'}</span>
                  <CheckCircle2 size={14} />
                </button>
              )}
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
