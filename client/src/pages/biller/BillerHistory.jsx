/**
 * BillerHistory — Past bills with payment status filter.
 */

import { useEffect, useState } from 'react';
import { IoRefresh } from 'react-icons/io5';
import { getBills } from '../../api/bills';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function BillerHistory() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchBills = () => {
    setLoading(true);
    const params = {};
    if (filter) params.payment_status = filter;
    getBills(params)
      .then(({ data }) => setBills(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBills(); }, [filter]);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">📜 Bill History</h1>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <button onClick={fetchBills} className="btn btn-secondary btn-sm"><IoRefresh size={16} /></button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Subtotal</th>
              <th>Tax</th>
              <th>Discount</th>
              <th>Final</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id}>
                <td className="font-mono text-xs">{bill.id.slice(0, 8)}</td>
                <td className="text-[var(--color-text-muted)]">
                  {new Date(bill.created_at).toLocaleDateString()}
                </td>
                <td className="text-[var(--color-text-muted)]">{bill.customer || '—'}</td>
                <td>₹{parseFloat(bill.subtotal).toFixed(0)}</td>
                <td>₹{parseFloat(bill.tax_amount).toFixed(0)}</td>
                <td>₹{parseFloat(bill.discount_amount).toFixed(0)}</td>
                <td className="font-bold">₹{parseFloat(bill.final_amount).toFixed(0)}</td>
                <td className="capitalize">{bill.payment_method}</td>
                <td><StatusBadge status={bill.payment_status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {bills.length === 0 && (
          <p className="text-center text-[var(--color-text-muted)] py-8">No bills found.</p>
        )}
      </div>
    </div>
  );
}
