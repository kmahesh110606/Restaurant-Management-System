/**
 * StaffLayout — Layout wrapper for staff (kitchen/waiter) dashboards.
 */

import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';

export default function StaffLayout() {
  return (
    <div className="sidebar-layout min-h-screen bg-[#121212]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />
        <main className="flex-1 p-6 overflow-y-auto w-full">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
