import React, { useState, useEffect, useRef } from 'react';
import { X, User, Phone, CheckCircle2, AlertCircle, ArrowRight, LogOut, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { DataStore, useStoreData } from '../../lib/store';
import { UserProfile } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, bookings } = useStoreData();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // When modal opens, focus input
  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsSwitching(false);
      if (!currentUser) {
        setTimeout(() => nameInputRef.current?.focus(), 150);
      }
    }
  }, [isOpen, currentUser]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Clean phone input (digits only, max 10)
  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    if (error) setError('');
  };

  const handleNameChange = (val: string) => {
    setFullName(val);
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Indian mobile numbers must start with 6, 7, 8, or 9.');
      return;
    }

    // Create or retrieve user profile
    const newUser: UserProfile = {
      id: `usr-${cleanPhone}`,
      fullName: trimmedName,
      phone: `+91 ${cleanPhone}`,
      email: `${cleanPhone}@customer.homeease.in`,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    DataStore.setCurrentUser(newUser);
    toast.success(`Welcome, ${trimmedName}! You are now logged in.`);
    setFullName('');
    setPhone('');
    setIsSwitching(false);
    onSuccess?.(newUser);
    onClose();
  };

  const handleLogout = () => {
    const prevName = currentUser?.fullName;
    DataStore.setCurrentUser(null);
    toast.info(prevName ? `Logged out from ${prevName}'s account.` : 'Logged out successfully.');
    setIsSwitching(false);
  };

  // User bookings count
  const userBookings = currentUser
    ? bookings.filter((b) => b.customerPhone?.replace(/\D/g, '').includes(currentUser.phone.replace(/\D/g, '')))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog (Bottom sheet on mobile, centered card on desktop) */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#176B52] border border-emerald-200 flex items-center justify-center font-bold">
              <User size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-none">
                {currentUser && !isSwitching ? 'Your Account' : 'Customer Login'}
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {currentUser && !isSwitching ? 'Active Session' : 'No password or OTP needed'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto">
          {currentUser && !isSwitching ? (
            /* Logged in state view */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#176B52] text-white flex items-center justify-center text-lg font-extrabold shadow-xs shrink-0">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-slate-900 text-base leading-tight truncate">
                    {currentUser.fullName}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Phone size={12} className="text-slate-400" />
                    <span>{currentUser.phone}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={10} />
                    <span>Verified Customer</span>
                  </div>
                </div>
              </div>

              {/* Quick stats / summary */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-base font-extrabold text-slate-900">{userBookings.length}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Your Bookings</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-base font-extrabold text-[#176B52]">₹250</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Referral Credit</div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <a
                  href="/bookings"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Track My Bookings</span>
                  <ArrowRight size={13} />
                </a>

                <button
                  type="button"
                  onClick={() => setIsSwitching(true)}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Switch Mobile Number
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2 px-4 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login form (Name + Mobile only, no OTP) */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center sm:text-left">
                <h4 className="font-extrabold text-base text-slate-900">
                  Enter Mobile & Name
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instant sign-in for auto-filling bookings & tracking past services. No OTP required!
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User size={15} className="absolute left-3 text-slate-400" />
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={fullName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#176B52] focus:ring-2 focus:ring-[#176B52]/20"
                    required
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  {/* Country Prefix */}
                  <div className="absolute left-3 flex items-center gap-1 pr-2 border-r border-slate-200 text-xs font-bold text-slate-700">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full pl-20 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#176B52] focus:ring-2 focus:ring-[#176B52]/20 tracking-wider"
                    required
                  />
                  {phone.length === 10 && /^[6-9]\d{9}$/.test(phone) && (
                    <CheckCircle2 size={16} className="absolute right-3 text-emerald-600" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Enter 10-digit Indian phone number</span>
                  <span className="font-mono">{phone.length}/10</span>
                </div>
              </div>

              {/* Feature perks badges */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-emerald-900 font-medium">
                  <Zap size={12} className="text-[#176B52] shrink-0" />
                  <span>Instant 1-click access — No SMS or OTP delay</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-emerald-900 font-medium">
                  <ShieldCheck size={12} className="text-[#176B52] shrink-0" />
                  <span>Securely auto-fills saved addresses & bookings</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!fullName.trim() || phone.length !== 10}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Continue / Log In</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Back to existing profile if switching */}
              {isSwitching && currentUser && (
                <button
                  type="button"
                  onClick={() => setIsSwitching(false)}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel and keep {currentUser.fullName}
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
