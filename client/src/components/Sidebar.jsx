/**
 * Sidebar — Staff/Admin navigation sidebar.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import {
  IoRestaurant, IoGrid, IoReceipt, IoPeople, IoSettings,
  IoBarChart, IoLogOut, IoBook, IoTabletLandscape, IoTicket,
  IoFastFood, IoWallet,
} from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';

const navItems = {
  admin: [
    { path: '/admin', icon: IoGrid, label: 'Dashboard', end: true },
    { path: '/admin/menu', icon: IoRestaurant, label: 'Menu' },
    { path: '/admin/recipes', icon: IoBook, label: 'Recipes' },
    { path: '/admin/tables', icon: IoTabletLandscape, label: 'Tables' },
    { path: '/admin/staff', icon: IoPeople, label: 'Staff' },
    { path: '/admin/orders', icon: IoReceipt, label: 'Orders' },
    { path: '/admin/analytics', icon: IoBarChart, label: 'Analytics' },
    { path: '/admin/config', icon: IoSettings, label: 'Settings' },
  ],
  waiter: [
    { path: '/staff/waiter', icon: IoFastFood, label: 'Dashboard', end: true },
  ],
  kitchen: [
    { path: '/staff/kitchen', icon: IoRestaurant, label: 'Kitchen', end: true },
  ],
  biller: [
    { path: '/biller', icon: IoWallet, label: 'Billing', end: true },
    { path: '/biller/history', icon: IoReceipt, label: 'History' },
  ],
};

export default function Sidebar() {
  const { user, role, restaurant, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-[260px] h-screen sticky top-0 flex flex-col bg-[var(--color-bg-card)] border-r border-[var(--color-border-light)]">
      {/* Brand */}
      <div className="p-5 border-b border-[var(--color-border-light)]">
        <h1 className="text-lg font-bold text-[var(--color-text-heading)] truncate">
          {restaurant?.name || 'Restaurant'}
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 capitalize">
          {role} Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-[var(--color-border-light)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold text-sm">
            {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-heading)] truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] capitalize">{role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost w-full justify-start text-[var(--color-danger)]">
          <IoLogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
