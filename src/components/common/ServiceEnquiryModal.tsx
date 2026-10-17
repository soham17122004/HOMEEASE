import React, { useState } from 'react';
import { X, Send, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { DataStore } from '../../lib/store';
import { getCategoryDisplayName } from '../../lib/serviceCoverage';
import { openWhatsApp, WHATSAPP_DISPLAY } from '../../lib/whatsapp';

interface ServiceEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceCategory: string;
  defaultCity?: string;
  defaultPincode?: string;
  defaultAddress?: string;
  coordinates?: { lat: number; lng: number };
}

export const ServiceEnquiryModal: React.FC<ServiceEnquiryModalProps> = ({
  isOpen,
  onClose,
  serviceCategory,
  defaultCity = '',
  defaultPincode = '',
  defaultAddress = '',
  coordinates,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(defaultAddress);
  const [city, setCity] = useState(defaultCity);
  const [pincode, setPincode] = useState(defaultPincode);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    DataStore.createServiceEnquiry({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim() || 'not-provided@example.com',
      serviceCategory,
      fullAddress: address || `${city} ${pincode}`,
      city: city || 'Gujarat',
      pincode: pincode.replace(/\D/g, '').slice(0, 6),
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
      notes: notes.trim(),
    });

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-none w-full max-w-lg shadow-xl border border-slate-300 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-slate-900 text-white flex items-center justify-center">
              <MapPin size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Request Service Coverage</h3>
              <p className="text-[11px] text-slate-500">
                {getCategoryDisplayName(serviceCategory)} expansion enquiry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-none hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-none bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Enquiry Received!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you for letting us know! Our Gujarat operations expansion team reviews neighborhood demand daily. We will prioritize PIN code <span className="font-bold">{pincode || city}</span> and notify you via WhatsApp / SMS once services launch in your locality.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-none text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-slate-50 p-3 rounded-none border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">
                Notice: This address is currently outside our immediate active zone.
              </p>
              <p className="text-[11px] text-slate-500">
                Submit this quick enquiry so our operations manager can check if an express technician dispatch is possible or add your area to next week's rollout.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-none bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pooja Trivedi"
                  className="w-full p-2.5 rounded-none border border-slate-300 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9825012345"
                  className="w-full p-2.5 rounded-none border border-slate-300 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@example.com"
                  className="w-full p-2.5 rounded-none border border-slate-300 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">City / Town</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Morbi"
                  className="w-full p-2.5 rounded-none border border-slate-300 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">Postal PIN Code</label>
                <input
                  type="text"
                  value={pincode}
                  maxLength={6}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 363641"
                  className="w-full p-2.5 rounded-none border border-slate-300 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">Full Service Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 301, Silver Residency, Near Highway..."
                  className="w-full p-2.5 rounded-none border border-slate-300 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">Specific Requirements / Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Need sofa sanitization for 3-seater before weekend"
                  className="w-full p-2.5 rounded-none border border-slate-300 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => openWhatsApp({
                  customMessage: `Hello HomeEase! 👋 I need service in my area: ${address || city} (PIN: ${pincode}). Category: ${getCategoryDisplayName(serviceCategory)}. Can you dispatch a team?`,
                })}
                className="w-full sm:w-auto px-4 py-2.5 rounded-none bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                title={`Chat on WhatsApp: ${WHATSAPP_DISPLAY}`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.301-.15-1.783-.879-2.06-.979-.277-.1-.479-.15-.68.15-.202.301-.78 1.002-.956 1.203-.176.201-.353.226-.653.075s-1.27-.468-2.42-1.493c-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.151-.176.201-.301.302-.502.1-.201.05-.376-.025-.526-.075-.15-.68-1.639-.93-2.242-.244-.588-.493-.508-.68-.518-.176-.008-.377-.01-.578-.01-.201 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511s1.08 2.912 1.231 3.113c.151.201 2.126 3.245 5.15 4.552.72.311 1.282.497 1.72.636.724.23 1.383.198 1.904.12.58-.087 1.783-.728 2.034-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351z"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.981-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.642 0-3.167-.487-4.453-1.326l-.32-.208-2.955.836.84-2.882-.218-.337A8.17 8.17 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2z"/>
                </svg>
                <span>Ask on WhatsApp</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-none border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-none bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Submit Enquiry</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
