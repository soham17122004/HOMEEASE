import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Star,
  MapPin,
  ChevronRight,
  Sparkles,
  ChevronDown,
  Layers,
  Wrench,
  Wind,
  Check,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useStoreData, DataStore } from '../lib/store';
import { ServiceCard } from '../components/common/ServiceCard';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { services, reviews, selectedCity } = useStoreData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    DataStore.syncWithBackend();
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

  const popularServices = services.filter((s) => s.isPopular).slice(0, 4);

  // 4 Core Service Pillars with direct deep-dive
  const corePillars = [
    {
      title: 'Sofa Cleaning',
      slug: 'sofa-deep-cleaning',
      price: '₹149/seat',
      tagline: '1 to 10-seater selection, fabric & leather care',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
      icon: Layers,
    },
    {
      title: 'Home Deep Cleaning',
      slug: '2bhk-home-deep-cleaning',
      price: 'From ₹3,499',
      tagline: '1–4 BHK, kitchen degreasing & bath descaling',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      icon: Sparkles,
    },
    {
      title: 'AC Service & Repair',
      slug: 'ac-power-jet-servicing',
      price: 'From ₹549',
      tagline: 'Split & window power jet wash, gas check',
      imageUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&q=80',
      icon: Wind,
    },
    {
      title: 'Washing Machine Repair',
      slug: 'washing-machine-service-repair',
      price: 'From ₹499',
      tagline: 'Front & top load diagnostics, drum descaling',
      imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80',
      icon: Wrench,
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
      
      {/* 1. URBAN COMPANY STYLE LIGHT HERO SECTION */}
      <section className="bg-white border-b border-slate-200 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Heading, Search & Category Pillars (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Region Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
                <MapPin size={13} className="text-emerald-700" />
                <span>Operating in {selectedCity} & across Gujarat</span>
              </div>

              {/* Headline */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Expert home services, on demand.
                </h1>
                <p className="text-slate-600 text-sm sm:text-base mt-2.5 max-w-xl leading-relaxed">
                  Book background-verified specialists for sofa cleaning, full-home sanitization, AC power servicing, and appliance repairs at fixed, upfront rates.
                </p>
              </div>

              {/* Search Bar with Instant Suggestions */}
              <div className="relative max-w-xl">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <Search size={16} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="Search for 'sofa cleaning', 'AC jet wash', '2 BHK'..."
                    className="w-full pl-10 pr-28 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-4 py-2 rounded-lg bg-[#176B52] hover:bg-[#135742] text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Search
                  </button>
                </form>

                {/* Suggestions Dropdown */}
                {isSearchFocused && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-30 divide-y divide-slate-100">
                    <div className="px-3.5 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Matching Services ({filteredSuggestions.length})
                    </div>
                    {filteredSuggestions.slice(0, 4).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => navigate(`/services/${s.slug}`)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={s.imageUrl}
                            alt={s.title}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-100"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{s.title}</div>
                            <div className="text-[11px] text-slate-500">{s.durationMinutes} mins • ₹{s.price}</div>
                          </div>
                        </div>
                        <span className="text-slate-700 text-xs font-semibold flex items-center gap-0.5">
                          Book <ChevronRight size={13} />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct 4-Service Quick Grid (Signature Urban Company Grid) */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  What do you need help with today?
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {corePillars.map((pillar) => {
                    const IconComp = pillar.icon;
                    return (
                      <Link
                        key={pillar.title}
                        to={`/services/${pillar.slug}`}
                        className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs bg-slate-50/60 hover:bg-white transition-all flex flex-col justify-between group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            <IconComp size={16} />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {pillar.price}
                          </span>
                        </div>
                        <div className="mt-3">
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-slate-700">
                            {pillar.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            {pillar.tagline}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Key Trust Guarantees */}
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-700 stroke-[2.5]" />
                  <span>Police-verified experts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-700 stroke-[2.5]" />
                  <span>Standardized transparent pricing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-700 stroke-[2.5]" />
                  <span>30-day rework warranty</span>
                </div>
              </div>

            </div>

            {/* Right Column: Authentic Professional Service Photography (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80"
                  alt="Professional home cleaning specialist at work"
                  className="w-full aspect-[4/3] object-cover"
                />

                {/* Overlaid Verified Card */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                      ★
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">4.88 / 5 Rating</div>
                      <div className="text-[10px] text-slate-500">Based on 2,400+ verified Gujarat bookings</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                    Gujarat Verified
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. MOST BOOKED SERVICES IN GUJARAT */}
      <section className="py-12 bg-slate-50/50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Top Rated Packages
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Most Booked Services This Month
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Specialized treatments using certified machinery, safety kits, and trained technicians.
              </p>
            </div>
            <Link
              to="/services"
              className="mt-3 sm:mt-0 text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center gap-1 group"
            >
              <span>View all services</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularServices.map((service) => (
              <ServiceCard key={service.id} service={service} featured />
            ))}
          </div>
        </div>
      </section>

      {/* 3. DEDICATED 4-SERVICE PILLARS DEEP-DIVE */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Tailored Home Services
            </h2>
            <p className="text-slate-500 text-xs mt-1.5">
              Every home is unique. Customize your requirements dynamically with clear transparent rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Sofa Cleaning Pillar */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80"
                    alt="Sofa Cleaning"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Sofa & Upholstery Care</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Injection-extraction foam wash for 1 to 10 seaters. Removes sweat stains, dust mites, and odors.
                </p>
                <ul className="mt-3 space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-700" />
                    <span>Fabric, velvet & leather conditioning</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-700" />
                    <span>Dry vacuuming & cushion sanitization</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-700" />
                    <span>Dries in 2–3 hours with fans</span>
                  </li>
                </ul>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">From ₹149/seat</span>
                <Link
                  to="/services/sofa-deep-cleaning"
                  className="px-3 py-1.5 rounded-lg bg-[#176B52] hover:bg-[#135742] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Configure Seats
                </Link>
              </div>
            </div>

            {/* Home Deep Cleaning Pillar */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80"
                    alt="Full Home Cleaning"
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
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">From ₹3,499</span>
                <Link
                  to="/services/2bhk-home-deep-cleaning"
                  className="px-3 py-1.5 rounded-lg bg-[#176B52] hover:bg-[#135742] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Select BHK
                </Link>
              </div>
            </div>

            {/* AC Servicing Pillar */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&q=80"
                    alt="AC Servicing"
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
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">From ₹549</span>
                <Link
                  to="/services/ac-power-jet-servicing"
                  className="px-3 py-1.5 rounded-lg bg-[#176B52] hover:bg-[#135742] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Select AC Units
                </Link>
              </div>
            </div>

            {/* Washing Machine Service Pillar */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80"
                    alt="Washing Machine Repair"
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
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">From ₹499</span>
                <Link
                  to="/services/washing-machine-service-repair"
                  className="px-3 py-1.5 rounded-lg bg-[#176B52] hover:bg-[#135742] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Book Diagnosis
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. THE 3-STEP BOOKING JOURNEY */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
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

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-xl bg-white border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Select & Tailor Your Service</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose your exact service requirements: seater count for sofas, BHK size for deep cleaning, or appliance type. View instant, fixed upfront pricing.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Confirm Doorstep on Google Maps</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pinpoint your exact apartment or society gate with our integrated Google Maps picker, and choose a convenient 2-hour arrival slot.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Verified Pro Arrives with Warranty</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our background-checked expert arrives on time with industrial equipment. Inspect the completed service and enjoy our 30-day rework guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GENUINE CUSTOMER REVIEWS */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Verified Booking
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{rev.userName}</div>
                    <div className="text-[10px] text-slate-400">{rev.serviceTitle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section className="py-14 bg-slate-50/50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Have Questions?
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {homeFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-xs font-bold text-slate-900 hover:text-slate-700"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={15}
                    className={`text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-slate-900' : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CLEAN COMMERCIAL BOTTOM CTA */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Ready to book your home service?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Choose a service, select your preferred arrival slot, and let our verified technicians handle the rest.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/services"
                className="px-5 py-2.5 rounded-xl bg-[#176B52] hover:bg-[#135742] text-white text-xs font-bold transition-colors shadow-xs"
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
