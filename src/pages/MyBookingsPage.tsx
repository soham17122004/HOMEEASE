import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  User,
  ShieldCheck,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useStoreData, DataStore } from '../lib/store';
import { BookingStatus } from '../types';
import { LoginModal } from '../components/common/LoginModal';

export const MyBookingsPage: React.FC = () => {
  const { bookings, currentUser } = useStoreData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [cancelModalBookingId, setCancelModalBookingId] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    DataStore.syncWithBackend();
  }, []);

  // Search logic: by booking reference code (e.g. JND-2026-XXXX) or mobile number or customer name
  const trimmed = searchQuery.trim().toLowerCase();

  const searchedBookings = bookings.filter((b) => {
    if (trimmed) {
      const codeMatch = b.bookingCode?.toLowerCase().includes(trimmed);
      const phoneMatch = b.customerPhone?.replace(/\D/g, '').includes(trimmed.replace(/\D/g, ''));
      const nameMatch = b.customerName?.toLowerCase().includes(trimmed);
      const idMatch = b.id.toLowerCase().includes(trimmed);
      return codeMatch || phoneMatch || nameMatch || idMatch;
    }
    // If user is logged in, prioritize showing their bookings!
    if (currentUser?.phone) {
      const userPhoneClean = currentUser.phone.replace(/\D/g, '');
      const bookingPhoneClean = b.customerPhone?.replace(/\D/g, '') || '';
      return bookingPhoneClean.includes(userPhoneClean) || b.userId === currentUser.id;
    }
    return true;
  });

  const displayBookings = searchedBookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return b.status === 'pending';
    if (activeTab === 'confirmed') return b.status === 'confirmed' || b.status === 'in_progress';
    if (activeTab === 'completed') return b.status === 'completed';
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-0.5 rounded-none text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1.5 uppercase">
            <span className="w-1.5 h-1.5 rounded-none bg-amber-600 animate-pulse" />
            Pending Confirmation
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2 py-0.5 rounded-none text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-300 flex items-center gap-1.5 uppercase">
            <span className="w-1.5 h-1.5 rounded-none bg-blue-600" />
            Confirmed
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-0.5 rounded-none text-[11px] font-bold bg-purple-50 text-purple-900 border border-purple-300 flex items-center gap-1.5 uppercase">
            <span className="w-1.5 h-1.5 rounded-none bg-purple-600 animate-ping" />
            Technician Dispatched
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-none text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1 uppercase">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 rounded-none text-[11px] font-bold bg-rose-50 text-rose-900 border border-rose-300 flex items-center gap-1 uppercase">
            <XCircle size={12} />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-none text-[11px] font-bold bg-slate-100 text-slate-700 uppercase">
            {status}
          </span>
        );
    }
  };

  const handleConfirmCancel = () => {
    if (cancelModalBookingId) {
      DataStore.cancelBooking(cancelModalBookingId);
      setCancelModalBookingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header - Crisp Urban Company Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Track Your Booking
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Look up scheduled appointments in Junagadh without requiring an account.
            </p>
          </div>
          <Link
            to="/services"
            className="self-start sm:self-auto px-4 py-2 rounded-none bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            + Book a Service
          </Link>
        </div>

        {/* Customer Account Status Banner */}
        {currentUser ? (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#176B52] text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0">
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900">{currentUser.fullName}</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Active Customer
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Mobile: {currentUser.phone}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="text-xs font-bold text-[#176B52] bg-white hover:bg-emerald-100/50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                Switch Account
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
                <User size={18} />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">Want all your bookings automatically tracked?</div>
                <div className="text-[11px] text-slate-500">Log in with your name & mobile number (no password or OTP required).</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Log In with Mobile
            </button>
          </div>
        )}

        {/* Search Bar for Lookup - Crisp Rectangular */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="text-xs font-bold text-slate-900 block mb-2 uppercase tracking-wider">
            Search by Booking ID or Mobile Number
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. JND-2026-1042 or 9820154321"
              className="w-full pl-10 pr-4 py-2.5 rounded-none bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
            Your booking reference code was provided on your booking confirmation page.
          </p>
        </div>

        {/* Filter Tabs - Crisp Rectangular */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'all', label: `All (${searchedBookings.length})` },
            { id: 'pending', label: `Pending (${searchedBookings.filter((b) => b.status === 'pending').length})` },
            { id: 'confirmed', label: `Confirmed (${searchedBookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress').length})` },
            { id: 'completed', label: `Completed (${searchedBookings.filter((b) => b.status === 'completed').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-none text-xs font-bold whitespace-nowrap transition-colors border ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'text-slate-700 bg-white border-slate-300 hover:border-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List - Crisp Rectangles */}
        {displayBookings.length > 0 ? (
          <div className="space-y-3">
            {displayBookings.map((b) => {
              const primaryItem = b.items[0];
              const isCancellable = b.status === 'pending' || b.status === 'confirmed';

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-none border border-slate-200 hover:border-slate-800 p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Service Image & Details */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    {primaryItem?.imageUrl ? (
                      <img
                        src={primaryItem.imageUrl}
                        alt={primaryItem.serviceTitle}
                        className="w-16 h-16 rounded-none object-cover shrink-0 bg-slate-100 border border-slate-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-none bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                        JND
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-none border border-slate-200">
                          {b.bookingCode || b.id}
                        </span>
                        {getStatusBadge(b.status)}
                      </div>

                      <h3 className="font-bold text-sm text-slate-900">
                        {primaryItem?.serviceTitle || 'Home Service'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Calendar size={13} className="text-[#176B52]" />
                          {new Date(b.scheduledDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-slate-400" />
                          {b.scheduledTimeSlot}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-[#176B52]" />
                          <span>{b.locality || b.address?.locality || 'Junagadh'}, Junagadh</span>
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 pt-0.5">
                        Customer: <strong className="text-slate-800">{b.customerName}</strong> ({b.customerPhone})
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex sm:flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-3">
                    <div className="text-left md:text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Price</div>
                      <div className="text-base font-extrabold text-slate-900">
                        {BRAND_CONFIG.currency.symbol}{b.totalAmount}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {b.paymentStatus === 'paid' ? 'Paid' : 'Pay After Work'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCancellable && (
                        <button
                          onClick={() => setCancelModalBookingId(b.id)}
                          className="px-3 py-1.5 rounded-none border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}

                      <Link
                        to={`/bookings/${b.id}`}
                        className="px-3.5 py-1.5 rounded-none bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-none border border-slate-200 p-10 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-none bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Calendar size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">No Bookings Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? `No records matching "${searchQuery}". Please check your booking code or mobile number.`
                : 'You have not scheduled any services recently.'}
            </p>
            <Link
              to="/services"
              className="mt-4 inline-block px-4 py-2 rounded-none bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              Browse Services
            </Link>
          </div>
        )}

      </div>

      {/* Cancel Confirmation Modal - Crisp Rectangular */}
      {cancelModalBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-none p-6 max-w-sm w-full border border-slate-300 text-center shadow-xl">
            <div className="w-10 h-10 rounded-none bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <AlertCircle size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Cancel Booking?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to cancel this appointment in Junagadh? You can rebook at any time.
            </p>

            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                onClick={() => setCancelModalBookingId(null)}
                className="px-3.5 py-2 rounded-none border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-none bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Customer Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};
