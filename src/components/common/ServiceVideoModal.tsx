import React from 'react';
import { X, ShieldCheck, CheckCircle2, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ServiceVideoPlayer } from './ServiceVideoPlayer';
import { Service } from '../../types';

interface ServiceVideoModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceVideoModal: React.FC<ServiceVideoModalProps> = ({
  service,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !service) return null;

  const videoUrl = service.videoUrl || 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Industrial_vacuum_cleaner_in_operation.webm';
  const videoTitle = service.videoTitle || `${service.title} - Real Service In Action`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#176B52] flex items-center justify-center border border-emerald-200/60 shadow-xs">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                Real Technician Demonstration
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Verified footage of our certified specialist in action
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="p-4 sm:p-6 bg-slate-900">
          <ServiceVideoPlayer
            videoUrl={videoUrl}
            posterUrl={service.videoPosterUrl || service.imageUrl}
            title={videoTitle}
            technicianName="Specialist Rajesh V."
            technicianRole="Senior Service Professional"
            autoPlay={true}
          />
        </div>

        {/* Service Summary & Quick Booking Strip */}
        <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
          <div>
            <div className="text-xs font-bold text-slate-900 line-clamp-1">
              {service.title}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
              <span className="font-extrabold text-[#176B52] text-sm">
                ₹{service.price}
              </span>
              <span>•</span>
              <span>{service.durationMinutes} mins</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> 30-Day Guarantee
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              to={`/services/${service.slug}`}
              onClick={onClose}
              className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              Full Details
            </Link>
            <Link
              to={`/book?serviceId=${service.id}`}
              onClick={onClose}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-5 py-2 rounded-xl btn-primary text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>Book This Service</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
