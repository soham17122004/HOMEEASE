import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Receipt,
  Printer,
  XCircle,
  Clock3,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useStoreData, DataStore } from '../lib/store';
import { BookingStatus } from '../types';

export const BookingDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { bookings } = useStoreData();

  const booking = bookings.find((b) => b.id === bookingId || b.bookingCode === bookingId);

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Booking Details Not Found</h2>
          <Link
            to="/bookings"
            className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  // Visual status step index
  const getStatusStep = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'confirmed':
        return 2;
      case 'in_progress':
        return 3;
      case 'completed':
        return 4;
      case 'cancelled':
        return 0;
      default:
        return 1;
    }
  };

  const currentStepNum = getStatusStep(booking.status);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Navigation Breadcrumb */}
        <Link
          to="/bookings"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 mb-6 font-semibold"
        >
          <ArrowLeft size={14} />
          <span>Back to All Bookings</span>
        </Link>

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
                  {booking.bookingCode}
                </span>
                <span className="text-xs text-slate-400">• Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                {booking.items[0]?.serviceTitle || 'Home Service Package'}
              </h1>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Invoice</div>
              <div className="text-2xl font-extrabold text-slate-900">
                {BRAND_CONFIG.currency.symbol}{booking.totalAmount}
              </div>
              <div className="text-xs text-emerald-600 font-semibold capitalize">
                {booking.paymentStatus === 'paid' ? 'Paid Online' : 'Pay After Work (Cash/UPI)'}
              </div>
            </div>
          </div>

          {/* Interactive Progress Timeline */}
          {booking.status !== 'cancelled' ? (
            <div className="pt-8">
              <div className="grid grid-cols-4 gap-2 relative">
                {/* Connecting track */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                <div
                  className="absolute top-4 left-6 h-0.5 bg-emerald-600 transition-all duration-500 -z-0"
                  style={{ width: `${Math.min(100, Math.max(0, ((currentStepNum - 1) / 3) * 100))}%` }}
                />

                {[
                  { step: 1, title: 'Order Placed', desc: 'Received in system' },
                  { step: 2, title: 'Pro Assigned', desc: 'Specialist allocated' },
                  { step: 3, title: 'In Progress', desc: 'Work underway' },
                  { step: 4, title: 'Completed', desc: 'Job finished' },
                ].map((item) => {
                  const isDone = currentStepNum >= item.step;
                  const isCurrent = currentStepNum === item.step;

                  return (
                    <div key={item.step} className="flex flex-col items-center text-center relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : item.step}
                      </div>
                      <div className={`text-xs font-bold mt-2 ${isCurrent ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 hidden sm:block">{item.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="pt-6">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                <XCircle size={18} className="shrink-0 text-rose-600" />
                <div>
                  <strong>Booking Cancelled:</strong> This service appointment was cancelled upon request. No cancellation charges apply.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Two-Column Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Card 1: Schedule & Location */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Calendar size={16} className="text-emerald-600" />
              <span>Schedule & Address</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Clock3 size={15} className="text-slate-400 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">
                    {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </div>
                  <div className="text-slate-500">{booking.scheduledTimeSlot}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
                <MapPin size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Confirmed Gujarat Doorstep Snapshot</span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Verified ✓
                    </span>
                  </div>
                  <div className="text-slate-700 text-xs">
                    {booking.address_line || `${booking.address.houseNumber}, ${booking.address.street}, ${booking.address.area}, ${booking.address.city}, Gujarat ${booking.address.pincode}`}
                  </div>
                  {booking.address.landmark && (
                    <div className="text-[11px] text-slate-500">
                      Landmark: <strong>{booking.address.landmark}</strong>
                    </div>
                  )}
                  {booking.latitude && booking.longitude && (
                    <div className="flex items-center gap-3 pt-1 text-[11px]">
                      <span className="text-slate-500">
                        GPS: <strong className="text-slate-700">{booking.latitude.toFixed(5)}° N, {booking.longitude.toFixed(5)}° E</strong>
                      </span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${booking.latitude},${booking.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-800 font-bold underline"
                      >
                        Directions in Google Maps ↗
                      </a>
                    </div>
                  )}
                  {(booking.location_instructions || booking.address.notesForPro) && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-lg text-slate-600 text-[11px]">
                      <strong>Gate / Building Note:</strong> {booking.location_instructions || booking.address.notesForPro}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Assigned Professional & Safety */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Assigned Technician</span>
            </h3>

            {booking.assignedProfessional ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                      {booking.assignedProfessional.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {booking.assignedProfessional.name}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        ★ {booking.assignedProfessional.rating} Rating • {booking.assignedProfessional.completedJobs} verified jobs
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${booking.assignedProfessional.phone}`}
                    className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-colors"
                    title="Call technician"
                  >
                    <Phone size={16} />
                  </a>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800">Verified Identity Standards:</div>
                  <div>✓ Government Aadhaar background verified</div>
                  <div>✓ Temperature & hygiene kit compliance checked</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-4">
                Technician details will be assigned 2 hours prior to your slot.
              </div>
            )}
          </div>

        </div>

        {/* Invoice Itemized Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Receipt size={16} className="text-emerald-600" />
              <span>Tax Invoice Summary</span>
            </h3>
            <button
              onClick={() => window.print()}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <Printer size={13} />
              <span>Print Invoice</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {booking.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50">
                <div>
                  <div className="font-bold text-slate-900">{item.serviceTitle}</div>
                  <div className="text-slate-400 text-[11px]">Quantity: {item.quantity}</div>
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <div className="text-slate-500 text-[11px] mt-1 space-y-0.5">
                      {item.selectedAddOns.map((ad, i) => (
                        <div key={i}>+ {ad.name} ({BRAND_CONFIG.currency.symbol}{ad.price})</div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="font-bold text-slate-900">
                  {BRAND_CONFIG.currency.symbol}{item.servicePrice * item.quantity}
                </span>
              </div>
            ))}

            <div className="pt-2 space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{BRAND_CONFIG.currency.symbol}{booking.subtotal}</span>
              </div>

              {booking.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({booking.couponCode})</span>
                  <span>-{BRAND_CONFIG.currency.symbol}{booking.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Safety & Platform Fee</span>
                <span>{booking.platformFee === 0 ? 'FREE' : `${BRAND_CONFIG.currency.symbol}${booking.platformFee}`}</span>
              </div>

              <div className="flex justify-between">
                <span>Goods & Services Tax (GST 18%)</span>
                <span>{BRAND_CONFIG.currency.symbol}{booking.taxAmount}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                <span>Grand Total Paid / Payable</span>
                <span className="text-emerald-700">
                  {BRAND_CONFIG.currency.symbol}{booking.totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
