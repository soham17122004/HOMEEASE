import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  UserCheck,
  Phone,
  ArrowRight,
  Printer,
  Sparkles,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useStoreData } from '../lib/store';
import { openWhatsApp, WHATSAPP_DISPLAY } from '../lib/whatsapp';

export const BookingSuccessPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { bookings } = useStoreData();

  const booking = bookings.find((b) => b.id === bookingId || b.bookingCode === bookingId);

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Booking Confirmation</h2>
          <p className="text-xs text-slate-500 mt-2">
            Loading your booking details...
          </p>
          <Link
            to="/bookings"
            className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            Go to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Success Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 text-center relative overflow-hidden">
          
          {/* Top Decorative Sparkle Ring */}
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-6 shadow-inner ring-8 ring-emerald-50 animate-bounce">
            <CheckCircle2 size={42} strokeWidth={2.5} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <Sparkles size={12} />
            <span>Booking Confirmed</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Thank you! Your service is booked.
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Booking reference code: <strong className="text-slate-900 font-mono tracking-wider text-sm bg-slate-100 px-2 py-0.5 rounded">{booking.bookingCode}</strong>.
            A confirmation SMS & email have been dispatched to <strong>{booking.customerPhone}</strong>.
          </p>

          {/* Booking Summary Box */}
          <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 text-left space-y-5">
            
            {/* Date and Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Scheduled Date</div>
                  <div className="text-xs font-bold text-slate-900">
                    {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Arrival Window</div>
                  <div className="text-xs font-bold text-slate-900">{booking.scheduledTimeSlot}</div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 pb-4 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin size={18} />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">Service Location</div>
                <div className="text-slate-600 mt-0.5">
                  {booking.address.houseNumber}, {booking.address.street}, {booking.address.area},{' '}
                  {booking.address.city} - {booking.address.pincode}
                </div>
                {booking.address.landmark && (
                  <div className="text-[11px] text-slate-400 mt-0.5">Landmark: {booking.address.landmark}</div>
                )}
              </div>
            </div>

            {/* Assigned Professional */}
            {booking.assignedProfessional && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                    {booking.assignedProfessional.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{booking.assignedProfessional.name}</span>
                      <ShieldCheck size={14} className="text-emerald-600" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ★ {booking.assignedProfessional.rating} • {booking.assignedProfessional.completedJobs} jobs done
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${booking.assignedProfessional.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1.5"
                >
                  <Phone size={13} />
                  <span>Call Pro</span>
                </a>
              </div>
            )}

            {/* Financial Summary */}
            <div className="pt-1 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Payment Status: </span>
                <span className="font-bold text-slate-900 uppercase tracking-wide">
                  {booking.paymentStatus === 'paid' ? 'Paid Online' : 'Pay After Service (Cash/UPI)'}
                </span>
              </div>
              <div className="text-sm font-extrabold text-emerald-700">
                Total: {BRAND_CONFIG.currency.symbol}{booking.totalAmount}
              </div>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openWhatsApp({
                customMessage: `Hello HomeEase! 👋 I have booked a service. Booking Ref: ${booking.bookingCode}. Scheduled: ${new Date(booking.scheduledDate).toLocaleDateString()} (${booking.scheduledTimeSlot}). Address: ${booking.address.houseNumber}, ${booking.address.street}, ${booking.address.city}. Please confirm dispatch!`,
              })}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-md shadow-[#25D366]/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.301-.15-1.783-.879-2.06-.979-.277-.1-.479-.15-.68.15-.202.301-.78 1.002-.956 1.203-.176.201-.353.226-.653.075s-1.27-.468-2.42-1.493c-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.151-.176.201-.301.302-.502.1-.201.05-.376-.025-.526-.075-.15-.68-1.639-.93-2.242-.244-.588-.493-.508-.68-.518-.176-.008-.377-.01-.578-.01-.201 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511s1.08 2.912 1.231 3.113c.151.201 2.126 3.245 5.15 4.552.72.311 1.282.497 1.72.636.724.23 1.383.198 1.904.12.58-.087 1.783-.728 2.034-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.981-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.642 0-3.167-.487-4.453-1.326l-.32-.208-2.955.836.84-2.882-.218-.337A8.17 8.17 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2z"/>
              </svg>
              <span>Get WhatsApp Updates ({WHATSAPP_DISPLAY})</span>
            </button>

            <Link
              to="/bookings"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <span>View My Bookings</span>
              <ArrowRight size={14} />
            </Link>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Printer size={14} />
              <span>Print Invoice</span>
            </button>

            <Link
              to="/services"
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              Book Another Service
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
