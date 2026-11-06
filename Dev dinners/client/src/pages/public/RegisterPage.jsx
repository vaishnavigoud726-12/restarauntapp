import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UtensilsCrossed, User, Store, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [isRestaurant, setIsRestaurant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Customer state
  const [customerForm, setCustomerForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    dietary: 'Veg',
  });

  // Restaurant state
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    area: 'Hitec City',
    priceForTwo: 800,
    diningStyle: 'Casual Dining',
    cuisineTypes: 'Hyderabadi, North Indian',
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isRestaurant) {
        const payload = {
          ...restaurantForm,
          cuisineTypes: restaurantForm.cuisineTypes.split(',').map((c) => c.trim()),
          priceForTwo: Number(restaurantForm.priceForTwo),
        };
        await register(payload, true);
        navigate('/owner/dashboard');
      } else {
        const payload = {
          fullName: customerForm.fullName,
          email: customerForm.email,
          password: customerForm.password,
          phone: customerForm.phone,
          dietaryPreferences: [customerForm.dietary],
        };
        await register(payload, false);
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Join CraveWise
          </h2>
          <p className="text-xs text-slate-500">
            Register as a dining patron or list your restaurant establishment.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-5">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setIsRestaurant(false)}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                !isRestaurant
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-brand-500" />
              <span>Dine-In Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setIsRestaurant(true)}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                isRestaurant
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-500" />
              <span>Restaurant Owner</span>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {!isRestaurant ? (
              /* Customer Form */
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Varma"
                    value={customerForm.fullName}
                    onChange={(e) => setCustomerForm({ ...customerForm, fullName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="name@gmail.com"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98490 00000"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={customerForm.password}
                    onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dietary Preference</label>
                  <select
                    value={customerForm.dietary}
                    onChange={(e) => setCustomerForm({ ...customerForm, dietary: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Halal">Halal</option>
                    <option value="Jain">Jain</option>
                  </select>
                </div>
              </>
            ) : (
              /* Restaurant Form */
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Restaurant Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Nizami Dine"
                      value={restaurantForm.name}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Owner Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mohammed Khan"
                      value={restaurantForm.ownerName}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, ownerName: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Business Email</label>
                    <input
                      type="email"
                      required
                      placeholder="manager@venue.com"
                      value={restaurantForm.email}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, email: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98490 00000"
                      value={restaurantForm.phone}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Hyderabad Area</label>
                    <select
                      value={restaurantForm.area}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, area: e.target.value })}
                      className="w-full text-xs px-2 py-2 rounded-xl border border-slate-300"
                    >
                      <option value="Hitec City">Hitec City</option>
                      <option value="Jubilee Hills">Jubilee Hills</option>
                      <option value="Banjara Hills">Banjara Hills</option>
                      <option value="Gachibowli">Gachibowli</option>
                      <option value="Secunderabad">Secunderabad</option>
                      <option value="Madhapur">Madhapur</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Price for 2 (₹)</label>
                    <input
                      type="number"
                      required
                      value={restaurantForm.priceForTwo}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, priceForTwo: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Dining Style</label>
                    <select
                      value={restaurantForm.diningStyle}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, diningStyle: e.target.value })}
                      className="w-full text-xs px-2 py-2 rounded-xl border border-slate-300"
                    >
                      <option value="Casual Dining">Casual Dining</option>
                      <option value="Fine Dining">Fine Dining</option>
                      <option value="Café">Café</option>
                      <option value="Rooftop">Rooftop</option>
                      <option value="Family Restaurant">Family Restaurant</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cuisines (comma separated)</label>
                  <input
                    type="text"
                    value={restaurantForm.cuisineTypes}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, cuisineTypes: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={restaurantForm.password}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, password: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

