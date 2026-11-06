import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import {
  Compass,
  MapPin,
  UtensilsCrossed,
  Sparkles,
  Award,
  Users,
  LogOut,
  User,
  Shield,
  Store,
  ChevronDown,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { currentLocation, selectManualLocation, detectBrowserLocation, detectingGPS, hubs } = useLocation();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const routerLoc = useRouterLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  CRAVE<span className="text-brand-500">WISE</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  Smart Dine-In Discovery
                </span>
              </div>
            </Link>

            {/* Geolocation Selector Pill */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-700 transition border border-slate-200"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
                <span className="max-w-[140px] truncate">{currentLocation.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLocationDropdown && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <button
                      onClick={() => {
                        detectBrowserLocation();
                        setShowLocationDropdown(false);
                      }}
                      disabled={detectingGPS}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${detectingGPS ? 'animate-spin' : ''}`} />
                      {detectingGPS ? 'Detecting GPS...' : 'Use Current Live GPS'}
                    </button>
                  </div>
                  <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Hyderabad Dining Hub
                  </div>
                  {hubs.map((hub) => (
                    <button
                      key={hub.name}
                      onClick={() => {
                        selectManualLocation(hub);
                        setShowLocationDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 hover:text-brand-600 transition flex items-center justify-between"
                    >
                      <span>{hub.name}</span>
                      {currentLocation.name === hub.name && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Primary Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                routerLoc.pathname === '/' ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Discover
            </Link>
            <Link
              to="/group-dining"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                routerLoc.pathname.startsWith('/group-dining') ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-500" />
              Group Dining
            </Link>
            <Link
              to="/compare"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                routerLoc.pathname === '/compare' ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Compare
            </Link>
            {user && role === 'customer' && (
              <>
                <Link
                  to="/my-bookings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    routerLoc.pathname === '/my-bookings' ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  My Bookings
                </Link>
                <Link
                  to="/passport"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    routerLoc.pathname === '/passport' ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-500" />
                  Dining Passport
                  <span className="ml-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {user.loyaltyPoints || 100} pts
                  </span>
                </Link>
              </>
            )}

            {/* Restaurant Portal Link */}
            {user && role === 'restaurant_owner' && (
              <Link
                to="/owner/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
              >
                <Store className="w-4 h-4 text-emerald-600" />
                Restaurant Portal
              </Link>
            )}

            {/* Admin Portal Link */}
            {user && role === 'super_admin' && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                Super Admin
              </Link>
            )}
          </div>

          {/* User Account Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100 transition border border-slate-200"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/20"
                  />
                  <div className="hidden md:flex flex-col text-left pr-2">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {user.name || user.fullName}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {role?.replace('_', ' ')}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                    </div>

                    {role === 'customer' && (
                      <>
                        <Link
                          to="/passport"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Award className="w-4 h-4 text-amber-500" />
                          Dining Passport ({user.loyaltyPoints || 0} pts)
                        </Link>
                        <Link
                          to="/my-bookings"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Compass className="w-4 h-4 text-brand-500" />
                          My Reservations
                        </Link>
                      </>
                    )}

                    {role === 'restaurant_owner' && (
                      <Link
                        to="/owner/dashboard"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Store className="w-4 h-4 text-emerald-600" />
                        Restaurant Dashboard
                      </Link>
                    )}

                    {role === 'super_admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        Platform Administration
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-sm shadow-brand-500/20 transition hover:shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

