/**
 * OrderStatusPage — Live order tracking for customers.
 * Polls order status every 10 seconds with animated status stepper.
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import {
  ClockRegular,
  CheckmarkCircleRegular,
  FoodRegular,
  PersonRegular,
  ArrowLeftRegular,
} from '@fluentui/react-icons';
import { trackOrder } from '../../api/orders';

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: ClockRegular },
  { key: 'confirmed', label: 'Confirmed', icon: CheckmarkCircleRegular },
  { key: 'preparing', label: 'Preparing', icon: FoodRegular },
  { key: 'ready', label: 'Ready', icon: FoodRegular },
  { key: 'served', label: 'Served', icon: PersonRegular },
];

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'ready', 'served'];

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const { restaurantConfig, slug } = useOutletContext() || {};
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const currency = restaurantConfig?.currency || '₹';

  const fetchStatus = async () => {
    try {
      const { data } = await trackOrder(orderId);
      setOrder(data);
      setError(null);

      // Stop polling if order is served or cancelled
      if (data.status === 'served' || data.status === 'cancelled') {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch {
      setError('Unable to track order. Please check your order ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    fetchStatus();

    // Poll every 10 seconds
    intervalRef.current = setInterval(fetchStatus, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderId]);

  const currentStepIndex = order ? STATUS_ORDER.indexOf(order.status) : -1;

  if (loading) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in space-y-4 py-8">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-fade-in">
        <ClockRegular fontSize={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">Order not found</h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => navigate(`/${slug}/menu`)}
          className="btn btn-primary"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(`/${slug}/menu`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors"
      >
        <ArrowLeftRegular fontSize={16} />
        Back to menu
      </button>

      <div className="text-center">
        <h1 className="text-xl font-extrabold text-gray-900">Order Status</h1>
        <p className="text-xs text-gray-500 mt-1">
          Order #{String(order.id).slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Cancelled state */}
      {order.status === 'cancelled' && (
        <div className="glass-card p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">✕</span>
          </div>
          <h2 className="text-lg font-bold text-red-600">Order Cancelled</h2>
          <p className="text-sm text-gray-500 mt-1">This order has been cancelled.</p>
        </div>
      )}

      {/* Status Stepper */}
      {order.status !== 'cancelled' && (
        <div className="glass-card p-6">
          <div className="space-y-0">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isLast = index === STEPS.length - 1;

              return (
                <div key={step.key} className="flex items-start gap-4">
                  {/* Step indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isCurrent
                          ? 'bg-[var(--color-primary)] text-white shadow-lg animate-glow'
                          : isCompleted
                            ? 'bg-[var(--color-primary-50)] text-[var(--color-primary)]'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon fontSize={18} />
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 h-8 transition-colors duration-500 ${
                          isCompleted && index < currentStepIndex ? 'bg-[var(--color-primary)]' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>

                  {/* Step label */}
                  <div className="pt-2.5">
                    <p className={`text-sm font-bold ${
                      isCurrent ? 'text-[var(--color-primary)]' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-gray-500 mt-0.5 animate-pulse-soft">In progress...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-900">Order Details</h3>

        {order.items?.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-gray-600">
              {item.quantity}x {item.menu_item_name}
            </span>
            <span className="font-semibold text-gray-900">
              {currency}{parseFloat(item.subtotal).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="border-t border-gray-100 pt-2 flex justify-between">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-extrabold text-gray-900">
            {currency}{parseFloat(order.total_amount).toFixed(2)}
          </span>
        </div>

        {order.table_number && (
          <p className="text-xs text-gray-500">Table {order.table_number}</p>
        )}
        {order.token_number && (
          <p className="text-xs text-gray-500">Token #{order.token_number}</p>
        )}
      </div>
    </div>
  );
}
