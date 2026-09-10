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
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      {/* ═══════════ CUSTOMER HEADER ═══════════ */}
      <header className="glass-header h-14 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <NavLink to={`/${slug}/menu`} className="flex items-center gap-2.5">
          {restaurantConfig?.logo ? (
            <img
              src={restaurantConfig.logo}
              alt={restaurantName}
              className="w-8 h-8 rounded-xl object-cover"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              <FoodRegular fontSize={14} />
            </div>
          )}
          <span className="text-sm font-extrabold text-gray-900 tracking-tight">
            {restaurantName}
          </span>
        </NavLink>

        {/* Cart badge (desktop) */}
        <NavLink
          to={`/${slug}/cart`}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)] text-xs font-bold hover:bg-[var(--color-primary-100)] transition-colors"
        >
          <CartRegular fontSize={14} />
          <span>{totalItems} Items</span>
        </NavLink>
      </header>

      {/* ═══════════ CONTENT ═══════════ */}
      <main className="flex-1 p-4 sm:p-6 pb-24 sm:pb-6 max-w-5xl mx-auto w-full">
        <Outlet context={{ restaurantConfig, slug }} />
      </main>

      {/* ═══════════ MOBILE BOTTOM NAV ═══════════ */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 glass-header border-t border-gray-200/40 z-40">
        <div className="flex items-center justify-around py-2">
          <NavLink
            to={`/${slug}/menu`}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              isMenuActive ? 'text-[var(--color-primary)]' : 'text-gray-400'
            }`}
          >
            <HomeRegular fontSize={20} />
            <span className="text-[10px] font-bold">Menu</span>
          </NavLink>

          <NavLink
            to={`/${slug}/cart`}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors relative ${
              isCartActive ? 'text-[var(--color-primary)]' : 'text-gray-400'
            }`}
          >
            <CartRegular fontSize={20} />
            <span className="text-[10px] font-bold">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 right-1 w-4 h-4 bg-[var(--color-primary)] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pop">
                {totalItems}
              </span>
            )}
          </NavLink>

          <NavLink
            to={`/${slug}/orders`}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              isOrderActive ? 'text-[var(--color-primary)]' : 'text-gray-400'
            }`}
          >
            <ClipboardTaskRegular fontSize={20} />
            <span className="text-[10px] font-bold">Orders</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
