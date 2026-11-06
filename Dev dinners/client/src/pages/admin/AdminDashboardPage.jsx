import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Store,
  Calendar,
  Tag,
  MessageSquare,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import API from '../../services/api';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' | 'restaurants' | 'customers' | 'discounts' | 'feedback'
  const [loading, setLoading] = useState(true);

  // Restaurants list state
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantSearch, setRestaurantSearch] = useState('');

  // Customers list state
  const [customers, setCustomers] = useState([]);

  // Discounts list state
  const [discounts, setDiscounts] = useState([]);
  const [newDiscount, setNewDiscount] = useState({
    code: 'FESTIVE30',
    title: 'Hyderabad Festive Feast',
    description: '30% off across verified partner restaurants',
    discountType: 'percentage',
    discountValue: 30,
    minBillAmount: 700,
    maxDiscountAmount: 400,
    targetSegment: 'all',
    whyExplanation: 'Seasonal festive celebration dining discount.',
  });

  // Feedback list state
  const [feedbackList, setFeedbackList] = useState([]);

  const fetchMetrics = async () => {
    try {
      const res = await API.get('/admin/metrics');
      if (res.success) setMetrics(res.data);
    } catch (err) {
      console.error('Metrics fetch error:', err);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await API.get(`/admin/restaurants?keyword=${restaurantSearch}`);
      if (res.success) setRestaurants(res.data);
    } catch (err) {
      console.error('Restaurants fetch error:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await API.get('/admin/customers');
      if (res.success) setCustomers(res.data);
    } catch (err) {
      console.error('Customers fetch error:', err);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const res = await API.get('/discounts/admin/all');
      if (res.success) setDiscounts(res.data);
    } catch (err) {
      console.error('Discounts fetch error:', err);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await API.get('/admin/feedback');
      if (res.success) setFeedbackList(res.data);
    } catch (err) {
      console.error('Feedback fetch error:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchMetrics(),
        fetchRestaurants(),
        fetchCustomers(),
        fetchDiscounts(),
        fetchFeedback(),
      ]);
      setLoading(false);
    };
    init();
  }, []);

  // Update restaurant status (approve, freeze, reject)
  const handleUpdateRestaurantStatus = async (id, status) => {
    try {
      const res = await API.put(`/admin/restaurants/${id}/status`, { approvalStatus: status });
      if (res.success) {
        fetchRestaurants();
        fetchMetrics();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Toggle customer status
  const handleToggleCustomer = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await API.put(`/admin/customers/${id}/status`, { accountStatus: nextStatus });
      if (res.success) {
        fetchCustomers();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Create discount campaign
  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/discounts/admin', newDiscount);
      if (res.success) {
        alert('Discount rule launched!');
        fetchDiscounts();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Moderate feedback
  const handleModerateFeedback = async (id, status) => {
    try {
      const res = await API.put(`/feedback/${id}/moderate`, { status });
      if (res.success) {
        fetchFeedback();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading Super Admin Console...
      </div>
    );
  }

  const summary = metrics?.summary || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              CRAVEWISE SUPER-ADMIN CONSOLE
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Platform Governance & Central Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Control partner restaurant approvals, customer segments, personalized discount rules, and review moderation.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'metrics', label: 'Platform Metrics & Audit', icon: Activity },
          { id: 'restaurants', label: `Restaurants (${restaurants.length})`, icon: Store },
          { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
          { id: 'discounts', label: `Personalized Discounts (${discounts.length})`, icon: Tag },
          { id: 'feedback', label: `Verified Reviews (${feedbackList.length})`, icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: METRICS & ACTIVITY */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Diners
              </span>
              <span className="text-2xl font-extrabold text-slate-900">{summary.totalCustomers || 0}</span>
              <p className="text-[11px] text-slate-500">{summary.activeCustomers || 0} active accounts</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Partner Restaurants
              </span>
              <span className="text-2xl font-extrabold text-emerald-600">
                {summary.approvedRestaurants || 0}
              </span>
              <p className="text-[11px] text-slate-500">{summary.totalRestaurants || 0} total enrolled</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Bookings
              </span>
              <span className="text-2xl font-extrabold text-brand-600">{summary.totalBookings || 0}</span>
              <p className="text-[11px] text-slate-500">{summary.completedBookings || 0} completed dining visits</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Campaigns
              </span>
              <span className="text-2xl font-extrabold text-purple-600">{summary.activeDiscounts || 0}</span>
              <p className="text-[11px] text-slate-500">{summary.totalFeedback || 0} verified reviews</p>
            </div>
          </div>

          {/* Popular Cuisines & Activity Logs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900">High Demand Cuisines in Hyderabad</h4>
              <div className="space-y-2 text-xs">
                {metrics?.popularCuisines?.map((c) => (
                  <div key={c._id} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">{c._id}</span>
                    <span className="font-bold text-brand-600">{c.count} Restaurants</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900">Recent Platform Audit Logs</h4>
              <div className="divide-y divide-slate-100 text-xs">
                {metrics?.recentActivity?.map((act) => (
                  <div key={act._id} className="py-2 space-y-0.5">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{act.action}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        {new Date(act.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{act.targetEntity}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESTAURANTS MODERATION */}
      {activeTab === 'restaurants' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-extrabold text-sm text-slate-900">Partner Restaurant Governance</h4>
            <input
              type="text"
              placeholder="Search by restaurant name or area..."
              value={restaurantSearch}
              onChange={(e) => setRestaurantSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRestaurants()}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Restaurant</th>
                  <th className="p-3">Area</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {restaurants.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{r.name}</span>
                      <span className="text-[10px] text-slate-400">{r.email}</span>
                    </td>
                    <td className="p-3 text-slate-600">{r.address?.area}</td>
                    <td className="p-3 font-bold text-amber-500">★ {r.averageRating?.toFixed(1)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                          r.approvalStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.approvalStatus === 'frozen'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        ● {r.approvalStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {r.approvalStatus !== 'approved' && (
                        <button
                          onClick={() => handleUpdateRestaurantStatus(r._id, 'approved')}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
                        >
                          Approve
                        </button>
                      )}
                      {r.approvalStatus === 'approved' && (
                        <button
                          onClick={() => handleUpdateRestaurantStatus(r._id, 'frozen')}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 transition"
                        >
                          Freeze Account
                        </button>
                      )}
                      {r.approvalStatus === 'frozen' && (
                        <button
                          onClick={() => handleUpdateRestaurantStatus(r._id, 'approved')}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 transition"
                        >
                          Unfreeze
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMERS MANAGEMENT */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h4 className="font-extrabold text-sm text-slate-900">Registered Diners & Segmentation</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Segment</th>
                  <th className="p-3">Visits</th>
                  <th className="p-3">Loyalty Pts</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{c.fullName}</span>
                      <span className="text-[10px] text-slate-400">{c.email}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold uppercase text-[10px]">
                        {c.segment}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{c.totalCompletedVisits || 0}</td>
                    <td className="p-3 font-bold text-amber-600">{c.loyaltyPoints} pts</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          c.accountStatus === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        ● {c.accountStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleCustomer(c._id, c.accountStatus)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          c.accountStatus === 'active'
                            ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        {c.accountStatus === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DISCOUNTS CONFIGURATION */}
      {activeTab === 'discounts' && (
        <div className="space-y-6">
          {/* Create campaign form */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900">
              Configure Personalized Discount Campaign Rule
            </h4>
            <form onSubmit={handleCreateDiscount} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                placeholder="Code (e.g. BDAY25)"
                value={newDiscount.code}
                onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                className="text-xs px-3 py-2 uppercase rounded-xl border border-slate-300 font-mono"
              />
              <input
                type="text"
                required
                placeholder="Offer Title"
                value={newDiscount.title}
                onChange={(e) => setNewDiscount({ ...newDiscount, title: e.target.value })}
                className="text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
              <select
                value={newDiscount.targetSegment}
                onChange={(e) => setNewDiscount({ ...newDiscount, targetSegment: e.target.value })}
                className="text-xs px-2 py-2 rounded-xl border border-slate-300"
              >
                <option value="all">All Diners</option>
                <option value="new">New Diners Only</option>
                <option value="loyal">Loyal Diners (5+ visits)</option>
                <option value="birthday">Birthday Month Diners</option>
                <option value="high_spending">High Spenders</option>
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Discount %"
                  value={newDiscount.discountValue}
                  onChange={(e) => setNewDiscount({ ...newDiscount, discountValue: Number(e.target.value) })}
                  className="w-full text-xs px-2 py-2 rounded-xl border border-slate-300"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition shrink-0"
                >
                  Create
                </button>
              </div>
            </form>
          </div>

          {/* Discounts Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Coupon Code</th>
                  <th className="p-3">Title & Rule</th>
                  <th className="p-3">Target Segment</th>
                  <th className="p-3">Why Explanation</th>
                  <th className="p-3 text-right">Redemptions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discounts.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 font-mono font-bold text-purple-700">{d.code}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{d.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {d.discountValue}% off • Min spend ₹{d.minBillAmount}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px] uppercase">
                        {d.targetSegment}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 italic">{d.whyExplanation}</td>
                    <td className="p-3 text-right font-extrabold text-slate-900">
                      {d.currentUsageCount || 0} used
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FEEDBACK MODERATION */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h4 className="font-extrabold text-sm text-slate-900">Verified Feedback Moderation</h4>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {feedbackList.map((rev) => (
              <div key={rev._id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.customerId?.fullName}</span>
                    <span className="text-slate-400">reviewed</span>
                    <span className="font-bold text-brand-600">{rev.restaurantId?.name}</span>
                    <span className="font-bold text-amber-500">★ {rev.ratings?.overall}</span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                        rev.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>
                  <p className="text-slate-600">{rev.comment}</p>
                </div>

                <div className="shrink-0 space-x-1">
                  {rev.status !== 'approved' ? (
                    <button
                      onClick={() => handleModerateFeedback(rev._id, 'approved')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModerateFeedback(rev._id, 'hidden')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                    >
                      Hide Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

