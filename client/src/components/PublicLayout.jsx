/**
 * PublicLayout — Layout for non-authenticated pages (landing, login, signup).
 * Minimal top navbar with logo + CTA buttons on a soft gradient background.
 */

import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FoodRegular } from '@fluentui/react-icons';

export default function PublicLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/' || location.pathname === '/landing';

  return (
    <div className={`min-h-screen flex flex-col ${isLanding ? '' : 'bg-gradient-warm'}`}>
      {/* ═══════════ NAVBAR ═══════════ */}
      <header
        className={`h-16 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40 ${
          isLanding ? 'glass-header' : 'bg-transparent'
        }`}
      >
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <FoodRegular fontSize={16} />
          </div>
          <span className="text-base font-extrabold tracking-tight text-gray-900">
            RMS
          </span>
        </NavLink>

        {/* Right: Nav Links + CTAs */}
        <div className="flex items-center gap-3">
          {isLanding && (
            <>
              <a
                href="#features"
                className="hidden sm:inline text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="hidden sm:inline text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
              >
                Pricing
              </a>
            </>
          )}
          <NavLink
            to="/login"
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
          >
            Login
          </NavLink>
          <NavLink
            to="/signup"
            className="btn btn-primary btn-sm"
          >
            Get Started
          </NavLink>
        </div>
      </header>

      {/* ═══════════ CONTENT ═══════════ */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
