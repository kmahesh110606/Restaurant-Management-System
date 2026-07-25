/**
 * StaffManagement — Admin can create/manage staff users.
 */

import { useEffect, useState } from 'react';
import { IoAdd, IoTrash, IoSave, IoPeople } from 'react-icons/io5';
import { getStaff, createStaff, deleteStaff } from '../../api/staff';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: '', password: '', first_name: '', last_name: '',
    email: '', role: 'waiter', phone_number: '',
  });

  const fetchStaff = () => {
    setLoading(true);
    getStaff()
      .then(({ data }) => setStaff(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createStaff(form);
      toast.success('Staff member created!');
      setModalOpen(false);
      setForm({ username: '', password: '', first_name: '', last_name: '', email: '', role: 'waiter', phone_number: '' });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.username?.[0] || 'Failed to create staff.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    try {
      await deleteStaff(id);
      toast.success('Staff member removed.');
      fetchStaff();
    } catch (err) {
      toast.error('Failed to remove.');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const roleColors = {
    admin: 'var(--color-primary)',
    waiter: 'var(--color-info)',
    kitchen: 'var(--color-accent)',
    biller: 'var(--color-success)',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">👥 Staff Management</h1>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary" id="add-staff-btn">
          <IoAdd size={18} /> Add Staff
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="card p-12 text-center">
          <IoPeople size={48} className="mx-auto text-[var(--color-text-muted)] mb-3" />
          <p className="text-lg font-semibold text-[var(--color-text-heading)]">No staff members</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">
                    {s.user.first_name ? `${s.user.first_name} ${s.user.last_name}` : s.user.username}
                  </td>
                  <td className="text-[var(--color-text-muted)]">{s.user.username}</td>
                  <td>
                    <span
                      className="badge"
                      style={{ background: `${roleColors[s.role]}20`, color: roleColors[s.role] }}
                    >
                      {s.role}
                    </span>
                  </td>
                  <td className="text-[var(--color-text-muted)]">{s.user.email || '—'}</td>
                  <td className="text-[var(--color-text-muted)]">{s.phone_number || '—'}</td>
                  <td>
                    <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm">
                      <IoTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Staff Member">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">First Name</label>
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Last Name</label>
              <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Username *</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Password *</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" required minLength={8} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Role *</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input">
              <option value="admin">Admin</option>
              <option value="waiter">Waiter</option>
              <option value="kitchen">Kitchen</option>
              <option value="biller">Biller</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Phone</label>
            <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="input" />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary"><IoSave size={16} /> {submitting ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
