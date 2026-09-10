/**
 * LandingNavbar — Glassmorphic top navigation for the landing page.
 * Responsive with mobile menu, smooth blur effect, and Fluent UI icons.
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
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-gray-200/60 shadow-xs py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform"
            style={{ background: 'var(--color-primary)' }}
          >
            <FoodRegular fontSize={22} />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900">
            Savoré<span className="text-[var(--color-primary)]">RMS</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-bold text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">
            Features
          </a>
          <a href="#workflows" className="hover:text-gray-900 transition-colors">
            Workflows
          </a>
          <a href="#preview" className="hover:text-gray-900 transition-colors">
            Live Preview
          </a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">
            Pricing
          </a>
        </div>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="btn btn-secondary text-xs font-bold px-4 py-2"
          >
            Staff Login
          </Link>
          <Link
            to="/signup"
            className="btn btn-primary text-xs font-bold px-5 py-2 gap-1.5 shadow-md shadow-orange-500/20"
          >
            <span>Start Free</span>
            <ArrowRightRegular fontSize={14} />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <DismissRegular fontSize={22} /> : <NavigationRegular fontSize={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden glass-modal mx-4 mt-3 p-5 space-y-4 border border-gray-200 shadow-xl animate-scale-in">
          <div className="flex flex-col space-y-3 text-sm font-bold text-gray-800">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[var(--color-primary)]"
            >
              Features
            </a>
            <a
              href="#workflows"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[var(--color-primary)]"
            >
              Workflows
            </a>
            <a
              href="#preview"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[var(--color-primary)]"
            >
              Live Preview
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[var(--color-primary)]"
            >
              Pricing
            </a>
          </div>

          <div className="pt-3 border-t border-gray-200/80 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="btn btn-secondary w-full py-2.5 text-xs font-bold"
            >
              Staff Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileOpen(false)}
              className="btn btn-primary w-full py-2.5 text-xs font-bold"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
