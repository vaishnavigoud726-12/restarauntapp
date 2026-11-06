import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Phone,
  Sparkles,
  Utensils,
  Tag,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import API from '../../services/api';
import StarRating from '../../components/common/StarRating';
import BookingModal from '../../components/customer/BookingModal';
import MealBuilderModal from '../../components/customer/MealBuilderModal';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMealBuilderOpen, setIsMealBuilderOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/restaurants/${id}`);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-3 font-semibold">Loading restaurant details...</p>
      </div>
    );
  }

  if (!data || !data.restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <h3 className="font-bold text-lg text-slate-800">Restaurant not found</h3>
        <Link to="/" className="text-xs font-semibold text-brand-600 hover:underline">
          Return to discovery
        </Link>
      </div>
    );
  }

  const { restaurant, menuItems = [], reviews = [], activeOffers = [] } = data;

  const categories = ['All', ...new Set(menuItems.map((m) => m.category))];
  const filteredDishes =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((m) => m.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Restaurants
      </Link>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
        <div className="h-64 sm:h-80 w-full overflow-hidden relative">
          <img
            src={restaurant.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500 text-white">
                {restaurant.diningStyle}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white">
                ₹{restaurant.priceForTwo} for two
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {restaurant.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {restaurant.tagline || restaurant.description}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              {restaurant.address?.street}, {restaurant.address?.area}, {restaurant.address?.city}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsMealBuilderOpen(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition flex items-center gap-2"
            >
              <Utensils className="w-4 h-4 text-brand-400" />
              Meal Builder
            </button>
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 shadow-md shadow-brand-500/20 transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Reserve a Table
            </button>
          </div>
        </div>
      </div>

      {/* Ratings & Active Offers Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ratings Breakdown Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-sm text-slate-900">Verified Diner Ratings</h4>
            <span className="text-base font-extrabold text-amber-500">
              ★ {restaurant.averageRating?.toFixed(1) || '4.5'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { label: 'Food Taste & Quality', val: restaurant.ratingsBreakdown?.food || 4.5 },
              { label: 'Hospitality & Service', val: restaurant.ratingsBreakdown?.service || 4.2 },
              { label: 'Ambience & Hygiene', val: restaurant.ratingsBreakdown?.ambience || 4.4 },
              { label: 'Overall Experience', val: restaurant.ratingsBreakdown?.overall || 4.5 },
            ].map((metric) => (
              <div key={metric.label} className="space-y-0.5">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>{metric.label}</span>
                  <span className="font-bold text-slate-900">{metric.val.toFixed(1)}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(metric.val / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational & Features Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Timings & Amenities
          </h4>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" />
              <span>
                Operating Hours: <b>{restaurant.openingTime} - {restaurant.closingTime}</b>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-500" />
              <span>Contact: <b>{restaurant.phone}</b></span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {restaurant.features?.map((f) => (
                <span
                  key={f}
                  className="px-2 py-1 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-700"
                >
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Active Offers Card */}
        <div className="bg-gradient-to-br from-amber-50/80 to-brand-50/50 p-5 rounded-2xl border border-amber-200/80 shadow-sm space-y-3">
          <h4 className="font-bold text-sm text-amber-900 border-b border-amber-200/60 pb-2 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-brand-500" />
            Active Dine-In Perks
          </h4>
          {activeOffers.length === 0 ? (
            <p className="text-xs text-slate-500">Standard menu pricing currently in effect.</p>
          ) : (
            <div className="space-y-2">
              {activeOffers.slice(0, 2).map((offer) => (
                <div key={offer._id} className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span>{offer.title}</span>
                    <span className="font-mono text-brand-600 px-1.5 py-0.5 rounded bg-brand-50 text-[11px]">
                      {offer.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{offer.whyExplanation || offer.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Menu Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-extrabold text-xl text-slate-900">Explore Menu</h3>
            <p className="text-xs text-slate-500">Authentic recipes prepared fresh daily for dine-in patrons</p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition whitespace-nowrap border ${
                  activeCategory === cat
                    ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDishes.map((dish) => (
            <div
              key={dish._id}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition flex flex-col justify-between space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        dish.dietaryType === 'Veg'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      ● {dish.dietaryType}
                    </span>
                    {dish.isChefSpecial && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        Chef's Special
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{dish.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{dish.description}</p>
                </div>

                <span className="font-extrabold text-slate-900 text-base shrink-0">
                  ₹{dish.price}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Category: <b>{dish.category}</b></span>
                <span className="font-medium">Pop. Score: {dish.popularityScore}/100</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Reviews Section */}
      <section className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Verified Dine-In Reviews ({reviews.length})
            </h3>
            <p className="text-xs text-slate-500">
              Only diners who completed physical reservations can post reviews. No fake feedback.
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400">
            No reviews published yet. Be the first to dine in and review!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.customerId?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h5 className="font-bold text-sm text-slate-900">
                        {rev.customerId?.fullName || 'Verified Diner'}
                      </h5>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Completed Reservation
                      </span>
                    </div>
                  </div>
                  <StarRating rating={rev.ratings?.overall || 5} />
                </div>

                {rev.reviewTitle && (
                  <h6 className="font-bold text-xs text-slate-800">{rev.reviewTitle}</h6>
                )}
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>

                {/* Restaurant official response */}
                {rev.ownerReply?.replyText && (
                  <div className="ml-4 p-3 rounded-xl bg-slate-50 border-l-4 border-brand-500 text-xs space-y-1">
                    <span className="font-bold text-slate-900 block">
                      Restaurant Management Response:
                    </span>
                    <p className="text-slate-600">{rev.ownerReply.replyText}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        restaurant={restaurant}
      />

      <MealBuilderModal
        isOpen={isMealBuilderOpen}
        onClose={() => setIsMealBuilderOpen(false)}
        restaurant={restaurant}
        onProceedToBooking={() => {
          setIsMealBuilderOpen(false);
          setIsBookingOpen(true);
        }}
      />
    </div>
  );
}

