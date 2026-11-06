import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  MapPin,
  UtensilsCrossed,
  SlidersHorizontal,
  Compass,
  Map as MapIcon,
  Grid,
  Users,
  Tag,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import API from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import RestaurantCard from '../../components/common/RestaurantCard';
import RestaurantMap from '../../components/map/RestaurantMap';
import HelpMeChooseModal from '../../components/customer/HelpMeChooseModal';
import MealBuilderModal from '../../components/customer/MealBuilderModal';
import BookingModal from '../../components/customer/BookingModal';
import { Link } from 'react-router-dom';

const POPULAR_CUISINES = [
  'All',
  'Hyderabadi',
  'Biryani',
  'Mughlai',
  'North Indian',
  'South Indian',
  'Continental',
  'Vegetarian',
];

export default function HomePage() {
  const { currentLocation } = useLocation();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'distance' | 'price'

  // Modals state
  const [isHelpMeChooseOpen, setIsHelpMeChooseOpen] = useState(false);
  const [selectedForMealBuilder, setSelectedForMealBuilder] = useState(null);
  const [selectedForBooking, setSelectedForBooking] = useState(null);
  const [prefilledMealData, setPrefilledMealData] = useState(null);

  // Fetch nearby restaurants whenever location changes
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          lng: currentLocation.lng,
          lat: currentLocation.lat,
          maxDistance: 35,
        });
        if (activeCuisine !== 'All') {
          queryParams.append('cuisine', activeCuisine);
        }

        const res = await API.get(`/restaurants/nearby?${queryParams.toString()}`);
        if (res.success) {
          setRestaurants(res.data);
        }
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [currentLocation, activeCuisine]);

  // Filter & sort
  const filteredRestaurants = restaurants
    .filter((r) => {
      if (!keyword.trim()) return true;
      const term = keyword.toLowerCase();
      return (
        r.name.toLowerCase().includes(term) ||
        r.cuisineTypes?.some((c) => c.toLowerCase().includes(term)) ||
        r.address?.area?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'distance') return (a.distanceKm || 0) - (b.distanceKm || 0);
      if (sortBy === 'price') return (a.priceForTwo || 0) - (b.priceForTwo || 0);
      return (b.averageRating || 0) - (a.averageRating || 0);
    });

  const handleMealBuilderProceed = (mealData) => {
    setPrefilledMealData(mealData);
    setSelectedForBooking(selectedForMealBuilder);
    setSelectedForMealBuilder(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Discovery Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-navy-950 text-white pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NOT A FOOD DELIVERY CLONE – THE SMARTER DINE-IN PLATFORM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Discover Exceptional Dine-In Moments,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-amber-400 to-amber-200">
              Personalized for You
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-normal">
            Real location-aware discovery across Hyderabad, transparent budget meal matching, guaranteed table reservations, and verified diner reviews.
          </p>

          {/* Search Bar & Action Buttons */}
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl text-slate-800">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search restaurants, Hyderabadi biryani, areas, or cuisines..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={() => setIsHelpMeChooseOpen(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Help Me Choose</span>
            </button>
          </div>

          {/* Quick Feature Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 font-medium">
            <Link to="/group-dining" className="hover:text-brand-400 transition flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-400" />
              <span>Group Dining Planner</span>
            </Link>
            <span className="text-slate-600">•</span>
            <Link to="/compare" className="hover:text-brand-400 transition flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Restaurant Comparison</span>
            </Link>
            <span className="text-slate-600">•</span>
            <Link to="/passport" className="hover:text-brand-400 transition flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Dining Passport Rewards</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Controls Bar: Cuisine Filter + View Toggle + Sorting */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          {/* Cuisine Pill Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {POPULAR_CUISINES.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCuisine(c)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition whitespace-nowrap border ${
                  activeCuisine === c
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* View Toggle & Sorting */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="rating">Top Rated</option>
                <option value="distance">Nearest Distance</option>
                <option value="price">Budget (Low to High)</option>
              </select>
            </div>

            {/* Grid vs Map Toggle */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl border border-slate-300">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5 text-brand-500" />
                <span className="hidden sm:inline">Interactive Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Location Status Notice */}
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-100/70 px-4 py-2 rounded-xl">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-brand-500" />
            <span>
              Showing restaurants near <b>{currentLocation.name}</b> (Distances calculated dynamically)
            </span>
          </div>
          <span className="font-bold text-slate-700">
            {filteredRestaurants.length} Restaurants Found
          </span>
        </div>

        {/* View Mode: Grid vs Interactive Map */}
        {viewMode === 'grid' ? (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 rounded-2xl bg-slate-200/60 animate-pulse"></div>
              ))}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No restaurants match your filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing search terms or selecting a different cuisine or area.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant._id}
                  restaurant={restaurant}
                  onOpenBooking={(rest) => {
                    setSelectedForBooking(rest);
                    setPrefilledMealData(null);
                  }}
                  onOpenMealBuilder={(rest) => setSelectedForMealBuilder(rest)}
                />
              ))}
            </div>
          )
        ) : (
          /* Interactive Leaflet Map */
          <div className="h-[550px] w-full rounded-2xl overflow-hidden shadow-sm">
            <RestaurantMap
              restaurants={filteredRestaurants}
              userLocation={{ lat: currentLocation.lat, lng: currentLocation.lng }}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <HelpMeChooseModal
        isOpen={isHelpMeChooseOpen}
        onClose={() => setIsHelpMeChooseOpen(false)}
      />

      <MealBuilderModal
        isOpen={!!selectedForMealBuilder}
        onClose={() => setSelectedForMealBuilder(null)}
        restaurant={selectedForMealBuilder}
        onProceedToBooking={handleMealBuilderProceed}
      />

      <BookingModal
        isOpen={!!selectedForBooking}
        onClose={() => {
          setSelectedForBooking(null);
          setPrefilledMealData(null);
        }}
        restaurant={selectedForBooking}
        prefilledMeal={prefilledMealData}
      />
    </div>
  );
}

