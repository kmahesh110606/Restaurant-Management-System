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
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';

export default function CustomerLayout() {
  const { slug } = useParams();
  const location = useLocation();
  const { loadRestaurantTheme, restaurantConfig, themeLoading, resetTheme } = useTheme();
  const { totalItems, setRestaurantSlug } = useCart();
  const [loaded, setLoaded] = useState(false);

  // Load restaurant theme from API on mount or slug change
  useEffect(() => {
    if (slug) {
      loadRestaurantTheme(slug).then(() => setLoaded(true));
      setRestaurantSlug(slug);
    }
    return () => {
      // Reset theme when leaving customer pages
      resetTheme();
    };
  }, [slug, loadRestaurantTheme, setRestaurantSlug, resetTheme]);

  const restaurantName = restaurantConfig?.name || 'Restaurant';

  // Determine which bottom nav item is active
  const isMenuActive = location.pathname.includes('/menu');
  const isCartActive = location.pathname.includes('/cart');
  const isOrderActive = location.pathname.includes('/order');

  if (themeLoading && !loaded) {
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

  return (
    <div className="min-h-screen bg-gradient-warm bg-mesh-canvas flex flex-col relative selection:bg-orange-500 selection:text-white">
      {/* ═══════════ CUSTOMER HEADER ═══════════ */}
      <header className="glass-header h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <NavLink to={`/${slug}/menu`} className="flex items-center gap-2.5 group">
          {restaurantConfig?.logo ? (
            <img
              src={restaurantConfig.logo}
              alt={restaurantName}
              className="w-9 h-9 rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' }}
            >
              <FoodRegular fontSize={18} />
            </div>
          )}
          <div>
            <span className="text-sm font-extrabold text-slate-900 tracking-tight block">
              {restaurantName}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
              Digital QR Menu
            </span>
          </div>
        </NavLink>

        {/* Cart badge (desktop) */}
        <NavLink
          to={`/${slug}/cart`}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass-pill text-xs font-bold text-slate-800 hover:bg-white transition-all shadow-xs"
        >
          <CartRegular fontSize={16} className="text-orange-600" />
          <span>{totalItems} Items</span>
          {totalItems > 0 && (
            <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </NavLink>
      </header>

      {/* ═══════════ CONTENT ═══════════ */}
      <main className="flex-1 p-4 sm:p-6 pb-24 sm:pb-8 max-w-5xl mx-auto w-full relative z-10">
        <Outlet context={{ restaurantConfig, slug }} />
      </main>

      {/* ═══════════ MOBILE BOTTOM NAV (Floating Frosted Capsule) ═══════════ */}
      <nav className="sm:hidden fixed bottom-3 inset-x-4 glass-card bg-white/85 py-2 px-6 border border-white/80 z-40 shadow-2xl rounded-full">
        <div className="flex items-center justify-around">
          <NavLink
            to={`/${slug}/menu`}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              isMenuActive ? 'text-orange-600 font-bold' : 'text-slate-400 font-semibold'
            }`}
          >
            <HomeRegular fontSize={20} />
            <span className="text-[10px]">Menu</span>
          </NavLink>

          <NavLink
            to={`/${slug}/cart`}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors relative ${
              isCartActive ? 'text-orange-600 font-bold' : 'text-slate-400 font-semibold'
            }`}
          >
            <CartRegular fontSize={20} />
            <span className="text-[10px]">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pop">
                {totalItems}
              </span>
            )}
          </NavLink>

          <NavLink
            to={`/${slug}/order`}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              isOrderActive ? 'text-orange-600 font-bold' : 'text-slate-400 font-semibold'
            }`}
          >
            <ClipboardTaskRegular fontSize={20} />
            <span className="text-[10px]">Track</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
