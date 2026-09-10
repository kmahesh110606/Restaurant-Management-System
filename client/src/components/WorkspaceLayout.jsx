/**
 * WorkspaceLayout — Authenticated staff workspace layout.
 * Features a glassmorphic sidebar with role-aware navigation and a clean header.
 * Uses Fluent UI icons throughout.
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
} from '@fluentui/react-icons';
import { useAuth } from '../contexts/AuthContext';

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/dashboard', icon: GridRegular },
  { label: 'Menu', path: '/menu-management', icon: FoodRegular },
  { label: 'Tables', path: '/tables', icon: TableSimpleRegular, workflowOnly: 'table' },
  { label: 'Staff', path: '/staff', icon: PeopleTeamRegular },
  { label: 'Recipes', path: '/recipes', icon: BookOpenRegular },
  { label: 'Orders', path: '/orders', icon: ClipboardTaskRegular },
  { label: 'Analytics', path: '/analytics', icon: DataBarVerticalRegular },
  { label: 'Billing', path: '/billing', icon: ReceiptRegular },
  { label: 'Configuration', path: '/config', icon: SettingsRegular },
];

const KITCHEN_NAV = [
  { label: 'Kitchen Orders', path: '/kitchen', icon: BowlSaladRegular },
];

const WAITER_NAV = [
  { label: 'My Tables', path: '/waiter', icon: PeopleRegular },
  { label: 'Live Orders', path: '/kitchen', icon: BowlSaladRegular },
];

const BILLER_NAV = [
  { label: 'Billing', path: '/billing', icon: MoneyRegular },
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
    kitchen: 'Kitchen Staff',
    waiter: 'Waiter',
    biller: 'Biller',
  }[role] || 'Staff';

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col antialiased">
      {/* ═══════════ HEADER ═══════════ */}
      <header className="glass-header h-16 px-5 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        {/* Left: Mobile menu + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100/60 transition-colors"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <DismissRegular fontSize={20} /> : <NavigationRegular fontSize={20} />}
          </button>

          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
              style={{ background: `var(--color-primary)` }}
            >
              <FoodRegular fontSize={16} />
            </div>
            <span className="text-base font-extrabold tracking-tight text-gray-900 hidden sm:inline">
              {restaurant?.name || 'Restaurant'}
            </span>
          </NavLink>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 transition-colors relative"
            aria-label="Notifications"
          >
            <AlertRegular fontSize={18} />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" id="profile-dropdown-area">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 py-1.5 px-3 rounded-2xl hover:bg-gray-100/60 transition-all"
            >
              <div className="text-right hidden sm:block leading-tight">
                <p className="text-xs font-bold text-gray-900">{displayName}</p>
                <p className="text-[10px] text-gray-500 font-medium">{roleLabel}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <PersonRegular fontSize={16} className="text-gray-500" />
              </div>
              <ChevronDownRegular
                fontSize={12}
                className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 glass-modal py-2 z-50 animate-scale-in">
                <div className="px-4 py-2.5 border-b border-gray-100/60">
                  <p className="text-sm font-bold text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{user?.email || user?.username}</p>
                </div>

                <div className="py-1 px-2">
                  <NavLink
                    to="/config"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100/60 transition-colors"
                  >
                    <SettingsRegular fontSize={14} />
                    Settings
                  </NavLink>
                </div>

                <div className="border-t border-gray-100/60 px-2 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50/60 rounded-xl transition-colors"
                  >
                    <SignOutRegular fontSize={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════ BODY ═══════════ */}
      <div className="flex-1 flex w-full">
        {/* ═══════════ SIDEBAR ═══════════ */}
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 glass-overlay z-40 md:hidden animate-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

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
          <p className="section-label px-3 mb-3">Navigation</p>

          <nav className="space-y-0.5 flex-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[var(--color-primary-50)] text-[var(--color-primary)] font-bold border border-[var(--color-primary-100)]'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                    }`
                  }
                >
                  <Icon
                    fontSize={18}
                    className="shrink-0"
                  />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom: Restaurant info */}
          <div className="mt-auto pt-4 border-t border-gray-200/50 px-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {restaurant?.workflow_type === 'table' ? 'Table Service' :
               restaurant?.workflow_type === 'token' ? 'Token Service' : 'Counter Service'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{restaurant?.name}</p>
          </div>
        </aside>

        {/* ═══════════ MAIN CONTENT ═══════════ */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
