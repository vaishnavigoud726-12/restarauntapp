import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { UtensilsCrossed, Shield, Store, User, Lock, Mail, ArrowRight, Github } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState('customer'); // 'customer' | 'restaurant_owner' | 'super_admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(searchParams.get('oauth_error') || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const data = await login(email, password, role);
      if (data.role === 'restaurant_owner') {
        navigate('/owner/dashboard');
      } else if (data.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Instant demo filler for MSD evaluation
  const fillDemo = (demoEmail, demoPass, demoRole) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setRole(demoRole);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to CraveWise
          </h2>
          <p className="text-xs text-slate-500">
            Select your portal to access reservations, analytics, or platform administration.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-5">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                role === 'customer'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-brand-500" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('restaurant_owner')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                role === 'restaurant_owner'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-500" />
              <span>Owner</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('super_admin')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                role === 'super_admin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-purple-500" />
              <span>Admin</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {role === 'customer' && (
            <div className="space-y-3">
              <div className="relative flex items-center">
                <div className="flex-1 border-t border-slate-200" />
                <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">or</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>
              <button
                type="button"
                onClick={() => window.location.assign('/api/auth/github')}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4" />
                Continue with GitHub
              </button>
            </div>
          )}

          {/* Quick Demo Logins for Faculty & Evaluators */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block text-center">
              One-Click Viva & Faculty Evaluation Logins
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => fillDemo('rahul@gmail.com', 'customer123', 'customer')}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-center"
              >
                👤 Customer
              </button>
              <button
                type="button"
                onClick={() => fillDemo('paradise@cravewise.com', 'owner123', 'restaurant_owner')}
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-center"
              >
                🏪 Owner
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@cravewise.com', 'admin123', 'super_admin')}
                className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-semibold text-center"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
