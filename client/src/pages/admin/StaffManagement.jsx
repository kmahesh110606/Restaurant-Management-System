/**
 * StaffManagement — Rebuilt staff directory management with Fluent UI icons and updated spacing.
 */

import { useEffect, useState } from 'react';
import {
  People24Filled,
  Add24Regular,
  Delete24Regular,
  Save24Regular,
} from '@fluentui/react-icons';
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
    admin: '#E53935',
    waiter: '#42A5F5',
    kitchen: '#FFB300',
    biller: '#4CAF50',
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E53935]/10 border border-[#E53935]/20 flex items-center justify-center text-[#FF5252]">
            <People24Filled className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">Staff Directory</h1>
            <p className="text-xs text-[#9E9E9E] font-medium mt-0.5">Manage accounts and role access for restaurant staff</p>
          </div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary px-5 py-2.5 rounded-xl font-extrabold flex items-center gap-2" id="add-staff-btn">
          <Add24Regular className="text-lg" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="card p-16 text-center bg-[#1A1A1D] border-[#26262A] rounded-2xl space-y-2">
          <People24Filled className="text-4xl mx-auto text-[#71717A]" />
          <p className="text-lg font-extrabold text-[#FAFAFA]">No staff members</p>
          <p className="text-xs text-[#71717A]">Add staff user accounts to give them access to kitchen or billing consoles.</p>
        </div>
      ) : (
        <div className="card overflow-hidden bg-[#1A1A1D] border-[#26262A] shadow-2xl rounded-2xl">
          <table className="data-table w-full text-left">
            <thead>
              <tr className="bg-[#141416] border-b border-[#26262A] text-[11px] font-black uppercase tracking-wider text-[#71717A]">
                <th className="py-4 px-5">Name</th>
                <th className="py-4 px-5">Username</th>
                <th className="py-4 px-5">Role</th>
                <th className="py-4 px-5">Email</th>
                <th className="py-4 px-5">Phone</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262A] text-sm font-medium">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-[#222226] transition-colors">
                  <td className="py-4 px-5 font-bold text-[#FAFAFA]">
                    {s.user.first_name ? `${s.user.first_name} ${s.user.last_name}` : s.user.username}
                  </td>
                  <td className="py-4 px-5 text-xs text-[#9E9E9E] font-mono">{s.user.username}</td>
                  <td className="py-4 px-5">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
                      style={{
                        background: `${roleColors[s.role]}15`,
                        color: roleColors[s.role],
                        borderColor: `${roleColors[s.role]}30`,
                      }}
                    >
                      {s.role}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-xs text-[#9E9E9E]">{s.user.email || '—'}</td>
                  <td className="py-4 px-5 text-xs text-[#9E9E9E] font-mono">{s.phone_number || '—'}</td>
                  <td className="py-4 px-5 text-right">
                    <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm p-2 rounded-xl text-xs">
                      <Delete24Regular className="text-base" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Staff Member">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">First Name</label>
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="input text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Last Name</label>
              <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="input text-sm font-semibold" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Username *</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input text-sm font-semibold" required />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Password *</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input text-sm font-semibold" required minLength={8} />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Role *</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input text-sm font-semibold">
              <option value="admin">Admin</option>
              <option value="waiter">Waiter</option>
              <option value="kitchen">Kitchen</option>
              <option value="biller">Biller</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Phone</label>
            <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="input text-sm font-semibold" />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary px-4 py-2 rounded-xl text-xs font-extrabold">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2">
              <Save24Regular className="text-base" />
              <span>{submitting ? 'Creating...' : 'Create Staff Member'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
