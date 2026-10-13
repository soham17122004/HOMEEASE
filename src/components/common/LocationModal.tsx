import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapPin, X, Check, Search } from 'lucide-react';
import { DataStore, useStoreData } from '../../lib/store';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Known localities and pincodes for Junagadh, Gujarat
const JUNAGADH_LOCALITIES = [
  'moti baug',
  'motibaug',
  'zanzarda road',
  'zanzarda',
  'joshipura',
  'kalva chowk',
  'timbavadi',
  'bilkha road',
  'majevadi gate',
  'college road',
  'gandhi chowk',
  'dipanjali',
  'dolatpara',
  'madhuram',
  'rayji nagar',
  'girnar road',
  'jawahar road',
  'station road',
  'sardar patel colony',
  'junagadh',
  'junagadh city',
];

const JUNAGADH_PINCODES = ['362001', '362002', '362003', '362004', '362015'];

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { selectedCity } = useStoreData();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Determine whether the search query matches Junagadh or an unsupported location
  const searchMatch = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Default: no query typed -> valid Junagadh display
    if (!query) {
      return { isJunagadh: true, matchedLocality: null };
    }

    // Direct match with Junagadh name or district
    if (query.includes('junagadh') || 'junagadh'.includes(query)) {
      return { isJunagadh: true, matchedLocality: 'Junagadh' };
    }

    // Check pincodes
    const pinMatch = JUNAGADH_PINCODES.find((pin) => pin.includes(query) || query.includes(pin));
    if (pinMatch || (query.length <= 6 && query.startsWith('362'))) {
      return { isJunagadh: true, matchedLocality: `Pincode ${pinMatch || query}` };
    }

    // Check localities
    const localityMatch = JUNAGADH_LOCALITIES.find(
      (loc) => loc.includes(query) || query.includes(loc)
    );
    if (localityMatch) {
      const formattedName = localityMatch
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return { isJunagadh: true, matchedLocality: formattedName };
    }

    // Query exists but does NOT match Junagadh
    return { isJunagadh: false, matchedLocality: null };
  }, [searchQuery]);

  const handleSelectJunagadh = () => {
    DataStore.setSelectedCity('Junagadh');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md border border-slate-200/90 shadow-xl overflow-hidden flex flex-col animate-scaleIn transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <MapPin size={18} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                Choose your service location
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Enter your location to check service availability and pricing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer -mr-1"
            title="Close dialog"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Location Input */}
        <div className="px-6 pb-4">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your area or 6-digit pincode"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 pt-1">
          {searchMatch.isJunagadh ? (
            /* Available Service City: Junagadh Only */
            <button
              type="button"
              onClick={handleSelectJunagadh}
              className="w-full text-left p-4 rounded-xl border border-emerald-600 bg-emerald-50/20 hover:bg-emerald-50/40 transition-all cursor-pointer flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={16} className="text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">Junagadh, Gujarat</span>
                    <span className="inline-flex items-center text-[10px] font-medium text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Service Available
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {searchMatch.matchedLocality
                      ? `Service available in ${searchMatch.matchedLocality}, Junagadh.`
                      : 'We currently provide home services in Junagadh.'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 font-normal">
                    Localities: Moti Baug, Zanzarda Road, Joshipura, Kalva Chowk, Timbavadi &amp; more
                  </p>
                </div>
              </div>

              {/* Selection indicator */}
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1">
                <Check size={12} strokeWidth={2.5} />
              </div>
            </button>
          ) : (
            /* Other Cities / Unsupported Location: Coming Soon */
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 text-center space-y-3">
              <div className="w-9 h-9 rounded-full bg-slate-200/70 text-slate-500 flex items-center justify-center mx-auto">
                <MapPin size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  We're coming to your city soon!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  We're expanding to more locations across Gujarat. Currently, our services are
                  available only in Junagadh.
                </p>
              </div>

              <div className="pt-1 flex flex-col items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-400 bg-slate-200/70 border border-slate-200 cursor-not-allowed select-none"
                >
                  Coming Soon
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline transition-colors cursor-pointer"
                >
                  Switch to Junagadh, Gujarat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          <span>Currently serving Junagadh, Gujarat</span>
        </div>
      </div>
    </div>
  );
};
