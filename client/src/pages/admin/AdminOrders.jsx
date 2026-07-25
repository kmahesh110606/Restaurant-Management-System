/**
 * AdminOrders — Admin view of all orders with filters.
 */

import { useEffect, useState, useRef } from 'react';
import { IoRefresh, IoTime } from 'react-icons/io5';
import { getOrders, updateOrderStatus } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUSES = ['', 'pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const intervalRef = useRef(null);

  const fetchOrders = () => {
    const params = { today: 'true' };
    if (statusFilter) params.status = statusFilter;
    getOrders(params)
      .then(({ data }) => setOrders(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 15000);
    return () => clearInterval(intervalRef.current);
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">📋 Orders</h1>
        <div className="flex gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
            className="input w-auto"
          >
            <option value="">All Statuses</option>
            {STATUSES.slice(1).map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button onClick={fetchOrders} className="btn btn-secondary btn-sm">
            <IoRefresh size={16} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Type</th>
              <th>Table/Token</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="font-mono text-xs">{order.id.slice(0, 8)}</td>
                <td className="capitalize">{order.order_type}</td>
                <td>
                  {order.table_number ? `Table ${order.table_number}` : ''}
                  {order.token_number ? `Token #${order.token_number}` : ''}
                  {!order.table_number && !order.token_number ? '—' : ''}
                </td>
                <td className="text-[var(--color-text-muted)]">{order.customer_phone || '—'}</td>
                <td className="text-sm">{order.items?.length || 0} items</td>
                <td><StatusBadge status={order.status} /></td>
                <td className="font-semibold">₹{parseFloat(order.total_amount).toFixed(0)}</td>
                <td className="text-[var(--color-text-muted)] text-xs">
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="input w-auto text-xs py-1"
                  >
                    {STATUSES.slice(1).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="text-center text-[var(--color-text-muted)] py-8">No orders found.</p>
        )}
      </div>

      <p className="text-center text-xs text-[var(--color-text-muted)] mt-4 flex items-center justify-center gap-1">
        <IoTime size={14} /> Auto-refreshing every 15 seconds
      </p>
    </div>
  );
}
