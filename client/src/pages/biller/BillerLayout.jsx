/**
 * BillerLayout — Layout for biller/cashier views.
 */

import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

export default function BillerLayout() {
  return (
    <div className="sidebar-layout">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
