import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  CalendarCheck,
  User,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Search,
  Home,
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';
import { DataStore, useStoreData } from '../../lib/store';
import { LocationModal } from './LocationModal';
import { openWhatsApp, WHATSAPP_DISPLAY } from '../../lib/whatsapp';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, selectedCity, bookings, services } = useStoreData();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active bookings count
  const myBookingsCount = currentUser
    ? bookings.filter((b) => b.userId === currentUser.id && (b.status === 'confirmed' || b.status === 'in_progress' || b.status === 'pending')).length
    : 0;

  const handleLogout = () => {
    DataStore.setCurrentUser(null);
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const handleSwitchToAdmin = () => {
    DataStore.switchRole('admin');
    setIsProfileDropdownOpen(false);
    navigate('/admin');
  };

  const handleSwitchToCustomer = () => {
    DataStore.switchRole('customer');
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/services?q=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch('');
      setIsSearchFocused(false);
    }
  };

  const matchingServices = quickSearch.trim()
    ? services.filter((s) => s.title.toLowerCase().includes(quickSearch.toLowerCase()) || s.categorySlug?.includes(quickSearch.toLowerCase())).slice(0, 4)
    : [];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'glass-header shadow-xs py-0.5'
            : 'bg-white border-b border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand Logo & Location Selector */}
            <div className="flex items-center gap-5">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                  <Home size={18} strokeWidth={2.2} />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
                    {BRAND_CONFIG.name}
                  </span>
                  <span className="text-[10px] tracking-normal font-medium text-slate-500 mt-1">
                    Home Services • Gujarat
                  </span>
                </div>
              </Link>

              {/* Location Selector Pill */}
              <button
                type="button"
                onClick={() => setIsLocationOpen(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[#F7F8FA] hover:bg-slate-100 text-[#22252B] text-[11px] sm:text-xs font-semibold transition-colors border border-[#E6E8EC]"
                title="Change operating city"
              >
                <MapPin size={12} className="text-[#176B52] shrink-0" />
                <span className="max-w-[65px] sm:max-w-[130px] truncate">{selectedCity}</span>
                <span className="hidden sm:inline text-slate-400 font-normal">, Gujarat</span>
                <ChevronDown size={11} className="text-slate-400 shrink-0" />
              </button>
            </div>

            {/* Middle: Clean Desktop Search Bar */}
            <div className="hidden lg:block relative flex-1 max-w-md mx-6">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search size={15} className="absolute left-3.5 text-slate-400" />
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search 'sofa cleaning', 'AC service', '2BHK'..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </form>

              {/* Quick Search Auto-complete dropdown */}
              {isSearchFocused && matchingServices.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 divide-y divide-slate-100">
                  {matchingServices.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        navigate(`/services/${s.slug}`);
                        setQuickSearch('');
                        setIsSearchFocused(false);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="font-medium text-slate-800">{s.title}</div>
                      <span className="text-slate-500 font-semibold">₹{s.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Nav Links & Actions */}
            <div className="flex items-center gap-3">
              {/* Desktop Links */}
              <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600 mr-2">
                <Link
                  to="/services"
                  className={`hover:text-slate-900 transition-colors ${
                    location.pathname === '/services' ? 'text-slate-950 font-bold' : ''
                  }`}
                >
                  All Services
                </Link>
                <Link
                  to="/about"
                  className={`hover:text-slate-900 transition-colors ${
                    location.pathname === '/about' ? 'text-slate-950 font-bold' : ''
                  }`}
                >
                  Coverage & About
                </Link>
                <Link
                  to="/faq"
                  className={`hover:text-slate-900 transition-colors ${
                    location.pathname === '/faq' ? 'text-slate-950 font-bold' : ''
                  }`}
                >
                  Help
                </Link>
              </nav>

              {/* Direct WhatsApp Button (Logo Only) */}
              <button
                type="button"
                onClick={() => openWhatsApp({ customMessage: 'Hello HomeEase! 👋 I would like to inquire about booking a home service in Junagadh.' })}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                title={`Chat on WhatsApp (${WHATSAPP_DISPLAY})`}
                aria-label="Chat on WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.301-.15-1.783-.879-2.06-.979-.277-.1-.479-.15-.68.15-.202.301-.78 1.002-.956 1.203-.176.201-.353.226-.653.075s-1.27-.468-2.42-1.493c-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.151-.176.201-.301.302-.502.1-.201.05-.376-.025-.526-.075-.15-.68-1.639-.93-2.242-.244-.588-.493-.508-.68-.518-.176-.008-.377-.01-.578-.01-.201 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511s1.08 2.912 1.231 3.113c.151.201 2.126 3.245 5.15 4.552.72.311 1.282.497 1.72.636.724.23 1.383.198 1.904.12.58-.087 1.783-.728 2.034-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351z"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.981-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.642 0-3.167-.487-4.453-1.326l-.32-.208-2.955.836.84-2.882-.218-.337A8.17 8.17 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2z"/>
                </svg>
              </button>

              {/* Track Booking Guest Link */}
              <Link
                to="/bookings"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <CalendarCheck size={14} className="text-[#176B52]" />
                <span>Track Booking</span>
              </Link>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3">
            <button
              type="button"
              onClick={() => {
                setIsLocationOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
            >
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-emerald-700" />
                <span>Operating City: <strong>{selectedCity}, Gujarat</strong></span>
              </div>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            <div className="flex flex-col space-y-1 text-xs font-semibold text-slate-700 pt-1">
              <Link
                to="/services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                All Services
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Coverage & About
              </Link>
              <Link
                to="/faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Help & FAQ
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Contact Us
              </Link>
              <Link
                to="/bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-900 flex items-center gap-2 font-semibold"
              >
                <CalendarCheck size={14} className="text-[#176B52]" />
                <span>Track Booking</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Location Modal */}
      <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
    </>
  );
};
