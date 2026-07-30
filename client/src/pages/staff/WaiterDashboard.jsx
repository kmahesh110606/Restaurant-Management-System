/**
 * WaiterDashboard — Rebuilt waiter service terminal with Microsoft Fluent UI icons and updated layout spacing.
 */

import { useEffect, useState, useRef } from 'react';
import {
  Food24Filled,
  CheckmarkCircle24Regular,
  ArrowClockwise24Regular,
  Clock24Regular,
} from '@fluentui/react-icons';
import { getOrders, updateOrderStatus } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function WaiterDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ready'); // ready | all
  const intervalRef = useRef(null);

  const fetchOrders = () => {
    getOrders({ today: 'true' })
      .then(({ data }) => {
        const results = data.results || data;
        setOrders(results);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 10000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleServe = async (orderId) => {
    try {
      await updateOrderStatus(orderId, { status: 'served' });
      toast.success('Order marked as served!');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update.');
    }
  };

  const filteredOrders = filter === 'ready'
    ? orders.filter((o) => o.status === 'ready')
    : orders.filter((o) => !['cancelled', 'served'].includes(o.status));

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  const readyCount = orders.filter((o) => o.status === 'ready').length;

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#4CAF50]/10 border border-[#4CAF50]/20 flex items-center justify-center text-[#4CAF50]">
            <Food24Filled className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">Waiter Terminal</h1>
            <p className="text-xs text-[#9E9E9E] font-medium mt-0.5">
              {readyCount} order{readyCount !== 1 ? 's' : ''} ready to serve to tables
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 bg-[#1A1A1D] p-1.5 rounded-2xl border border-[#26262A]">
            <button
              onClick={() => setFilter('ready')}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                filter === 'ready' ? 'bg-[#E53935] text-white shadow-md shadow-[#E53935]/25' : 'text-[#71717A] hover:text-[#FAFAFA]'
              }`}
            >
              Ready ({readyCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                filter === 'all' ? 'bg-[#E53935] text-white shadow-md shadow-[#E53935]/25' : 'text-[#71717A] hover:text-[#FAFAFA]'
              }`}
            >
              All Active
            </button>
          </div>
          <button onClick={fetchOrders} className="btn btn-secondary px-3 py-2 rounded-xl text-xs font-extrabold">
            <ArrowClockwise24Regular className="text-base" />
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="card p-16 text-center bg-[#1A1A1D] border-[#26262A] rounded-2xl space-y-3">
          <Food24Filled className="text-4xl mx-auto text-[#71717A]" />
          <p className="text-lg font-extrabold text-[#FAFAFA]">
            {filter === 'ready' ? 'No orders ready for pickup' : 'No active table orders'}
          </p>
          <p className="text-xs text-[#71717A]">Orders prepared by the kitchen will alert here for serving.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`card p-6 bg-[#1A1A1D] border-[#26262A] rounded-2xl shadow-2xl space-y-4 flex flex-col justify-between ${
                order.status === 'ready' ? 'border-[#4CAF50] ring-1 ring-[#4CAF50]/40' : ''
              }`}
            >
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
                  <span className="text-xs font-semibold text-[#71717A]">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-1.5 mb-4 bg-[#141416] p-4 rounded-xl border border-[#222226]">
                  {order.items?.map((item) => (
                    <p key={item.id} className="text-xs font-bold text-[#E0E0E0]">
                      <span className="text-[#FFB300] font-black mr-2">{item.quantity}×</span> {item.menu_item_name}
                    </p>
                  ))}
                </div>
              </div>

              {order.status === 'ready' && (
                <button
                  onClick={() => handleServe(order.id)}
                  className="btn btn-success btn-md w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2"
                >
                  <CheckmarkCircle24Regular className="text-base" /> Mark as Served
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs font-semibold text-[#71717A] flex items-center justify-center gap-2 pt-2">
        <Clock24Regular className="text-sm" /> Auto-refreshing waiter dashboard every 10 seconds
      </p>
    </div>
  );
}
