import React, { useState, useEffect } from 'react';
import {
  Users,
  Sparkles,
  Share2,
  CheckCircle2,
  Vote,
  Calendar,
  ArrowRight,
  Plus,
  Copy,
} from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GroupDiningPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allRestaurants, setAllRestaurants] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [shareCodeInput, setShareCodeInput] = useState('CW-MSD6');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Creation form state
  const [groupName, setGroupName] = useState('');
  const [groupSize, setGroupSize] = useState(4);
  const [targetBudget, setTargetBudget] = useState(600);
  const [shortlisted, setShortlisted] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await API.get('/restaurants');
        if (res.success) {
          setAllRestaurants(res.data);
          if (res.data.length >= 3) {
            setShortlisted([res.data[0]._id, res.data[1]._id, res.data[2]._id]);
          }
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
      }
    };
    fetchRestaurants();
    // Auto load seed plan CW-MSD6 for instant review
    handleJoinByCode('CW-MSD6');
  }, []);

  const handleJoinByCode = async (codeToUse) => {
    const code = (codeToUse || shareCodeInput).trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    try {
      const res = await API.get(`/group-dining/code/${code}`);
      if (res.success) {
        setActivePlan(res.data);
      }
    } catch (err) {
      console.warn('Could not load plan by code:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to create a group dining plan.');
      navigate('/login');
      return;
    }

    if (shortlisted.length < 2) {
      alert('Please shortlist at least 2 restaurants for voting.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/group-dining', {
        groupName,
        groupSize,
        targetBudgetPerPerson: targetBudget,
        shortlistedRestaurantIds: shortlisted,
      });

      if (res.success) {
        setActivePlan(res.data);
        setShowCreateModal(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to create plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleCastVote = async (restaurantId) => {
    if (!user) {
      alert('Please log in to vote in this group outing.');
      navigate('/login');
      return;
    }

    try {
      const res = await API.post(`/group-dining/${activePlan._id}/vote`, {
        restaurantId,
      });
      if (res.success) {
        setActivePlan(res.data);
      }
    } catch (err) {
      alert(err.message || 'Voting failed.');
    }
  };

  const handleFinalize = async () => {
    try {
      const res = await API.post(`/group-dining/${activePlan._id}/finalize`);
      if (res.success) {
        setActivePlan({ ...activePlan, status: 'finalized' });
        alert('Voting locked! The winning restaurant has been decided.');
      }
    } catch (err) {
      alert(err.message || 'Failed to finalize.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-500" />
            Group Dining Planner & Voting Room
          </h1>
          <p className="text-xs text-slate-500">
            Coordinate team dinners, college hangouts, and celebrations. Shortlist venues and vote collaboratively.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 transition flex items-center gap-1.5 shadow-md shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Create New Group Plan
        </button>
      </div>

      {/* Share Code Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
          Enter Group Share Code:
        </span>
        <div className="flex-1 flex gap-2 w-full">
          <input
            type="text"
            placeholder="e.g. CW-MSD6"
            value={shareCodeInput}
            onChange={(e) => setShareCodeInput(e.target.value.toUpperCase())}
            className="w-full text-xs uppercase px-3 py-2 rounded-xl border border-slate-300 font-mono tracking-wider focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={() => handleJoinByCode()}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shrink-0"
          >
            Load Plan
          </button>
        </div>
      </div>

      {/* Active Voting Room Card */}
      {activePlan && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                  {activePlan.status}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Share Code: <b>{activePlan.shareCode}</b>
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {activePlan.groupName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target: {activePlan.groupSize} People • Approx ₹{activePlan.targetBudgetPerPerson}/person
              </p>
            </div>

            {/* Voting Controls */}
            {activePlan.status === 'voting' && (
              <button
                onClick={handleFinalize}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Lock Voting & Finalize
              </button>
            )}
          </div>

          {/* Shortlisted Restaurant Voting Cards */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800">
              Shortlisted Venues ({activePlan.shortlistedRestaurants?.length}):
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activePlan.shortlistedRestaurants?.map((item) => {
                const rest = item.restaurantId;
                if (!rest) return null;
                const voteCount = item.votes?.length || 0;
                const isWinner =
                  activePlan.winningRestaurantId?._id?.toString() === rest._id?.toString() ||
                  activePlan.winningRestaurantId?.toString() === rest._id?.toString();

                return (
                  <div
                    key={rest._id}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                      isWinner
                        ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2">
                        <img
                          src={rest.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {isWinner && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500 text-white shadow-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Leader
                          </div>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-slate-900">{rest.name}</h4>
                      <p className="text-[11px] text-slate-500">{rest.address?.area}, Hyderabad</p>

                      <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-100">
                        <span className="font-bold text-slate-800">₹{rest.priceForTwo} for 2</span>
                        <span className="font-bold text-amber-500">★ {rest.averageRating?.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-700">
                        {voteCount} {voteCount === 1 ? 'Vote' : 'Votes'}
                      </span>

                      {activePlan.status === 'voting' ? (
                        <button
                          onClick={() => handleCastVote(rest._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition flex items-center gap-1"
                        >
                          <Vote className="w-3.5 h-3.5" />
                          Vote
                        </button>
                      ) : (
                        isWinner && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Winner
                          </span>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Create Group Dining Plan</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Occasion / Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Birthday Dinner, Friday Team Outing"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Group Size</label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={groupSize}
                    onChange={(e) => setGroupSize(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Budget / Person (₹)</label>
                  <input
                    type="number"
                    min="200"
                    step="50"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Shortlist Venues to Vote on ({shortlisted.length} selected):
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2">
                  {allRestaurants.map((r) => {
                    const isChecked = shortlisted.includes(r._id);
                    return (
                      <label
                        key={r._id}
                        className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <span className="font-semibold text-slate-800">{r.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setShortlisted(shortlisted.filter((i) => i !== r._id));
                            } else {
                              setShortlisted([...shortlisted, r._id]);
                            }
                          }}
                          className="accent-brand-500 rounded"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-brand-500 hover:bg-brand-600 transition"
              >
                {loading ? 'Creating...' : 'Create & Generate Share Code'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

