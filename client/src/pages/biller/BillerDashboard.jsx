/**
 * BillerDashboard — Rebuilt counter billing interface with Microsoft Fluent UI icons and updated spacing.
 */

import { useState, useEffect } from 'react';
import {
  Payment24Filled,
  Search24Regular,
  Receipt24Filled,
  Money24Filled,
  CheckmarkCircle24Regular,
} from '@fluentui/react-icons';
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
        toast('No unpaid orders found for this selection.', { icon: '🔍' });
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
      const billsRes = await getBills({ today: 'true' });
      setRecentBills(billsRes.data.results || billsRes.data);
      toast.success('Bill generated successfully!');
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
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#4CAF50]/10 border border-[#4CAF50]/20 flex items-center justify-center text-[#4CAF50]">
            <Payment24Filled className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">Billing Counter</h1>
            <p className="text-xs text-[#9E9E9E] font-medium mt-0.5">Quick order lookup, bill calculation, and cashier payments</p>
          </div>
        </div>
      </div>

      {/* Lookup Card */}
      <div className="card p-7 bg-[#1A1A1D] border-[#26262A] shadow-2xl rounded-2xl space-y-4">
        <h2 className="text-xs font-black text-[#71717A] uppercase tracking-wider">
          Lookup Unpaid Orders
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-extrabold text-[#71717A] uppercase tracking-wider mb-2">Target Type</label>
            <select
              value={lookupType}
              onChange={(e) => setLookupType(e.target.value)}
              className="input w-auto text-sm font-semibold py-2.5"
            >
              <option value="table">Table Number</option>
              <option value="token">Token Number</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-extrabold text-[#71717A] uppercase tracking-wider mb-2">
              {lookupType === 'table' ? 'Table Number' : 'Token Number'}
            </label>
            <input
              type="number"
              value={lookupValue}
              onChange={(e) => setLookupValue(e.target.value)}
              className="input text-sm font-semibold py-2.5"
              placeholder={`Enter ${lookupType} number...`}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              id="lookup-input"
            />
          </div>
          <button onClick={handleLookup} disabled={searching} className="btn btn-primary px-6 py-2.5 rounded-xl font-extrabold flex items-center gap-2">
            <Search24Regular className="text-base" /> {searching ? 'Searching...' : 'Find Orders'}
          </button>
        </div>
      </div>

      {/* Found Orders Card */}
      {orders.length > 0 && (
        <div className="card p-7 bg-[#1A1A1D] border-[#26262A] shadow-2xl rounded-2xl space-y-6 animate-slide-up">
          <h2 className="text-lg font-extrabold text-[#FAFAFA]">
            Found {orders.length} Unpaid Order{orders.length > 1 ? 's' : ''}
          </h2>

          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="p-4 rounded-xl bg-[#141416] border border-[#26262A] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#9E9E9E]">Order #{order.id.slice(0, 8)}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="space-y-1">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs font-semibold text-[#E0E0E0]">
                      <span>{item.quantity}× {item.menu_item_name}</span>
                      <span>₹{parseFloat(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="text-right pt-2 border-t border-[#26262A] font-extrabold text-[#FFB300] text-sm">
                  Order Total: ₹{parseFloat(order.total_amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#26262A] pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#9E9E9E]">Subtotal</span>
              <span className="text-2xl font-black text-[#FAFAFA]">₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-xs font-extrabold text-[#71717A] uppercase tracking-wider">Discount (₹):</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="input w-36 text-sm font-semibold"
                min={0}
              />
            </div>
            <button
              onClick={handleCreateBill}
              disabled={creating}
              className="btn btn-accent btn-lg w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2"
              id="generate-bill-btn"
            >
              <Receipt24Filled className="text-lg" />
              <span>{creating ? 'Generating...' : `Generate Bill — ₹${(totalAmount - discount).toFixed(2)}`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Bills Table Card */}
      <div className="card p-7 bg-[#1A1A1D] border-[#26262A] shadow-2xl rounded-2xl space-y-4">
        <h2 className="text-base font-extrabold text-[#FAFAFA]">Today's Bills</h2>
        {loading ? (
          <LoadingSpinner />
        ) : recentBills.length === 0 ? (
          <p className="text-center text-[#71717A] py-12 text-sm font-semibold">No bills generated today yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full text-left">
              <thead>
                <tr className="bg-[#141416] border-b border-[#26262A] text-[11px] font-black uppercase tracking-wider text-[#71717A]">
                  <th className="py-4 px-5">Bill ID</th>
                  <th className="py-4 px-5">Orders</th>
                  <th className="py-4 px-5">Subtotal</th>
                  <th className="py-4 px-5">Tax</th>
                  <th className="py-4 px-5">Discount</th>
                  <th className="py-4 px-5">Final Amount</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262A] text-sm font-medium">
                {recentBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-[#222226] transition-colors">
                    <td className="py-4 px-5 font-mono text-xs font-bold text-[#FAFAFA]">#{bill.id.slice(0, 8)}</td>
                    <td className="py-4 px-5 font-semibold text-[#A1A1AA]">{bill.orders?.length || 0}</td>
                    <td className="py-4 px-5 font-semibold text-[#E0E0E0]">₹{parseFloat(bill.subtotal).toFixed(2)}</td>
                    <td className="py-4 px-5 font-semibold text-[#9E9E9E]">₹{parseFloat(bill.tax_amount).toFixed(2)}</td>
                    <td className="py-4 px-5 font-semibold text-[#9E9E9E]">₹{parseFloat(bill.discount_amount).toFixed(2)}</td>
                    <td className="py-4 px-5 font-black text-[#FFB300]">₹{parseFloat(bill.final_amount).toFixed(2)}</td>
                    <td className="py-4 px-5"><StatusBadge status={bill.payment_status} /></td>
                    <td className="py-4 px-5 text-right">
                      {bill.payment_status !== 'paid' && (
                        <button
                          onClick={() => setBillModal(bill)}
                          className="btn btn-success btn-sm px-4 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 ml-auto"
                        >
                          <Money24Filled className="text-base" /> Pay
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
          <div className="space-y-5">
            <div className="text-center p-4 bg-[#141416] rounded-2xl border border-[#26262A]">
              <p className="text-3xl font-black text-[#FFB300]">
                ₹{parseFloat(billModal.final_amount).toFixed(2)}
              </p>
              <p className="text-xs font-bold text-[#71717A] mt-1 uppercase tracking-wider">Final Amount to Collect</p>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input text-sm font-semibold">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI / QR</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              onClick={() => handleMarkPaid(billModal.id)}
              className="btn btn-success btn-lg w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2"
            >
              <CheckmarkCircle24Regular className="text-xl" /> Confirm Payment Received
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
