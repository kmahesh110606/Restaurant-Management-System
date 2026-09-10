/**
 * LandingNavbar — iOS 28 Liquid Glass Floating Navigation Bar.
 * Panoramic wide capsule with genuine optical transparency,
 * specular dual-edge highlights, and refined typography.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FoodRegular,
  NavigationRegular,
  DismissRegular,
  ArrowRightRegular,
} from '@fluentui/react-icons';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 lg:px-10 pt-3 sm:pt-4 pointer-events-none transition-all duration-300">
      <nav
        className={`max-w-[1360px] w-full mx-auto pointer-events-auto rounded-full transition-all duration-300 relative overflow-hidden ${
          scrolled
            ? 'bg-white/45 backdrop-blur-3xl py-2.5 px-5 sm:px-8 shadow-xl shadow-slate-900/5 border border-white/75'
            : 'bg-white/35 backdrop-blur-3xl py-3 px-5 sm:px-9 shadow-md shadow-slate-900/[0.03] border border-white/65'
        }`}
        style={{
          boxShadow: scrolled
            ? '0 16px 40px -8px rgba(15, 23, 42, 0.08), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.3)'
            : '0 8px 24px -4px rgba(15, 23, 42, 0.04), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Subtle top specular sheen beam */}
        <div
          className="absolute top-0 inset-x-0 h-[1.5px] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.95) 45%, rgba(255, 255, 255, 0.95) 55%, transparent 100%)',
          }}
        />

        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200"
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' }}
            >
              <FoodRegular fontSize={20} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900">
                RMS
              </span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold text-orange-600 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                System
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-200/40 backdrop-blur-md p-1.5 rounded-full border border-white/60">
            <a
              href="#features"
              className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white/80 transition-all duration-150"
            >
              Features
            </a>
            <a
              href="#workflows"
              className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white/80 transition-all duration-150"
            >
              Workflows
            </a>
            <a
              href="#preview"
              className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white/80 transition-all duration-150"
            >
              Live Cockpit
            </a>
            <a
              href="#pricing"
              className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white/80 transition-all duration-150"
            >
              Pricing
            </a>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-950 bg-white/40 hover:bg-white/70 border border-white/60 transition-all duration-200 shadow-xs"
            >
              Staff Portal
            </Link>
            <Link
              to="/signup"
              className="btn btn-primary btn-sm px-5 py-2 gap-1.5 text-xs font-bold shadow-md shadow-orange-500/25 rounded-full"
            >
              <span>Get Started</span>
              <ArrowRightRegular fontSize={13} />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full text-slate-700 hover:bg-white/60 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <DismissRegular fontSize={22} /> : <NavigationRegular fontSize={22} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden glass-modal mt-3 p-5 space-y-4 border border-white/80 shadow-2xl animate-scale-in">
            <div className="flex flex-col space-y-2 text-sm font-bold text-slate-800">
              <a
                href="#features"
                onClick={() => setMobileOpen(false)}
                className="px-3.5 py-2 rounded-xl hover:bg-white/60 transition-colors"
              >
                Features
              </a>
              <a
                href="#workflows"
                onClick={() => setMobileOpen(false)}
                className="px-3.5 py-2 rounded-xl hover:bg-white/60 transition-colors"
              >
                Workflows
              </a>
              <a
                href="#preview"
                onClick={() => setMobileOpen(false)}
                className="px-3.5 py-2 rounded-xl hover:bg-white/60 transition-colors"
              >
                Live Cockpit
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileOpen(false)}
                className="px-3.5 py-2 rounded-xl hover:bg-white/60 transition-colors"
              >
                Pricing
              </a>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="btn btn-secondary w-full py-2.5 text-xs font-bold justify-center"
              >
                Staff Portal
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="btn btn-primary w-full py-2.5 text-xs font-bold justify-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
