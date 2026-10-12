/**
 * WaiterDashboard — Waiter service terminal with table overview & ready orders.
 * Live polling, mark orders as served, view occupied tables, quick order creation.
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FoodRegular,
  CheckmarkCircleRegular,
  ArrowClockwiseRegular,
  ClockRegular,
  TableSimpleRegular,
  PersonRegular,
  AddRegular,
} from '@fluentui/react-icons';
import { getOrders, updateOrderStatus } from '../../api/orders';
import { getTables } from '../../api/tables';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import LiquidPills from '../../components/ui/LiquidPills';
import toast from 'react-hot-toast';

export default function WaiterDashboard() {
  const { restaurant } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ready'); // 'ready' | 'all'
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      const [ordersRes, tablesRes] = await Promise.all([
        getOrders({ today: 'true' }),
        getTables(),
      ]);
      const orderList = ordersRes.data.results || ordersRes.data || [];
      const tableList = tablesRes.data.results || tablesRes.data || [];
      setOrders(orderList);
      setTables(tableList);
    } catch (err) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 8000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleServe = async (orderId) => {
    try {
      await updateOrderStatus(orderId, { status: 'served' });
      toast.success('Order marked as served to table!');
      fetchData();
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const readyOrders = orders.filter((o) => o.status === 'ready');
  const displayOrders = filter === 'ready'
    ? readyOrders
    : orders.filter((o) => !['cancelled', 'served'].includes(o.status));

  if (loadError) return <EmptyState title="Could not refresh orders" subtitle="The service queue could not be updated." actionLabel="Retry" onAction={() => window.location.reload()} />;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-16 max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Waiter Service</h1>

        {/* Filter pills & refresh */}
        <div className="flex items-center gap-2.5">
          <LiquidPills
            items={[
              { label: `Ready to Serve (${readyOrders.length})`, value: 'ready' },
              { label: 'All Active Tickets', value: 'all' },
            ]}
            value={filter}
            onChange={setFilter}
            layoutId="waiter-filter-pill"
            size="sm"
          />

          <button
            onClick={fetchData}
            className="btn btn-secondary min-h-[38px] px-3.5 font-bold shrink-0"
            title="Refresh Orders"
          >
            <ArrowClockwiseRegular fontSize={15} />
          </button>
        </div>
      </div>

      {/* ═══════════ READY / ACTIVE ORDERS ═══════════ */}
      <div>
        <h2 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
          <span>{filter === 'ready' ? 'Orders Ready for Delivery' : 'Active Orders Queue'}</span>
          <span className="badge badge-ready font-mono font-bold text-xs">
            {displayOrders.length}
          </span>
        </h2>

        {displayOrders.length === 0 ? (
          <EmptyState
            icon={CheckmarkCircleRegular}
            title={filter === 'ready' ? 'No orders waiting' : 'No active orders'}
            subtitle={
              filter === 'ready'
                ? 'All prepared orders have been delivered to guests.'
                : 'All current tickets are settled or served.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayOrders.map((order) => (
              <div
                key={order.id}
                className={`solid-card p-5 rounded-2xl bg-white border space-y-3.5 shadow-sm transition-all ${
                  order.status === 'ready'
                    ? 'border-emerald-300 ring-2 ring-emerald-100'
                    : 'border-gray-200/80'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    {order.table_number && (
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                        Table {order.table_number}
                      </span>
                    )}
                    {order.token_number && (
                      <span className="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                        Token #{order.token_number}
                      </span>
                    )}
                    <StatusBadge status={order.status} />
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-400">
                    #{order.id.slice(0, 6)}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1.5 py-1">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-800">
                        <span className="font-extrabold text-[var(--color-primary)] mr-1.5">
                          {it.quantity}×
                        </span>
                        {it.menu_item_name || it.item_name || 'Dish'}
                      </span>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-xl">
                    <span className="font-bold">Note:</span> {order.notes}
                  </p>
                )}

                {/* Action button */}
                <div className="pt-2">
                  {order.status === 'ready' ? (
                    <button
                      onClick={() => handleServe(order.id)}
                      className="w-full btn btn-success py-2.5 text-xs font-bold gap-2 shadow-sm"
                    >
                      <CheckmarkCircleRegular fontSize={16} />
                      Mark Delivered to Table
                    </button>
                  ) : (
                    <div className="text-center py-1.5 text-xs text-gray-500 font-semibold">
                      In Kitchen ({order.status})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════ TABLE FLOOR STATUS ═══════════ */}
      {tables.length > 0 && (
        <div className="pt-6 border-t border-gray-200/70 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <TableSimpleRegular fontSize={20} className="text-gray-500" />
              <span>Dining Floor Overview</span>
            </h2>
            <span className="text-xs font-semibold text-gray-500">
              {tables.filter((t) => t.is_occupied).length} of {tables.length} occupied
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {tables.map((tbl) => (
              <div
                key={tbl.id}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  tbl.is_occupied
                    ? 'border-orange-200 bg-orange-50/60'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="text-xs font-extrabold text-gray-900">Table {tbl.number}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Cap: {tbl.capacity} seats</p>
                <div className="mt-2.5">
                  <span
                    className={`badge text-[10px] font-bold ${
                      tbl.is_occupied
                        ? 'badge-pending'
                        : 'badge-ready'
                    }`}
                  >
                    {tbl.is_occupied ? 'Occupied' : 'Available'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
