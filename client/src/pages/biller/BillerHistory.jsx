/**
 * BillerHistory — Archive of issued bills with search, status filters, and reprint capability.
 * Glassmorphic design and Fluent UI icons throughout.
 */

import { useEffect, useState } from 'react';
import {
  ArrowClockwiseRegular,
  SearchRegular,
  PrintRegular,
  ReceiptRegular,
} from '@fluentui/react-icons';
import { getBills } from '../../api/bills';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import CustomSelect from '../../components/ui/CustomSelect';

export default function BillerHistory() {
  const [bills, setBills] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBills = () => {
    setLoading(true);
    const params = {};
    if (filter) params.payment_status = filter;
    getBills(params)
      .then(({ data }) => setBills(data.results || data || []))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBills();
  }, [filter]);

  const filteredBills = bills.filter((b) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      b.id.toLowerCase().includes(term) ||
      (b.customer && String(b.customer).toLowerCase().includes(term)) ||
      (b.payment_method && b.payment_method.toLowerCase().includes(term))
    );
  });

  if (loadError) return <EmptyState title="Could not load this page" subtitle="Check your connection and try again." actionLabel="Retry" onAction={() => window.location.reload()} />;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-16 max-w-7xl mx-auto">
      {/* ═══════════ HEADER & FILTERS ═══════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Bill Archives</h1>
        </div>

        {/* Filters: Responsive on Mobile & Desktop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* Search bar: full-width on mobile, neat width on desktop with guaranteed icon clearance */}
          <div className="relative flex-1 sm:w-64">
            <SearchRegular fontSize={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10 search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Bill ID..."
              className="input input-with-icon-left min-h-[40px] text-xs sm:text-sm w-full"
            />
          </div>

          {/* Dropdown & Refresh on mobile are side-by-side */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <CustomSelect
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Paid', value: 'paid' },
                { label: 'Unpaid', value: 'unpaid' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
              value={filter}
              onChange={setFilter}
              size="sm"
              className="flex-1 sm:w-40"
            />

            <button
              onClick={fetchBills}
              className="btn btn-secondary min-h-[40px] px-3.5 font-bold shrink-0"
              title="Refresh Bills"
            >
              <ArrowClockwiseRegular fontSize={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ BILLS LIST ═══════════ */}
      {filteredBills.length === 0 ? (
        <EmptyState
          icon={ReceiptRegular}
          title="No bills found"
          subtitle="No billing records match your search or filter criteria."
        />
      ) : (
        <>
          {/* Mobile Cards View (< md) */}
          <div className="block md:hidden space-y-3.5">
            {filteredBills.map((bill) => (
              <div
                key={bill.id}
                className="glass-card p-4 space-y-3 border border-white/80 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-900">
                      #{bill.id.slice(0, 8)}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(bill.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <StatusBadge status={bill.payment_status} />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 border-y border-gray-100/80 py-2">
                  <span className="text-gray-700 font-medium">
                    {bill.customer || 'Guest'}
                  </span>
                  <span className="capitalize font-semibold text-gray-600 bg-gray-100/80 px-2 py-0.5 rounded-lg text-[11px]">
                    {bill.payment_method || 'Cash'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 gap-3">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total</span>
                    <span className="text-base font-black text-gray-900">
                      ₹{parseFloat(bill.final_amount || 0).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedBill(bill)}
                    className="btn btn-secondary min-h-[36px] px-3.5 text-xs font-bold gap-1.5"
                  >
                    <PrintRegular fontSize={14} />
                    View Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block solid-card overflow-hidden bg-white border border-gray-200">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Date & Time</th>
                    <th>Customer</th>
                    <th>Subtotal</th>
                    <th>Tax</th>
                    <th>Discount</th>
                    <th>Total Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="font-mono text-xs font-bold text-gray-900">
                        #{bill.id.slice(0, 8)}
                      </td>
                      <td className="text-gray-500 text-xs">
                        {new Date(bill.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="text-gray-600 font-medium text-xs">
                        {bill.customer || 'Guest'}
                      </td>
                      <td>₹{parseFloat(bill.subtotal || 0).toFixed(2)}</td>
                      <td>₹{parseFloat(bill.tax_amount || 0).toFixed(2)}</td>
                      <td>₹{parseFloat(bill.discount_amount || 0).toFixed(2)}</td>
                      <td className="font-black text-gray-900">
                        ₹{parseFloat(bill.final_amount || 0).toFixed(2)}
                      </td>
                      <td className="capitalize font-semibold text-xs text-gray-600">
                        {bill.payment_method || 'Cash'}
                      </td>
                      <td>
                        <StatusBadge status={bill.payment_status} />
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="btn btn-sm btn-secondary py-1 px-2.5 text-[11px] font-bold gap-1"
                        >
                          <PrintRegular fontSize={12} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══════════ RECEIPT MODAL ═══════════ */}
      {selectedBill && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBill(null)}
          title={`Bill #${selectedBill.id.slice(0, 8)}`}
          size="sm"
        >
          <div className="space-y-4 p-2 text-xs">
            <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-2">
              <span>Date:</span>
              <span className="font-semibold text-gray-800">
                {new Date(selectedBill.created_at).toLocaleString()}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{parseFloat(selectedBill.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="font-semibold">₹{parseFloat(selectedBill.tax_amount || 0).toFixed(2)}</span>
              </div>
              {parseFloat(selectedBill.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-₹{parseFloat(selectedBill.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex justify-between font-black text-sm text-gray-900">
                <span>Paid Total:</span>
                <span className="text-[var(--color-primary)]">
                  ₹{parseFloat(selectedBill.final_amount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-gray-600">
              <span>Payment Mode:</span>
              <span className="badge badge-paid uppercase font-bold">{selectedBill.payment_method || 'Cash'}</span>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => window.print()}
                className="btn btn-secondary flex-1 py-2 font-bold gap-1.5"
              >
                <PrintRegular fontSize={14} />
                Print Duplicate
              </button>
              <button
                onClick={() => setSelectedBill(null)}
                className="btn btn-ghost px-4"
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
