import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Check, ArrowRight, Star } from 'lucide-react';
import { Service } from '../../types';
import { BRAND_CONFIG } from '../../config/brand';
import { openWhatsApp } from '../../lib/whatsapp';

interface ServiceCardProps {
  service: Service;
  featured?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, featured = false }) => {
  const navigate = useNavigate();

  const discount = service.originalPrice
    ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
    : 0;

  return (
    <div
      className={`group bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300 flex flex-col ${
        featured ? 'ring-1 ring-slate-900/10' : ''
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={service.imageUrl}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {discount > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#176B52] text-white shadow-xs">
              {discount}% OFF
            </span>
          )}
          {service.isPopular && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#22252B] text-white shadow-xs">
              Popular
            </span>
          )}
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-white/95 text-slate-800 px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-xs border border-slate-200">
          <Clock size={11} className="text-slate-500" />
          <span>{service.durationMinutes} mins</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded text-[11px] font-bold">
              <Star size={11} className="fill-amber-500 text-amber-500" />
              <span>{service.rating.toFixed(2)}</span>
            </span>
            <span className="text-[11px] text-slate-500">
              ({service.reviewCount} reviews)
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/services/${service.slug}`}
            className="block font-bold text-slate-900 text-sm hover:text-slate-700 transition-colors line-clamp-2 leading-snug"
          >
            {service.title}
          </Link>

          {/* Short description */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {service.shortDescription}
          </p>

          {/* Key included highlights */}
          <div className="mt-3 space-y-1 border-t border-slate-100 pt-2.5">
            {service.includedItems.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                <Check size={12} className="text-[#176B52] shrink-0 mt-0.5" />
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Starting at</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                {BRAND_CONFIG.currency.symbol}{service.price}
              </span>
              {service.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {BRAND_CONFIG.currency.symbol}{service.originalPrice}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => openWhatsApp({
                serviceTitle: service.title,
                price: service.price,
              })}
              className="p-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white transition-all border border-[#25D366]/20"
              title="Inquire directly on WhatsApp: 9016526419"
              aria-label="Direct WhatsApp"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.301-.15-1.783-.879-2.06-.979-.277-.1-.479-.15-.68.15-.202.301-.78 1.002-.956 1.203-.176.201-.353.226-.653.075s-1.27-.468-2.42-1.493c-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.151-.176.201-.301.302-.502.1-.201.05-.376-.025-.526-.075-.15-.68-1.639-.93-2.242-.244-.588-.493-.508-.68-.518-.176-.008-.377-.01-.578-.01-.201 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511s1.08 2.912 1.231 3.113c.151.201 2.126 3.245 5.15 4.552.72.311 1.282.497 1.72.636.724.23 1.383.198 1.904.12.58-.087 1.783-.728 2.034-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.981-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.642 0-3.167-.487-4.453-1.326l-.32-.208-2.955.836.84-2.882-.218-.337A8.17 8.17 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2z"/>
              </svg>
            </button>
            <Link
              to={`/services/${service.slug}`}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              Details
            </Link>
            <button
              type="button"
              onClick={() => navigate(`/book?serviceId=${service.id}`)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#176B52] hover:bg-[#135742] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>Book</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
