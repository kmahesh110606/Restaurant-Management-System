/**
 * StaffManagement — Staff directory and role assignments (Admin, Waiter, Kitchen, Biller).
 * Glassmorphic design and Fluent UI icons throughout.
 */

import { useEffect, useState } from 'react';
import {
  PeopleTeamRegular,
  AddRegular,
  DeleteRegular,
  SaveRegular,
  PersonRegular,
  MailRegular,
  CallRegular,
  ShieldRegular,
} from '@fluentui/react-icons';
import { getStaff, createStaff, deleteStaff } from '../../api/staff';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'waiter',
    phone_number: '',
  });

  const fetchStaff = () => {
    setLoading(true);
    getStaff()
      .then(({ data }) => setStaff(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createStaff(form);
      toast.success('Staff member registered successfully!');
      setModalOpen(false);
      setForm({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        role: 'waiter',
        phone_number: '',
      });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.username?.[0] || 'Failed to create staff account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await deleteStaff(id);
      toast.success('Staff member removed.');
      fetchStaff();
    } catch {
      toast.error('Failed to remove staff.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const roleBadges = {
    admin: { label: 'Admin', class: 'bg-red-50 text-red-700 border-red-200' },
    waiter: { label: 'Waitstaff', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    kitchen: { label: 'Kitchen Chef', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    biller: { label: 'Cashier / POS', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };

  return (
    <div className="animate-fade-in space-y-6 pb-16 max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20"
            style={{ background: '#2563EB' }}
          >
            <PeopleTeamRegular fontSize={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Staff & Roles</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Manage operational personnel and role-based permissions
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary px-4 py-2 text-xs font-bold gap-1.5"
        >
          <AddRegular fontSize={14} /> Add Staff Member
        </button>
      </div>

      {/* ═══════════ STAFF TABLE ═══════════ */}
      {staff.length === 0 ? (
        <EmptyState
          icon={PeopleTeamRegular}
          title="No staff members registered"
          subtitle="Add waiters, chefs, or cashiers to manage restaurant operations."
          actionLabel="Add Staff"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="solid-card bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => {
                  const roleConfig = roleBadges[s.role] || {
                    label: s.role,
                    class: 'bg-gray-100 text-gray-700',
                  };
                  const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.username;

                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-xs">{fullName}</p>
                            <p className="text-[10px] text-gray-400 capitalize">{s.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs font-bold text-gray-600">
                        @{s.username}
                      </td>
                      <td>
                        <span className={`badge border font-bold text-xs ${roleConfig.class}`}>
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="text-xs text-gray-500">{s.email || '—'}</td>
                      <td className="text-xs text-gray-500">{s.phone_number || '—'}</td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="btn btn-danger btn-sm p-1.5"
                          title="Remove Staff"
                        >
                          <DeleteRegular fontSize={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ ADD STAFF MODAL ═══════════ */}
      {modalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          title="Add Staff Member"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name</label>
                <input
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="e.g. Alex"
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">Last Name</label>
                <input
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="e.g. Chen"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Login Username *</label>
                <input
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="alexchen"
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Operational Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input"
                >
                  <option value="waiter">Waiter / Floor Server</option>
                  <option value="kitchen">Kitchen Staff / Chef</option>
                  <option value="biller">Cashier / Biller</option>
                  <option value="admin">Assistant Administrator</option>
                </select>
              </div>

              <div>
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="alex@restaurant.com"
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
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
