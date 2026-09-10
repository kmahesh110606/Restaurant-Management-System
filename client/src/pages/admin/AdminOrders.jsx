/**
 * AdminOrders — Complete order history ledger with status filters,
 * administrative overrides, items expander, and glassmorphic styling.
 */

import { useEffect, useState, useRef } from 'react';
import {
  ArrowClockwiseRegular,
  ReceiptRegular,
  ClockRegular,
  FilterRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { getOrders, updateOrderStatus } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

const STATUSES = [
  { label: 'All Orders', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Served', value: 'served' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const intervalRef = useRef(null);

  const fetchOrders = () => {
    const params = { today: 'true' };
    if (statusFilter) params.status = statusFilter;
    getOrders(params)
      .then(({ data }) => setOrders(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 12000);
    return () => clearInterval(intervalRef.current);
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(term) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(term)) ||
      (o.table_number && o.table_number.toString().includes(term)) ||
      (o.token_number && o.token_number.toString().includes(term))
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-16 max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-500/20"
            style={{ background: 'var(--color-primary)' }}
          >
            <ReceiptRegular fontSize={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customer Orders</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Live ticketing archive, table mapping, and status management
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <SearchRegular fontSize={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search table, customer, ID..."
              className="input pl-8 py-1.5 text-xs w-52"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input py-1.5 text-xs w-36"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            onClick={fetchOrders}
            className="btn btn-secondary px-3 py-1.5 text-xs font-bold gap-1.5"
          >
            <ArrowClockwiseRegular fontSize={14} />
          </button>
        </div>
      </div>

      {/* ═══════════ ORDERS TABLE ═══════════ */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ReceiptRegular}
          title="No orders found"
          subtitle="No tickets match the selected status filter or search term."
        />
      ) : (
        <div className="solid-card bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Placed At</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Customer</th>
                  <th>Items Ordered</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Override Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="font-mono text-xs font-bold text-gray-900">
                      #{ord.id.slice(0, 8)}
                    </td>
                    <td className="text-gray-500 text-xs">
                      {new Date(ord.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="capitalize text-xs font-semibold text-gray-600">
                      {ord.order_type}
                    </td>
                    <td className="text-xs font-bold text-gray-900">
                      {ord.table_number && `Table ${ord.table_number}`}
                      {ord.token_number && `Token #${ord.token_number}`}
                      {!ord.table_number && !ord.token_number && 'POS Counter'}
                    </td>
                    <td className="text-xs text-gray-700 font-medium">
                      {ord.customer_name || 'Guest'}
                    </td>
                    <td className="text-xs text-gray-600">
                      <div className="max-w-xs space-y-0.5">
                        {ord.items?.map((it, idx) => (
                          <div key={idx} className="truncate">
                            <span className="font-bold text-gray-900 mr-1">{it.quantity}×</span>
                            {it.menu_item_name || it.item_name || 'Dish'}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="font-black text-gray-900 text-xs">
                      ₹{parseFloat(ord.total_amount).toFixed(2)}
                    </td>
                    <td>
                      <StatusBadge status={ord.status} />
                    </td>
                    <td>
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className="input py-1 px-2 text-xs font-bold w-32"
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="served">Served</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
