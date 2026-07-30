/**
 * Sidebar — Rebuilt premium navigation sidebar using Microsoft Fluent UI icons & enhanced spacing.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import {
  Grid24Filled,
  Food24Filled,
  Book24Filled,
  Table24Filled,
  People24Filled,
  Receipt24Filled,
  DataTrending24Filled,
  Settings24Filled,
  SignOut24Filled,
  Fire24Filled,
  Payment24Filled,
} from '@fluentui/react-icons';
import { useAuth } from '../contexts/AuthContext';

const navItems = {
  admin: [
    { path: '/admin', icon: Grid24Filled, label: 'Dashboard', end: true },
    { path: '/admin/menu', icon: Food24Filled, label: 'Menu Management' },
    { path: '/admin/recipes', icon: Book24Filled, label: 'Recipe Book' },
    { path: '/admin/tables', icon: Table24Filled, label: 'Table Mapping' },
    { path: '/admin/staff', icon: People24Filled, label: 'Staff Directory' },
    { path: '/admin/orders', icon: Receipt24Filled, label: 'Orders Stream' },
    { path: '/admin/analytics', icon: DataTrending24Filled, label: 'Analytics' },
    { path: '/admin/config', icon: Settings24Filled, label: 'Settings' },
  ],
  waiter: [
    { path: '/staff/waiter', icon: Food24Filled, label: 'Waiter Terminal', end: true },
  ],
  kitchen: [
    { path: '/staff/kitchen', icon: Cookbook24Filled, label: 'Kitchen Display', end: true },
  ],
  biller: [
    { path: '/biller', icon: Payment24Filled, label: 'Billing Counter', end: true },
    { path: '/biller/history', icon: Receipt24Filled, label: 'Billing History' },
  ],
};

export default function Sidebar() {
  const { user, role, restaurant, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-[280px] h-screen sticky top-0 flex flex-col bg-[#141414] border-r border-[#262626] select-none z-40 shadow-2xl">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#262626] flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E53935] via-[#D32F2F] to-[#FF8F00] flex items-center justify-center shadow-lg shadow-[#E53935]/25 flex-shrink-0 ring-1 ring-white/10">
          <Fire24Filled className="text-white text-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-[#FAFAFA] truncate tracking-tight">
            {restaurant?.name || 'DineFlow'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-[#FFB300] animate-pulse" />
            <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
              {role} Console
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 text-[11px] font-extrabold uppercase text-[#71717A] tracking-widest">
          Main Navigation
        </div>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[#E53935] to-[#C62828] text-white shadow-lg shadow-[#E53935]/30 border border-[#FF5252]/40 translate-x-1'
                  : 'text-[#A1A1AA] hover:bg-[#222224] hover:text-[#FAFAFA] border border-transparent hover:translate-x-0.5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`text-xl transition-all duration-200 ${
                    isActive ? 'text-white scale-110' : 'text-[#71717A] group-hover:text-[#FF5252] group-hover:scale-105'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer User Info & Logout */}
      <div className="p-5 border-t border-[#262626] bg-[#18181A]">
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#222226] border border-[#2E2E33] mb-3.5 shadow-inner">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E53935] to-[#FF8F00] flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0">
            {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-[#FAFAFA] truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </p>
            <p className="text-[11px] font-bold text-[#FFB300] capitalize tracking-wide mt-0.5">
              {role} Account
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-extrabold text-[#FF5252] bg-[#E53935]/12 hover:bg-[#E53935]/22 border border-[#E53935]/25 transition-all duration-200 hover:shadow-lg hover:shadow-[#E53935]/15 active:scale-[0.98]"
          id="sidebar-signout-btn"
        >
          <SignOut24Filled className="text-base" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
