/**
 * AdminDashboard — Overview page with quick stats, Microsoft Fluent UI icons, and enhanced layout spacing.
 */

import { useEffect, useState } from 'react';
import {
  Receipt24Filled,
  Money24Filled,
  People24Filled,
  DataTrending24Filled,
  Clock24Filled,
  ArrowRight24Regular,
  Grid24Filled,
} from '@fluentui/react-icons';
import { Link } from 'react-router-dom';
import { getAnalyticsSummary } from '../../api/analytics';
import { getOrders } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
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
        const results = ordersRes.data.results || ordersRes.data;
        setRecentOrders(results.slice(0, 10));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  const stats = [
    { label: 'Total Orders (30d)', value: summary?.total_orders || 0, icon: Receipt24Filled, color: '#E53935', bg: 'rgba(229,57,53,0.12)' },
    { label: 'Revenue (30d)', value: `₹${(summary?.total_revenue || 0).toLocaleString()}`, icon: Money24Filled, color: '#4CAF50', bg: 'rgba(76,175,80,0.12)' },
    { label: 'Customers (30d)', value: summary?.total_customers || 0, icon: People24Filled, color: '#FFB300', bg: 'rgba(255,179,0,0.12)' },
    { label: 'Avg Order Value', value: `₹${(summary?.avg_order_value || 0).toFixed(0)}`, icon: DataTrending24Filled, color: '#42A5F5', bg: 'rgba(66,165,245,0.12)' },
  ];

  return (
    <div className="animate-fade-in w-full space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E53935] to-[#FF8F00] flex items-center justify-center text-white shadow-lg shadow-[#E53935]/20">
            <Grid24Filled className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">Overview Dashboard</h1>
            <p className="text-xs text-[#9E9E9E] mt-0.5 font-medium">Real-time statistics & today's customer ordering stream</p>
          </div>
        </div>

        <Link to="/admin/orders" className="btn btn-secondary text-xs font-extrabold px-4 py-2.5 rounded-xl gap-2 hover:border-[#FF5252]/50">
          <span>View All Orders</span>
          <ArrowRight24Regular className="text-sm" />
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card p-6 bg-[#1A1A1D] border-[#26262A] shadow-2xl hover:border-[#3E3E45] transition-all duration-300 relative overflow-hidden group rounded-2xl"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-inner"
                style={{ background: stat.bg, color: stat.color }}
              >
                <stat.icon className="text-2xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-black text-[#FAFAFA] tracking-tight truncate">{stat.value}</p>
                <p className="text-xs font-extrabold text-[#71717A] mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Live Orders Card */}
      <div className="card p-7 bg-[#1A1A1D] border-[#26262A] shadow-2xl space-y-5 rounded-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#26262A]">
          <h2 className="text-base font-extrabold text-[#FAFAFA] flex items-center gap-2.5">
            <Clock24Filled className="text-[#FF5252] text-xl" />
            <span>Today's Live Orders</span>
          </h2>
          <span className="text-xs font-extrabold text-[#FFB300] bg-[#FFB300]/10 px-3.5 py-1.5 rounded-full border border-[#FFB300]/20">
            {recentOrders.length} Recent
          </span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-14 text-[#71717A] space-y-2">
            <Receipt24Filled className="text-4xl mx-auto opacity-40 text-[#FF5252]" />
            <p className="text-sm font-extrabold text-[#FAFAFA]">No orders received today yet</p>
            <p className="text-xs">Incoming customer orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#26262A] text-[11px] font-black uppercase text-[#71717A] tracking-wider bg-[#141416]">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Table / Token</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262A] text-sm font-medium">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#222226] transition-colors">
                    <td className="py-4 px-4 font-mono text-xs font-bold text-[#FAFAFA]">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="py-4 px-4 capitalize font-semibold text-[#A1A1AA]">
                      {order.order_type}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#E0E0E0]">
                      {order.table_number && `Table ${order.table_number}`}
                      {order.token_number && `Token #${order.token_number}`}
                      {!order.table_number && !order.token_number && '—'}
                    </td>
                    <td className="py-4 px-4"><StatusBadge status={order.status} /></td>
                    <td className="py-4 px-4 font-extrabold text-[#FFB300]">
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-[#71717A]">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
