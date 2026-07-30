/**
 * TableManagement — Rebuilt table mapping with Fluent UI icons, QR code preview, and enhanced grid spacing.
 */

import { useEffect, useState } from 'react';
import {
  Table24Filled,
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  QrCode24Regular,
  ArrowDownload24Regular,
  Save24Regular,
} from '@fluentui/react-icons';
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
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E53935]/10 border border-[#E53935]/20 flex items-center justify-center text-[#FF5252]">
            <Table24Filled className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">Table Mapping</h1>
            <p className="text-xs text-[#9E9E9E] font-medium mt-0.5">Manage dining area tables & automated QR menu codes</p>
          </div>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary px-5 py-2.5 rounded-xl font-extrabold flex items-center gap-2" id="add-table-btn">
          <Add24Regular className="text-lg" />
          <span>Add Table</span>
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="card p-16 text-center bg-[#1A1A1D] border-[#26262A] rounded-2xl space-y-2">
          <Table24Filled className="text-4xl mx-auto text-[#71717A]" />
          <p className="text-lg font-extrabold text-[#FAFAFA]">No dining tables added</p>
          <p className="text-xs text-[#71717A]">Add tables to automatically generate printable customer QR codes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => {
            const qrUrl = table.qr_code ? (table.qr_code.startsWith('http') ? table.qr_code : `${API_BASE}${table.qr_code}`) : null;
            return (
              <div key={table.id} className="card p-6 bg-[#1A1A1D] border-[#26262A] hover:border-[#3E3E45] rounded-2xl shadow-xl text-center space-y-4 flex flex-col justify-between">
                <div>
                  <div className="text-3xl font-black text-[#E53935] mb-1">
                    #{table.number}
                  </div>
                  <p className="text-sm font-extrabold text-[#FAFAFA] mb-1">
                    {table.name || `Table ${table.number}`}
                  </p>
                  <p className="text-xs font-bold text-[#71717A] mb-4">Capacity: {table.capacity} Guests</p>

                  {qrUrl && (
                    <div
                      className="cursor-pointer mb-4 inline-block p-2 bg-white rounded-2xl shadow-md border border-white/20 hover:scale-105 transition-transform"
                      onClick={() => setQrModal(table)}
                      title="Click to expand QR Code"
                    >
                      <img src={qrUrl} alt={`QR Table ${table.number}`} className="w-32 h-32 mx-auto rounded-lg object-contain" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-center pt-2 border-t border-[#26262A]">
                  {qrUrl && (
                    <button onClick={() => downloadQR(table.qr_code, table.name || `table_${table.number}`)} className="btn btn-secondary btn-sm p-2.5 rounded-xl text-xs" title="Download QR">
                      <ArrowDownload24Regular className="text-base" />
                    </button>
                  )}
                  <button onClick={() => handleRegenerateQR(table.id)} className="btn btn-secondary btn-sm p-2.5 rounded-xl text-xs" title="Regenerate QR">
                    <QrCode24Regular className="text-base" />
                  </button>
                  <button onClick={() => openModal(table)} className="btn btn-secondary btn-sm p-2.5 rounded-xl text-xs" title="Edit Table">
                    <Edit24Regular className="text-base" />
                  </button>
                  <button onClick={() => handleDelete(table.id)} className="btn btn-danger btn-sm p-2.5 rounded-xl text-xs" title="Delete Table">
                    <Delete24Regular className="text-base" />
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
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Table Number *</label>
            <input type="number" value={form.number} onChange={(e) => setForm({ ...form, number: parseInt(e.target.value) })} className="input text-sm font-semibold" required min={1} />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Label / Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input text-sm font-semibold" placeholder='e.g. "Patio Booth #3"' />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Seating Capacity</label>
            <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })} className="input text-sm font-semibold" min={1} />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary px-4 py-2 rounded-xl text-xs font-extrabold">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2">
              <Save24Regular className="text-base" />
              <span>{submitting ? 'Saving...' : 'Save Table'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Preview Modal */}
      <Modal isOpen={!!qrModal} onClose={() => setQrModal(null)} title={`QR Code — ${qrModal?.name || `Table ${qrModal?.number}`}`}>
        {qrModal?.qr_code && (
          <div className="text-center space-y-4">
            <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl">
              <img
                src={qrModal.qr_code.startsWith('http') ? qrModal.qr_code : `${API_BASE}${qrModal.qr_code}`}
                alt="QR Code"
                className="w-64 h-64 mx-auto object-contain"
              />
            </div>
            <p className="text-xs text-[#9E9E9E] font-medium">
              Scan this QR code to access the instant customer ordering menu for this table.
            </p>
            <button
              onClick={() => downloadQR(qrModal.qr_code, qrModal.name || `table_${qrModal.number}`)}
              className="btn btn-primary px-6 py-2.5 rounded-xl font-extrabold flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowDownload24Regular className="text-base" /> Download Printable Code
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
