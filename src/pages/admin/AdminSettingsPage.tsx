import React, { useState } from 'react';
import {
  Save,
  CheckCircle2,
  Building,
  Phone,
  Mail,
  ShieldCheck,
  MapPin,
  Clock,
  Bell,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';
import { DataStore, useStoreData } from '../../lib/store';
import { getAuthorizedAdminEmail } from '../../lib/adminAuth';

export const AdminSettingsPage: React.FC = () => {
  const { websiteSettings } = useStoreData();
  const [saved, setSaved] = useState(false);

  // Form states initialized from persistent store
  const [companyName, setCompanyName] = useState(websiteSettings.companyName || websiteSettings.businessName || 'HomeEase Junagadh');
  const [supportPhone, setSupportPhone] = useState(websiteSettings.supportPhone || websiteSettings.contactPhone || '+91 90165 26419');
  const [supportEmail, setSupportEmail] = useState(websiteSettings.supportEmail || 'support@homeease.in');
  const [whatsappNumber, setWhatsappNumber] = useState(websiteSettings.whatsappNumber || '9016526419');
  const [officeAddress, setOfficeAddress] = useState(websiteSettings.officeAddress || websiteSettings.address || 'Zanzarda Road, Junagadh');
  const [tagline, setTagline] = useState(websiteSettings.tagline || 'Expert Home Services, Right at Your Doorstep in Junagadh');
  const [operatingHours, setOperatingHours] = useState(websiteSettings.operatingHours || '8:00 AM – 8:00 PM (All 7 Days)');
  const [activeSlots, setActiveSlots] = useState<string[]>(websiteSettings.activeSlots || websiteSettings.availableSlots || []);
  const [smsAlerts, setSmsAlerts] = useState(websiteSettings.smsAlerts ?? true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(websiteSettings.whatsappAlerts ?? true);
  const [adminEmailAlerts, setAdminEmailAlerts] = useState(websiteSettings.adminEmailAlerts ?? true);

  const authorizedEmail = getAuthorizedAdminEmail();

  const ALL_SLOTS = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
  ];

  const toggleSlot = (slot: string) => {
    if (activeSlots.includes(slot)) {
      if (activeSlots.length <= 1) {
        alert('At least one active time slot must be enabled.');
        return;
      }
      setActiveSlots(activeSlots.filter((s) => s !== slot));
    } else {
      setActiveSlots([...activeSlots, slot]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    DataStore.updateWebsiteSettings({
      companyName,
      supportPhone,
      supportEmail,
      whatsappNumber,
      officeAddress,
      tagline,
      operatingHours,
      activeSlots,
      smsAlerts,
      whatsappAlerts,
      adminEmailAlerts,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Website & Operations Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure business details, Junagadh contact lines, operating hours, and dispatch notification preferences.
        </p>
      </div>

      {/* Admin Authorization Security Status */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm">Authorized Admin Access Control</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active & Enforced
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Only the configured authorized email can access this panel: <strong className="text-slate-800 font-mono">{authorizedEmail}</strong>
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 shrink-0">
          Configured via <code className="text-slate-800 font-semibold font-mono">ADMIN_EMAIL</code> env
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact Information */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone size={16} className="text-[#176B52]" />
            <h3 className="text-sm font-bold text-slate-900">Customer Support & Contact Lines (Junagadh)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company / Platform Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer Support Hotline</label>
              <input
                type="text"
                required
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">WhatsApp Dispatch Helpline</label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Support Email Address</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Junagadh Hub Physical Address</label>
              <input
                type="text"
                required
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours and Slots */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock size={16} className="text-[#176B52]" />
            <h3 className="text-sm font-bold text-slate-900">Operating Hours & Booking Time Slots</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Business Operating Hours Label</label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Active 2-Hour Delivery Slots (Click to Enable / Disable)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {ALL_SLOTS.map((slot) => {
                  const isActive = activeSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-[#176B52] text-white border-[#176B52]'
                          : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                      }`}
                    >
                      <span>{slot}</span>
                      <span className="text-[10px] font-bold">
                        {isActive ? 'Active' : 'Off'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Customer-Facing Content */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building size={16} className="text-[#176B52]" />
            <h3 className="text-sm font-bold text-slate-900">Customer-Facing Branding & Content</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Header Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 space-y-1 text-[11px]">
              <div className="font-semibold text-slate-900">Junagadh Service City Coverage:</div>
              <div>Operating exclusively in Junagadh, Gujarat. Localities: Zanzarda Road, Joshipura, Moti Baug, Kalva Chowk, Timbavadi, College Road, Dolatpara (Pincodes 362001–362015).</div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell size={16} className="text-[#176B52]" />
            <h3 className="text-sm font-bold text-slate-900">Automated Dispatch & Notification Settings</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-900">Instant Admin Email Notifications</div>
                <div className="text-[11px] text-slate-500">Send an immediate alert email to {authorizedEmail} whenever a customer books a service.</div>
              </div>
              <input
                type="checkbox"
                checked={adminEmailAlerts}
                onChange={(e) => setAdminEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#176B52] focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-900">Customer SMS Confirmation Dispatch</div>
                <div className="text-[11px] text-slate-500">Send confirmation SMS with booking reference code (JND-2026-XXXX) to the customer's phone number.</div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#176B52] focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-900">WhatsApp Dispatch Link Activation</div>
                <div className="text-[11px] text-slate-500">Enable direct 1-click WhatsApp customer support and pro assignment updates.</div>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#176B52] focus:ring-0"
              />
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 size={16} />
              <span>Settings updated successfully!</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              Changes apply instantly across public customer booking pages.
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#176B52] hover:bg-[#135742] text-white font-semibold text-xs shadow-xs flex items-center gap-2 transition-colors"
          >
            <Save size={15} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
