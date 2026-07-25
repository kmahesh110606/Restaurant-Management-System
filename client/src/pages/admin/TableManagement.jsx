/**
 * TableManagement — CRUD for tables with QR code preview and download.
 */

import { useEffect, useState } from 'react';
import { IoAdd, IoCreate, IoTrash, IoQrCode, IoDownload, IoSave } from 'react-icons/io5';
import { getTables, createTable, updateTable, deleteTable, regenerateQR } from '../../api/tables';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
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
      .then(({ data }) => setTables(data.results || data))
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
    if (!confirm('Delete this table?')) return;
    try {
      await deleteTable(id);
      toast.success('Table deleted.');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  const handleRegenerateQR = async (id) => {
    try {
      await regenerateQR(id);
      toast.success('QR code regenerated!');
      fetchData();
    } catch (err) {
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

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">🪑 Table Management</h1>
        <button onClick={() => openModal()} className="btn btn-primary" id="add-table-btn">
          <IoAdd size={18} /> Add Table
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-lg font-semibold text-[var(--color-text-heading)]">No tables yet</p>
          <p className="text-[var(--color-text-muted)]">Add tables to generate QR codes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => {
            const qrUrl = table.qr_code ? (table.qr_code.startsWith('http') ? table.qr_code : `${API_BASE}${table.qr_code}`) : null;
            return (
              <div key={table.id} className="card p-4 text-center">
                <div className="text-3xl font-bold text-[var(--color-primary)] mb-1">
                  {table.number}
                </div>
                <p className="text-sm text-[var(--color-text-heading)] font-medium mb-1">
                  {table.name || `Table ${table.number}`}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mb-3">Seats: {table.capacity}</p>

                {qrUrl && (
                  <div
                    className="cursor-pointer mb-3 inline-block"
                    onClick={() => setQrModal(table)}
                  >
                    <img src={qrUrl} alt={`QR Table ${table.number}`} className="w-32 h-32 mx-auto rounded-lg border border-[var(--color-border)] bg-white p-1" />
                  </div>
                )}

                <div className="flex gap-1 justify-center flex-wrap">
                  {qrUrl && (
                    <button onClick={() => downloadQR(table.qr_code, table.name || `table_${table.number}`)} className="btn btn-secondary btn-sm">
                      <IoDownload size={14} />
                    </button>
                  )}
                  <button onClick={() => handleRegenerateQR(table.id)} className="btn btn-secondary btn-sm">
                    <IoQrCode size={14} />
                  </button>
                  <button onClick={() => openModal(table)} className="btn btn-secondary btn-sm">
                    <IoCreate size={14} />
                  </button>
                  <button onClick={() => handleDelete(table.id)} className="btn btn-danger btn-sm">
                    <IoTrash size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Table' : 'Add Table'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Table Number *</label>
            <input type="number" value={form.number} onChange={(e) => setForm({ ...form, number: parseInt(e.target.value) })} className="input" required min={1} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Label / Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder='e.g. "Window Seat #3"' />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Capacity</label>
            <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })} className="input" min={1} />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary"><IoSave size={16} /> {submitting ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* QR Preview Modal */}
      <Modal isOpen={!!qrModal} onClose={() => setQrModal(null)} title={`QR Code — ${qrModal?.name || `Table ${qrModal?.number}`}`}>
        {qrModal?.qr_code && (
          <div className="text-center">
            <img
              src={qrModal.qr_code.startsWith('http') ? qrModal.qr_code : `${API_BASE}${qrModal.qr_code}`}
              alt="QR Code"
              className="w-64 h-64 mx-auto bg-white p-2 rounded-xl"
            />
            <p className="text-sm text-[var(--color-text-muted)] mt-3">
              Scan this QR code to access the menu for this table
            </p>
            <button
              onClick={() => downloadQR(qrModal.qr_code, qrModal.name || `table_${qrModal.number}`)}
              className="btn btn-primary mt-4"
            >
              <IoDownload size={16} /> Download for Printing
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
