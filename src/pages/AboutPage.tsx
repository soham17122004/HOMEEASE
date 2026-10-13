import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  BadgeCheck,
  Receipt,
  Umbrella,
  Sparkles,
  Users,
  Award,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Sparkles size={12} />
            <span>Our Journey & Standards</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Redefining Reliability in Indian Home Services
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {BRAND_CONFIG.name} was founded to end the frustration of unreliable local technicians, unpredictable pricing, and substandard workmanship. We deliver hotel-grade cleanliness, certified repairs, and total peace of mind right to your doorstep.
          </p>
        </div>

        {/* Brand Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">120K+</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Homes Maintained</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">4,500+</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Police-Verified Pros</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-600">4.86 ★</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Average Customer Rating</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">14+</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Major Indian Cities</div>
          </div>
        </div>

        {/* 4 Pillars of Excellence */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              The {BRAND_CONFIG.name} Quality Commitment
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Every appointment is guarded by our four ironclad service assurances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Background Checked & Certified</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Every technician undergoes a rigorous 3-step screening: police criminal verification, official Aadhaar biometric validation, and a minimum of 200 hours of technical training in our dedicated centers.
                </p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <BadgeCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">30-Day Free Rework Guarantee</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  If you notice any missed spot in deep cleaning or an appliance fault recurs within 30 days, we dispatch a senior supervisor to resolve it completely free of charge. No questions asked.
                </p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Receipt size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Upfront Fixed Standard Pricing</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  No bargaining, no surprise additions. What you see during booking is what you pay. Every single spare part or chemical used has an itemized digital rate card.
                </p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Umbrella size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">₹10,000 Accidental Damage Cover</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  We treat your home with supreme reverence. In the rare event of accidental breakage during service, our insurance policy covers repair or replacement up to ₹10,000 without delay.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Safety & Protocol Banner */}
        <div id="safety" className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl font-extrabold">Professional Hygiene & Equipment</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We never use harsh acidic domestic chemicals. All cleaning solutions are hospital-grade Diversey concentrates that are non-toxic, pet-safe, and biodegradable. Technicians wear sterilized boot covers and masks.
            </p>
          </div>
          <Link
            to="/services"
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition-all shrink-0 flex items-center gap-2"
          >
            <span>Book Certified Service</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
};
