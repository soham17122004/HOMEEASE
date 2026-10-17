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
      {/* Live Operational Beacon Pill - Crisp Rectangle */}
      <div className="flex items-center justify-center mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-white text-xs font-semibold text-slate-800 shadow-2xs border border-slate-300">
          <span className="w-2 h-2 rounded-none bg-emerald-600 inline-block" />
          <span className="font-bold text-slate-900">Live Field Operations:</span>
          <span className="text-slate-600">Technicians active in Junagadh & nearby zones</span>
        </div>
      </div>

      {/* Grid of Dynamic Metric Cards - Crisp Rectangles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STATS_DATA.map((stat) => {
          const Icon = stat.icon;
          const displayValue = stat.decimals
            ? (counts[stat.id] ?? 0).toFixed(stat.decimals)
            : (counts[stat.id] ?? 0).toLocaleString();

          return (
            <div
              key={stat.id}
              className="relative p-4 rounded-none bg-white border border-slate-200 hover:border-slate-800 transition-all group overflow-hidden"
            >
              <div className="flex items-start justify-between mb-2.5">
                <div className="w-8 h-8 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <Icon size={16} strokeWidth={2.2} />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-none border border-emerald-200">
                  <Clock size={10} /> Live
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-0.5">
                <span>{displayValue}</span>
                <span className="text-[#176B52] font-bold text-base sm:text-lg">
                  {stat.suffix}
                </span>
              </div>

              <div className="font-bold text-xs text-slate-900 mt-0.5">
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
