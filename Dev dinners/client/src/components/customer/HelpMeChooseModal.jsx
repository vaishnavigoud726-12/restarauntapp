import React, { useState } from 'react';
import { X, Sparkles, Sliders, CheckCircle2, MapPin, Tag, ChevronRight, ArrowRight } from 'lucide-react';
import API from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { Link } from 'react-router-dom';

const CUISINE_OPTIONS = [
  'Hyderabadi',
  'Biryani',
  'North Indian',
  'South Indian',
  'Mughlai',
  'Continental',
  'Vegetarian',
  'Seafood',
  'Italian',
];

export default function HelpMeChooseModal({ isOpen, onClose, onSelectRestaurant }) {
  const { currentLocation } = useLocation();
  const [budget, setBudget] = useState(500);
  const [maxDistance, setMaxDistance] = useState(15);
  const [minRating, setMinRating] = useState(4.0);
  const [dietary, setDietary] = useState('All');
  const [selectedCuisines, setSelectedCuisines] = useState(['Hyderabadi']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  if (!isOpen) return null;

  const toggleCuisine = (cuisine) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const handleComputeRecommendations = async () => {
    setLoading(true);
    try {
      const res = await API.post('/recommendations/help-me-choose', {
        budget,
        preferredCuisines: selectedCuisines,
        maxDistanceKm: maxDistance,
        minRating,
        dietaryPreference: dietary,
        userLat: currentLocation.lat,
        userLng: currentLocation.lng,
      });

      if (res.success) {
        setResults(res.data);
      }
    } catch (err) {
      console.error('Recommendation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Help Me Choose – Smart Dining Assistant</h3>
              <p className="text-white/80 text-xs">Transparent 5-factor mathematical scoring for your ideal dine-in venue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!results ? (
            <div className="space-y-6">
              {/* Target Budget Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>Target Budget per Person</span>
                  <span className="text-brand-600 font-extrabold text-base">₹{budget}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="50"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>₹200 (Pocket Friendly)</span>
                  <span>₹800 (Mid-Range)</span>
                  <span>₹2000 (Fine Dining)</span>
                </div>
              </div>

              {/* Max Travel Distance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>Maximum Travel Radius</span>
                  <span className="text-brand-600 font-extrabold text-base">{maxDistance} km</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>2 km (Walking/Nearby)</span>
                  <span>15 km (Within City)</span>
                  <span>30 km (Across Metro)</span>
                </div>
              </div>

              {/* Dietary Preferences */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 block">Dietary Lifestyle</label>
                <div className="grid grid-cols-3 gap-2">
                  {['All', 'Veg', 'Non-Veg'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDietary(mode)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                        dietary === mode
                          ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Cuisines */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 block">Preferred Cuisines</label>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_OPTIONS.map((c) => {
                    const isSelected = selectedCuisines.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCuisine(c)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition border ${
                          isSelected
                            ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>Minimum Verified Rating</span>
                  <span className="text-amber-500 font-extrabold text-base">★ {minRating}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[3.5, 4.0, 4.3, 4.5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setMinRating(r)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition border ${
                        minRating === r
                          ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ★ {r}+
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-base text-slate-900">
                  Top Matches Ranked by Transparent Suitability Score
                </h4>
                <button
                  onClick={() => setResults(null)}
                  className="text-xs font-semibold text-brand-600 hover:underline"
                >
                  Adjust Criteria
                </button>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No restaurants satisfied these strict criteria. Try increasing travel distance or budget.
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((item, idx) => (
                    <div
                      key={item.restaurant._id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-brand-500/50 hover:shadow-md transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={item.restaurant.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                                #{idx + 1}
                              </span>
                              <h5 className="font-bold text-slate-900 text-sm">
                                {item.restaurant.name}
                              </h5>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-brand-500" />
                              {item.restaurant.address?.area} • {item.distanceKm} km away
                            </p>
                            <p className="text-xs font-medium text-slate-600 mt-1">
                              Avg ₹{item.approxCostPerPerson}/person • {item.restaurant.cuisineTypes?.join(', ')}
                            </p>
                          </div>
                        </div>

                        {/* Suitability Score Badge */}
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-500 text-white text-xs font-extrabold shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            <span>{item.suitabilityScore} / 100</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 mt-1">
                            Match Score
                          </span>
                        </div>
                      </div>

                      {/* Transparent Explanations */}
                      <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 text-xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Why this was recommended:
                        </span>
                        {item.explanations.map((exp, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{exp}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Link
                          to={`/restaurants/${item.restaurant._id}`}
                          onClick={onClose}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition"
                        >
                          <span>Explore & Reserve</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            CraveWise transparent multi-attribute utility theory (MAUT) decision engine.
          </p>
          {!results ? (
            <button
              onClick={handleComputeRecommendations}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 shadow-md shadow-brand-500/20 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Evaluating Scoring Model...' : 'Find Best Restaurants'}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

