/**
 * KitchenKanbanPage — Real-time Kanban board for kitchen and floor staff.
 * 4 columns: Pending, Preparing, Ready, Served.
 * API-driven, live polling, glassmorphic cards, Fluent UI icons.
 */

import { useState, useEffect, useRef } from 'react';
import {
  BowlSaladRegular,
  ClockRegular,
  CheckmarkCircleRegular,
  ArrowClockwiseRegular,
  TimerRegular,
  FoodRegular,
  DismissRegular,
  AlertUrgentRegular,
  PrintRegular,
  ChevronRightRegular,
} from '@fluentui/react-icons';
import { getOrders, updateOrderStatus } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const COLUMNS = [
  { key: 'pending', title: 'Pending', color: 'text-amber-600', badgeClass: 'badge-pending' },
  { key: 'preparing', title: 'Preparing', color: 'text-purple-600', badgeClass: 'badge-preparing' },
  { key: 'ready', title: 'Ready to Run', color: 'text-emerald-600', badgeClass: 'badge-ready' },
  { key: 'served', title: 'Served', color: 'text-gray-500', badgeClass: 'badge-served' },
];

export default function KitchenKanbanPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const prevPendingCountRef = useRef(0);
  const intervalRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const { data } = await getOrders({ today: 'true' });
      const list = data.results || data || [];
      const pendingCount = list.filter((o) => o.status === 'pending').length;

      // Audio notification if new orders arrived
      if (pendingCount > prevPendingCountRef.current && prevPendingCountRef.current > 0) {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.value = 587.33; // D5
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
          setTimeout(() => osc.stop(), 500);
        } catch {
          // Audio playback allowed upon user interaction
        }
        toast('New order received!', { icon: '🔔' });
      }
      prevPendingCountRef.current = pendingCount;
      setOrders(list);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 8000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-500/20"
            style={{ background: 'var(--color-primary)' }}
          >
            <BowlSaladRegular fontSize={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Kitchen Orders Kanban</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live ticketing stream • Auto-refreshing every 8s • Last updated:{' '}
              {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="btn btn-secondary px-3.5 py-2 text-xs font-bold gap-2"
          >
            <PrintRegular fontSize={14} />
            <span className="hidden sm:inline">Print Orders</span>
          </button>
          <button
            onClick={fetchOrders}
            className="btn btn-primary px-3.5 py-2 text-xs font-bold gap-2"
          >
            <ArrowClockwiseRegular fontSize={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ═══════════ KANBAN GRID (4 COLUMNS) ═══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.key);

          return (
            <div
              key={col.key}
              className="glass-panel p-4 rounded-3xl border border-gray-200/80 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200/60">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black uppercase tracking-wider ${col.color}`}>
                    {col.title}
                  </span>
                </div>
                <span className={`badge ${col.badgeClass} font-mono font-bold text-xs`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards in this Column */}
              <div className="space-y-3.5 flex-1 overflow-y-auto">
                {colOrders.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <p className="text-xs font-semibold">No {col.title.toLowerCase()} orders</p>
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const elapsedMinutes = Math.floor(
                      (new Date() - new Date(order.created_at)) / (1000 * 60)
                    );

                    return (
                      <div
                        key={order.id}
                        className="solid-card p-4 rounded-2xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        {/* Card Header: Table/Token & Time */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {order.table_number && (
                              <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-orange-50 text-[var(--color-primary)] border border-orange-100">
                                Table {order.table_number}
                              </span>
                            )}
                            {order.token_number && (
                              <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                                Token #{order.token_number}
                              </span>
                            )}
                            {!order.table_number && !order.token_number && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600">
                                POS
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                            <ClockRegular fontSize={12} />
                            <span>{elapsedMinutes}m ago</span>
                          </div>
                        </div>

                        {/* Order ID & Customer */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-gray-400 font-bold">
                            #{order.id.slice(0, 6)}
                          </span>
                          {order.customer_name && (
                            <span className="font-semibold text-gray-700 truncate max-w-[120px]">
                              {order.customer_name}
                            </span>
                          )}
                        </div>

                        {/* Item List */}
                        <div className="py-2 border-y border-gray-100 space-y-1.5">
                          {order.items?.map((it, idx) => (
                            <div key={idx} className="flex items-start justify-between text-xs gap-2">
                              <span className="font-semibold text-gray-800 flex-1">
                                <span className="font-extrabold text-[var(--color-primary)] mr-1.5">
                                  {it.quantity}×
                                </span>
                                {it.menu_item_name || it.item_name || 'Dish'}
                              </span>
                              {it.notes && (
                                <p className="text-[10px] italic text-amber-600 max-w-[120px] truncate">
                                  {it.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Special Instructions */}
                        {order.notes && (
                          <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100 text-[11px] text-amber-800 font-medium">
                            <span className="font-bold">Note:</span> {order.notes}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-1 flex items-center justify-between gap-2">
                          {col.key === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'preparing')}
                              className="w-full btn btn-primary py-2 text-xs font-bold gap-1.5"
                            >
                              <BowlSaladRegular fontSize={14} />
                              Start Preparing
                            </button>
                          )}

                          {col.key === 'preparing' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'ready')}
                              className="w-full btn btn-success py-2 text-xs font-bold gap-1.5"
                            >
                              <CheckmarkCircleRegular fontSize={14} />
                              Mark Ready
                            </button>
                          )}

                          {col.key === 'ready' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'served')}
                              className="w-full btn btn-primary py-2 text-xs font-bold gap-1.5"
                            >
                              <ChevronRightRegular fontSize={14} />
                              Serve to Table
                            </button>
                          )}

                          {col.key === 'served' && (
                            <div className="w-full text-center py-1 text-[11px] font-bold text-gray-400">
                              Order Complete ✓
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
