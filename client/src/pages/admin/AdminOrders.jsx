/**
 * AdminOrders — Rebuilt Admin view of all orders with Fluent UI icons and improved layout spacing.
 */

import { useEffect, useState, useRef } from 'react';
import {
  ArrowClockwise24Regular,
  Receipt24Filled,
  Clock24Regular,
  Filter24Regular,
} from '@fluentui/react-icons';
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
    <div className="animate-fade-in space-y-6 pb-10">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E53935]/10 border border-[#E53935]/20 flex items-center justify-center text-[#FF5252]">
            <Receipt24Filled className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">Orders Stream</h1>
            <p className="text-xs text-[#9E9E9E] font-medium mt-0.5">Real-time incoming customer and table orders</p>
          </div>
        </div>

        {/* Filter and Action Controls */}
        <div className="flex gap-3 items-center">
          <div className="relative flex items-center">
            <Filter24Regular className="absolute left-3.5 text-[#71717A] text-sm pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
              className="input pl-10 pr-8 py-2 text-xs font-bold bg-[#1E1E20] border-[#2E2E33] rounded-xl focus:border-[#FF5252]"
            >
              <option value="">All Statuses</option>
              {STATUSES.slice(1).map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchOrders}
            className="btn btn-secondary py-2 px-3 rounded-xl border-[#2E2E33] hover:border-[#FF5252]/50 text-xs font-bold flex items-center gap-2 active:scale-95"
            title="Refresh orders"
          >
            <ArrowClockwise24Regular className="text-base" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Orders Data Table Container */}
      <div className="card overflow-hidden bg-[#1A1A1D] border-[#26262A] shadow-2xl rounded-2xl">
        <div className="overflow-x-auto">
          <table className="data-table w-full text-left">
            <thead>
              <tr className="bg-[#141416] border-b border-[#26262A] text-[11px] font-black uppercase tracking-wider text-[#71717A]">
                <th className="py-4 px-5">Order ID</th>
                <th className="py-4 px-5">Type</th>
                <th className="py-4 px-5">Table / Token</th>
                <th className="py-4 px-5">Customer</th>
                <th className="py-4 px-5">Items</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5">Time</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262A] text-sm font-medium">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#222226] transition-colors duration-150">
                  <td className="py-4 px-5 font-mono text-xs font-bold text-[#FAFAFA]">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="py-4 px-5 capitalize font-semibold text-[#A1A1AA]">
                    {order.order_type}
                  </td>
                  <td className="py-4 px-5 font-bold text-[#E0E0E0]">
                    {order.table_number ? `Table ${order.table_number}` : ''}
                    {order.token_number ? `Token #${order.token_number}` : ''}
                    {!order.table_number && !order.token_number ? '—' : ''}
                  </td>
                  <td className="py-4 px-5 text-xs text-[#9E9E9E] font-mono">{order.customer_phone || '—'}</td>
                  <td className="py-4 px-5 text-xs font-semibold text-[#E0E0E0]">{order.items?.length || 0} items</td>
                  <td className="py-4 px-5"><StatusBadge status={order.status} /></td>
                  <td className="py-4 px-5 font-extrabold text-[#FFB300]">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                  <td className="py-4 px-5 text-[#71717A] text-xs font-semibold">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="input w-auto text-xs py-1.5 px-3 bg-[#242428] border-[#33333A] rounded-xl font-bold focus:border-[#FF5252]"
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
        </div>

        {orders.length === 0 && (
          <div className="py-16 text-center text-[#71717A] space-y-2">
            <Receipt24Filled className="text-4xl mx-auto opacity-30 text-[#FF5252]" />
            <p className="text-base font-bold text-[#FAFAFA]">No active orders found</p>
            <p className="text-xs">New orders placed by customers will appear here automatically.</p>
          </div>
        )}
      </div>

      <p className="text-center text-xs font-semibold text-[#71717A] flex items-center justify-center gap-2 pt-2">
        <Clock24Regular className="text-sm" /> Auto-refreshing order stream every 15 seconds
      </p>
    </div>
  );
}
