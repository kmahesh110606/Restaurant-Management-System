const ORDER_TRANSITIONS = { pending: ['confirmed', 'preparing', 'cancelled'], confirmed: ['preparing', 'cancelled'], preparing: ['ready', 'cancelled'], ready: ['served', 'cancelled'], served: [], cancelled: [] };
/**
 * AdminOrders — Complete order history ledger with status filters,
 * administrative overrides, items expander, and glassmorphic styling.
 */

import { useEffect, useState, useRef } from 'react';
import {
  ArrowClockwiseRegular,
  ReceiptRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { getOrders, updateOrderStatus } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import CustomSelect from '../../components/ui/CustomSelect';
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
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const intervalRef = useRef(null);

  const fetchOrders = () => {
    const params = { today: 'true' };
    if (statusFilter) params.status = statusFilter;
    getOrders(params)
      .then(({ data }) => setOrders(data.results || data || []))
      .catch(() => setLoadError(true))
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
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status.');
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

  if (loadError) return <EmptyState title="Could not load this page" subtitle="Check your connection and try again." actionLabel="Retry" onAction={() => window.location.reload()} />;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-16 max-w-7xl mx-auto">
      {/* ═══════════ HEADER & FILTERS ═══════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Customer Orders</h1>
        </div>

        {/* Filters: Responsive on Mobile & Desktop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* Search bar: full-width on mobile, neat width on desktop with guaranteed icon clearance */}
          <div className="relative flex-1 sm:w-64">
            <SearchRegular fontSize={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10 search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search table, customer, ID..."
              className="input input-with-icon-left min-h-[40px] text-xs sm:text-sm w-full"
            />
          </div>

          {/* Dropdown & Refresh on mobile are side-by-side */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <CustomSelect
              options={STATUSES}
              value={statusFilter}
              onChange={setStatusFilter}
              size="sm"
              className="flex-1 sm:w-44"
            />

            <button
              onClick={fetchOrders}
              className="btn btn-secondary min-h-[40px] px-3.5 font-bold shrink-0"
              title="Refresh Orders"
            >
              <ArrowClockwiseRegular fontSize={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ ORDERS LIST ═══════════ */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ReceiptRegular}
          title="No orders found"
          subtitle="No tickets match the selected status filter or search term."
        />
      ) : (
        <>
          {/* Mobile Cards View (< md) */}
          <div className="block md:hidden space-y-3.5">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="glass-card p-4 space-y-3 border border-white/80 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-900">
                      #{ord.id.slice(0, 8)}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(ord.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <StatusBadge status={ord.status} />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 border-y border-gray-100/80 py-2">
                  <div className="font-bold text-gray-900">
                    {ord.table_number && `Table ${ord.table_number}`}
                    {ord.token_number && `Token #${ord.token_number}`}
                    {!ord.table_number && !ord.token_number && 'POS Counter'}
                    <span className="ml-1.5 font-normal text-gray-500 capitalize">({ord.order_type})</span>
                  </div>
                  <span className="text-gray-700 font-medium truncate max-w-[120px]">
                    {ord.customer_name || 'Guest'}
                  </span>
                </div>

                {/* Items summary */}
                <div className="text-xs text-gray-600 space-y-1">
                  {ord.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="truncate pr-2">
                        <span className="font-bold text-gray-900 mr-1.5">{it.quantity}×</span>
                        {it.menu_item_name || it.item_name || 'Dish'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-3">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total</span>
                    <span className="text-base font-black text-gray-900">
                      ₹{parseFloat(ord.total_amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="w-40 shrink-0">
                    <CustomSelect
                      value={ord.status}
                      onChange={(val) => handleStatusChange(ord.id, val)}
                      options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'preparing', label: 'Preparing' },
                        { value: 'ready', label: 'Ready' },
                        { value: 'served', label: 'Served' },
                        { value: 'cancelled', label: 'Cancelled' },
                      ].filter((option) => option.value === ord.status || ORDER_TRANSITIONS[ord.status]?.includes(option.value))}
                      size="sm"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block solid-card bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
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
                    <th>Update status</th>
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
                        <CustomSelect
                          value={ord.status}
                          onChange={(val) => handleStatusChange(ord.id, val)}
                          options={[
                            { value: 'pending', label: 'Pending' },
                            { value: 'preparing', label: 'Preparing' },
                            { value: 'ready', label: 'Ready' },
                            { value: 'served', label: 'Served' },
                            { value: 'cancelled', label: 'Cancelled' },
                          ].filter((option) => option.value === ord.status || ORDER_TRANSITIONS[ord.status]?.includes(option.value))}
                          size="sm"
                          className="w-36"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
