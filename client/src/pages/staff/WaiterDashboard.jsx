/**
 * WaiterDashboard — Shows ready-to-serve orders for waiters.
 * Allows marking orders as served.
 */

import { useEffect, useState, useRef } from 'react';
import { IoRefresh, IoCheckmarkCircle, IoTime, IoRestaurant } from 'react-icons/io5';
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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">🍽️ Waiter Dashboard</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {readyCount} order{readyCount !== 1 ? 's' : ''} ready to serve
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ready')}
            className={`btn btn-sm ${filter === 'ready' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Ready ({readyCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Active
          </button>
          <button onClick={fetchOrders} className="btn btn-secondary btn-sm">
            <IoRefresh size={16} />
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <IoRestaurant size={48} className="mx-auto text-[var(--color-text-muted)] mb-3" />
          <p className="text-lg font-semibold text-[var(--color-text-heading)]">
            {filter === 'ready' ? 'No orders ready' : 'No active orders'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`card p-4 ${order.status === 'ready' ? 'border-[var(--color-success)] border-2 animate-pulse-soft' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {order.table_number && (
                    <span className="text-sm font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded">
                      Table {order.table_number}
                    </span>
                  )}
                  {order.token_number && (
                    <span className="text-sm font-bold text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded">
                      Token #{order.token_number}
                    </span>
                  )}
                  <StatusBadge status={order.status} />
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                {order.items?.map((item) => (
                  <p key={item.id} className="text-sm text-[var(--color-text)]">
                    <span className="font-semibold">{item.quantity}×</span> {item.menu_item_name}
                  </p>
                ))}
              </div>

              {order.status === 'ready' && (
                <button
                  onClick={() => handleServe(order.id)}
                  className="btn btn-success btn-sm w-full"
                >
                  <IoCheckmarkCircle size={16} /> Mark as Served
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-[var(--color-text-muted)] mt-6 flex items-center justify-center gap-1">
        <IoTime size={14} /> Auto-refreshing every 10 seconds
      </p>
    </div>
  );
}
