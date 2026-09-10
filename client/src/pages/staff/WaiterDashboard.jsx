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
import toast from 'react-hot-toast';

export default function WaiterDashboard() {
  const { restaurant } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
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
      console.error('Failed to fetch waiter dashboard data', err);
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
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-500/20"
            style={{ background: 'var(--color-secondary)' }}
          >
            <FoodRegular fontSize={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Waiter Service Terminal</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {readyOrders.length} order{readyOrders.length !== 1 ? 's' : ''} ready to run to tables
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-white p-1 rounded-2xl border border-gray-200 shadow-xs">
            <button
              onClick={() => setFilter('ready')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'ready'
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ready to Serve ({readyOrders.length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Active Tickets
            </button>
          </div>

          <button
            onClick={fetchData}
            className="btn btn-secondary px-3.5 py-2 text-xs font-bold gap-1.5"
          >
            <ArrowClockwiseRegular fontSize={14} />
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
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tbl.is_occupied
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-emerald-50 text-emerald-700'
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
