/**
 * CustomerLayout — Layout for customer-facing QR menu pages.
 * Fetches restaurant config by slug from URL params and applies dynamic theming.
 * Minimal header with restaurant branding, optional mobile bottom nav.
 */

import { useEffect, useState } from 'react';
import { Outlet, useParams, NavLink, useLocation } from 'react-router-dom';
import {
  FoodRegular,
  CartRegular,
  ClipboardTaskRegular,
  HomeRegular,
} from '@fluentui/react-icons';
import EmptyState from '../../components/EmptyState';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';

const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://localhost/media/')) {
    return url.replace('http://localhost/media/', '/media/');
  }
  if (url.startsWith('http://localhost:8000/media/')) {
    return url.replace('http://localhost:8000/media/', '/media/');
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return parsed.pathname;
      }
    } catch {
      // ignore
    }
    return url;
  }
  return url.startsWith('/') ? url : `/${url}`;
};

export default function CustomerLayout() {
  const { slug } = useParams();
  const location = useLocation();
  const { loadRestaurantTheme, restaurantConfig, themeLoading, resetTheme } = useTheme();
  const { totalItems, setRestaurantSlug } = useCart();
  const [loaded, setLoaded] = useState(false);
  const tableQuery = new URLSearchParams(location.search).get('table');
  const tableSuffix = tableQuery ? `?table=${encodeURIComponent(tableQuery)}` : '';

  // Load restaurant theme from API on mount or slug change
  useEffect(() => {
    if (slug) {
      setLoaded(false);
      loadRestaurantTheme(slug).finally(() => setLoaded(true));
      setRestaurantSlug(slug);
    }
    return () => {
      // Reset theme when leaving customer pages
      resetTheme();
    };
  }, [slug, loadRestaurantTheme, setRestaurantSlug, resetTheme]);

  const restaurantName = restaurantConfig?.name || 'Restaurant';
  const menuBgUrl = getMediaUrl(restaurantConfig?.menu_background);
  const logoUrl = getMediaUrl(restaurantConfig?.logo);

  // Determine which bottom nav item is active
  const isMenuActive = location.pathname.includes('/menu') || location.pathname === `/${slug}`;
  const isCartActive = location.pathname.includes('/cart');
  const isOrderActive = location.pathname.includes('/order');

  if (themeLoading || !loaded) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gray-200 skeleton mx-auto mb-4" />
          <div className="h-4 w-40 skeleton mx-auto mb-2" />
          <div className="h-3 w-24 skeleton mx-auto" />
        </div>
      </div>
    );
  }

  if (!restaurantConfig) return <main className="p-8"><EmptyState title="Restaurant unavailable" subtitle="Check the menu link or ask a member of staff." actionLabel="Try again" onAction={() => window.location.reload()} /></main>;

  return (
    <div className="min-h-screen bg-gradient-warm bg-mesh-canvas flex flex-col relative selection:bg-[var(--color-primary)] selection:text-white">
      {/* ═══════════ CUSTOM MENU BACKGROUND / BRAND OVERLAY ═══════════ */}
      {menuBgUrl && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 opacity-90"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.82)), url(${menuBgUrl})`,
          }}
        />
      )}

      {/* ═══════════ CUSTOMER HEADER ═══════════ */}
      <header className="glass-header h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <NavLink to={`/${slug}/menu${tableSuffix}`} className="flex items-center gap-2.5 group">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={restaurantName}
              className="w-9 h-9 rounded-xl object-cover shadow-sm border border-white/80"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)' }}
            >
              <FoodRegular fontSize={18} />
            </div>
          )}
          <div>
            <span className="text-sm font-extrabold text-slate-900 tracking-tight block">
              {restaurantName}
            </span>
          </div>
        </NavLink>

        {/* Cart badge (desktop) */}
        <NavLink
          to={`/${slug}/cart${tableSuffix}`}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-panel text-xs font-bold text-slate-800 hover:bg-white/90 transition-all shadow-xs"
        >
          <CartRegular fontSize={16} className="text-[var(--color-primary)]" />
          <span>{totalItems} Items</span>
          {totalItems > 0 && (
            <span
              className="w-5 h-5 rounded-md text-white text-[10px] font-black flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}
            >
              {totalItems}
            </span>
          )}
        </NavLink>
      </header>

      {/* ═══════════ CONTENT ═══════════ */}
      <main className="flex-1 p-4 sm:p-6 pb-24 sm:pb-8 max-w-5xl mx-auto w-full relative z-10">
        <Outlet context={{ restaurantConfig, slug }} />
      </main>

      {/* ═══════════ MOBILE BOTTOM NAV (Floating Glass Dock) ═══════════ */}
      <nav className="sm:hidden fixed bottom-3 inset-x-4 glass-card bg-white/85 py-2 px-6 border border-white/80 z-40 shadow-2xl rounded-2xl">
        <div className="flex items-center justify-around">
          <NavLink
            to={`/${slug}/menu${tableSuffix}`}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors"
            style={{ color: isMenuActive ? 'var(--color-primary)' : '#94a3b8', fontWeight: isMenuActive ? 700 : 500 }}
          >
            <HomeRegular fontSize={20} />
            <span className="text-[10px]">Menu</span>
          </NavLink>

          <NavLink
            to={`/${slug}/cart${tableSuffix}`}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors relative"
            style={{ color: isCartActive ? 'var(--color-primary)' : '#94a3b8', fontWeight: isCartActive ? 700 : 500 }}
          >
            <CartRegular fontSize={20} />
            <span className="text-[10px]">Cart</span>
            {totalItems > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pop"
                style={{ background: 'var(--color-primary)' }}
              >
                {totalItems}
              </span>
            )}
          </NavLink>

          <NavLink
            to={`/${slug}/order${tableSuffix}`}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors"
            style={{ color: isOrderActive ? 'var(--color-primary)' : '#94a3b8', fontWeight: isOrderActive ? 700 : 500 }}
          >
            <ClipboardTaskRegular fontSize={20} />
            <span className="text-[10px]">Track</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
