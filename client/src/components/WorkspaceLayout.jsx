/**
 * WorkspaceLayout — Authenticated Staff Workspace Layout.
 * iOS 28 Liquid Glass aesthetic with multi-stage frosted sidebar,
 * floating glass header, live customer menu preview link, and role telemetry.
 */

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  GridRegular,
  FoodRegular,
  TableSimpleRegular,
  PeopleTeamRegular,
  BookOpenRegular,
  ReceiptRegular,
  DataBarVerticalRegular,
  SettingsRegular,
  SignOutRegular,
  NavigationRegular,
  DismissRegular,
  ChevronDownRegular,
  PersonRegular,
  AlertRegular,
  BowlSaladRegular,
  ClipboardTaskRegular,
  HistoryRegular,
  MoneyRegular,
  PeopleRegular,
  OpenRegular,
} from '@fluentui/react-icons';
import { useAuth } from '../contexts/AuthContext';

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/dashboard', icon: GridRegular },
  { label: 'Menu Catalog', path: '/menu-management', icon: FoodRegular },
  { label: 'Tables & QR', path: '/tables', icon: TableSimpleRegular, workflowOnly: 'table' },
  { label: 'Staff Directory', path: '/staff', icon: PeopleTeamRegular },
  { label: 'Recipe Book', path: '/recipes', icon: BookOpenRegular },
  { label: 'Live Orders', path: '/orders', icon: ClipboardTaskRegular },
  { label: 'Analytics', path: '/analytics', icon: DataBarVerticalRegular },
  { label: 'POS Billing', path: '/billing', icon: ReceiptRegular },
  { label: 'Configuration', path: '/config', icon: SettingsRegular },
];

const KITCHEN_NAV = [
  { label: 'Kitchen Orders', path: '/kitchen', icon: BowlSaladRegular },
];

const WAITER_NAV = [
  { label: 'Assigned Tables', path: '/waiter', icon: PeopleRegular },
  { label: 'Live Kitchen Orders', path: '/kitchen', icon: BowlSaladRegular },
];

const BILLER_NAV = [
  { label: 'POS Billing', path: '/billing', icon: MoneyRegular },
  { label: 'Bill History', path: '/bill-history', icon: HistoryRegular },
];

export default function WorkspaceLayout() {
  const { user, role, restaurant, logout, isAdmin, isKitchen, isWaiter, isBiller } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => {
      if (!e.target.closest('#profile-dropdown-area')) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [profileOpen]);

  // Determine nav items based on role
  let navItems = ADMIN_NAV;
  if (isKitchen) navItems = KITCHEN_NAV;
  else if (isWaiter) navItems = WAITER_NAV;
  else if (isBiller) navItems = BILLER_NAV;

  // Filter out workflow-specific items
  const workflowType = restaurant?.workflow_type;
  const filteredNav = navItems.filter((item) => {
    if (item.workflowOnly && workflowType !== item.workflowOnly) return false;
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
    : 'User';

  const roleLabel = {
    admin: 'Administrator',
    kitchen: 'Chef / Kitchen',
    waiter: 'Waitstaff',
    biller: 'Cashier / Biller',
  }[role] || 'Staff';

  const customerMenuUrl = restaurant?.slug ? `/${restaurant.slug}/menu` : null;

  return (
    <div className="min-h-screen bg-gradient-warm bg-mesh-canvas flex flex-col antialiased relative selection:bg-orange-500 selection:text-white">
      {/* ═══════════ FLOATING FROSTED HEADER ═══════════ */}
      <header className="glass-header h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        {/* Left: Mobile menu + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100/60 transition-colors"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <DismissRegular fontSize={20} /> : <NavigationRegular fontSize={20} />}
          </button>

          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/25 transition-transform duration-200 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' }}
            >
              <FoodRegular fontSize={18} />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">
                {restaurant?.name || 'Restaurant Management System'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider mt-0.5">
                RMS Suite
              </span>
            </div>
          </NavLink>
        </div>

        {/* Right: Live Customer Menu + Profile */}
        <div className="flex items-center gap-3">
          {customerMenuUrl && (
            <a
              href={customerMenuUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 glass-pill hover:bg-white transition-all shadow-xs"
              title="Open public customer QR menu in new tab"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
              <span>Customer Menu</span>
              <OpenRegular fontSize={12} className="text-slate-400" />
            </a>
          )}

          {/* Profile Dropdown */}
          <div className="relative" id="profile-dropdown-area">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 py-1 px-2.5 rounded-2xl glass-pill hover:bg-white/80 transition-all"
            >
              <div className="text-right hidden sm:block leading-tight">
                <p className="text-xs font-bold text-slate-900">{displayName}</p>
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">{roleLabel}</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <ChevronDownRegular
                fontSize={12}
                className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-modal py-2 z-50 animate-scale-in">
                <div className="px-4 py-3 border-b border-slate-200/60">
                  <p className="text-sm font-extrabold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || user?.username}</p>
                </div>

                <div className="py-1 px-2">
                  <NavLink
                    to="/config"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 rounded-xl hover:bg-white/70 transition-colors"
                  >
                    <SettingsRegular fontSize={15} />
                    <span>Restaurant Settings</span>
                  </NavLink>
                </div>

                <div className="border-t border-slate-200/60 px-2 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50/70 rounded-xl transition-colors"
                  >
                    <SignOutRegular fontSize={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════ WORKSPACE BODY ═══════════ */}
      <div className="flex-1 flex w-full relative z-10">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 glass-overlay z-40 md:hidden animate-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ═══════════ LIQUID GLASS SIDEBAR ═══════════ */}
        <aside
          className={`
            glass-sidebar w-[260px] shrink-0 select-none overflow-y-auto
            flex flex-col py-6 px-4
            transition-transform duration-300
            md:relative md:translate-x-0
            ${sidebarOpen
              ? 'fixed inset-y-0 left-0 z-50 translate-x-0 pt-20 shadow-2xl'
              : 'fixed -translate-x-full md:translate-x-0'
            }
          `}
        >
          {/* Section Label */}
          <p className="section-label px-3 mb-3 text-[10px] tracking-widest text-slate-400 uppercase font-black">
            Navigation
          </p>

          <nav className="space-y-1 flex-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/25'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                    }`
                  }
                >
                  <Icon
                    fontSize={18}
                    className="shrink-0"
                  />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Venue Capsule */}
          <div className="mt-auto pt-4 border-t border-slate-200/60 px-2">
            <div className="p-3 rounded-2xl bg-white/60 border border-white/80 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                  {restaurant?.workflow_type === 'table' ? 'Table Dine-In' :
                   restaurant?.workflow_type === 'token' ? 'Token Fast-Casual' : 'Counter POS'}
                </p>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 truncate">{restaurant?.name || 'Restaurant'}</p>
            </div>
          </div>
        </aside>

        {/* ═══════════ MAIN VIEWPORT ═══════════ */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
