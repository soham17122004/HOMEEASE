import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Star,
  MapPin,
  ArrowRight,
  Layers,
  Sparkles,
  Wrench,
  Wind,
  Check,
  Bath,
  Armchair,
  CheckCircle2,
  Clock,
  Award,
  Gift,
  Zap,
  AlertTriangle,
  Phone,
  Copy,
  Flame,
  Shield,
  Banknote,
  HeartHandshake,
  Users,
  ThumbsUp,
  ChevronLeft,
  MapPinned,
  BadgeCheck,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useStoreData, DataStore } from '../lib/store';
import { ServiceCard } from '../components/common/ServiceCard';
import { AnimatedStats } from '../components/common/AnimatedStats';

const SEARCH_PLACEHOLDERS = [
  "Search for 'sofa cleaning'...",
  "Search for 'AC power jet wash'...",
  "Search for '2 BHK full deep cleaning'...",
  "Search for 'washing machine repair'...",
  "Search for 'kitchen degreasing & bath descaling'...",
];

const LIVE_ACTIVITIES = [
  { area: 'Zanzarda Road, Junagadh', service: 'Sofa Deep Cleaning', time: '3m ago' },
  { area: 'Joshipura, Junagadh', service: 'AC Power Jet Servicing', time: '9m ago' },
  { area: 'Moti Baug, Junagadh', service: '2 BHK Home Deep Cleaning', time: '16m ago' },
  { area: 'Kalva Chowk, Junagadh', service: 'Washing Machine Repair', time: '22m ago' },
];

// Before/After gallery data
const BEFORE_AFTER_DATA = [
  {
    id: 'ba-sofa',
    title: 'Sofa Deep Cleaning',
    beforeDesc: 'Stained & discolored fabric with embedded dust mites',
    afterDesc: 'Showroom-fresh sanitized fabric with zero stains',
    beforeImage: '/images/services/sofa-before.jpg',
    afterImage: '/images/services/sofa-after.jpg',
  },
  {
    id: 'ba-ac',
    title: 'AC Power Jet Wash',
    beforeDesc: 'Heavy black mold & sludge buildup on inside blower fan wheel',
    afterDesc: 'Spotless, sanitized blower fan blades with doubled cooling airflow',
    beforeImage: '/images/services/ac-before.jpg',
    afterImage: '/images/services/ac-after.jpg',
  },
  {
    id: 'ba-home',
    title: 'Full Home Deep Cleaning',
    beforeDesc: 'Dust accumulation, limescale stains, greasy kitchen',
    afterDesc: 'Spotless surfaces, descaled bathrooms, degreased kitchen',
    beforeImage: '/images/services/home-before.jpg',
    afterImage: '/images/services/home-after.jpg',
  },
  {
    id: 'ba-wm',
    title: 'Washing Machine Descaling',
    beforeDesc: 'Lime buildup in drum, musty odor, lint clogs',
    afterDesc: 'Descaled drum, fresh odor, restored spin balance',
    beforeImage: '/images/services/wm-before.jpg',
    afterImage: '/images/services/wm-after.jpg',
  },
];

// Serviceable pincodes
const SERVICEABLE_PINCODES: Record<string, string> = {
  '362001': 'Junagadh City Center',
  '362002': 'Zanzarda Road, Joshipura',
  '362003': 'Moti Baug, Kalva Chowk',
  '362004': 'Timbavadi, Bilkha Road',
  '362015': 'Majevadi Gate',
  '362011': 'College Road Area',
  '362012': 'Dolatpara',
  '362013': 'Girnar Zone',
  '362014': 'Madhuram Area',
  '362020': 'Railway Station Area',
  '362030': 'Industrial Zone',
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { services, reviews, selectedCity } = useStoreData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [activityIndex, setActivityIndex] = useState(0);

  // Before/After gallery
  const [baIndex, setBaIndex] = useState(0);
  const [baSliderValue, setBaSliderValue] = useState(50);

  // Pincode checker
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{ status: 'serviceable' | 'not-serviceable' | null; area?: string }>({ status: null });

  // Referral
  const [referralCopied, setReferralCopied] = useState(false);

  // Diwali banner dismiss
  const [diwaliBannerVisible, setDiwaliBannerVisible] = useState(true);

  useEffect(() => {
    DataStore.syncWithBackend();

    const pTimer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3200);

    const aTimer = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % LIVE_ACTIVITIES.length);
    }, 4500);

    return () => {
      clearInterval(pTimer);
      clearInterval(aTimer);
    };
  }, []);

  // Suggestions for live search
  const filteredSuggestions = searchQuery.trim()
    ? services.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.categorySlug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePincodeCheck = () => {
    const clean = pincodeInput.replace(/\D/g, '').slice(0, 6);
    if (clean.length !== 6) return;
    const area = SERVICEABLE_PINCODES[clean];
    if (area) {
      setPincodeResult({ status: 'serviceable', area });
    } else {
      setPincodeResult({ status: 'not-serviceable' });
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText('HOMEEASE250');
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const popularServices = services.filter((s) => s.isPopular).slice(0, 4);

  // Urban Company signature top category tiles
  const topCategories = [
    {
      title: 'Sofa Cleaning',
      slug: 'sofa-carpet-care',
      icon: Armchair,
      count: '₹149/seat',
    },
    {
      title: 'Home Deep Clean',
      slug: 'home-cleaning',
      icon: Sparkles,
      count: 'From ₹3,499',
    },
    {
      title: 'AC Service & Repair',
      slug: 'ac-servicing',
      icon: Wind,
      count: 'From ₹549',
    },
    {
      title: 'Washing Machine',
      slug: 'appliance-repair',
      icon: Wrench,
      count: 'From ₹499',
    },
    {
      title: 'Kitchen & Bathroom',
      slug: 'kitchen-bathroom',
      icon: Bath,
      count: 'From ₹449',
    },
    {
      title: 'All Services',
      slug: 'all',
      icon: Layers,
      count: '15+ options',
    },
  ];

  // Authentic realistic FAQs
  const homeFaqs = [
    {
      q: 'How does HomeEase verify the exact service doorstep?',
      a: 'We integrate Google Maps Platform directly into your booking flow. You can search for your society or apartment, drag the pin to your exact building gate, or use your browser location with explicit permission. Our professionals receive turn-by-turn directions directly to your coordinates.',
    },
    {
      q: 'Do your professionals bring their own cleaning supplies and equipment?',
      a: 'Yes, absolutely. Our technicians arrive fully equipped with certified industrial wet extraction machines, single-disc floor buffers, high-pressure jet pumps, microfiber cloths, and pH-balanced, pet-safe chemicals. You do not need to provide any equipment.',
    },
    {
      q: 'What is covered under the 30-day service warranty?',
      a: 'If you notice any missed spots or performance issues within 30 days of service completion, simply report it via your bookings dashboard. We will dispatch a senior quality technician for a complimentary rework with zero extra charge.',
    },
    {
      q: 'Which cities across Gujarat are currently serviceable?',
      a: 'We are active across Junagadh, Gujarat. Our operations team manages coverage across Zanzarda Road, Joshipura, Moti Baug, Kalva Chowk, Timbavadi, and surrounding areas. Other cities in Gujarat are coming soon!',
    },
    {
      q: 'Can I reschedule or cancel my booking?',
      a: 'Yes. You can reschedule or cancel anytime up to 2 hours prior to the scheduled technician arrival directly from your "My Bookings" page with zero cancellation fees.',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* ===================== DIWALI / FESTIVE BANNER ===================== */}
      {diwaliBannerVisible && (
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 text-white overflow-hidden">
          {/* Animated sparkle overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(255,215,0,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.15) 0%, transparent 40%)',
          }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-none flex items-center justify-center border border-white/30">
                  <Flame size={18} className="text-yellow-200" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight">✨ Diwali Festive Sale!</span>
                    <span className="px-2 py-0.5 bg-white/25 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider rounded-none border border-white/30">
                      Limited Time
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-white/90 mt-0.5">
                    Get <strong>20% OFF</strong> on all services with code <code className="bg-white/20 px-1.5 py-0.5 font-bold rounded-none">FESTIVE15</code> • Pre-Diwali deep cleaning slots filling fast!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/services"
                  className="hidden sm:inline-flex items-center gap-1 px-3.5 py-1.5 bg-white text-orange-600 font-bold text-xs rounded-none hover:bg-orange-50 transition-colors"
                >
                  <span>Book Now</span>
                  <ArrowRight size={12} />
                </Link>
                <button
                  type="button"
                  onClick={() => setDiwaliBannerVisible(false)}
                  className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-none transition-colors cursor-pointer"
                  aria-label="Dismiss banner"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. URBAN COMPANY SIGNATURE HERO SECTION - RECTANGULAR, HIGH CONTRAST */}
      <section className="bg-white border-b border-slate-200 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Heading, Search & Category Pillars (7 cols) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              
              {/* Dynamic Live Activity & Region Ticker */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold w-fit">
                  <MapPin size={13} className="text-[#176B52]" />
                  <span>Serving {selectedCity}, Gujarat</span>
                </div>

                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block shrink-0" />
                  <span className="font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none">{LIVE_ACTIVITIES[activityIndex].service}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 truncate max-w-[120px] sm:max-w-none">{LIVE_ACTIVITIES[activityIndex].area}</span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                    {LIVE_ACTIVITIES[activityIndex].time}
                  </span>
                </div>
              </div>

              {/* Headline */}
              <div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Home services,{' '}
                  <span className="text-[#176B52]">on demand.</span>
                </h1>
                <p className="text-slate-600 text-xs sm:text-base mt-2 max-w-xl leading-relaxed">
                  Book background-verified specialists for sofa cleaning, full-home sanitization, AC power servicing, and appliance repairs at fixed, upfront rates.
                </p>
              </div>

              {/* Dynamic Search Bar - Mobile-optimized */}
              <div className="relative max-w-xl">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <Search size={16} className="absolute left-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                    className="w-full pl-10 pr-24 py-3 sm:py-3.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all shadow-xs"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                {/* Suggestions Dropdown */}
                {isSearchFocused && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-300 overflow-hidden z-30 divide-y divide-slate-100">
                    <div className="px-3.5 py-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Matching Services ({filteredSuggestions.length})
                    </div>
                    {filteredSuggestions.slice(0, 4).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => navigate(`/services/${s.slug}`)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={s.imageUrl}
                            alt={s.title}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{s.title}</div>
                            <div className="text-[11px] text-slate-500">{s.durationMinutes} mins • ₹{s.price}</div>
                          </div>
                        </div>
                        <span className="text-slate-800 text-xs font-semibold flex items-center gap-0.5">
                          Book <ChevronRight size={13} />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Category Grid */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Select a Service Category</span>
                  <Link to="/services" className="text-[11px] font-semibold text-[#176B52] sm:hidden flex items-center gap-0.5">
                    View all <ChevronRight size={12} />
                  </Link>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {topCategories.map((cat) => {
                    const IconComp = cat.icon;
                    const linkTarget = cat.slug === 'all' ? '/services' : `/services?category=${cat.slug}`;
                    return (
                      <Link
                        key={cat.title}
                        to={linkTarget}
                        className="p-2.5 sm:p-3 bg-white border border-slate-200 hover:border-slate-900 rounded-xl flex flex-col items-center text-center transition-all group active:scale-95 shadow-xs hover:shadow-md"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:bg-[#176B52] group-hover:text-white transition-colors mb-2">
                          <IconComp size={18} />
                        </div>
                        <div className="font-bold text-[11px] text-slate-900 line-clamp-1 group-hover:text-[#176B52]">
                          {cat.title}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 font-medium">
                          {cat.count}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Key Trust Guarantees - Crisp Rectangular */}
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#176B52] stroke-[2.5]" />
                  <span>Police-verified experts</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#176B52] stroke-[2.5]" />
                  <span>Standardized upfront pricing</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#176B52] stroke-[2.5]" />
                  <span>30-day rework warranty</span>
                </div>
              </div>

            </div>

            {/* Right Column: High Quality Photographic Showcase - Strictly Rectangular */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              
              {/* Rectangular Top Badge */}
              <div className="absolute -top-3 left-4 z-20 bg-white px-3 py-2 rounded-none shadow-sm flex items-center gap-2 border border-slate-300">
                <div className="w-7 h-7 rounded-none bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                  <ShieldCheck size={16} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-slate-900 leading-tight">100% Police Verified</div>
                  <div className="text-[10px] text-slate-500">Certified local specialists</div>
                </div>
              </div>

              {/* Rectangular Bottom Badge */}
              <div className="absolute -bottom-3 right-4 z-20 bg-white px-3 py-2 rounded-none shadow-sm flex items-center gap-2 border border-slate-300">
                <div className="w-7 h-7 rounded-none bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs border border-amber-200">
                  <Star size={15} className="fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-slate-900 leading-tight">30-Day Guarantee</div>
                  <div className="text-[10px] text-slate-500">Free rework warranty</div>
                </div>
              </div>

              {/* Main Visual Image Card - Crisp Rectangle */}
              <div className="relative rounded-none overflow-hidden border border-slate-300 shadow-sm bg-slate-100">
                <img
                  src="/images/services/home-cleaning.jpg"
                  alt="HomeEase certified cleaning specialist at work"
                  className="w-full aspect-[4/3] object-cover"
                />

                {/* Overlaid Verified Bar - Crisp Rectangle */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 p-3 rounded-none border border-slate-300 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-none bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      ★
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">4.88 / 5 Rating</div>
                      <div className="text-[10px] text-slate-500">Based on 2,400+ verified Gujarat bookings</div>
                    </div>
                  </div>
                  <Link
                    to="/services"
                    className="text-[11px] font-bold text-slate-900 hover:text-[#176B52] border border-slate-300 bg-slate-50 px-2 py-1 rounded-none flex items-center gap-1 transition-colors"
                  >
                    <span>View Catalog</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DYNAMIC ANIMATED METRICS & SOCIAL PROOF */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedStats />
        </div>
      </section>

      {/* ===================== EMERGENCY / SAME-DAY BOOKING BANNER ===================== */}
      <section className="py-0 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5 border-l-4 border-red-500 pl-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-10 h-10 bg-red-50 border border-red-200 rounded-none flex items-center justify-center">
                <Zap size={20} className="text-red-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900">Urgent? Same-Day Express Service</h3>
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-none border border-red-200 uppercase">
                    Priority
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Emergency AC breakdown, water leakage, or pre-event deep cleaning? Get a verified technician within <strong>2–4 hours</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <a
                href={`tel:${BRAND_CONFIG.contact.phone.replace(/\s/g, '')}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                <Phone size={13} />
                <span>Call Now</span>
              </a>
              <a
                href={BRAND_CONFIG.contact.whatsappUrl + '?text=' + encodeURIComponent('Hi, I need an emergency/same-day service booking. Please help!')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#25D366] hover:bg-[#1da855] text-white font-bold text-xs rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.301-.15-1.783-.879-2.06-.979-.277-.1-.479-.15-.68.15-.202.301-.78 1.002-.956 1.203-.176.201-.353.226-.653.075s-1.27-.468-2.42-1.493c-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.151-.176.201-.301.302-.502.1-.201.05-.376-.025-.526-.075-.15-.68-1.639-.93-2.242-.244-.588-.493-.508-.68-.518-.176-.008-.377-.01-.578-.01-.201 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511s1.08 2.912 1.231 3.113c.151.201 2.126 3.245 5.15 4.552.72.311 1.282.497 1.72.636.724.23 1.383.198 1.904.12.58-.087 1.783-.728 2.034-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351z"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.981-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.642 0-3.167-.487-4.453-1.326l-.32-.208-2.955.836.84-2.882-.218-.337A8.17 8.17 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MOST BOOKED SERVICES - CRISP RECTANGULAR URBAN COMPANY CARDS */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Top Rated Packages
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Most Booked Services
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Specialized treatments using certified machinery, safety kits, and trained technicians.
              </p>
            </div>
            <Link
              to="/services"
              className="mt-3 sm:mt-0 text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center gap-1 group border-b border-slate-900 pb-0.5"
            >
              <span>View all services</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularServices.map((service) => (
              <ServiceCard key={service.id} service={service} featured />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHY CHOOSE HOMEEASE - TRUST SECTION ===================== */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="text-xs font-bold text-[#176B52] uppercase tracking-wider mb-1">
              The HomeEase Promise
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Why 3,800+ Gujarat Homes Trust HomeEase
            </h2>
            <p className="text-slate-500 text-xs mt-1.5">
              Every aspect of our service is designed around your safety, convenience, and satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="p-5 bg-white border border-slate-200 rounded-none hover:border-[#176B52] transition-all group">
              <div className="w-11 h-11 rounded-none bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 group-hover:bg-[#176B52] transition-colors">
                <ShieldCheck size={22} className="text-[#176B52] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Police-Verified Experts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every technician undergoes mandatory Aadhaar & police background verification. Only 12% of applicants clear our screening process.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-5 bg-white border border-slate-200 rounded-none hover:border-[#176B52] transition-all group">
              <div className="w-11 h-11 rounded-none bg-amber-50 border border-amber-200 flex items-center justify-center mb-3 group-hover:bg-amber-500 transition-colors">
                <Award size={22} className="text-amber-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">30-Day Rework Guarantee</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Not satisfied? We dispatch a senior technician for free rework within 30 days. Zero questions asked, zero extra charges.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-5 bg-white border border-slate-200 rounded-none hover:border-[#176B52] transition-all group">
              <div className="w-11 h-11 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                <Banknote size={22} className="text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Transparent Upfront Pricing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fixed rates displayed before booking. Itemized invoice before work begins. Absolutely zero hidden costs or surprise additions.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-5 bg-white border border-slate-200 rounded-none hover:border-[#176B52] transition-all group">
              <div className="w-11 h-11 rounded-none bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-3 group-hover:bg-indigo-600 transition-colors">
                <Shield size={22} className="text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">₹10,000 Damage Insurance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complete coverage against accidental damage during service. Your home, furniture, and appliances are fully protected while we work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BEFORE / AFTER GALLERY ===================== */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Real Results
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Before & After Transformations
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              See the real difference our certified HomeEase technicians make — every single time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Image Side */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 touch-none select-none shadow-sm aspect-[16/10]">
              {/* Bottom Image: AFTER (clean, spotless) */}
              <img
                src={BEFORE_AFTER_DATA[baIndex].afterImage}
                alt={`${BEFORE_AFTER_DATA[baIndex].title} - After`}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Top Image: BEFORE (stained, dirty) - clipped by slider position */}
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{
                  clipPath: `inset(0 ${100 - baSliderValue}% 0 0)`,
                  WebkitClipPath: `inset(0 ${100 - baSliderValue}% 0 0)`,
                }}
              >
                <img
                  src={BEFORE_AFTER_DATA[baIndex].beforeImage}
                  alt={`${BEFORE_AFTER_DATA[baIndex].title} - Before`}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>

              {/* Divider Line & Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.6)] z-10 pointer-events-none"
                style={{ left: `${baSliderValue}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center shadow-lg">
                  <ChevronLeft size={11} className="text-slate-700 -mr-0.5" />
                  <ChevronRight size={11} className="text-slate-700 -ml-0.5" />
                </div>
              </div>

              {/* Before badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider rounded shadow-md pointer-events-none">
                BEFORE
              </div>

              {/* After badge */}
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider rounded shadow-md pointer-events-none">
                AFTER
              </div>

              {/* Helper badge */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium rounded-full pointer-events-none shadow-md">
                ↔ Slide to compare
              </div>

              {/* Range slider - full touch surface */}
              <input
                type="range"
                min="0"
                max="100"
                value={baSliderValue}
                onChange={(e) => setBaSliderValue(Number(e.target.value))}
                className="absolute inset-0 z-20 opacity-0 cursor-ew-resize w-full h-full touch-pan-x"
                style={{ WebkitAppearance: 'none' }}
                aria-label="Comparison slider"
              />
            </div>

            {/* Info Side */}
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 mb-3">
                {BEFORE_AFTER_DATA[baIndex].title}
              </h3>

              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="w-6 h-6 bg-red-200 text-red-700 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={13} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-red-600 uppercase mb-0.5">Before</div>
                    <p className="text-xs text-red-800">{BEFORE_AFTER_DATA[baIndex].beforeDesc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <div className="w-6 h-6 bg-emerald-200 text-emerald-700 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={13} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-600 uppercase mb-0.5">After</div>
                    <p className="text-xs text-emerald-800">{BEFORE_AFTER_DATA[baIndex].afterDesc}</p>
                  </div>
                </div>
              </div>

              {/* Gallery nav buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1 w-full sm:w-auto">Select Service:</span>
                {BEFORE_AFTER_DATA.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { setBaIndex(idx); setBaSliderValue(50); }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      idx === baIndex
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-slate-900'
                    }`}
                  >
                    {item.title.split(' ').slice(0, 2).join(' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DEDICATED 4-SERVICE PILLARS DEEP-DIVE - STRICTLY RECTANGULAR */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Specialized Service Pillars
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Every home is unique. Choose your requirements with clear, transparent upfront pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Sofa Cleaning Pillar */}
            <div className="rounded-none border border-slate-200 bg-white p-4 flex flex-col justify-between hover:border-slate-900 transition-all">
              <div>
                <div className="aspect-[16/10] rounded-none overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                  <img
                    src="/images/services/sofa-cleaning.jpg"
                    alt="HomeEase Sofa Cleaning Specialist"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Sofa & Upholstery Care</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Injection-extraction foam wash for 1 to 10 seaters. Removes sweat stains, dust mites, and odors.
                </p>
                <ul className="mt-3 space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#176B52]" />
                    <span>Fabric, velvet & leather conditioning</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#176B52]" />
                    <span>Dry vacuuming & cushion sanitization</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#176B52]" />
                    <span>Dries in 2–3 hours with fans</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">From ₹149/seat</span>
                <Link
                  to="/services/sofa-deep-cleaning"
                  className="px-3 py-1.5 rounded-none bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  Configure Seats
                </Link>
              </div>
            </div>

            {/* Home Deep Cleaning Pillar */}
            <div className="rounded-none border border-slate-200 bg-white p-4 flex flex-col justify-between hover:border-slate-900 transition-all">
              <div>
                <div className="aspect-[16/10] rounded-none overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                  <img
                    src="/images/services/home-cleaning.jpg"
                    alt="HomeEase Full Home Cleaning Specialist"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Full Home Deep Cleaning</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Intensive crew service with single-disc floor scrubbers, kitchen degreasing, and bath descaling.
                </p>
                <ul className="mt-3 space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#176B52]" />
                    <span>1 BHK to 4 BHK & Villa packages</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#176B52]" />
                    <span>Window track suction & balcony wash</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#176B52]" />
                    <span>Diversey certified non-toxic supplies</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">From ₹3,499</span>
                <Link
                  to="/services/2bhk-home-deep-cleaning"
                  className="px-3 py-1.5 rounded-none bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  Select BHK
                </Link>
              </div>
            </div>

            {/* AC Servicing Pillar */}
            <div className="rounded-none border border-slate-200 bg-white p-4 flex flex-col justify-between hover:border-slate-900 transition-all">
              <div>
                <div className="aspect-[16/10] rounded-none overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                  <img
                    src="/images/services/ac-repair.jpg"
                    alt="HomeEase AC Servicing Specialist"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm text-slate-900">AC Power Jet Servicing</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  High-pressure coil wash with waterproof jacket. Eliminates odor, boosts cooling, and cuts electricity bills.
                </p>
                <ul className="mt-3 space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#176B52]" />
                    <span>Split & window power jet wash</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#176B52]" />
                    <span>Digital gas pressure & cooling check</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#176B52]" />
                    <span>Outdoor condenser unit coil wash</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">From ₹549</span>
                <Link
                  to="/services/ac-power-jet-servicing"
                  className="px-3 py-1.5 rounded-none bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  Select AC Units
                </Link>
              </div>
            </div>

            {/* Washing Machine Service Pillar */}
            <div className="rounded-none border border-slate-200 bg-white p-4 flex flex-col justify-between hover:border-slate-900 transition-all">
              <div>
                <div className="aspect-[16/10] rounded-none overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                  <img
                    src="/images/services/washing-machine.jpg"
                    alt="HomeEase Washing Machine Repair Specialist"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Washing Machine Repair</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Drum descaling, filter clearance, and diagnostics for front load, top load, and semi-automatic machines.
                </p>
                <ul className="mt-3 space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#176B52]" />
                    <span>Citric acid high-temp scale dissolution</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#176B52]" />
                    <span>Vibration & drum spin diagnostic</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#176B52]" />
                    <span>Drain pump and inlet mesh clearing</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">From ₹499</span>
                <Link
                  to="/services/washing-machine-service-repair"
                  className="px-3 py-1.5 rounded-none bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  Book Diagnosis
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================== REFERRAL PROGRAM ===================== */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden border border-slate-200 rounded-none bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 text-[11px] font-bold rounded-none border border-amber-500/30 mb-3">
                  <Gift size={13} />
                  <span>Refer & Earn Program</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
                  Give ₹250, Get ₹250
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-4 max-w-md">
                  Share your exclusive referral code with friends & family. When they book their first HomeEase service, 
                  <strong className="text-white"> both of you receive ₹250 off</strong> your next booking!
                </p>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>No limits on referrals</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Credit applied instantly</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Stackable with coupons</span>
                  </div>
                </div>
              </div>

              {/* Right - Referral Code Card */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-none p-5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Your Referral Code
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 px-4 py-3 bg-white/10 border border-dashed border-white/30 rounded-none text-center">
                    <span className="text-xl font-extrabold text-white tracking-[0.15em]">HOMEEASE250</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    className={`px-3 py-3 rounded-none font-bold text-xs transition-all cursor-pointer ${
                      referralCopied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {referralCopied ? (
                      <span className="flex items-center gap-1"><Check size={13} /> Copied!</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy size={13} /> Copy</span>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={BRAND_CONFIG.contact.whatsappUrl + '?text=' + encodeURIComponent('Hey! Use my referral code HOMEEASE250 on HomeEase to get ₹250 off your first home service booking! 🏠✨')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-[#25D366] hover:bg-[#1da855] text-white font-bold text-xs rounded-none text-center transition-colors"
                  >
                    Share on WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'HomeEase Referral',
                          text: 'Use my code HOMEEASE250 to get ₹250 off your first HomeEase service! 🏠',
                          url: window.location.origin,
                        });
                      }
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs rounded-none transition-colors cursor-pointer"
                  >
                    Share Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 3-STEP BOOKING JOURNEY - RECTANGULAR */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Simple & Transparent
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            How HomeEase Works
          </h2>
          <p className="text-slate-500 text-xs max-w-lg mx-auto mt-1">
            Book professional service to your exact doorstep in three straightforward steps.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-5 rounded-none bg-white border border-slate-200">
              <div className="w-8 h-8 rounded-none bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-3">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Select & Tailor Your Service</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose your exact service requirements: seater count for sofas, BHK size for deep cleaning, or appliance type. View instant, fixed upfront pricing.
              </p>
            </div>

            <div className="p-5 rounded-none bg-white border border-slate-200">
              <div className="w-8 h-8 rounded-none bg-[#176B52] text-white font-bold text-xs flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Confirm Doorstep on Google Maps</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pinpoint your exact apartment or society gate with our integrated Google Maps picker, and choose a convenient 2-hour arrival slot.
              </p>
            </div>

            <div className="p-5 rounded-none bg-white border border-slate-200">
              <div className="w-8 h-8 rounded-none bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Verified Pro Arrives with Warranty</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our background-checked expert arrives on time with industrial equipment. Inspect the completed service and enjoy our 30-day rework guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SERVICE AREA / PINCODE CHECKER ===================== */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left - Checker */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-none border border-blue-200 mb-3">
                <MapPinned size={13} />
                <span>Service Area Checker</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                Check if We Serve Your Area
              </h2>
              <p className="text-xs text-slate-500 mb-5 max-w-md leading-relaxed">
                Enter your 6-digit pincode to instantly verify whether HomeEase operates in your neighborhood within Junagadh, Gujarat.
              </p>

              <div className="flex items-stretch gap-2 max-w-sm mb-4">
                <input
                  type="text"
                  value={pincodeInput}
                  onChange={(e) => {
                    setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setPincodeResult({ status: null });
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePincodeCheck()}
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 shadow-xs"
                />
                <button
                  type="button"
                  onClick={handlePincodeCheck}
                  disabled={pincodeInput.length !== 6}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
                >
                  Check
                </button>
              </div>

              {/* Result */}
              {pincodeResult.status === 'serviceable' && (
                <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl max-w-sm animate-fadeIn">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-emerald-800">Great news! We serve your area 🎉</div>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      <strong>{pincodeResult.area}</strong> ({pincodeInput}) is fully covered by HomeEase.
                    </p>
                    <Link to="/services" className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1.5 hover:text-emerald-900 transition-colors">
                      <span>Browse services</span>
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              )}

              {pincodeResult.status === 'not-serviceable' && (
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl max-w-sm animate-fadeIn">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-amber-800">Not yet available in {pincodeInput}</div>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      We're expanding rapidly! Leave your contact and we'll notify you upon launch.
                    </p>
                    <Link to="/contact" className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 mt-1.5 hover:text-amber-900 transition-colors">
                      <span>Notify me</span>
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right - Covered Areas */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
                <BadgeCheck size={15} className="text-[#176B52]" />
                Currently Active Zones
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(SERVICEABLE_PINCODES).slice(0, 8).map(([pin, area]) => (
                  <div key={pin} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{pin}</span>
                    <span className="text-slate-600 truncate">{area}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
                <MapPin size={10} />
                <span>Expanding to Rajkot, Bhavnagar & Ahmedabad soon</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GENUINE CUSTOMER REVIEWS - RECTANGULAR CARDS */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Customer Feedback
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Verified Reviews in Junagadh
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Real reviews from verified households across Junagadh, Gujarat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.slice(0, 3).map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-none border border-slate-200 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                      Verified Booking
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-none bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{rev.userName}</div>
                    <div className="text-[10px] text-slate-500">{rev.serviceTitle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION - RECTANGULAR */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Have Questions?
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-2">
            {homeFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-none border border-slate-200 bg-white overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-4 text-xs font-bold text-slate-900 hover:bg-slate-50 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-slate-900' : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-3 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CLEAN COMMERCIAL BOTTOM CTA */}
      <section className="py-10 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                Ready to book your home service?
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Choose a service, select your preferred arrival slot, and let our verified technicians handle the rest.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/services"
                className="px-5 py-2.5 rounded-none bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-colors cursor-pointer"
              >
                Browse All Services
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
