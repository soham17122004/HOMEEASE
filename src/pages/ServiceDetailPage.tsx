import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  BadgeCheck,
  Receipt,
  Sparkles,
  ArrowRight,
  Check,
  ChevronDown,
  Star,
  MapPin,
  Lock,
  Camera,
  Play,
  Film,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useStoreData, DataStore } from '../lib/store';
import { RatingStars } from '../components/common/RatingStars';
import { ServiceVideoPlayer } from '../components/common/ServiceVideoPlayer';
import {
  ServiceCustomizerStudio,
  CustomizedServiceConfig,
} from '../components/common/ServiceCustomizerStudio';
import { Service, Review } from '../types';
import { openWhatsApp, WHATSAPP_DISPLAY } from '../lib/whatsapp';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { services, reviews, currentUser, selectedCity } = useStoreData();

  useEffect(() => {
    DataStore.syncWithBackend();
  }, []);

  const service = services.find((s: Service) => s.slug === slug || s.id === slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [mediaMode, setMediaMode] = useState<'video' | 'photos'>(service?.videoUrl ? 'video' : 'photos');

  // Dynamic customization state from Studio
  const [customConfig, setCustomConfig] = useState<CustomizedServiceConfig | null>(null);

  // Review submission modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Service Not Found</h2>
          <p className="text-xs text-slate-500 mt-1.5">
            The service you requested may have been relocated or deactivated.
          </p>
          <Link
            to="/services"
            className="mt-4 inline-block px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold"
          >
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const gallery = service.galleryUrls && service.galleryUrls.length > 0
    ? service.galleryUrls
    : [service.imageUrl];

  const currentPrice = customConfig?.calculatedPrice ?? service.price;
  const currentOriginalPrice = customConfig?.originalPrice ?? service.originalPrice ?? Math.round(service.price * 1.35);

  const handleBookNow = () => {
    const params = new URLSearchParams();
    params.set('serviceId', service.id);
    if (customConfig) {
      params.set('price', String(customConfig.calculatedPrice));
      params.set('tier', customConfig.summaryLabel);
    }
    navigate(`/book?${params.toString()}`);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    DataStore.addReview({
      serviceId: service.id,
      serviceTitle: service.title,
      userId: currentUser?.id || 'guest',
      userName: currentUser?.fullName || 'Verified Customer',
      rating: reviewRating,
      comment: reviewComment.trim(),
      verifiedBooking: true,
    });

    setReviewComment('');
    setShowReviewModal(false);
  };

  const serviceReviews = reviews.filter((r: Review) => r.serviceId === service.id);

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 sm:py-8 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-slate-400 mb-6 flex items-center gap-1.5 font-medium">
          <Link to="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link to="/services" className="hover:text-slate-900">Services</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate max-w-sm">{service.title}</span>
        </nav>

        {/* Main Grid: Details & Customizer (8 cols) + Sticky Summary Card (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Gallery, Customizer Studio & Service Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Premium Realistic Service Media Card: Video & Photography Showcase */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              
              {/* Media Switcher Tab Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {service.videoUrl && (
                    <button
                      type="button"
                      onClick={() => setMediaMode('video')}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                        mediaMode === 'video'
                          ? 'bg-[#176B52] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
                      </span>
                      <Play size={12} className="fill-current" />
                      <span>Real Service Video</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setMediaMode('photos')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      mediaMode === 'photos'
                        ? 'bg-[#176B52] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Camera size={13} />
                    <span>Real Photos ({gallery.length})</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                  <ShieldCheck size={13} className="text-[#176B52]" />
                  <span>Junagadh Doorstep Verified</span>
                </div>
              </div>

              {/* MEDIA CONTAINER: Video Player OR Photo Viewer */}
              {mediaMode === 'video' && service.videoUrl ? (
                <div className="space-y-3">
                  <ServiceVideoPlayer
                    videoUrl={service.videoUrl}
                    posterUrl={service.videoPosterUrl || service.imageUrl}
                    title={service.videoTitle || `${service.title} - Real Service In Action`}
                    technicianName="Specialist Rajesh V."
                    technicianRole="Senior Service Professional"
                    autoPlay={false}
                  />

                  {/* Video Caption & Verification Note */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Film size={14} className="text-[#176B52] shrink-0" />
                      <span className="font-semibold text-slate-900 text-[11px] sm:text-xs">
                        {service.videoTitle || 'Real Service Demonstration with Certified Specialist'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">
                      Standardized SOP
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 group">
                    <img
                      src={gallery[activeImageIndex]}
                      alt={`${service.title} - Real Service In Action`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    />

                    {/* Subtle contrast gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 pointer-events-none">
                        {service.isPopular && (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-900/90 text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
                            <Sparkles size={11} className="text-amber-400" />
                            <span>Popular Choice</span>
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/95 text-slate-900 border border-white/40 shadow-xs backdrop-blur-xs flex items-center gap-1">
                          <Clock size={11} className="text-[#176B52]" />
                          <span>{service.durationMinutes} mins</span>
                        </span>
                      </div>

                      {/* Play Video Quick Trigger */}
                      {service.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setMediaMode('video')}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1 transition-all hover:scale-105"
                        >
                          <Play size={11} className="fill-white" />
                          <span>Watch Video Demo</span>
                        </button>
                      )}
                    </div>

                    {/* Bottom Realistic Caption & Watermark */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-none">
                      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/15">
                        <Camera size={12} className="text-emerald-400" />
                        <span className="font-semibold text-[11px]">Real Service Photography</span>
                        <span className="text-white/60 text-[10px] hidden sm:inline">• Certified Technician At Work</span>
                      </div>

                      <div className="text-[11px] font-medium text-white/80 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                        {activeImageIndex + 1} / {gallery.length}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <div className="flex items-center gap-2.5 mt-3 pt-2 border-t border-slate-100 overflow-x-auto pb-1">
                    {/* Video Quick Thumbnail */}
                    {service.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setMediaMode('video')}
                        className={`group relative flex-1 sm:flex-initial sm:w-28 rounded-lg overflow-hidden border transition-all text-left ${
                          mediaMode === 'video'
                            ? 'border-emerald-700 ring-2 ring-emerald-700/20'
                            : 'border-slate-200 hover:border-emerald-700'
                        }`}
                      >
                        <div className="aspect-[16/10] w-full overflow-hidden bg-slate-900 relative flex items-center justify-center">
                          <img
                            src={service.videoPosterUrl || service.imageUrl}
                            alt="Video Thumbnail"
                            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg group-hover:bg-[#176B52] group-hover:text-white transition-colors">
                            <Play size={14} className="fill-current ml-0.5" />
                          </div>
                        </div>
                        <div className="p-1 px-1.5 bg-slate-900 text-[10px] font-bold text-white truncate text-center">
                          ▶ Video Demo
                        </div>
                      </button>
                    )}

                    {gallery.map((img: string, idx: number) => {
                      const captions = [
                        'Overview & Prep',
                        'Service in Action',
                        'Pristine Result',
                      ];
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setMediaMode('photos');
                            setActiveImageIndex(idx);
                          }}
                          className={`group relative flex-1 sm:flex-initial sm:w-28 rounded-lg overflow-hidden border transition-all text-left ${
                            mediaMode === 'photos' && activeImageIndex === idx
                              ? 'border-emerald-700 ring-2 ring-emerald-700/20'
                              : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                            <img
                              src={img}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-1 px-1.5 bg-white text-[10px] font-semibold text-slate-700 truncate border-t border-slate-100">
                            {captions[idx] || `Snapshot ${idx + 1}`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Service Header Overview */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  <span>{service.rating.toFixed(2)}</span>
                </div>
                <span className="text-xs text-slate-500">
                  ({service.reviewCount} verified reviews)
                </span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <MapPin size={12} className="text-emerald-700" />
                  <span>Available in {selectedCity}, Gujarat</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {service.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {service.description}
              </p>

              {/* 3 Pillars strip */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <BadgeCheck size={16} className="text-emerald-700 shrink-0" />
                  <span>Verified Professionals</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                  <span>Transparent Pricing</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Clock size={16} className="text-emerald-700 shrink-0" />
                  <span>On-Time Arrival</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE CUSTOMIZATION STUDIO (Sofa, Home, AC, Washing Machine) */}
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={13} className="text-slate-600" />
                <span>Customize Package & Real-Time Pricing</span>
              </div>
              <ServiceCustomizerStudio
                serviceSlug={service.slug}
                categoryId={service.categoryId}
                basePrice={service.price}
                onChange={(config: CustomizedServiceConfig) => setCustomConfig(config)}
                onProceedToBooking={handleBookNow}
              />
            </div>

            {/* What is Included / Excluded */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-5">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                What is Included in This Service
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.includedItems.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <CheckCircle2 size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-800 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>

              {service.excludedItems.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    What is Not Included
                  </h3>
                  <div className="space-y-1.5">
                    {service.excludedItems.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-500">
                        <XCircle size={13} className="text-slate-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FAQ Accordion */}
            {service.faqList && service.faqList.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Service Specific Questions
                </h2>
                <div className="space-y-2">
                  {service.faqList.map((faq: { question: string; answer: string }, idx: number) => (
                    <div key={idx} className="rounded-lg border border-slate-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        className="w-full p-3 text-left flex items-center justify-between text-xs font-bold text-slate-900 hover:bg-slate-50"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaqIndex === idx && (
                        <div className="px-3 pb-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Verified Customer Reviews
                </h2>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="text-xs font-bold text-slate-900 hover:underline"
                >
                  Write a Review
                </button>
              </div>

              {serviceReviews.length > 0 ? (
                <div className="space-y-3">
                  {serviceReviews.map((rev: Review) => (
                    <div key={rev.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="font-bold text-xs text-slate-900">{rev.userName}</div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className={i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-2">
                  No customer reviews submitted yet. Book this service and be the first to review!
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY BOOKING SUMMARY CARD (4 COLS) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-5">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Fixed Transparent Price
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {BRAND_CONFIG.currency.symbol}{currentPrice}
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    {BRAND_CONFIG.currency.symbol}{currentOriginalPrice}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1 font-medium">
                  {customConfig?.summaryLabel || service.title}
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-[#176B52]" />
                  <span>30-Day Service Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-[#176B52]" />
                  <span>No cancellation fee before pro dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-[#176B52]" />
                  <span>Verified technician arrival across Gujarat</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="w-full py-3.5 rounded-xl bg-[#176B52] hover:bg-[#135742] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Book Online Now</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => openWhatsApp({
                    serviceTitle: service.title,
                    price: currentPrice,
                    customMessage: `Hello HomeEase! 👋 I want to book: ${service.title} (Starting at ₹${currentPrice}). Please confirm availability for today/tomorrow.`,
                  })}
                  className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer"
                  title={`Book on WhatsApp: ${WHATSAPP_DISPLAY}`}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.301-.15-1.783-.879-2.06-.979-.277-.1-.479-.15-.68.15-.202.301-.78 1.002-.956 1.203-.176.201-.353.226-.653.075s-1.27-.468-2.42-1.493c-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.151-.176.201-.301.302-.502.1-.201.05-.376-.025-.526-.075-.15-.68-1.639-.93-2.242-.244-.588-.493-.508-.68-.518-.176-.008-.377-.01-.578-.01-.201 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511s1.08 2.912 1.231 3.113c.151.201 2.126 3.245 5.15 4.552.72.311 1.282.497 1.72.636.724.23 1.383.198 1.904.12.58-.087 1.783-.728 2.034-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351z"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.981-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.642 0-3.167-.487-4.453-1.326l-.32-.208-2.955.836.84-2.882-.218-.337A8.17 8.17 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2z"/>
                  </svg>
                  <span>Book via WhatsApp ({WHATSAPP_DISPLAY})</span>
                </button>
              </div>

              <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <Lock size={12} className="text-slate-400" />
                <span>Zero prepayment required. Pay after service.</span>
              </div>
            </div>

            {/* Need Assistance Card */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-900">Have questions about this service?</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Chat or call our Gujarat customer desk at <strong>{WHATSAPP_DISPLAY}</strong>.
              </p>
              <button
                type="button"
                onClick={() => openWhatsApp({ customMessage: `Hello HomeEase! 👋 I have a question about ${service.title}.` })}
                className="w-full py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-emerald-200 cursor-pointer"
              >
                <span>Chat with Customer Desk</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E6E8EC] p-3 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-[#176B52]">
              {BRAND_CONFIG.currency.symbol}{currentPrice}
            </span>
            <span className="text-[11px] text-slate-400 line-through">
              {BRAND_CONFIG.currency.symbol}{currentOriginalPrice}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate max-w-[170px]">
            {customConfig?.summaryLabel || service.title}
          </div>
        </div>
        <button
          type="button"
          onClick={handleBookNow}
          className="px-5 py-2.5 rounded-xl bg-[#176B52] hover:bg-[#135742] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <span>Book Now</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Write a Customer Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        size={20}
                        className={star <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Your Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe the quality of service, technician punctuality, etc."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
