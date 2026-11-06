import React, { useState, useEffect } from 'react';
import { X, Utensils, Sparkles, Tag, Check, Trash2, ArrowRight } from 'lucide-react';
import API from '../../services/api';

export default function MealBuilderModal({ isOpen, onClose, restaurant, onProceedToBooking }) {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [budgetRecommendation, setBudgetRecommendation] = useState(null);
  const [targetBudget, setTargetBudget] = useState(500);
  const [activeTab, setActiveTab] = useState('custom'); // 'custom' | 'budget_optimizer'
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !restaurant) return null;

  // Load menu items for the restaurant
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await API.get(`/restaurants/${restaurant._id}`);
        if (res.success && res.data.menuItems) {
          setMenuItems(res.data.menuItems);
        }
      } catch (err) {
        console.error('Failed to load menu items:', err);
      }
    };
    fetchMenu();
  }, [restaurant]);

  // Recalculate bill whenever selected dishes or discount changes
  useEffect(() => {
    const recalculate = async () => {
      if (selectedDishes.length === 0) {
        setCalculation(null);
        setErrorMsg('');
        return;
      }

      try {
        const res = await API.post('/meal-builder/calculate', {
          itemIds: selectedDishes.map((d) => d._id),
          discountCode: discountCode.trim() || undefined,
        });
        if (res.success) {
          setCalculation(res.data);
          setErrorMsg('');
        }
      } catch (err) {
        setErrorMsg(err.message);
      }
    };

    if (activeTab === 'custom') {
      recalculate();
    }
  }, [selectedDishes, discountCode, activeTab]);

  const toggleSelectDish = (dish) => {
    const exists = selectedDishes.some((d) => d._id === dish._id);
    if (exists) {
      setSelectedDishes(selectedDishes.filter((d) => d._id !== dish._id));
    } else {
      if (selectedDishes.length >= 3) {
        alert('Smart Meal Builder allows a maximum of 3 dishes for optimal dining pairing.');
        return;
      }
      setSelectedDishes([...selectedDishes, dish]);
    }
  };

  const handleFetchBudgetCombos = async () => {
    setLoading(true);
    try {
      const res = await API.get(
        `/meal-builder/budget-recommendations/${restaurant._id}?budget=${targetBudget}`
      );
      if (res.success) {
        setBudgetRecommendation(res.data);
      }
    } catch (err) {
      alert(err.message || 'No combinations found within this budget.');
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendedCombo = (combo) => {
    setSelectedDishes(combo.items);
    setActiveTab('custom');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Smart Meal Builder – {restaurant.name}</h3>
              <p className="text-white/80 text-xs">Pick up to 3 dishes, optimize your budget, and calculate verified savings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Build My Meal ({selectedDishes.length}/3)
          </button>
          <button
            onClick={() => {
              setActiveTab('budget_optimizer');
              if (!budgetRecommendation) handleFetchBudgetCombos();
            }}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'budget_optimizer'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Budget Combo Optimizer
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'custom' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Menu Dishes Column */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Select up to 3 Menu Items:
                  </h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {selectedDishes.length} of 3 selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {menuItems.map((dish) => {
                    const isSelected = selectedDishes.some((d) => d._id === dish._id);
                    return (
                      <div
                        key={dish._id}
                        onClick={() => toggleSelectDish(dish)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/50 shadow-sm ring-1 ring-brand-500'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-600">
                              {dish.category}
                            </span>
                            <h5 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">
                              {dish.name}
                            </h5>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-brand-500 border-brand-500 text-white'
                                : 'border-slate-300 text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-xs">
                          <span
                            className={`font-semibold ${
                              dish.dietaryType === 'Veg' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            ● {dish.dietaryType}
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            ₹{dish.price}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bill & Summary Sidebar */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                    Meal Summary
                  </h4>

                  {selectedDishes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">
                      Select dishes from the menu to build your custom meal combo.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDishes.map((d) => (
                        <div
                          key={d._id}
                          className="flex items-center justify-between text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80"
                        >
                          <span className="truncate max-w-[120px] font-medium">{d.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">₹{d.price}</span>
                            <button
                              onClick={() => toggleSelectDish(d)}
                              className="text-slate-400 hover:text-rose-500 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Promo Code Input */}
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Personalized Promo Code
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. WELCOME20"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        className="w-full text-xs px-2.5 py-1.5 uppercase rounded-lg border border-slate-300 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    {errorMsg && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-1">{errorMsg}</p>
                    )}
                  </div>

                  {/* Calculation Details */}
                  {calculation && (
                    <div className="pt-2 border-t border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Original Total</span>
                        <span>₹{calculation.originalTotal}</span>
                      </div>
                      {calculation.discountSavings > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Verified Savings</span>
                          <span>- ₹{calculation.discountSavings}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                        <span>Final Payable</span>
                        <span className="text-brand-600 text-base">₹{calculation.finalPayable}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  disabled={selectedDishes.length === 0}
                  onClick={() => {
                    onProceedToBooking &&
                      onProceedToBooking({
                        selectedDishes,
                        discountCode,
                        estimatedAmount: calculation?.finalPayable || 500,
                      });
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-brand-500 hover:bg-brand-600 transition flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-sm shadow-brand-500/20"
                >
                  <span>Proceed with this Meal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Budget Optimizer View */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    What is your target budget for this meal?
                  </h4>
                  <p className="text-xs text-slate-600">
                    The backend solver automatically pairs Starter + Main Course + Dessert within your exact amount.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-brand-600 text-lg">₹{targetBudget}</span>
                  <input
                    type="range"
                    min="300"
                    max="1500"
                    step="50"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Number(e.target.value))}
                    className="accent-brand-500 cursor-pointer"
                  />
                  <button
                    onClick={handleFetchBudgetCombos}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition"
                  >
                    Solve
                  </button>
                </div>
              </div>

              {/* Combos list */}
              {budgetRecommendation?.data?.length > 0 ? (
                <div className="space-y-4">
                  <h5 className="font-bold text-sm text-slate-800">
                    Recommended 3-Course Combinations Under ₹{targetBudget}:
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {budgetRecommendation.data.map((combo, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-brand-500 transition flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                              Combo #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-emerald-600">
                              ₹{combo.totalPrice}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-700">
                            {combo.items.map((item) => (
                              <div key={item._id} className="flex justify-between">
                                <span className="truncate max-w-[130px] font-medium">{item.name}</span>
                                <span className="text-slate-400">₹{item.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          <button
                            onClick={() => applyRecommendedCombo(combo)}
                            className="w-full py-1.5 rounded-lg text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition"
                          >
                            Apply this Combination
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {loading
                    ? 'Computing optimal 3-course triplets...'
                    : 'No valid combinations found under this budget. Try increasing budget slightly.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

