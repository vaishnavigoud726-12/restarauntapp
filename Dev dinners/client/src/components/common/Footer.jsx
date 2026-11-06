import React from 'react';
import { UtensilsCrossed, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">
                CRAVE<span className="text-brand-500">WISE</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Smart Dine-In Discovery & Restaurant Intelligence Platform. Transforming offline dining with location awareness, transparent recommendation scoring, and personalized dining passport.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 text-xs uppercase tracking-wider">
              Discovery Engine
            </h4>
            <ul className="space-y-2">
              <li><a href="/#nearby" className="hover:text-white transition">Nearby Restaurants</a></li>
              <li><a href="/group-dining" className="hover:text-white transition">Group Dining Planner</a></li>
              <li><a href="/compare" className="hover:text-white transition">Restaurant Comparison Matrix</a></li>
              <li><a href="/passport" className="hover:text-white transition">Dining Passport & Badges</a></li>
            </ul>
          </div>

          {/* Business Portals */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 text-xs uppercase tracking-wider">
              Management Portals
            </h4>
            <ul className="space-y-2">
              <li><a href="/login" className="hover:text-white transition">Restaurant Owner Login</a></li>
              <li><a href="/register" className="hover:text-white transition">Register Your Restaurant</a></li>
              <li><a href="/login" className="hover:text-white transition">Super Admin Console</a></li>
              <li><span className="text-slate-500">Hyderabad Metro Coverage</span></li>
            </ul>
          </div>

          {/* MSD University CSE Project Details */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-brand-400 font-bold text-xs mb-1">
              <Shield className="w-3.5 h-3.5" />
              MSD CSE Final Project
            </div>
            <p className="text-slate-300 text-[11px] font-medium leading-relaxed">
              Management Software Development (MSD) – 3rd Year CSE 6-Member Team Submission.
            </p>
            <div className="mt-2 text-[10px] text-slate-400 flex flex-wrap gap-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-700">MERN Stack</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-700">MongoDB GeoJSON</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-700">JWT RBAC</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-700">Recharts</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 CraveWise Inc. Built for authentic offline dining experiences.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by 6-Member CSE Squad.
          </p>
        </div>
      </div>
    </footer>
  );
}

