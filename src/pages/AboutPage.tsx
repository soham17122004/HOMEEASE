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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
            <Sparkles size={12} className="text-[#176B52]" />
            <span>Our Journey & Standards</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Redefining Reliability in Indian Home Services
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {BRAND_CONFIG.name} was founded to end the frustration of unreliable local technicians, unpredictable pricing, and substandard workmanship. We deliver hotel-grade cleanliness, certified repairs, and total peace of mind right to your doorstep.
          </p>
        </div>

        {/* Brand Metrics - Crisp Rectangular */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 sm:p-8 rounded-none border border-slate-300 shadow-2xs text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#176B52]">120K+</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Homes Maintained</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">4,500+</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Police-Verified Pros</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-600">4.86 ★</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Average Customer Rating</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">14+</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Major Indian Cities</div>
          </div>
        </div>

        {/* 4 Pillars of Excellence - Crisp Rectangles */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              The {BRAND_CONFIG.name} Quality Commitment
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Every appointment is guarded by our four ironclad service assurances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-none border border-slate-300 shadow-2xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-none bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Background Checked & Certified</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Every technician undergoes a rigorous 3-step screening: police criminal verification, official Aadhaar biometric validation, and technical assessment in certified centers.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-none border border-slate-300 shadow-2xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-none bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center shrink-0">
                <BadgeCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">30-Day Free Rework Guarantee</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  If you notice any missed spot in deep cleaning or an appliance fault recurs within 30 days, we dispatch a senior supervisor to resolve it completely free of charge.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-none border border-slate-300 shadow-2xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-none bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center shrink-0">
                <Receipt size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Upfront Fixed Standard Pricing</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  No bargaining, no surprise additions. What you see during booking is what you pay. Every single spare part or chemical used has an itemized digital rate card.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-none border border-slate-300 shadow-2xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-none bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center shrink-0">
                <Umbrella size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">₹10,000 Accidental Damage Cover</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  We treat your home with supreme reverence. In the rare event of accidental breakage during service, our insurance policy covers repair or replacement up to ₹10,000 without delay.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Safety & Protocol Banner - Crisp Rectangle */}
        <div id="safety" className="bg-slate-900 rounded-none p-6 sm:p-10 text-white border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Professional Hygiene & Equipment</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We never use harsh acidic domestic chemicals. All cleaning solutions are hospital-grade concentrates that are non-toxic, pet-safe, and biodegradable. Technicians wear sterilized boot covers and masks.
            </p>
          </div>
          <Link
            to="/services"
            className="px-6 py-3 rounded-none bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-2xs transition-all shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>Book Certified Service</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
};
