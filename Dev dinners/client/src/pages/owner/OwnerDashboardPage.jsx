import React, { useState, useEffect } from 'react';
import {
  Store,
  TrendingUp,
  Users,
  Calendar,
  Utensils,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  DollarSign,
  AlertCircle,
  Ticket,
} from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'checkin' | 'menu' | 'tables' | 'waitlist'
  const [loading, setLoading] = useState(true);

  // Check-In code state
  const [checkInInput, setCheckInInput] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInError, setCheckInError] = useState('');

  // Menu management state
  const [menuList, setMenuList] = useState([]);
  const [newDish, setNewDish] = useState({
    name: '',
    category: 'Main Course',
    price: 250,
    dietaryType: 'Veg',
    description: '',
  });

  // Table management state
  const [tableList, setTableList] = useState([]);
  const [newTable, setNewTable] = useState({
    tableNumber: 'T-05',
    capacity: 4,
    zone: 'Indoor AC',
  });

  // Waitlist state
  const [waitlistQueue, setWaitlistQueue] = useState([]);

  // Bookings list state
  const [bookingsList, setBookingsList] = useState([]);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/restaurant-portal/dashboard');
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await API.get('/restaurant-portal/menu');
      if (res.success) setMenuList(res.data);
    } catch (err) {
      console.error('Error loading menu:', err);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await API.get('/restaurant-portal/tables');
      if (res.success) setTableList(res.data);
    } catch (err) {
      console.error('Error loading tables:', err);
    }
  };

  const fetchWaitlist = async () => {
    try {
      const res = await API.get('/waitlist/restaurant-queue');
      if (res.success) setWaitlistQueue(res.data);
    } catch (err) {
      console.error('Error loading waitlist:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await API.get('/restaurant-portal/bookings');
      if (res.success) setBookingsList(res.data);
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboard(),
        fetchMenu(),
        fetchTables(),
        fetchWaitlist(),
        fetchBookings(),
      ]);
      setLoading(false);
    };
    init();
  }, []);

  // Verify Check-In code
  const handleVerifyCheckIn = async (e) => {
    e.preventDefault();
    setCheckInError('');
    setCheckInResult(null);

    try {
      const res = await API.post('/bookings/verify-checkin', {
        checkInCode: checkInInput.trim(),
      });
      if (res.success) {
        setCheckInResult(res.data);
        setCheckInInput('');
        fetchDashboard();
        fetchBookings();
      }
    } catch (err) {
      setCheckInError(err.message || 'Invalid or expired check-in code.');
    }
  };

  // Complete dining session
  const handleCompleteDining = async (bookingId) => {
    const bill = prompt('Enter final dining bill amount in ₹:', '1200');
    if (!bill) return;

    try {
      const res = await API.post(`/bookings/${bookingId}/complete`, {
        actualBillAmount: Number(bill),
      });
      if (res.success) {
        alert('Dining session completed! Loyalty points credited to diner.');
        fetchDashboard();
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to complete session.');
    }
  };

  // Add menu item
  const handleAddDish = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/restaurant-portal/menu', newDish);
      if (res.success) {
        setNewDish({ name: '', category: 'Main Course', price: 250, dietaryType: 'Veg', description: '' });
        fetchMenu();
      }
    } catch (err) {
      alert(err.message || 'Failed to add dish.');
    }
  };

  // Toggle dish availability
  const handleToggleDish = async (dish) => {
    try {
      await API.put(`/restaurant-portal/menu/${dish._id}`, {
        isAvailable: !dish.isAvailable,
      });
      fetchMenu();
    } catch (err) {
      alert(err.message || 'Failed to update dish.');
    }
  };

  // Delete dish
  const handleDeleteDish = async (id) => {
    if (!window.confirm('Delete this dish from menu?')) return;
    try {
      await API.delete(`/restaurant-portal/menu/${id}`);
      fetchMenu();
    } catch (err) {
      alert(err.message);
    }
  };

  // Add table
  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/restaurant-portal/tables', newTable);
      if (res.success) {
        fetchTables();
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete table
  const handleDeleteTable = async (id) => {
    if (!window.confirm('Delete this table?')) return;
    try {
      await API.delete(`/restaurant-portal/tables/${id}`);
      fetchTables();
      fetchDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  // Notify waitlist customer
  const handleNotifyWaitlist = async (id) => {
    try {
      const res = await API.put(`/waitlist/${id}/notify`);
      if (res.success) {
        alert('Customer notified that table is ready!');
        fetchWaitlist();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading Restaurant Portal...
      </div>
    );
  }

  const kpis = dashboardData?.kpis || {};
  const profile = dashboardData?.restaurantProfile || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              RESTAURANT MANAGEMENT PORTAL
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-emerald-600" />
            {profile.name} – Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            {profile.area}, Hyderabad • Verified Rating: <b>★ {profile.averageRating?.toFixed(1)}</b> ({profile.totalReviews} reviews)
          </p>
        </div>

        {/* Quick Check-In Button Shortcut */}
        <button
          onClick={() => setActiveTab('checkin')}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          Verify Diner Arrival (Check-In)
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Intelligence KPIs & Insights', icon: TrendingUp },
          { id: 'checkin', label: 'Arrival Check-In & Bookings', icon: CheckCircle2 },
          { id: 'menu', label: `Menu Management (${menuList.length})`, icon: Utensils },
          { id: 'tables', label: `Table Layout (${tableList.length})`, icon: Calendar },
          { id: 'waitlist', label: `Waitlist Queue (${waitlistQueue.length})`, icon: Ticket },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & INTELLIGENCE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Reservations
              </span>
              <span className="text-2xl font-extrabold text-slate-900">{kpis.totalBookings || 0}</span>
              <p className="text-[11px] text-slate-500">{kpis.completedBookings || 0} completed visits</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Table Occupancy Rate
              </span>
              <span className="text-2xl font-extrabold text-brand-600">
                {kpis.tableUtilizationRate || 0}%
              </span>
              <p className="text-[11px] text-slate-500">{kpis.currentlySeated || 0} seated diners right now</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Recorded Revenue
              </span>
              <span className="text-2xl font-extrabold text-emerald-600">₹{kpis.totalRevenue || 0}</span>
              <p className="text-[11px] text-slate-500">From completed transactions</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Discount Given
              </span>
              <span className="text-2xl font-extrabold text-purple-600">
                ₹{kpis.totalDiscountSavingsGiven || 0}
              </span>
              <p className="text-[11px] text-slate-500">Total customer savings</p>
            </div>
          </div>

          {/* Business Insights Callout (MSD Requirement: Transparent data recommendations) */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-orange-500/10 border border-brand-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <h3 className="font-extrabold text-base text-slate-900">
                Data-Driven Restaurant Intelligence & Actionable Insights
              </h3>
            </div>
            <div className="space-y-1.5 text-xs text-slate-700">
              {dashboardData?.businessInsights?.map((ins, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{ins}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Menu Items & Ratings Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900">Top Performing Menu Items</h4>
              <div className="divide-y divide-slate-100 text-xs">
                {dashboardData?.popularItems?.map((dish) => (
                  <div key={dish._id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">{dish.name}</span>
                      <span className="text-[10px] text-slate-400">{dish.category} • ₹{dish.price}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold text-[11px]">
                      Pop. Score: {dish.popularityScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900">Verified Quality Metrics</h4>
              <div className="space-y-3 text-xs pt-1">
                {[
                  { label: 'Food Taste & Presentation', val: profile.ratingsBreakdown?.food || 4.5 },
                  { label: 'Host & Service Hospitality', val: profile.ratingsBreakdown?.service || 4.2 },
                  { label: 'Ambience & Cleanliness', val: profile.ratingsBreakdown?.ambience || 4.4 },
                  { label: 'Overall Patron Experience', val: profile.ratingsBreakdown?.overall || 4.5 },
                ].map((m) => (
                  <div key={m.label} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>{m.label}</span>
                      <span className="font-bold text-slate-900">{m.val.toFixed(1)} / 5.0</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(m.val / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ARRIVAL CHECK-IN & ACTIVE BOOKINGS */}
      {activeTab === 'checkin' && (
        <div className="space-y-6">
          {/* Check-In Code Input Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-sm space-y-3">
            <h3 className="font-extrabold text-base text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Verify Arrival Check-In Code
            </h3>
            <p className="text-xs text-emerald-800">
              When guests arrive at your restaurant, ask for their 4-digit code. Submitting it verifies physical arrival and switches their reservation status to "Seated".
            </p>

            <form onSubmit={handleVerifyCheckIn} className="flex gap-2 max-w-md">
              <input
                type="text"
                maxLength="4"
                placeholder="4-digit code (e.g. 4821)"
                value={checkInInput}
                onChange={(e) => setCheckInInput(e.target.value)}
                className="w-full text-base font-mono font-bold tracking-widest px-3 py-2 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shrink-0"
              >
                Seat Diner
              </button>
            </form>

            {checkInResult && (
              <div className="p-3 bg-white rounded-xl border border-emerald-300 text-xs text-emerald-900 font-semibold animate-in fade-in">
                ✓ Check-in verified! Diner is now seated at table {checkInResult.tableId?.tableNumber || ''}.
              </div>
            )}
            {checkInError && (
              <p className="text-xs text-rose-600 font-semibold">{checkInError}</p>
            )}
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h4 className="font-extrabold text-sm text-slate-900">
                Reservation Log & Seating Status
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Ref Code</th>
                    <th className="p-3">Diner Name</th>
                    <th className="p-3">Date & Slot</th>
                    <th className="p-3">Table</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Check-In Code</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookingsList.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-mono font-bold text-slate-700">{b.bookingReference}</td>
                      <td className="p-3 font-semibold text-slate-900">{b.customerId?.fullName || 'Diner'}</td>
                      <td className="p-3 text-slate-600">{b.bookingDate} • {b.timeSlot}</td>
                      <td className="p-3 font-medium">{b.tableId?.tableNumber} ({b.guestCount} guests)</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                            b.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'seated'
                              ? 'bg-blue-100 text-blue-800 animate-pulse'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          ● {b.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-brand-600">{b.checkInCode}</td>
                      <td className="p-3 text-right">
                        {b.status === 'seated' && (
                          <button
                            onClick={() => handleCompleteDining(b._id)}
                            className="px-3 py-1 rounded-lg text-[11px] font-bold text-white bg-brand-500 hover:bg-brand-600 transition"
                          >
                            Complete Visit
                          </button>
                        )}
                        {b.status === 'completed' && (
                          <span className="text-slate-400 text-[11px]">
                            Bill: ₹{b.actualBillAmount || b.billEstimatedAmount}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MENU MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Add Dish Form */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900">Add New Menu Dish</h4>
            <form onSubmit={handleAddDish} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <input
                type="text"
                required
                placeholder="Dish Name"
                value={newDish.name}
                onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                className="text-xs px-3 py-2 rounded-xl border border-slate-300 sm:col-span-2"
              />
              <select
                value={newDish.category}
                onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                className="text-xs px-2 py-2 rounded-xl border border-slate-300"
              >
                <option value="Starters">Starters</option>
                <option value="Main Course">Main Course</option>
                <option value="Breads & Rice">Breads & Rice</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
              </select>
              <select
                value={newDish.dietaryType}
                onChange={(e) => setNewDish({ ...newDish, dietaryType: e.target.value })}
                className="text-xs px-2 py-2 rounded-xl border border-slate-300"
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Vegan">Vegan</option>
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  placeholder="Price ₹"
                  value={newDish.price}
                  onChange={(e) => setNewDish({ ...newDish, price: Number(e.target.value) })}
                  className="w-full text-xs px-2 py-2 rounded-xl border border-slate-300"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Menu Items Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Dish Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {menuList.map((dish) => (
                  <tr key={dish._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 font-bold text-slate-900">{dish.name}</td>
                    <td className="p-3 text-slate-500">{dish.category}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          dish.dietaryType === 'Veg' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {dish.dietaryType}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-slate-900">₹{dish.price}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleDish(dish)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dish.isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {dish.isAvailable ? 'Available' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteDish(dish._id)}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TABLE LAYOUT */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          {/* Add Table Form */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900">Add Dining Table</h4>
            <form onSubmit={handleAddTable} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                placeholder="Table No (e.g. T-05)"
                value={newTable.tableNumber}
                onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
                className="text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
              <input
                type="number"
                min="1"
                max="20"
                required
                placeholder="Capacity (e.g. 4)"
                value={newTable.capacity}
                onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                className="text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
              <select
                value={newTable.zone}
                onChange={(e) => setNewTable({ ...newTable, zone: e.target.value })}
                className="text-xs px-2 py-2 rounded-xl border border-slate-300"
              >
                <option value="Indoor AC">Indoor AC</option>
                <option value="Family Booth">Family Booth</option>
                <option value="Outdoor / Garden">Outdoor / Garden</option>
                <option value="Rooftop">Rooftop</option>
                <option value="Private Dining">Private Dining</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
              >
                Add Table
              </button>
            </form>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tableList.map((t) => (
              <div
                key={t._id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
              >
                <div>
                  <h5 className="font-extrabold text-base text-slate-900">{t.tableNumber}</h5>
                  <p className="text-xs text-slate-500">{t.zone}</p>
                  <span className="text-[10px] font-bold text-emerald-600">{t.capacity} Seats</span>
                </div>
                <button
                  onClick={() => handleDeleteTable(t._id)}
                  className="text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: WAITLIST QUEUE */}
      {activeTab === 'waitlist' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Live Waitlist Queue</h4>
              <p className="text-xs text-slate-500">
                Customers queued when your dining slots were full. Notify them when a table frees up.
              </p>
            </div>
          </div>

          {waitlistQueue.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No customers currently waiting in line.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {waitlistQueue.map((item) => (
                <div key={item._id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-brand-600">#{item.queuePosition}</span>
                      <span className="font-bold text-slate-900">{item.customerId?.fullName || 'Diner'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Party of {item.guestCount} • Slot: {item.date} ({item.timeSlot})
                    </p>
                  </div>

                  <div>
                    {item.status === 'waiting' ? (
                      <button
                        onClick={() => handleNotifyWaitlist(item._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition"
                      >
                        Notify Table Ready
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-bold">Notified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

