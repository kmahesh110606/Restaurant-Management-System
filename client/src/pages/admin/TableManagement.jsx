/**
 * TableManagement — Dining table mapping with QR code generation,
 * capacity configuration, area assignment, and download/print features.
 */

import { useEffect, useState } from 'react';
import {
  TableSimpleRegular,
  AddRegular,
  EditRegular,
  DeleteRegular,
  QrCodeRegular,
  ArrowDownloadRegular,
  SaveRegular,
  PrintRegular,
  ArrowClockwiseRegular,
} from '@fluentui/react-icons';
import { getTables, createTable, updateTable, deleteTable, regenerateQR } from '../../api/tables';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function TableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [qrModal, setQrModal] = useState(null);

  const [form, setForm] = useState({ number: '', name: '', capacity: 4 });

  const fetchData = () => {
    setLoading(true);
    getTables()
      .then(({ data }) => setTables(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (table = null) => {
    if (table) {
      setEditing(table);
      setForm({ number: table.number, name: table.name || '', capacity: table.capacity });
    } else {
      setEditing(null);
      setForm({ number: '', name: '', capacity: 4 });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await updateTable(editing.id, form);
        toast.success('Table updated!');
      } else {
        await createTable(form);
        toast.success('Table created! QR code generated.');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save table.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      await deleteTable(id);
      toast.success('Table deleted.');
      fetchData();
    } catch {
      toast.error('Failed to delete table.');
    }
  };

  const handleRegenerateQR = async (id) => {
    try {
      await regenerateQR(id);
      toast.success('QR code regenerated!');
      fetchData();
    } catch {
      toast.error('Failed to regenerate QR.');
    }
  };

  const downloadQR = (qrUrl, tableName) => {
    const url = qrUrl.startsWith('http') ? qrUrl : `${API_BASE}${qrUrl}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr_${tableName}.png`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-16 max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-500/20"
            style={{ background: 'var(--color-secondary)' }}
          >
            <TableSimpleRegular fontSize={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Tables & QR Setup</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Manage dining floor tables, capacities, and customer self-ordering QR codes
            </p>
          </div>
        </div>

        <button
          onClick={() => openModal()}
          className="btn btn-primary px-4 py-2 text-xs font-bold gap-1.5"
        >
          <AddRegular fontSize={14} /> Add New Table
        </button>
      </div>

      {/* ═══════════ TABLES GRID ═══════════ */}
      {tables.length === 0 ? (
        <EmptyState
          icon={TableSimpleRegular}
          title="No dining tables yet"
          subtitle="Add tables to generate QR codes for customers to scan and place orders."
          actionLabel="Create First Table"
          onAction={() => openModal()}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {tables.map((tbl) => {
            const qrUrl = tbl.qr_code
              ? tbl.qr_code.startsWith('http')
                ? tbl.qr_code
                : `${API_BASE}${tbl.qr_code}`
              : null;

            return (
              <div
                key={tbl.id}
                className="solid-card bg-white border border-gray-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900">
                        Table {tbl.number}
                      </h3>
                      {tbl.name && (
                        <p className="text-xs text-gray-500 font-medium">{tbl.name}</p>
                      )}
                    </div>
                    <span
                      className={`badge font-bold text-xs ${
                        tbl.is_occupied ? 'badge-pending' : 'badge-ready'
                      }`}
                    >
                      {tbl.is_occupied ? 'Occupied' : 'Available'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 font-medium">
                    Capacity: <span className="font-bold text-gray-900">{tbl.capacity} seats</span>
                  </p>

                  {/* QR Preview thumbnail */}
                  {qrUrl && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                      <img
                        src={qrUrl}
                        alt={`QR Table ${tbl.number}`}
                        className="w-28 h-28 object-contain cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setQrModal(tbl)}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex gap-1.5">
                    {qrUrl && (
                      <button
                        onClick={() => downloadQR(tbl.qr_code, `table_${tbl.number}`)}
                        className="btn btn-secondary btn-sm p-1.5"
                        title="Download QR"
                      >
                        <ArrowDownloadRegular fontSize={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleRegenerateQR(tbl.id)}
                      className="btn btn-secondary btn-sm p-1.5"
                      title="Regenerate QR"
                    >
                      <ArrowClockwiseRegular fontSize={14} />
                    </button>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openModal(tbl)}
                      className="btn btn-secondary btn-sm px-2.5 py-1 text-xs font-bold gap-1"
                    >
                      <EditRegular fontSize={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tbl.id)}
                      className="btn btn-danger btn-sm p-1.5"
                    >
                      <DeleteRegular fontSize={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════ TABLE MODAL ═══════════ */}
      {modalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          title={editing ? `Edit Table ${editing.number}` : 'Add New Dining Table'}
          size="sm"
        >
          <form onSubmit={handleSubmit} className="space-y-4 p-2">
            <div>
              <label className="form-label">Table Number *</label>
              <input
                required
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                placeholder="e.g. 5 or A1"
                className="input"
              />
            </div>

            <div>
              <label className="form-label">Section / Label (Optional)</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Patio Corner, Window 2"
                className="input"
              />
            </div>

            <div>
              <label className="form-label">Seating Capacity *</label>
              <input
                type="number"
                min="1"
                required
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 2 })}
                className="input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn btn-secondary px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary px-6 text-xs font-bold gap-1.5"
              >
                <SaveRegular fontSize={14} />
                {submitting ? 'Saving...' : 'Save Table'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═══════════ QR CODE PREVIEW & PRINT MODAL ═══════════ */}
      {qrModal && (
        <Modal
          isOpen={true}
          onClose={() => setQrModal(null)}
          title={`Table ${qrModal.number} — QR Code`}
          size="sm"
        >
          <div className="p-4 text-center space-y-4">
            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs inline-block">
              <img
                src={
                  qrModal.qr_code?.startsWith('http')
                    ? qrModal.qr_code
                    : `${API_BASE}${qrModal.qr_code}`
                }
                alt={`Table ${qrModal.number}`}
                className="w-48 h-48 object-contain mx-auto"
              />
            </div>

            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">
                Table {qrModal.number} {qrModal.name && `(${qrModal.name})`}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Scan to browse menu and order directly
              </p>
            </div>

            <div className="flex gap-2 justify-center pt-2 border-t border-gray-100">
              <button
                onClick={() => downloadQR(qrModal.qr_code, `table_${qrModal.number}`)}
                className="btn btn-primary flex-1 py-2 text-xs font-bold gap-1.5"
              >
                <ArrowDownloadRegular fontSize={14} /> Download PNG
              </button>
              <button
                onClick={() => window.print()}
                className="btn btn-secondary flex-1 py-2 text-xs font-bold gap-1.5"
              >
                <PrintRegular fontSize={14} /> Print
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
