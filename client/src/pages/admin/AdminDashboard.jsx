/**
 * AdminDashboard — Overview dashboard with KPI stat cards,
 * today's live incoming orders, quick management links, and glassmorphic styling.
 */

import { useEffect, useState } from 'react';
import {
  ReceiptRegular,
  MoneyRegular,
  PeopleRegular,
  ArrowTrendingLinesRegular,
  ClockRegular,
  ArrowRightRegular,
  GridRegular,
  FoodRegular,
  TableSimpleRegular,
  SettingsRegular,
  BowlSaladRegular,
} from '@fluentui/react-icons';
import { Link } from 'react-router-dom';
import { getAnalyticsSummary } from '../../api/analytics';
import { getOrders } from '../../api/orders';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const { restaurant } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAnalyticsSummary({ days: 30 }),
      getOrders({ today: 'true' }),
    ])
      .then(([summaryRes, ordersRes]) => {
        setSummary(summaryRes.data);
        const results = ordersRes.data.results || ordersRes.data || [];
        setRecentOrders(results.slice(0, 8));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Monthly Orders',
      value: summary?.total_orders || 0,
      icon: ReceiptRegular,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Total Revenue',
      value: `₹${(summary?.total_revenue || 0).toLocaleString()}`,
      icon: MoneyRegular,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Diners',
      value: summary?.total_customers || 0,
      icon: PeopleRegular,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Average Ticket',
      value: `₹${(summary?.avg_order_value || 0).toFixed(0)}`,
      icon: ArrowTrendingLinesRegular,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-16 max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-500/20"
            style={{ background: 'var(--color-primary)' }}
          >
            <GridRegular fontSize={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {restaurant?.name || 'Restaurant'} Management Console
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Live operational stream, revenue metrics, and administrative controls
            </p>
          </div>
        </div>

        <Link
          to="/orders"
          className="btn btn-secondary text-xs font-bold px-4 py-2 gap-2"
        >
          <span>All Orders</span>
          <ArrowRightRegular fontSize={14} />
        </Link>
      </div>

      {/* ═══════════ KPI STAT CARDS ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.label}
              className="stat-card glass-card p-5 flex items-center gap-4 border border-gray-200/80"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${st.bg} ${st.color}`}
              >
                <Icon fontSize={22} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black text-gray-900 tracking-tight truncate">
                  {st.value}
                </p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                  {st.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════ QUICK SHORTCUTS ═══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/menu-management"
          className="p-4 rounded-2xl glass-panel border border-gray-200/80 hover:border-gray-300 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-[var(--color-primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
            <FoodRegular fontSize={18} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-900">Manage Menu</p>
            <p className="text-[11px] text-gray-400">Items & Categories</p>
          </div>
        </Link>

        <Link
          to="/kitchen"
          className="p-4 rounded-2xl glass-panel border border-gray-200/80 hover:border-gray-300 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <BowlSaladRegular fontSize={18} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-900">Live Kitchen</p>
            <p className="text-[11px] text-gray-400">Kanban Board</p>
          </div>
        </Link>

        <Link
          to="/tables"
          className="p-4 rounded-2xl glass-panel border border-gray-200/80 hover:border-gray-300 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <TableSimpleRegular fontSize={18} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-900">QR & Tables</p>
            <p className="text-[11px] text-gray-400">Layout & Codes</p>
          </div>
        </Link>

        <Link
          to="/config"
          className="p-4 rounded-2xl glass-panel border border-gray-200/80 hover:border-gray-300 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <SettingsRegular fontSize={18} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-900">Settings</p>
            <p className="text-[11px] text-gray-400">Branding & Taxes</p>
          </div>
        </Link>
      </div>

      {/* ═══════════ TODAY'S LIVE ORDERS ═══════════ */}
      <div className="solid-card bg-white border border-gray-200/90 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <ClockRegular fontSize={18} className="text-[var(--color-primary)]" />
            <span>Today's Incoming Orders</span>
          </h2>
          <span className="badge badge-confirmed font-mono text-xs font-bold">
            {recentOrders.length} Recent
          </span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <ReceiptRegular fontSize={36} className="mx-auto text-gray-300" />
            <p className="text-xs font-bold text-gray-700">No orders received today yet</p>
            <p className="text-xs">Customer QR orders and POS tickets will show up here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Type</th>
                  <th>Table / Token</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="font-mono text-xs font-bold text-gray-900">
                      #{ord.id.slice(0, 8)}
                    </td>
                    <td className="capitalize text-xs font-semibold text-gray-600">
                      {ord.order_type}
                    </td>
                    <td className="text-xs font-bold text-gray-900">
                      {ord.table_number && `Table ${ord.table_number}`}
                      {ord.token_number && `Token #${ord.token_number}`}
                      {!ord.table_number && !ord.token_number && 'POS Counter'}
                    </td>
                    <td>
                      <StatusBadge status={ord.status} />
                    </td>
                    <td className="font-bold text-[var(--color-primary)] text-xs">
                      ₹{parseFloat(ord.total_amount).toFixed(2)}
                    </td>
                    <td className="text-xs text-gray-500">
                      {new Date(ord.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
