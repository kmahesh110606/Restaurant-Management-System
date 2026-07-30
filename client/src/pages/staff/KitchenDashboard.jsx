/**
 * KitchenDashboard — Rebuilt kitchen order terminal using Microsoft Fluent UI icons & enhanced spacing.
 */

import { useEffect, useState, useRef } from 'react';
import {
  Fire24Filled,
  CheckmarkCircle24Regular,
  ArrowClockwise24Regular,
  Clock24Regular,
  Book24Filled,
} from '@fluentui/react-icons';
import { getOrders, updateOrderStatus } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchOrders = () => {
    getOrders({ today: 'true' })
      .then(({ data }) => {
        const results = data.results || data;
        const active = results.filter((o) => ['pending', 'confirmed', 'preparing'].includes(o.status));
        setOrders(active);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 10000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E53935]/10 border border-[#E53935]/20 flex items-center justify-center text-[#FF5252]">
            <Book24Filled className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">Kitchen Display System</h1>
            <p className="text-xs text-[#9E9E9E] font-medium mt-0.5">
              {orders.length} active kitchen order{orders.length !== 1 ? 's' : ''} pending preparation
            </p>
          </div>
        </div>
        <button onClick={fetchOrders} className="btn btn-secondary px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2">
          <ArrowClockwise24Regular className="text-base" /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="card p-16 text-center bg-[#1A1A1D] border-[#26262A] rounded-2xl space-y-3">
          <CheckmarkCircle24Regular className="text-5xl mx-auto text-[#4CAF50]" />
          <p className="text-xl font-extrabold text-[#FAFAFA]">All caught up!</p>
          <p className="text-xs text-[#71717A]">No active tickets waiting in the kitchen queue right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`card p-6 bg-[#1A1A1D] border-[#26262A] rounded-2xl shadow-2xl space-y-4 flex flex-col justify-between ${
                order.status === 'pending' ? 'border-[#FFB300]/60 ring-1 ring-[#FFB300]/30' : ''
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#26262A]">
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.table_number && (
                      <span className="text-xs font-black text-[#FF5252] bg-[#E53935]/15 px-3 py-1 rounded-xl border border-[#E53935]/30">
                        Table {order.table_number}
                      </span>
                    )}
                    {order.token_number && (
                      <span className="text-xs font-black text-[#FFB300] bg-[#FFB300]/15 px-3 py-1 rounded-xl border border-[#FFB300]/30">
                        Token #{order.token_number}
                      </span>
                    )}
                    <StatusBadge status={order.status} />
                  </div>
                  <span className="text-xs font-semibold text-[#71717A] flex items-center gap-1">
                    <Clock24Regular className="text-sm" />
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4 bg-[#141416] p-4 rounded-xl border border-[#222226]">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-[#FAFAFA] font-bold">
                        <span className="text-[#FFB300] font-black mr-2">{item.quantity}×</span>
                        {item.menu_item_name}
                      </span>
                      {item.notes && (
                        <span className="text-xs text-[#FFB300] italic font-semibold">📝 {item.notes}</span>
                      )}
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <p className="text-xs font-semibold text-[#FFB300] bg-[#FFB300]/10 p-3 rounded-xl border border-[#FFB300]/20 mb-4">
                    📝 {order.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2">
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'preparing')}
                    className="btn btn-primary btn-md w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2"
                  >
                    <Fire24Filled className="text-base" /> Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'ready')}
                    className="btn btn-success btn-md w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2"
                  >
                    <CheckmarkCircle24Regular className="text-base" /> Mark Order Ready
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs font-semibold text-[#71717A] flex items-center justify-center gap-2 pt-2">
        <Clock24Regular className="text-sm" /> Auto-refreshing kitchen orders every 10 seconds
      </p>
    </div>
  );
}
