/**
 * KitchenDashboard — Real-time kitchen terminal focused on prep workflows.
 * Glassmorphic design, Fluent UI icons, elapsed timers, status progression.
 */

import { useEffect, useState, useRef } from 'react';
import {
  BowlSaladRegular,
  CheckmarkCircleRegular,
  ArrowClockwiseRegular,
  ClockRegular,
  BookOpenRegular,
  TimerRegular,
  AlertRegular,
} from '@fluentui/react-icons';
import { getOrders, updateOrderStatus } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchOrders = () => {
    getOrders({ today: 'true' })
      .then(({ data }) => {
        const results = data.results || data || [];
        const active = results.filter((o) => ['pending', 'confirmed', 'preparing'].includes(o.status));
        setOrders(active);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 8000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-12 max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-500/20"
            style={{ background: 'var(--color-primary)' }}
          >
            <BowlSaladRegular fontSize={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Kitchen Order Tickets</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {orders.length} active ticket{orders.length !== 1 ? 's' : ''} in the preparation pipeline
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className="btn btn-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <ArrowClockwiseRegular fontSize={14} /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={CheckmarkCircleRegular}
          title="All caught up!"
          subtitle="No active tickets waiting in the kitchen queue right now."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => {
            const elapsedMinutes = Math.floor(
              (new Date() - new Date(order.created_at)) / (1000 * 60)
            );

            return (
              <div
                key={order.id}
                className={`glass-card p-5 rounded-2xl space-y-4 flex flex-col justify-between border transition-all ${
                  order.status === 'pending'
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : 'border-gray-200/80'
                }`}
              >
                <div>
                  {/* Top bar: table/token + elapsed time */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      {order.table_number && (
                        <span className="text-xs font-black text-[var(--color-primary)] bg-orange-50 px-3 py-1 rounded-xl border border-orange-200">
                          Table {order.table_number}
                        </span>
                      )}
                      {order.token_number && (
                        <span className="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                          Token #{order.token_number}
                        </span>
                      )}
                      {!order.table_number && !order.token_number && (
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-xl">
                          Counter
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                      <ClockRegular fontSize={12} />
                      <span>{elapsedMinutes}m ago</span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center justify-between text-xs py-2 text-gray-500 font-medium">
                    <span className="font-mono font-bold text-gray-400">#{order.id.slice(0, 8)}</span>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Items list */}
                  <div className="py-2 border-t border-gray-100 space-y-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between text-sm gap-2">
                        <span className="font-semibold text-gray-800 flex-1">
                          <span className="font-extrabold text-[var(--color-primary)] mr-2">
                            {item.quantity}×
                          </span>
                          {item.menu_item_name || item.item_name || 'Dish'}
                        </span>
                        {item.notes && (
                          <span className="text-xs text-amber-600 italic bg-amber-50 px-2 py-0.5 rounded">
                            {item.notes}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Special Notes */}
                  {order.notes && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-xs text-amber-800 font-medium">
                      <span className="font-bold">Instructions:</span> {order.notes}
                    </div>
                  )}
                </div>

                {/* Status action */}
                <div className="pt-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                      className="w-full btn btn-primary py-2.5 text-xs font-bold gap-2"
                    >
                      <BowlSaladRegular fontSize={16} />
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'ready')}
                      className="w-full btn btn-success py-2.5 text-xs font-bold gap-2"
                    >
                      <CheckmarkCircleRegular fontSize={16} />
                      Mark Ready for Pickup
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
