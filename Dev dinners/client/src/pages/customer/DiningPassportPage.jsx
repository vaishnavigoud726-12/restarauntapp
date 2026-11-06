import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  TrendingDown,
  Compass,
  Flame,
  CheckCircle2,
  Lock,
  Gift,
  History,
  Store,
} from 'lucide-react';
import API from '../../services/api';

export default function DiningPassportPage() {
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        const res = await API.get('/passport/summary');
        if (res.success) {
          setPassport(res.data);
        }
      } catch (err) {
        console.error('Failed to load passport:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPassport();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading Dining Passport...
      </div>
    );
  }

  const { customer = {}, stats = {}, badges = [], visitedRestaurants = [], recentLoyaltyLedger = [] } =
    passport || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Passport Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={customer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt="avatar"
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-amber-500/30 shadow-lg"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {customer.segment?.toUpperCase()} MEMBER
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                {customer.fullName}'s Dining Passport
              </h1>
              <p className="text-xs text-slate-400">
                Official CraveWise Dining Identity & Loyalty Portfolio
              </p>
            </div>
          </div>

          {/* Loyalty Balance Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center sm:text-right w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 block">
              Available Loyalty Points
            </span>
            <span className="text-3xl font-extrabold text-white">
              {customer.loyaltyPoints || 100} <span className="text-sm font-normal text-amber-300">pts</span>
            </span>
            <p className="text-[10px] text-slate-300 mt-0.5">
              Redeemable for dining vouchers
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Completed Visits
          </span>
          <span className="text-2xl font-extrabold text-slate-900">{stats.totalVisits || 0}</span>
          <p className="text-[11px] text-slate-500">Verified dining sessions</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Unique Venues
          </span>
          <span className="text-2xl font-extrabold text-brand-600">{stats.uniqueVenuesCount || 0}</span>
          <p className="text-[11px] text-slate-500">Distinct restaurants stamped</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Money Saved
          </span>
          <span className="text-2xl font-extrabold text-emerald-600">₹{stats.totalSavings || 0}</span>
          <p className="text-[11px] text-slate-500">Through personalized offers</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Cuisines Explored
          </span>
          <span className="text-2xl font-extrabold text-amber-600">
            {stats.cuisinesExplored?.length || 0}
          </span>
          <p className="text-[11px] text-slate-500">Diverse flavor profiles</p>
        </div>
      </div>

      {/* Achievement Badges Section */}
      <section className="space-y-4">
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Dining Achievements & Badges
          </h3>
          <p className="text-xs text-slate-500">
            Badges unlock automatically when qualifying dining visits and milestones are achieved.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                badge.isUnlocked
                  ? 'bg-amber-50/60 border-amber-200 shadow-sm'
                  : 'bg-slate-50/60 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  badge.isUnlocked
                    ? 'bg-gradient-to-tr from-amber-500 to-brand-500 text-white shadow-md shadow-amber-500/20'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {badge.isUnlocked ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-slate-900">{badge.name}</h4>
                  {badge.isUnlocked && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                      Unlocked
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visited Restaurants Stamped */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-brand-500" />
            Stamped Dining Venues ({visitedRestaurants.length})
          </h3>
          <p className="text-xs text-slate-500">
            Restaurants where you completed full offline dining sessions.
          </p>
        </div>

        {visitedRestaurants.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No restaurant stamps earned yet. Complete your first table reservation to get stamped!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {visitedRestaurants.map((r) => (
              <div
                key={r._id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-3"
              >
                <img
                  src={r.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="truncate">
                  <h5 className="font-bold text-xs text-slate-900 truncate">{r.name}</h5>
                  <p className="text-[11px] text-slate-500">{r.address?.area}, Hyderabad</p>
                  <span className="text-[10px] text-emerald-600 font-bold">★ {r.averageRating?.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Loyalty Points Ledger */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            Loyalty Points Ledger
          </h3>
          <p className="text-xs text-slate-500">
            Points are earned exclusively upon completing valid dining sessions (Base 50 pts + 5% of bill).
          </p>
        </div>

        {recentLoyaltyLedger.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No transactions recorded yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {recentLoyaltyLedger.map((tx) => (
              <div key={tx._id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{tx.reason}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-extrabold text-sm ${
                      tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'credit' ? `+${tx.points}` : `-${tx.points}`} pts
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Balance: {tx.balanceAfter} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

