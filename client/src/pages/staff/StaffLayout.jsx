/**
 * StaffLayout — Layout wrapper for staff (kitchen/waiter) dashboards.
 */

import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

export default function StaffLayout() {
  return (
    <div className="sidebar-layout">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
