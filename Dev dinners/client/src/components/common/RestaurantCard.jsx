import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, Utensils, Tag, Clock, ArrowRight } from 'lucide-react';
import StarRating from './StarRating';

export default function RestaurantCard({
  restaurant,
  onOpenBooking,
  onOpenMealBuilder,
  onToggleCompare,
  isCompared = false,
}) {
  const {
    _id,
    name,
    tagline,
    images = [],
    cuisineTypes = [],
    diningStyle,
    priceForTwo,
    address = {},
    averageRating = 4.2,
    totalReviews = 0,
    distanceKm,
    featuredOffer,
    activeOffersCount = 0,
  } = restaurant;

  const coverImg = images[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Image & Badge Header */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={coverImg}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20"></div>

          {/* Dining Style Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-semibold text-white border border-white/20">
            <span>{diningStyle}</span>
          </div>

          {/* Distance Pill */}
          {distanceKm !== undefined && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-slate-800 shadow-sm">
              <MapPin className="w-3 h-3 text-brand-500" />
              <span>{distanceKm} km</span>
            </div>
          )}

          {/* Active Offer Pill */}
          {(featuredOffer || activeOffersCount > 0) && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/95 to-brand-500/95 backdrop-blur-md text-[11px] font-bold text-white shadow-md">
              <Tag className="w-3.5 h-3.5" />
              <span className="truncate">{featuredOffer || `${activeOffersCount} Special Dine-In Offers Available`}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                to={`/restaurants/${_id}`}
                className="font-bold text-base text-slate-900 hover:text-brand-600 transition line-clamp-1"
              >
                {name}
              </Link>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{address.area || 'Hyderabad'}</span>
              </p>
            </div>
            <StarRating rating={averageRating} totalReviews={totalReviews} />
          </div>

          {/* Cuisines */}
          <div className="flex flex-wrap gap-1.5">
            {cuisineTypes.slice(0, 3).map((cuisine) => (
              <span
                key={cuisine}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
              >
                {cuisine}
              </span>
            ))}
          </div>

          {/* Price & Timing */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span className="text-[10px] text-slate-400 block">Avg for Two</span>
              <span className="font-bold text-slate-900 text-sm">₹{priceForTwo}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Table Booking</span>
              <span className="font-semibold text-emerald-600 text-xs flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Instant Slots
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <button
          onClick={() => onOpenMealBuilder && onOpenMealBuilder(restaurant)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
        >
          <Utensils className="w-3.5 h-3.5 text-brand-500" />
          Meal Builder
        </button>

        <button
          onClick={() => onOpenBooking && onOpenBooking(restaurant)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-sm shadow-brand-500/20 transition"
        >
          <span>Book Table</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

