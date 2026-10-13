import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Home,
  FileText,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';
import { GUJARAT_CITIES } from '../../data/gujaratLocations';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 text-xs">
      {/* 4 Trust Pillars Bar */}
      <div className="border-b border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Verified Professionals</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  100% background-checked, identity-verified service experts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">30-Day Service Guarantee</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Complimentary rework if service does not meet quality standards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Upfront Fixed Pricing</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Transparent itemized rates with zero surprise doorstep fees.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">On-Time Arrival</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  60-minute express doorstep slots with instant WhatsApp updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand & Contact */}
          <div className="lg:col-span-2 space-y-3.5">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
                <Home size={16} />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                {BRAND_CONFIG.name}
              </span>
            </Link>
            <p className="text-slate-500 text-xs max-w-sm leading-relaxed">
              Gujarat's trusted on-demand home service platform. Professional deep cleaning, sofa upholstery care, AC servicing, and washing machine repairs at verified fixed prices.
            </p>

            <div className="space-y-1.5 pt-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-500" />
                <span>WhatsApp / Helpline: <strong className="text-slate-900">{BRAND_CONFIG.contact.phone}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-slate-500" />
                <span>Support: <strong className="text-slate-900">{BRAND_CONFIG.contact.email}</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-slate-500 shrink-0 mt-0.5" />
                <span>Operating Headquarters: {BRAND_CONFIG.contact.address}</span>
              </div>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h5 className="font-bold text-slate-900 text-xs mb-3 uppercase tracking-wider">
              Core Services
            </h5>
            <ul className="space-y-2 text-slate-600">
              <li>
                <Link to="/services/sofa-deep-cleaning" className="hover:text-slate-900 transition-colors">
                  Sofa Cleaning (1–10 Seats)
                </Link>
              </li>
              <li>
                <Link to="/services/2bhk-home-deep-cleaning" className="hover:text-slate-900 transition-colors">
                  Full Home Deep Cleaning
                </Link>
              </li>
              <li>
                <Link to="/services/ac-power-jet-servicing" className="hover:text-slate-900 transition-colors">
                  AC Jet Wash & Gas Check
                </Link>
              </li>
              <li>
                <Link to="/services/washing-machine-service-repair" className="hover:text-slate-900 transition-colors">
                  Washing Machine Repair
                </Link>
              </li>
              <li>
                <Link to="/services/bathroom-deep-cleaning" className="hover:text-slate-900 transition-colors">
                  Bathroom Tile Descaling
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-slate-900 font-semibold text-slate-900">
                  View All Services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Operating Coverage across Gujarat */}
          <div>
            <h5 className="font-bold text-slate-900 text-xs mb-3 uppercase tracking-wider">
              Gujarat Coverage
            </h5>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
              {GUJARAT_CITIES.map((c) => (
                <span
                  key={c.name}
                  className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium"
                >
                  {c.name}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5">
              Admin-configured coverage zones with Google Maps doorstep validation.
            </p>
          </div>

          {/* Company & Support */}
          <div>
            <h5 className="font-bold text-slate-900 text-xs mb-3 uppercase tracking-wider">
              Company & Help
            </h5>
            <ul className="space-y-2 text-slate-600">
              <li>
                <Link to="/about" className="hover:text-slate-900 transition-colors">
                  About HomeEase
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-slate-900 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-slate-900 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-slate-900 transition-colors">
                  Track My Booking
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-slate-900 transition-colors">
                  Terms & Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>
              © {new Date().getFullYear()} {BRAND_CONFIG.name} Technologies Private Limited. All rights reserved.
            </span>
            {/* Subtle, hidden-style Admin console trigger for business owner */}
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center p-0.5 text-slate-300 hover:text-slate-500 opacity-20 hover:opacity-90 transition-all duration-300 rounded cursor-pointer"
              title="Console"
              aria-label="Staff Login"
            >
              <Lock size={10} className="stroke-[1.5]" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/legal" className="hover:text-slate-800">Privacy Policy</Link>
            <span>•</span>
            <Link to="/legal" className="hover:text-slate-800">Terms of Service</Link>
            <span>•</span>
            <Link to="/legal" className="hover:text-slate-800">Pricing Guarantee</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
