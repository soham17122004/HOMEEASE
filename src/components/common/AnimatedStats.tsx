import React, { useState, useEffect } from 'react';
import { ShieldCheck, Star, Users, Award, Clock } from 'lucide-react';

interface StatItem {
  id: string;
  icon: React.ElementType;
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
  detail: string;
  color: string;
}

const STATS_DATA: StatItem[] = [
  {
    id: 'bookings',
    icon: Users,
    value: 2450,
    suffix: '+',
    label: 'Happy Gujarat Homes',
    detail: 'Verified doorstep services completed',
    color: 'emerald',
  },
  {
    id: 'rating',
    icon: Star,
    value: 4.88,
    suffix: ' / 5',
    decimals: 2,
    label: 'Customer Satisfaction',
    detail: 'From 1,800+ authenticated reviews',
    color: 'amber',
  },
  {
    id: 'verified',
    icon: ShieldCheck,
    value: 100,
    suffix: '%',
    label: 'Background Verified',
    detail: 'Police & aadhaar cleared technicians',
    color: 'teal',
  },
  {
    id: 'warranty',
    icon: Award,
    value: 30,
    suffix: '-Day',
    label: 'Rework Warranty',
    detail: 'Zero questions asked re-service guarantee',
    color: 'indigo',
  },
];

export const AnimatedStats: React.FC = () => {
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    bookings: 0,
    rating: 0,
    verified: 0,
    warranty: 0,
  });

  useEffect(() => {
    const duration = 1600; // 1.6s smooth count-up
    const startTime = performance.now();

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic formula
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const nextCounts: { [key: string]: number } = {};
      STATS_DATA.forEach((stat) => {
        nextCounts[stat.id] = stat.decimals
          ? parseFloat((stat.value * easeProgress).toFixed(stat.decimals))
          : Math.floor(stat.value * easeProgress);
      });

      setCounts(nextCounts);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Ensure exact final values
        const finalCounts: { [key: string]: number } = {};
        STATS_DATA.forEach((stat) => {
          finalCounts[stat.id] = stat.value;
        });
        setCounts(finalCounts);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-full">
      {/* Live Operational Beacon Pill */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-pill text-xs font-medium text-slate-700 shadow-xs border border-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="font-semibold text-slate-900">Live Field Operations:</span>
          <span className="text-slate-600">Technicians active in Junagadh & nearby zones</span>
        </div>
      </div>

      {/* Grid of Dynamic Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {STATS_DATA.map((stat) => {
          const Icon = stat.icon;
          const displayValue = stat.decimals
            ? (counts[stat.id] ?? 0).toFixed(stat.decimals)
            : (counts[stat.id] ?? 0).toLocaleString();

          return (
            <div
              key={stat.id}
              className="relative p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover-lift group overflow-hidden"
            >
              {/* Subtle top ambient accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:bg-[#176B52] group-hover:text-white transition-all duration-300 shadow-xs">
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/60">
                  <Clock size={10} /> Live
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-0.5">
                <span>{displayValue}</span>
                <span className="text-emerald-700 font-bold text-lg sm:text-xl">
                  {stat.suffix}
                </span>
              </div>

              <div className="font-bold text-xs text-slate-900 mt-1">
                {stat.label}
              </div>

              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-1">
                {stat.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
