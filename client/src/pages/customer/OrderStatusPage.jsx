/**
 * OrderStatusPage — Post-order view showing status, table/token, items.
 * Polls for status updates every 10 seconds.
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { IoArrowBack, IoRestaurant, IoTime, IoCheckmarkCircle } from 'react-icons/io5';
import { trackOrder } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: IoCheckmarkCircle },
  { key: 'confirmed', label: 'Confirmed', icon: IoCheckmarkCircle },
  { key: 'preparing', label: 'Preparing', icon: IoRestaurant },
  { key: 'ready', label: 'Ready', icon: IoCheckmarkCircle },
  { key: 'served', label: 'Served', icon: IoCheckmarkCircle },
];

function getStepIndex(status) {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function OrderStatusPage() {
  const { restaurant } = useOutletContext();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchOrder = () => {
    trackOrder(orderId)
      .then(({ data }) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    // Poll every 10 seconds
    intervalRef.current = setInterval(fetchOrder, 10000);
    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  // Stop polling when order is served or cancelled
  useEffect(() => {
    if (order && (order.status === 'served' || order.status === 'cancelled')) {
      clearInterval(intervalRef.current);
    }
  }, [order?.status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--color-text-secondary)]">Order not found.</p>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);

  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <button onClick={() => navigate(`/${restaurant.slug}/menu`)} className="btn btn-ghost mb-4">
        <IoArrowBack size={18} /> Order More
      </button>

      {/* Status header */}
      <div className="card p-6 text-center mb-6">
        <div className="mb-4">
          <StatusBadge status={order.status} />
        </div>

        {order.status === 'cancelled' ? (
          <h1 className="text-xl font-bold text-[var(--color-danger)]">Order Cancelled</h1>
        ) : (
          <h1 className="text-xl font-bold text-[var(--color-text-heading)]">
            {order.status === 'served' ? 'Order Complete! 🎉' : 'Your order is being prepared'}
          </h1>
        )}

        {/* Table / Token display */}
        <div className="mt-4 p-4 rounded-[var(--radius-lg)] bg-[var(--color-bg)] inline-block">
          {order.table_number && (
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Table</p>
              <p className="text-3xl font-bold text-[var(--color-primary)]">{order.table_number}</p>
            </div>
          )}
          {order.token_number && (
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Token</p>
              <p className="text-3xl font-bold text-[var(--color-accent)]">#{order.token_number}</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress steps */}
      {order.status !== 'cancelled' && (
        <div className="card p-5 mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-4">
            Order Progress
          </h2>
          <div className="space-y-3">
            {STATUS_STEPS.map((step, idx) => {
              const isComplete = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isComplete
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                    } ${isCurrent ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-bg-card)]' : ''}`}
                  >
                    <step.icon size={16} />
                  </div>
                  <span className={`text-sm font-medium ${isComplete ? 'text-[var(--color-text-heading)]' : 'text-[var(--color-text-muted)]'}`}>
                    {step.label}
                  </span>
                  {isCurrent && order.status !== 'served' && (
                    <span className="animate-pulse-soft text-xs text-[var(--color-primary)]">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
          Order Items
        </h2>
        <div className="space-y-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b border-[var(--color-border-light)] last:border-0">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-heading)]">
                  {item.quantity}× {item.menu_item_name}
                </p>
              </div>
              <span className="text-sm text-[var(--color-text-secondary)]">₹{parseFloat(item.subtotal).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
          <span className="font-semibold text-[var(--color-text-heading)]">Total</span>
          <span className="font-bold text-[var(--color-accent)]">₹{parseFloat(order.total_amount).toFixed(0)}</span>
        </div>
      </div>

      {/* Polling indicator */}
      {order.status !== 'served' && order.status !== 'cancelled' && (
        <p className="text-center text-xs text-[var(--color-text-muted)] mt-4 flex items-center justify-center gap-1">
          <IoTime size={14} /> Auto-refreshing every 10 seconds
        </p>
      )}
    </div>
  );
}
