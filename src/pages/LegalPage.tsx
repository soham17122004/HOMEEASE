import React, { useState } from 'react';
import { ShieldCheck, FileText, RefreshCw } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';

export const LegalPage: React.FC = () => {
  const [tab, setTab] = useState<'privacy' | 'terms' | 'refund'>('privacy');

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Trust, Legal & Compliance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Last updated: October 2026 • Effective across all operational regions
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 mb-8 gap-4 overflow-x-auto">
          <button
            onClick={() => setTab('privacy')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'privacy'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setTab('terms')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'terms'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={14} />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setTab('refund')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'refund'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw size={14} />
            <span>Cancellation & Refund Policy</span>
          </button>
        </div>

        {/* Content Box - Crisp Rectangular */}
        <div className="bg-white rounded-none p-6 sm:p-10 border border-slate-300 shadow-2xs text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6">
          {tab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
              <p>
                At {BRAND_CONFIG.name}, we collect personal details necessary to fulfill your residential service appointments, including your full name, mobile number, home delivery address, and service notes.
              </p>

              <h2 className="text-lg font-bold text-slate-900">2. How We Guard Customer Privacy</h2>
              <p>
                We never monetize or sell personal consumer records to third-party advertisers. Addresses and phone numbers are shared strictly with the assigned technician for navigation and dispatch purposes during the active service window.
              </p>

              <h2 className="text-lg font-bold text-slate-900">3. Payment & Banking Data</h2>
              <p>
                {BRAND_CONFIG.name} does not record full debit/credit card CVV or net-banking credentials. Transactions are handled through PCI-DSS compliant secure gateways or direct peer-to-peer UPI channels.
              </p>
            </div>
          )}

          {tab === 'terms' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By booking an appointment on {BRAND_CONFIG.name}, you agree to these standard operating conditions, which establish a legally binding service engagement between the household resident and our registered platform partners.
              </p>

              <h2 className="text-lg font-bold text-slate-900">2. Access to Premises</h2>
              <p>
                The customer agrees to provide safe, unimpeded access to water and electricity points needed to operate equipment such as high-pressure jet washers or single-disc floor buffers.
              </p>

              <h2 className="text-lg font-bold text-slate-900">3. Damage Protection Guarantee</h2>
              <p>
                In the rare instance that accidental breakage occurs as a direct result of platform negligence, {BRAND_CONFIG.name} provides insurance coverage up to ₹10,000 following an on-site damage assessment.
              </p>
            </div>
          )}

          {tab === 'refund' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">1. Cancellation Timelines</h2>
              <p>
                Customers are entitled to free cancellation up to 2 hours before the scheduled appointment slot with zero cancellation fee. Cancellations made less than 60 minutes prior may be subject to a nominal technician mobilization fee of ₹99.
              </p>

              <h2 className="text-lg font-bold text-slate-900">2. 30-Day Free Rework Charter</h2>
              <p>
                If you are unsatisfied with deep cleaning thoroughness or an appliance repair fault recurs within 30 calendar days, we provide a 100% free revisit and rectification service.
              </p>

              <h2 className="text-lg font-bold text-slate-900">3. Online Payment Refunds</h2>
              <p>
                Refunds for prepaid digital bookings are credited back to the original source account (UPI / Bank Account) within 3 to 5 business days upon claim verification.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
