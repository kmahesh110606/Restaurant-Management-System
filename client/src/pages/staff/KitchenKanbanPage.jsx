import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../contexts/AuthContext';


import { useState, useEffect, useRef } from 'react';
import {
  BowlSaladRegular,
  ClockRegular,
  CheckmarkCircleRegular,
  ArrowClockwiseRegular,
  PrintRegular,
  ChevronRightRegular,
} from '@fluentui/react-icons';
import { getOrders, updateOrderStatus } from '../../api/orders';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const COLUMNS = [
  { key: 'pending', title: 'Pending Prep', color: 'text-amber-600', dot: 'bg-amber-500', badgeClass: 'badge-pending' },
  { key: 'preparing', title: 'On The Stove', color: 'text-purple-600', dot: 'bg-purple-500', badgeClass: 'badge-preparing' },
  { key: 'ready', title: 'Ready to Run', color: 'text-emerald-600', dot: 'bg-emerald-500', badgeClass: 'badge-ready' },
  { key: 'served', title: 'Served & Done', color: 'text-slate-500', dot: 'bg-slate-400', badgeClass: 'badge-served' },
];

export default function KitchenKanbanPage() {
  const { role } = useAuth();
  const canPrepare = role === 'admin' || role === 'kitchen';
  const canServe = role === 'admin' || role === 'waiter';
  const [orders, setOrders] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
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
          setTimeout(() => { osc.stop(); audioCtx.close(); }, 500);
        } catch {
          // Audio playback allowed upon user interaction
        }
        toast.success('New ticket received in kitchen');
      }
      prevPendingCountRef.current = pendingCount;
      setOrders(list);
    } catch {
      setLoadError(true);
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
      toast.success(`Ticket advanced to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update ticket status');
    }
  };

  if (loadError) return <EmptyState title="Could not refresh orders" subtitle="The service queue could not be updated." actionLabel="Retry" onAction={() => window.location.reload()} />;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kitchen Orders
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={() => window.print()}
            className="btn btn-secondary px-4 py-2 text-xs font-bold gap-2"
          >
            <PrintRegular fontSize={15} />
            <span className="hidden sm:inline">Print Tickets</span>
          </button>
          <button
            onClick={fetchOrders}
            className="btn btn-primary px-4 py-2 text-xs font-bold gap-2 shadow-md shadow-orange-500/20"
          >
            <ArrowClockwiseRegular fontSize={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ═══════════ KANBAN GRID (4 COLUMNS) ═══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.key || (col.key === 'pending' && o.status === 'confirmed'));

          return (
            <div
              key={col.key}
              className="glass-panel p-5 rounded-3xl border border-white/80 flex flex-col min-h-[540px] shadow-sm"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${col.color}`}>
                    {col.title}
                  </span>
                </div>
                <span className={`badge ${col.badgeClass} font-mono font-bold text-xs px-2.5 py-0.5`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards in this Column */}
              <div className="space-y-4 flex-1 overflow-y-auto">
                {colOrders.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 space-y-2">
                    <p className="text-xs font-bold">No {col.title.toLowerCase()} tickets</p>
                    <p className="text-[11px] text-slate-400">Queue is clear</p>
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const elapsedMinutes = Math.floor(
                      (new Date() - new Date(order.created_at)) / (1000 * 60)
                    );

                    return (
                      <div
                        key={order.id}
                        className="glass-card p-5 space-y-4 border border-white/90 shadow-sm hover:shadow-lg transition-all duration-200"
                      >
                        {/* Card Header: Table/Token & Time */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {order.table_number && (
                              <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/20">
                                Table {order.table_number}
                              </span>
                            )}
                            {order.token_number && (
                              <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                                Token #{order.token_number}
                              </span>
                            )}
                            {!order.table_number && !order.token_number && (
                              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-600">
                                POS Counter
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                            <ClockRegular fontSize={13} className="text-slate-400" />
                            <span>{elapsedMinutes}m ago</span>
                          </div>
                        </div>

                        {/* Order ID & Customer */}
                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <span className="font-mono text-slate-400 font-bold">
                            #{order.id.slice(0, 8)}
                          </span>
                          {order.customer_name && (
                            <span className="font-bold text-slate-700 truncate max-w-[130px]">
                              {order.customer_name}
                            </span>
                          )}
                        </div>

                        {/* Item List */}
                        <div className="py-2.5 border-y border-slate-100 space-y-2">
                          {order.items?.map((it, idx) => (
                            <div key={idx} className="flex items-start justify-between text-xs gap-2">
                              <span className="font-bold text-slate-800 flex-1">
                                <span className="font-black text-orange-600 mr-2 bg-orange-500/10 px-1.5 py-0.5 rounded-md">
                                  {it.quantity}×
                                </span>
                                {it.menu_item_name || it.item_name || 'Dish'}
                              </span>
                              {it.notes && (
                                <p className="text-[10px] italic text-amber-700 max-w-[160px] break-words font-medium">
                                  {it.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Special Instructions */}
                        {order.notes && (
                          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 font-medium">
                            <span className="font-bold">Instructions:</span> {order.notes}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-1 flex items-center justify-between gap-2">
                          {col.key === 'pending' && canPrepare && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'preparing')}
                              className="w-full btn btn-primary py-2 text-xs font-bold gap-1.5 shadow-md shadow-orange-500/20"
                            >
                              <BowlSaladRegular fontSize={15} />
                              <span>Start Preparing</span>
                            </button>
                          )}

                          {col.key === 'preparing' && canPrepare && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'ready')}
                              className="w-full btn btn-success py-2 text-xs font-bold gap-1.5 shadow-md shadow-emerald-500/20"
                            >
                              <CheckmarkCircleRegular fontSize={15} />
                              <span>Mark Ready</span>
                            </button>
                          )}

                          {col.key === 'ready' && canServe && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'served')}
                              className="w-full btn btn-primary py-2 text-xs font-bold gap-1.5 shadow-md shadow-orange-500/20"
                            >
                              <ChevronRightRegular fontSize={15} />
                              <span>Serve Course</span>
                            </button>
                          )}

                          {col.key === 'served' && (
                            <div className="w-full text-center py-1.5 text-xs font-bold text-slate-400 bg-slate-50/70 rounded-xl border border-slate-100">
                              Order Complete
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
