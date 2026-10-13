import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: number;
  showScore?: boolean;
  reviewCount?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  max = 5,
  size = 15,
  showScore = true,
  reviewCount,
}) => {
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <Star
              key={i}
              size={size}
              className={`${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : half
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-slate-200 fill-slate-100'
              }`}
            />
          );
        })}
      </div>
      {showScore && (
        <span className="font-semibold text-slate-800 text-xs">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-slate-400 text-xs font-normal">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
