import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, totalReviews, size = 'sm', interactive = false, onRate }) {
  const stars = [1, 2, 3, 4, 5];
  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`${starSizes[size]} ${
                star <= Math.round(rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-100 text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-xs font-bold text-slate-700">
          {rating.toFixed(1)}
        </span>
      )}
      {totalReviews !== undefined && (
        <span className="text-[11px] text-slate-400 font-medium">
          ({totalReviews})
        </span>
      )}
    </div>
  );
}

