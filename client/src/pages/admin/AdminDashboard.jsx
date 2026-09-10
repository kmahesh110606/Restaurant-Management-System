/**
 * AdminDashboard — iOS 28 Liquid Glass Operations Cockpit.
 * KPI telemetry cards with dynamic mesh refractions,
 * live incoming orders stream, quick shortcuts, and glassmorphic tables.
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
  SparkleRegular,
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
      <div className="flex justify-center items-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Monthly Orders',
      value: summary?.total_orders || 0,
      icon: ReceiptRegular,
      color: '#EA580C',
      bg: 'rgba(234, 88, 12, 0.1)',
      trend: '+14% vs last month',
    },
    {
      label: 'Total Revenue',
      value: `₹${(summary?.total_revenue || 0).toLocaleString()}`,
      icon: MoneyRegular,
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.1)',
      trend: '+22% revenue pacing',
    },
    {
      label: 'Total Diners',
      value: summary?.total_customers || 0,
      icon: PeopleRegular,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.1)',
      trend: 'Active guest engagement',
    },
    {
      label: 'Average Ticket',
      value: `₹${(summary?.avg_order_value || 0).toFixed(0)}`,
      icon: ArrowTrendingLinesRegular,
      color: '#6366F1',
      bg: 'rgba(99, 102, 241, 0.1)',
      trend: 'Per-table average',
    },
  ];

  return (
    <div className="animate-fade-in space-y-10 pb-20 max-w-7xl mx-auto">
      {/* ═══════════ OPERATIONS COCKPIT HEADER ═══════════ */}
      <div className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-white/80">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/25 shrink-0"
            style={{ background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' }}
          >
            <GridRegular fontSize={26} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {restaurant?.name || 'Restaurant'} Operations Cockpit
              </h1>
              <span className="badge badge-ready font-bold text-xs py-1 px-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                Live Floor
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Real-time ticketing telemetry, floor occupancy, and administrative controls
            </p>
          </div>
        </div>

        <Link
          to="/orders"
          className="btn btn-secondary text-xs font-bold px-5 py-2.5 gap-2 shadow-sm self-start sm:self-center"
        >
          <span>All Order Records</span>
          <ArrowRightRegular fontSize={14} />
        </Link>
      </div>

      {/* ═══════════ KPI STAT CARDS ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.label}
              className="glass-card p-6 flex flex-col justify-between space-y-4 border border-white/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {st.label}
                </span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: st.bg, color: st.color }}
                >
                  <Icon fontSize={20} />
                </div>
              </div>

              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {st.value}
                </p>
                <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {st.trend}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════ QUICK LAUNCH ACTIONS ═══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <Link
          to="/menu-management"
          className="glass-card-interactive p-5 flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <FoodRegular fontSize={22} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-900">Manage Menu</p>
            <p className="text-xs text-slate-400 font-medium">Dishes & Pricing</p>
          </div>
        </Link>

        <Link
          to="/kitchen"
          className="glass-card-interactive p-5 flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <BowlSaladRegular fontSize={22} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-900">Kitchen Display</p>
            <p className="text-xs text-slate-400 font-medium">Live Kanban Queue</p>
          </div>
        </Link>

        <Link
          to="/tables"
          className="glass-card-interactive p-5 flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <TableSimpleRegular fontSize={22} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-900">Tables & QR</p>
            <p className="text-xs text-slate-400 font-medium">Desk QR Codes</p>
          </div>
        </Link>

        <Link
          to="/config"
          className="glass-card-interactive p-5 flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <SettingsRegular fontSize={22} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-900">Settings</p>
            <p className="text-xs text-slate-400 font-medium">Branding & Taxes</p>
          </div>
        </Link>
      </div>

      {/* ═══════════ TODAY'S LIVE INCOMING ORDERS TABLE ═══════════ */}
      <div className="glass-card p-6 sm:p-8 space-y-6 border border-white/80">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <ClockRegular fontSize={18} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Today's Live Order Stream
              </h2>
              <p className="text-xs text-slate-500 font-medium">Auto-synced from customer QR scans and counter POS</p>
            </div>
          </div>
          <span className="badge badge-confirmed font-mono text-xs font-bold py-1 px-3">
            {recentOrders.length} Active Tickets
          </span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-3">
            <ReceiptRegular fontSize={40} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No tickets placed yet today</p>
            <p className="text-xs max-w-sm mx-auto text-slate-500">
              Customer QR orders from dining tables and POS tickets will appear here instantaneously in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Service Type</th>
                  <th>Table / Token</th>
                  <th>Live Status</th>
                  <th>Net Amount</th>
                  <th>Placed Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="transition-colors">
                    <td className="font-mono text-xs font-bold text-slate-900">
                      #{ord.id.slice(0, 8)}
                    </td>
                    <td className="capitalize text-xs font-bold text-slate-600">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/50">
                        {ord.order_type}
                      </span>
                    </td>
                    <td className="text-xs font-bold text-slate-900">
                      {ord.table_number && (
                        <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 border border-orange-500/20">
                          Table {ord.table_number}
                        </span>
                      )}
                      {ord.token_number && (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/20">
                          Token #{ord.token_number}
                        </span>
                      )}
                      {!ord.table_number && !ord.token_number && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                          POS Counter
                        </span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={ord.status} />
                    </td>
                    <td className="font-black text-orange-600 text-xs font-mono">
                      ₹{parseFloat(ord.total_amount).toFixed(2)}
                    </td>
                    <td className="text-xs font-medium text-slate-500">
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
