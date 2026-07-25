/**
 * AdminDashboard — Overview page with quick stats.
 */

import { useEffect, useState } from 'react';
import { IoReceipt, IoCash, IoPeople, IoTrendingUp } from 'react-icons/io5';
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
    { label: 'Total Orders (30d)', value: summary?.total_orders || 0, icon: IoReceipt, color: 'var(--color-primary)' },
    { label: 'Revenue (30d)', value: `₹${(summary?.total_revenue || 0).toLocaleString()}`, icon: IoCash, color: 'var(--color-success)' },
    { label: 'Customers (30d)', value: summary?.total_customers || 0, icon: IoPeople, color: 'var(--color-accent)' },
    { label: 'Avg Order Value', value: `₹${(summary?.avg_order_value || 0).toFixed(0)}`, icon: IoTrendingUp, color: 'var(--color-info)' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-[var(--color-text-heading)] mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center"
                style={{ background: `${stat.color}20`, color: stat.color }}
              >
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-heading)]">{stat.value}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Today's Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-center py-8">No orders today yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Type</th>
                  <th>Table/Token</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs">{order.id.slice(0, 8)}...</td>
                    <td className="capitalize">{order.order_type}</td>
                    <td>
                      {order.table_number && `Table ${order.table_number}`}
                      {order.token_number && `Token #${order.token_number}`}
                      {!order.table_number && !order.token_number && '—'}
                    </td>
                    <td><StatusBadge status={order.status} /></td>
                    <td className="font-semibold">₹{parseFloat(order.total_amount).toFixed(0)}</td>
                    <td className="text-[var(--color-text-muted)]">
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
