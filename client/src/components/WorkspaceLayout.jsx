

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
  BowlSaladRegular,
  ClipboardTaskRegular,
  HistoryRegular,
  MoneyRegular,
  PeopleRegular,
  OpenRegular,
  ShieldCheckmarkRegular,
} from '@fluentui/react-icons';
import { useAuth } from '../contexts/AuthContext';

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/dashboard', icon: GridRegular },
  { label: 'Menu Catalog', path: '/menu-management', icon: FoodRegular },
  { label: 'Tables & QR', path: '/tables', icon: TableSimpleRegular, workflowOnly: 'table' },
  { label: 'Staff Directory', path: '/staff', icon: PeopleTeamRegular },
  { label: 'Recipe Book', path: '/recipes', icon: BookOpenRegular },
  { label: 'Orders', path: '/orders', icon: ClipboardTaskRegular },
  { label: 'Analytics', path: '/analytics', icon: DataBarVerticalRegular },
  { label: 'POS Billing', path: '/billing', icon: ReceiptRegular },
  { label: 'Bill History', path: '/bill-history', icon: HistoryRegular },
  { label: 'Configuration', path: '/config', icon: SettingsRegular },
];

const KITCHEN_NAV = [
  { label: 'Kitchen Orders', path: '/kitchen', icon: BowlSaladRegular },
];

const WAITER_NAV = [
  { label: 'Assigned Tables', path: '/waiter', icon: PeopleRegular },
  { label: 'Kitchen orders', path: '/kitchen', icon: BowlSaladRegular },
];

const BILLER_NAV = [
  { label: 'POS Billing', path: '/billing', icon: MoneyRegular },
  { label: 'Bill History', path: '/bill-history', icon: HistoryRegular },
];

export default function WorkspaceLayout() {
  const { user, role, restaurant, logout, isSuperuser, isAdmin, isKitchen, isWaiter, isBiller, getDefaultPath } = useAuth();
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
  if (isSuperuser || role === 'platform_admin') {
    navItems = [
      { label: 'Platform Console', path: '/platform', icon: ShieldCheckmarkRegular },

    ];
  } else if (isKitchen) navItems = KITCHEN_NAV;
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
    platform_admin: 'Platform Superadmin',
    admin: 'Restaurant Admin',
    kitchen: 'Chef / Kitchen',
    waiter: 'Waitstaff',
    biller: 'Cashier / Biller',
  }[role] || (isSuperuser ? 'Platform Superadmin' : 'Staff');

  const customerMenuUrl = restaurant?.slug ? `/${restaurant.slug}/menu` : null;

  return (
    <div className="min-h-screen bg-gradient-warm bg-mesh-canvas flex flex-col antialiased relative selection:bg-orange-500 selection:text-white">
      {/* ═══════════ AMBIENT FLUID BLOOM MESH (Provides vivid color refraction behind liquid glass) ═══════════ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="ambient-glow-orb-1 opacity-80" />
        <div className="ambient-glow-orb-2 opacity-75" />
        <div className="ambient-glow-orb-3 opacity-70" />
        <div className="ambient-glow-orb-4 opacity-70" />
      </div>

      {/* ═══════════ FLOATING FROSTED HEADER ═══════════ */}
      <header
        className="glass-header h-16 px-4 sm:px-8 flex items-center justify-between fixed top-0 inset-x-0 z-40"
        style={{
          backdropFilter: 'blur(32px) saturate(210%)',
          WebkitBackdropFilter: 'blur(32px) saturate(210%)',
        }}
      >
        {/* Left: Mobile menu + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100/60 transition-colors"
            aria-label="Toggle navigation" aria-expanded={sidebarOpen} aria-controls="workspace-sidebar"
          >
            {sidebarOpen ? <DismissRegular fontSize={20} /> : <NavigationRegular fontSize={20} />}
          </button>

          <NavLink to={getDefaultPath()} className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/25 transition-transform duration-200 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' }}
            >
              <FoodRegular fontSize={18} />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">
                {restaurant?.name || 'Restaurant Management Service'}
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 glass-panel hover:bg-white/90 transition-all shadow-xs"
              title="Open public customer QR menu in new tab"
            >
              <span>Customer Menu</span>
              <OpenRegular fontSize={12} className="text-slate-400" />
            </a>
          )}

          {/* Profile Dropdown */}
          <div className="relative" id="profile-dropdown-area">
            <button
              aria-label="Account menu" aria-expanded={profileOpen}
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 py-1 px-2.5 rounded-xl glass-panel hover:bg-white/90 transition-all"
              style={{
                backdropFilter: 'blur(24px) saturate(190%)',
                WebkitBackdropFilter: 'blur(24px) saturate(190%)',
              }}
            >
              <div className="text-right hidden sm:block leading-tight">
                <p className="text-xs font-bold text-slate-900">{displayName}</p>
                <p className="text-xs text-orange-600 font-semibold">{roleLabel}</p>
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
              <div
                className="absolute right-0 mt-2 w-64 glass-modal py-2 z-50 animate-scale-in"
                style={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(36px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(36px) saturate(190%)',
                }}
              >
                <div className="px-4 py-3 border-b border-slate-200/60">
                  <p className="text-sm font-extrabold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || user?.username}</p>
                </div>

                <div className="py-1 px-2 space-y-0.5">
                  {isAdmin && <NavLink
                    to="/config"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 rounded-xl hover:bg-white/70 transition-colors"
                  >
                    <SettingsRegular fontSize={15} />
                    <span>Restaurant Settings</span>
                  </NavLink>}
                  {(isSuperuser || role === 'platform_admin') && (
                    <NavLink
                      to="/platform"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-orange-600 hover:text-orange-700 rounded-xl hover:bg-orange-50/70 transition-colors"
                    >
                      <ShieldCheckmarkRegular fontSize={15} />
                      <span>Platform Admin</span>
                    </NavLink>
                  )}
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
      <div className="flex-1 flex w-full relative z-10 pt-16">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-16 glass-overlay z-40 md:hidden animate-overlay"
            style={{
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ═══════════ LIQUID GLASS SIDEBAR ═══════════ */}
        <aside id="workspace-sidebar"
          className={`
            glass-sidebar w-[270px] shrink-0 select-none overflow-y-auto
            flex flex-col py-6 px-4
            transition-transform duration-300
            md:relative md:top-auto md:bottom-auto md:translate-x-0
            ${sidebarOpen
              ? 'fixed top-16 bottom-0 left-0 z-50 translate-x-0 shadow-2xl'
              : 'fixed top-16 bottom-0 left-0 -translate-x-full md:translate-x-0'
            }
          `}
          style={{
            backdropFilter: 'blur(36px) saturate(210%)',
            WebkitBackdropFilter: 'blur(36px) saturate(210%)',
          }}
        >
          {/* Section Label */}

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
                <p className="text-xs font-bold text-slate-700">
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
