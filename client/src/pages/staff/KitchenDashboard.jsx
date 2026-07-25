/**
 * KitchenDashboard — Shows incoming orders for kitchen staff.
 * Allows marking orders as preparing/ready.
 * Auto-polls every 10 seconds.
 */

import { useEffect, useState, useRef } from 'react';
import { IoRefresh, IoFlame, IoCheckmarkCircle, IoTime } from 'react-icons/io5';
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
        // Show pending, confirmed, preparing orders
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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">🍳 Kitchen Dashboard</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {orders.length} active order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={fetchOrders} className="btn btn-secondary">
          <IoRefresh size={18} /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-lg font-semibold text-[var(--color-text-heading)]">All caught up!</p>
          <p className="text-[var(--color-text-muted)]">No pending orders right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`card p-4 ${
                order.status === 'pending' ? 'border-[var(--color-warning)] border-2' : ''
              }`}
            >
              {/* Header */}
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
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                  <IoTime size={12} />
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1.5 mb-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text)]">
                      <span className="font-semibold text-[var(--color-accent)]">{item.quantity}×</span>{' '}
                      {item.menu_item_name}
                    </span>
                    {item.notes && (
                      <span className="text-xs text-[var(--color-warning)] italic">📝 {item.notes}</span>
                    )}
                  </div>
                ))}
              </div>

              {order.notes && (
                <p className="text-xs text-[var(--color-warning)] bg-[var(--color-warning)]/10 p-2 rounded mb-3">
                  📝 {order.notes}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'preparing')}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    <IoFlame size={16} /> Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'ready')}
                    className="btn btn-success btn-sm flex-1"
                  >
                    <IoCheckmarkCircle size={16} /> Mark Ready
                  </button>
                )}
              </div>
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
