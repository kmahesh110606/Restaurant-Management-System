/**
 * TopHeader — Sleek top navbar using Microsoft Fluent UI icons & rich spacing.
 */

import { useLocation } from 'react-router-dom';
import { Open24Regular, Person24Regular, Sparkle24Filled } from '@fluentui/react-icons';
import { useAuth } from '../contexts/AuthContext';

const PATH_TITLES = {
  '/admin': 'Dashboard Overview',
  '/admin/menu': 'Menu Management',
  '/admin/recipes': 'Recipe Book',
  '/admin/tables': 'Table Mapping',
  '/admin/staff': 'Staff Directory',
  '/admin/orders': 'Order Stream',
  '/admin/analytics': 'Analytics & Insights',
  '/admin/config': 'Restaurant Settings',
  '/staff/kitchen': 'Kitchen Display System',
  '/staff/waiter': 'Waiter Terminal',
  '/biller': 'Billing Counter',
  '/biller/history': 'Billing History',
};

export default function TopHeader() {
  const { user, role, restaurant } = useAuth();
  const location = useLocation();

  const title = PATH_TITLES[location.pathname] || 'Dashboard';
  const menuUrl = restaurant?.slug ? `/${restaurant.slug}/menu` : '#';

  return (
    <header className="h-18 bg-[#18181A] border-b border-[#262626] px-8 flex items-center justify-between sticky top-0 z-30 shadow-lg backdrop-blur-md bg-opacity-95">
      {/* Left: Title & Breadcrumb */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-extrabold text-[#FAFAFA] tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {restaurant?.slug && (
          <span className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Menu
          </span>
        )}
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-5">
        {/* Customer Menu Link */}
        {restaurant?.slug && (
          <a
            href={menuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#242428] hover:bg-[#2C2C32] border border-[#33333A] hover:border-[#FF5252]/50 text-[#E0E0E0] hover:text-[#FF5252] text-xs font-extrabold transition-all duration-200 shadow-sm active:scale-95"
            title="View Public Customer Menu"
          >
            <span>Customer Menu</span>
            <Open24Regular className="text-sm" />
          </a>
        )}

        {/* User Pill */}
        <div className="flex items-center gap-3.5 pl-4 border-l border-[#262626]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E53935] to-[#FF8F00] flex items-center justify-center text-white font-black text-sm shadow-md ring-1 ring-white/10">
            {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-extrabold text-[#FAFAFA] truncate max-w-[140px]">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </div>
            <div className="text-[10px] font-extrabold text-[#FFB300] uppercase tracking-wider mt-0.5">
              {role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
