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
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useStoreData, DataStore } from '../lib/store';
import { RatingStars } from '../components/common/RatingStars';
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

  // Dynamic customization state from Studio
  const [customConfig, setCustomConfig] = useState<CustomizedServiceConfig | null>(null);

  // Review submission modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-none p-8 max-w-md w-full text-center border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Service Not Found</h2>
          <p className="text-xs text-slate-500 mt-1.5">
            The service you requested may have been relocated or deactivated.
          </p>
          <Link
            to="/services"
            className="mt-4 inline-block px-4 py-2 rounded-none bg-slate-900 text-white text-xs font-bold"
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
        <nav className="text-xs text-slate-400 mb-5 flex items-center gap-1.5 font-medium">
          <Link to="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link to="/services" className="hover:text-slate-900">Services</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate max-w-sm">{service.title}</span>
        </nav>

        {/* Main Grid: Details & Customizer (8 cols) + Sticky Summary Card (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Gallery, Customizer Studio & Service Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Urban Company High Quality Image Showcase - Strictly Rectangular */}
            <div className="bg-white rounded-none p-4 sm:p-5 border border-slate-200">
              
              {/* Main Photo Viewer */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-none overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={gallery[activeImageIndex]}
                  alt={`${service.title} - Service in action`}
                  className="w-full h-full object-cover"
                />

                {/* Top Badges - Crisp Rectangular */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                  <div className="flex items-center gap-2">
                    {service.isPopular && (
                      <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-slate-900 text-white flex items-center gap-1 tracking-wider uppercase">
                        Popular Choice
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-white text-slate-900 border border-slate-300 flex items-center gap-1">
                      <Clock size={11} className="text-[#176B52]" />
                      <span>{service.durationMinutes} mins</span>
                    </span>
                  </div>

                  <span className="text-[10px] font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded-none border border-slate-300">
                    {activeImageIndex + 1} of {gallery.length} Photos
                  </span>
                </div>

                {/* Bottom Realistic Caption & Watermark */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-none">
                  <div className="flex items-center gap-1.5 bg-black/75 px-2.5 py-1 rounded-none border border-white/20">
                    <Camera size={12} className="text-emerald-400" />
                    <span className="font-semibold text-[11px]">Real Service Photography</span>
                    <span className="text-white/70 text-[10px] hidden sm:inline">• Certified Junagadh Expert</span>
                  </div>
                </div>
              </div>

              {/* Thumbnails - Crisp Rectangular */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 overflow-x-auto pb-1">
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
                      onClick={() => setActiveImageIndex(idx)}
                      className={`group relative flex-1 sm:flex-initial sm:w-28 rounded-none overflow-hidden border transition-all text-left cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-slate-900 ring-1 ring-slate-900'
                          : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                      }`}
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                        <img
                          src={img}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-1 px-1.5 bg-white text-[10px] font-semibold text-slate-700 truncate border-t border-slate-100">
                        {captions[idx] || `Photo ${idx + 1}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Service Header Overview - Crisp Rectangular */}
            <div className="bg-white rounded-none p-5 sm:p-6 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded-none text-xs font-bold">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  <span>{service.rating.toFixed(2)}</span>
                </div>
                <span className="text-xs text-slate-500">
                  ({service.reviewCount} verified reviews)
                </span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <MapPin size={12} className="text-[#176B52]" />
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
                  <BadgeCheck size={16} className="text-[#176B52] shrink-0" />
                  <span>Verified Professionals</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <ShieldCheck size={16} className="text-[#176B52] shrink-0" />
                  <span>Transparent Pricing</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Clock size={16} className="text-[#176B52] shrink-0" />
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

            {/* What is Included / Excluded - Crisp Rectangular */}
            <div className="bg-white rounded-none p-5 sm:p-6 border border-slate-200 space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                What is Included in This Service
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {service.includedItems.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 rounded-none bg-slate-50 border border-slate-200">
                    <CheckCircle2 size={14} className="text-[#176B52] shrink-0 mt-0.5" />
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

            {/* FAQ Accordion - Crisp Rectangular */}
            {service.faqList && service.faqList.length > 0 && (
              <div className="bg-white rounded-none p-5 sm:p-6 border border-slate-200 space-y-3">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Service Specific Questions
                </h2>
                <div className="space-y-2">
                  {service.faqList.map((faq: { question: string; answer: string }, idx: number) => (
                    <div key={idx} className="rounded-none border border-slate-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        className="w-full p-3 text-left flex items-center justify-between text-xs font-bold text-slate-900 hover:bg-slate-50 cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaqIndex === idx && (
                        <div className="px-3 pb-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2 bg-slate-50/50">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section - Crisp Rectangular */}
            <div className="bg-white rounded-none p-5 sm:p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Verified Customer Reviews
                </h2>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="text-xs font-bold text-slate-900 hover:underline cursor-pointer"
                >
                  Write a Review
                </button>
              </div>

              {serviceReviews.length > 0 ? (
                <div className="space-y-2.5">
                  {serviceReviews.map((rev: Review) => (
                    <div key={rev.id} className="p-3.5 rounded-none border border-slate-200 bg-slate-50/50">
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

          {/* RIGHT COLUMN: STICKY BOOKING SUMMARY CARD (4 COLS) - CRISP RECTANGULAR */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="bg-white rounded-none p-5 border border-slate-300 shadow-2xs space-y-5">
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

              {/* Guarantees Box - Crisp Rectangle */}
              <div className="p-3 rounded-none bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
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

              {/* Action Buttons - Urban Company Crisp Rectangular */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="w-full py-3 rounded-none bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                  className="w-full py-2.5 rounded-none bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
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

            {/* Need Assistance Card - Crisp Rectangle */}
            <div className="bg-white rounded-none p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-900">Have questions about this service?</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Chat or call our Gujarat customer desk at <strong>{WHATSAPP_DISPLAY}</strong>.
              </p>
              <button
                type="button"
                onClick={() => openWhatsApp({ customMessage: `Hello HomeEase! 👋 I have a question about ${service.title}.` })}
                className="w-full py-2 rounded-none bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-300 cursor-pointer"
              >
                <span>Chat with Customer Desk</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Action Bar - Crisp Rectangles */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-300 p-3 px-4 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-slate-900">
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
          className="px-5 py-2.5 rounded-none bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Book Now</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Review Modal - Crisp Rectangle */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-none p-6 max-w-md w-full border border-slate-300 shadow-xl space-y-4">
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
                      className="p-1 cursor-pointer"
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
                  className="w-full p-2.5 rounded-none border border-slate-300 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-3.5 py-2 rounded-none border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-none bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
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
