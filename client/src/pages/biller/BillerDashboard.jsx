/**
 * BillerDashboard — Lookup by table/token, view orders, generate bills, mark as paid.
 */

import { useState, useEffect } from 'react';
import { IoSearch, IoReceipt, IoCash, IoCheckmarkCircle, IoTime } from 'react-icons/io5';
import { lookupForBilling, createBill, markBillPaid, getBills } from '../../api/bills';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function BillerDashboard() {
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

  useEffect(() => {
    getBills({ today: 'true' })
      .then(({ data }) => setRecentBills(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLookup = async () => {
    if (!lookupValue) return;
    setSearching(true);
    try {
      const params = {};
      params[lookupType] = lookupValue;
      const { data } = await lookupForBilling(params);
      const results = Array.isArray(data) ? data : (data.results || []);
      setOrders(results);
      if (results.length === 0) {
        toast('No unpaid orders found.', { icon: '🔍' });
      }
    } catch (err) {
      toast.error('Lookup failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateBill = async () => {
    setCreating(true);
    try {
      const orderIds = orders.map((o) => o.id);
      const { data } = await createBill({
        order_ids: orderIds,
        discount_amount: discount,
      });
      setBillModal(data);
      setOrders([]);
      // Refresh recent bills
      const billsRes = await getBills({ today: 'true' });
      setRecentBills(billsRes.data.results || billsRes.data);
      toast.success('Bill created!');
    } catch (err) {
      toast.error('Failed to create bill.');
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
      toast.success('Bill marked as paid!');
      setBillModal(null);
      const billsRes = await getBills({ today: 'true' });
      setRecentBills(billsRes.data.results || billsRes.data);
    } catch (err) {
      toast.error('Failed to update payment.');
    }
  };

  const totalAmount = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-[var(--color-text-heading)] mb-6">💰 Billing</h1>

      {/* Lookup */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
          Lookup Orders
        </h2>
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Type</label>
            <select
              value={lookupType}
              onChange={(e) => setLookupType(e.target.value)}
              className="input w-auto"
            >
              <option value="table">Table</option>
              <option value="token">Token</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
              {lookupType === 'table' ? 'Table Number' : 'Token Number'}
            </label>
            <input
              type="number"
              value={lookupValue}
              onChange={(e) => setLookupValue(e.target.value)}
              className="input"
              placeholder={`Enter ${lookupType} number`}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              id="lookup-input"
            />
          </div>
          <button onClick={handleLookup} disabled={searching} className="btn btn-primary">
            <IoSearch size={18} /> {searching ? 'Searching...' : 'Find'}
          </button>
        </div>
      </div>

      {/* Found orders */}
      {orders.length > 0 && (
        <div className="card p-5 mb-6 animate-slide-up">
          <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">
            Found {orders.length} Unpaid Order{orders.length > 1 ? 's' : ''}
          </h2>

          <div className="space-y-3 mb-4">
            {orders.map((order) => (
              <div key={order.id} className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-light)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[var(--color-text-muted)]">{order.id.slice(0, 8)}</span>
                  <StatusBadge status={order.status} />
                </div>
                {order.items?.map((item) => (
                  <p key={item.id} className="text-sm text-[var(--color-text)]">
                    {item.quantity}× {item.menu_item_name} — ₹{parseFloat(item.subtotal).toFixed(0)}
                  </p>
                ))}
                <div className="text-right mt-2 font-semibold text-[var(--color-accent)]">
                  ₹{parseFloat(order.total_amount).toFixed(0)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">Subtotal</span>
              <span className="text-xl font-bold text-[var(--color-text-heading)]">₹{totalAmount.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-[var(--color-text-secondary)]">Discount:</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="input w-32"
                min={0}
              />
            </div>
            <button
              onClick={handleCreateBill}
              disabled={creating}
              className="btn btn-accent btn-lg w-full"
              id="generate-bill-btn"
            >
              <IoReceipt size={20} /> {creating ? 'Generating...' : `Generate Bill — ₹${(totalAmount - discount).toFixed(0)}`}
            </button>
          </div>
        </div>
      )}

      {/* Recent bills */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Today's Bills</h2>
        {loading ? (
          <LoadingSpinner />
        ) : recentBills.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] py-8">No bills today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Orders</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Discount</th>
                  <th>Final</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="font-mono text-xs">{bill.id.slice(0, 8)}</td>
                    <td>{bill.orders?.length || 0}</td>
                    <td>₹{parseFloat(bill.subtotal).toFixed(0)}</td>
                    <td>₹{parseFloat(bill.tax_amount).toFixed(0)}</td>
                    <td>₹{parseFloat(bill.discount_amount).toFixed(0)}</td>
                    <td className="font-bold">₹{parseFloat(bill.final_amount).toFixed(0)}</td>
                    <td><StatusBadge status={bill.payment_status} /></td>
                    <td>
                      {bill.payment_status !== 'paid' && (
                        <button
                          onClick={() => setBillModal(bill)}
                          className="btn btn-success btn-sm"
                        >
                          <IoCash size={14} /> Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Modal */}
      <Modal isOpen={!!billModal} onClose={() => setBillModal(null)} title="Mark Bill as Paid">
        {billModal && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-accent)]">
                ₹{parseFloat(billModal.final_amount).toFixed(0)}
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Final Amount</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              onClick={() => handleMarkPaid(billModal.id)}
              className="btn btn-success btn-lg w-full"
            >
              <IoCheckmarkCircle size={20} /> Confirm Payment
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
