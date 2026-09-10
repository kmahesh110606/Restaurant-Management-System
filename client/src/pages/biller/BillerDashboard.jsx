/**
 * BillerDashboard — POS and counter billing terminal.
 * Lookup orders by Table / Token, calculate discounts and taxes,
 * generate print-ready bills, and mark payments (Cash / Card / UPI).
 */

import { useState, useEffect } from 'react';
import {
  PaymentRegular,
  SearchRegular,
  ReceiptRegular,
  MoneyRegular,
  CheckmarkCircleRegular,
  PrintRegular,
  TableSimpleRegular,
  TicketHorizontalRegular,
  DismissRegular,
  ArrowClockwiseRegular,
  FilterRegular,
} from '@fluentui/react-icons';
import { lookupForBilling, createBill, markBillPaid, getBills } from '../../api/bills';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

export default function BillerDashboard() {
  const { restaurant } = useAuth();
  const [lookupType, setLookupType] = useState('table');
  const [lookupValue, setLookupValue] = useState('');
  const [orders, setOrders] = useState([]);
  const [searching, setSearching] = useState(false);
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billModal, setBillModal] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [creating, setCreating] = useState(false);

  const fetchRecentBills = () => {
    getBills({ today: 'true' })
      .then(({ data }) => setRecentBills(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecentBills();
  }, []);

  const handleLookup = async (e) => {
    e?.preventDefault();
    if (!lookupValue.trim()) return;
    setSearching(true);
    try {
      const params = {};
      params[lookupType] = lookupValue.trim();
      const { data } = await lookupForBilling(params);
      const results = Array.isArray(data) ? data : (data.results || []);
      setOrders(results);
      if (results.length === 0) {
        toast(`No unpaid orders found for ${lookupType} ${lookupValue}`, { icon: '🔍' });
      }
    } catch {
      toast.error('Lookup failed. Please check table/token number.');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateBill = async () => {
    if (orders.length === 0) return;
    setCreating(true);
    try {
      const orderIds = orders.map((o) => o.id);
      const { data } = await createBill({
        order_ids: orderIds,
        discount_amount: parseFloat(discount) || 0,
      });
      setBillModal(data);
      setOrders([]);
      setLookupValue('');
      fetchRecentBills();
      toast.success('Bill generated successfully!');
    } catch {
      toast.error('Failed to generate bill.');
    } finally {
      setCreating(false);
    }
  };

  const handleMarkPaid = async (billId) => {
    try {
      await markBillPaid(billId, {
        payment_status: 'paid',
        payment_method: paymentMethod,
      });
      toast.success('Payment recorded successfully!');
      setBillModal(null);
      fetchRecentBills();
    } catch {
      toast.error('Failed to update payment status.');
    }
  };

  const subtotal = orders.reduce(
    (sum, o) => sum + parseFloat(o.total_amount || 0),
    0
  );
  const taxRate = parseFloat(restaurant?.tax_rate || 5);
  const calculatedTax = (subtotal * taxRate) / 100;
  const grandTotal = Math.max(0, subtotal + calculatedTax - (parseFloat(discount) || 0));

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
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-500/20"
            style={{ background: 'var(--color-primary)' }}
          >
            <ReceiptRegular fontSize={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Billing & POS Terminal</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Generate guest checks, apply discounts, and record payments
            </p>
          </div>
        </div>

        <button
          onClick={fetchRecentBills}
          className="btn btn-secondary px-3.5 py-2 text-xs font-bold gap-1.5"
        >
          <ArrowClockwiseRegular fontSize={14} /> Refresh
        </button>
      </div>

      {/* ═══════════ LOOKUP & TICKET SUMMARY GRID ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Lookup Box & Unpaid Tickets (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Lookup Panel */}
          <div className="glass-card p-6 space-y-4 border border-gray-200/80">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <SearchRegular fontSize={16} className="text-[var(--color-primary)]" />
              <span>Search Active Orders</span>
            </h2>

            <form onSubmit={handleLookup} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLookupType('table');
                    setLookupValue('');
                  }}
                  className={`btn flex-1 py-2 text-xs font-bold gap-2 ${
                    lookupType === 'table' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <TableSimpleRegular fontSize={14} />
                  Table Number
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLookupType('token');
                    setLookupValue('');
                  }}
                  className={`btn flex-1 py-2 text-xs font-bold gap-2 ${
                    lookupType === 'token' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <TicketHorizontalRegular fontSize={14} />
                  Token Number
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={lookupValue}
                  onChange={(e) => setLookupValue(e.target.value)}
                  placeholder={`Enter ${lookupType === 'table' ? 'Table No. (e.g. 4)' : 'Token No. (e.g. 102)'}`}
                  className="input flex-1"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="btn btn-primary px-5 text-xs font-bold gap-2"
                >
                  {searching ? 'Finding...' : 'Find Tickets'}
                </button>
              </div>
            </form>
          </div>

          {/* Orders Found */}
          {orders.length > 0 && (
            <div className="glass-panel p-5 space-y-4 border border-gray-200/80 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200/60">
                <span className="text-xs font-black uppercase text-gray-700 tracking-wider">
                  Unpaid Tickets ({orders.length})
                </span>
                <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                  {lookupType.toUpperCase()} {lookupValue}
                </span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-gray-500">#{ord.id.slice(0, 8)}</span>
                      <StatusBadge status={ord.status} />
                    </div>

                    <div className="space-y-1">
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-700">
                          <span>
                            {it.quantity}× {it.menu_item_name || it.item_name || 'Item'}
                          </span>
                          <span className="font-semibold">
                            ₹{(parseFloat(it.price || 0) * it.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex justify-between text-xs font-bold text-gray-900">
                      <span>Ticket Subtotal</span>
                      <span>₹{parseFloat(ord.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Bill Calculation & Receipt Generator (5 cols) */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 space-y-5 border border-gray-200/80 sticky top-24">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-200/60">
              <PaymentRegular fontSize={18} className="text-[var(--color-primary)]" />
              <span>Bill Calculation</span>
            </h2>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <ReceiptRegular fontSize={36} className="mx-auto text-gray-300" />
                <p className="text-xs font-semibold">No tickets selected for billing</p>
                <p className="text-[11px]">Search for a table or token on the left to generate bill.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({taxRate}%):</span>
                    <span className="font-semibold text-gray-900">₹{calculatedTax.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600 pt-1">
                    <span>Discount (₹):</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-24 px-2 py-1 text-right text-xs font-bold input"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-sm font-black text-gray-900">Grand Total:</span>
                  <span className="text-2xl font-black text-[var(--color-primary)]">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleCreateBill}
                  disabled={creating}
                  className="w-full btn btn-primary py-3 text-xs font-bold gap-2 shadow-md shadow-orange-500/25"
                >
                  <ReceiptRegular fontSize={16} />
                  {creating ? 'Creating Bill...' : 'Generate & Print Bill'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ TODAY'S RECENT BILLS TABLE ═══════════ */}
      <div className="pt-6 border-t border-gray-200/70 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <ReceiptRegular fontSize={20} className="text-gray-500" />
            <span>Today's Issued Bills</span>
          </h2>
          <span className="text-xs font-semibold text-gray-500">
            {recentBills.length} bill{recentBills.length !== 1 ? 's' : ''} recorded
          </span>
        </div>

        <div className="solid-card overflow-hidden bg-white border border-gray-200">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Time</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Discount</th>
                  <th>Final Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentBills.map((b) => (
                  <tr key={b.id}>
                    <td className="font-mono text-xs font-bold text-gray-900">
                      #{b.id.slice(0, 8)}
                    </td>
                    <td className="text-gray-500 text-xs">
                      {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>₹{parseFloat(b.subtotal || 0).toFixed(2)}</td>
                    <td>₹{parseFloat(b.tax_amount || 0).toFixed(2)}</td>
                    <td>₹{parseFloat(b.discount_amount || 0).toFixed(2)}</td>
                    <td className="font-black text-gray-900">
                      ₹{parseFloat(b.final_amount || 0).toFixed(2)}
                    </td>
                    <td className="capitalize font-semibold text-xs text-gray-600">
                      {b.payment_method || 'Cash'}
                    </td>
                    <td>
                      <StatusBadge status={b.payment_status} />
                    </td>
                    <td>
                      {b.payment_status !== 'paid' ? (
                        <button
                          onClick={() => setBillModal(b)}
                          className="btn btn-sm btn-primary py-1 px-2.5 text-[11px] font-bold"
                        >
                          Collect
                        </button>
                      ) : (
                        <button
                          onClick={() => setBillModal(b)}
                          className="btn btn-sm btn-secondary py-1 px-2.5 text-[11px] font-bold"
                        >
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══════════ BILL / RECEIPT MODAL ═══════════ */}
      {billModal && (
        <Modal
          isOpen={true}
          onClose={() => setBillModal(null)}
          title={`Bill #${billModal.id.slice(0, 8)}`}
          size="md"
        >
          <div className="space-y-5 p-2 print-area">
            {/* Restaurant header */}
            <div className="text-center pb-3 border-b border-gray-200">
              <h3 className="text-lg font-black text-gray-900">{restaurant?.name || 'Savoré Bistro'}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{restaurant?.address || 'Tax Invoice'}</p>
            </div>

            {/* Bill Info */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Date & Time:</span>
                <span className="font-semibold text-gray-800">
                  {new Date(billModal.created_at || Date.now()).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{parseFloat(billModal.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span className="font-semibold">₹{parseFloat(billModal.tax_amount || 0).toFixed(2)}</span>
              </div>
              {parseFloat(billModal.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-₹{parseFloat(billModal.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-black text-gray-900">
                <span>Total Due:</span>
                <span className="text-[var(--color-primary)]">
                  ₹{parseFloat(billModal.final_amount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector if unpaid */}
            {billModal.payment_status !== 'paid' && (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <label className="form-label">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['cash', 'card', 'upi'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`btn py-2 text-xs font-bold uppercase ${
                        paymentMethod === m ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleMarkPaid(billModal.id)}
                  className="w-full btn btn-success py-2.5 text-xs font-bold gap-2"
                >
                  <CheckmarkCircleRegular fontSize={16} />
                  Record Payment & Close
                </button>
              </div>
            )}

            {/* Print Action */}
            <div className="pt-2 flex justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="btn btn-secondary flex-1 py-2 text-xs font-bold gap-2"
              >
                <PrintRegular fontSize={14} /> Print Receipt
              </button>
              <button
                onClick={() => setBillModal(null)}
                className="btn btn-ghost px-4 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
