import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Check, Trash2, MapPin, Tag, Star, ArrowRight } from 'lucide-react';
import API from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { Link } from 'react-router-dom';

export default function ComparisonPage() {
  const { currentLocation } = useLocation();
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await API.get('/restaurants');
        if (res.success && res.data.length >= 2) {
          setAllRestaurants(res.data);
          // Auto select first 2 for quick evaluation demo
          setSelectedIds([res.data[0]._id, res.data[1]._id]);
        }
      } catch (err) {
        console.error('Failed to load restaurants for comparison:', err);
      }
    };
    fetchList();
  }, []);

  useEffect(() => {
    const fetchComparison = async () => {
      if (selectedIds.length < 2) {
        setComparisonData([]);
        return;
      }
      setLoading(true);
      try {
        const res = await API.post('/restaurants/compare', {
          restaurantIds: selectedIds,
          userLat: currentLocation.lat,
          userLng: currentLocation.lng,
        });
        if (res.success) {
          setComparisonData(res.data);
        }
      } catch (err) {
        console.error('Comparison fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [selectedIds, currentLocation]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert('You can compare a maximum of 3 restaurants side-by-side.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6 text-brand-500" />
          Restaurant Comparison Matrix
        </h1>
        <p className="text-xs text-slate-500">
          Compare distance, ratings, price for two, signature dishes, and active offers side-by-side.
        </p>
      </div>

      {/* Selector pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
        <span className="text-xs font-bold text-slate-700 block">
          Select 2 or 3 Restaurants to Compare:
        </span>
        <div className="flex flex-wrap gap-2">
          {allRestaurants.map((r) => {
            const isSelected = selectedIds.includes(r._id);
            return (
              <button
                key={r._id}
                onClick={() => toggleSelect(r._id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{r.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid Table */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Computing comparative metrics...
        </div>
      ) : comparisonData.length < 2 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
          Please select at least 2 restaurants from the list above to compare.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider w-1/4">
                  Feature
                </th>
                {comparisonData.map((r) => (
                  <th key={r._id} className="p-4 text-slate-900 font-extrabold text-sm">
                    <div className="space-y-1">
                      <img
                        src={r.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300'}
                        alt=""
                        className="w-full h-28 object-cover rounded-xl"
                      />
                      <h4 className="text-base font-extrabold mt-1">{r.name}</h4>
                      <p className="text-xs text-slate-500">{r.area}, Hyderabad</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {/* Distance */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Distance from You</td>
                {comparisonData.map((r) => (
                  <td key={r._id} className="p-4 font-extrabold text-brand-600">
                    {r.distanceKm} km
                  </td>
                ))}
              </tr>

              {/* Verified Rating */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Verified Rating</td>
                {comparisonData.map((r) => (
                  <td key={r._id} className="p-4">
                    <span className="font-extrabold text-amber-500 text-sm">
                      ★ {r.averageRating?.toFixed(1)}
                    </span>
                    <span className="text-slate-400 text-[11px] block">
                      ({r.totalReviews} completed diner visits)
                    </span>
                  </td>
                ))}
              </tr>

              {/* Price For Two */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Price for Two</td>
                {comparisonData.map((r) => (
                  <td key={r._id} className="p-4 font-bold text-slate-900 text-sm">
                    ₹{r.priceForTwo}{' '}
                    <span className="text-slate-400 text-xs font-normal">
                      (~₹{r.approxPerPerson}/person)
                    </span>
                  </td>
                ))}
              </tr>

              {/* Cuisines */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Cuisines</td>
                {comparisonData.map((r) => (
                  <td key={r._id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {r.cuisineTypes?.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Popular Menu Items */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Popular Menu Items</td>
                {comparisonData.map((r) => (
                  <td key={r._id} className="p-4 space-y-1">
                    {r.topDishes?.map((d) => (
                      <div key={d._id} className="flex justify-between text-[11px] text-slate-700">
                        <span>• {d.name}</span>
                        <span className="font-bold">₹{d.price}</span>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>

              {/* Active Offers */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Available Offers</td>
                {comparisonData.map((r) => (
                  <td key={r._id} className="p-4">
                    {r.availableOffers?.length > 0 ? (
                      <div className="space-y-1">
                        {r.availableOffers.map((o) => (
                          <span
                            key={o.code}
                            className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800"
                          >
                            {o.code}: {o.title}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">Standard Pricing</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Actions */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Action</td>
                {comparisonData.map((r) => (
                  <td key={r._id} className="p-4">
                    <Link
                      to={`/restaurants/${r._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-brand-500 hover:bg-brand-600 transition"
                    >
                      <span>Explore & Reserve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

