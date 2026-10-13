import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { openWhatsApp, WHATSAPP_DISPLAY } from '../lib/whatsapp';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Booking Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How can we help your home today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Have questions about a customized package, rescheduling an appointment, or partner recruitment? Our team is available 7 days a week.
          </p>
        </div>

        {/* 4 Contact Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Phone size={20} />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Customer Helpline</h3>
            <div className="font-extrabold text-slate-900 text-sm mt-1">{BRAND_CONFIG.contact.phone}</div>
            <div className="text-[11px] text-slate-500 mt-1">Toll-free across India</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 mx-auto">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Direct WhatsApp</h3>
              <div className="font-extrabold text-slate-900 text-sm mt-1">{WHATSAPP_DISPLAY}</div>
              <div className="text-[11px] text-slate-500 mt-1">Live booking assistance 7 days/week</div>
            </div>
            <button
              type="button"
              onClick={() => openWhatsApp({ customMessage: 'Hello HomeEase! 👋 I need assistance with booking a home service in Gujarat.' })}
              className="mt-3 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer w-full"
            >
              Open WhatsApp
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Mail size={20} />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Email Support</h3>
            <div className="font-extrabold text-slate-900 text-sm mt-1">{BRAND_CONFIG.contact.email}</div>
            <div className="text-[11px] text-slate-500 mt-1">Average response &lt; 2 hours</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Operating Hours</h3>
            <div className="font-extrabold text-slate-900 text-sm mt-1">{BRAND_CONFIG.contact.operatingHours}</div>
            <div className="text-[11px] text-slate-500 mt-1">Open on all public holidays</div>
          </div>
        </div>

        {/* Contact Form & Headquarters Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Support Ticket Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you for reaching out to {BRAND_CONFIG.name}. A customer service representative will contact you at <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Send an Inquiry or Feedback</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="e.g. Ramesh Joshi"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="e.g. ramesh@example.com"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Inquiry Topic</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                  >
                    <option value="Booking Inquiry">Existing Booking Question / Rescheduling</option>
                    <option value="Custom Quote">Large Commercial / Villa Deep Clean Quote</option>
                    <option value="Quality Feedback">Service Quality / Warranty Claim</option>
                    <option value="Partner Onboarding">Technician Partnership & Joining</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="How can we assist you? Include booking reference code if applicable."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <span>Submit Support Message</span>
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>

          {/* Headquarters Info (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-sm">Corporate Headquarters</h3>
            
            <div className="flex items-start gap-3 text-xs text-slate-600">
              <MapPin size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">{BRAND_CONFIG.name} Technologies Pvt. Ltd.</strong>
                <p className="mt-1 leading-relaxed">{BRAND_CONFIG.contact.address}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="font-bold text-slate-900">Need Immediate Assistance?</div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                If your technician has not arrived within 15 minutes of your slot window, call our express dispatch desk at{' '}
                <strong className="text-slate-900">{BRAND_CONFIG.contact.phone}</strong> for instant live GPS tracking.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
