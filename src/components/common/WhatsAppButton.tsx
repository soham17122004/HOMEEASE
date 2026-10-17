import React, { useState } from 'react';
import { X } from 'lucide-react';
import { WHATSAPP_DISPLAY, openWhatsApp } from '../../lib/whatsapp';

export const WhatsAppButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  const handleClick = () => {
    openWhatsApp({
      customMessage: 'Hello HomeEase! 👋 I need assistance or want to book a home service in Gujarat.',
    });
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex items-center gap-2">
      {/* Interactive Tooltip bubble - Desktop only so it never blocks mobile screens */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-slate-900 text-xs font-semibold px-3 py-2 rounded-xl shadow-lg border border-slate-200 animate-fadeIn relative">
          <div className="w-2 h-2 rounded-full bg-[#25D366] shrink-0" />
          <span>Chat on WhatsApp: <strong>{WHATSAPP_DISPLAY}</strong></span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
            title="Dismiss tooltip"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Primary WhatsApp floating button - Sleek circular FAB on mobile, pill on desktop */}
      <button
        type="button"
        onClick={handleClick}
        aria-label="Direct WhatsApp Support: 9016526419"
        className="group relative flex items-center gap-2 p-3 sm:px-4 sm:py-3 rounded-full sm:rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer border-2 border-white/80"
      >
        <span className="w-6 h-6 text-white flex items-center justify-center shrink-0">
          {/* WhatsApp Brand Icon */}
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.301-.15-1.783-.879-2.06-.979-.277-.1-.479-.15-.68.15-.202.301-.78 1.002-.956 1.203-.176.201-.353.226-.653.075s-1.27-.468-2.42-1.493c-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.151-.176.201-.301.302-.502.1-.201.05-.376-.025-.526-.075-.15-.68-1.639-.93-2.242-.244-.588-.493-.508-.68-.518-.176-.008-.377-.01-.578-.01-.201 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511s1.08 2.912 1.231 3.113c.151.201 2.126 3.245 5.15 4.552.72.311 1.282.497 1.72.636.724.23 1.383.198 1.904.12.58-.087 1.783-.728 2.034-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.981-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.642 0-3.167-.487-4.453-1.326l-.32-.208-2.955.836.84-2.882-.218-.337A8.17 8.17 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2z" />
          </svg>
        </span>
        <div className="text-left hidden sm:block">
          <div className="text-[10px] uppercase font-bold text-white/90 tracking-wider leading-none">Instant Help</div>
          <div className="text-xs font-bold text-white mt-0.5">WhatsApp</div>
        </div>
      </button>
    </div>
  );
};
