/**
 * PlatformAdminPage — Platform Superadmin Control Center.
 * Entire RMS software administration for:
 * 1. Registered Hotels / Restaurants (metrics, status, master credential assistance)
 * 2. Cross-tenant Users Directory (all users, roles, tenant assignments, password resets)
 * 3. Security & Safety Logs (authentication audits, credential changes, intrusion alerts)
 * 4. Cross-platform Macro Telemetry (GMV, order volume, total accounts)
 */

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  BuildingShopRegular,
  PeopleRegular,
  ReceiptRegular,
  MoneyRegular,
  SearchRegular,
  KeyRegular,
  ArrowSyncRegular,
  DismissRegular,
  CheckmarkRegular,
  CopyRegular,
  ShieldCheckmarkRegular,
  PersonRegular,
  LockClosedRegular,
  AlertRegular,
  CheckmarkCircleRegular,
} from '@fluentui/react-icons';
import {
  getPlatformRestaurants,
  resetOwnerPassword,
  getPlatformSummary,
  getPlatformUsers,
  getPlatformSafetyLogs,
  resetUserPassword,
  toggleRestaurantStatus,
} from '../../api/platform';
import LoadingSpinner from '../../components/LoadingSpinner';
import LiquidPills from '../../components/ui/LiquidPills';
import toast from 'react-hot-toast';

export default function PlatformAdminPage() {
  const { isSuperuser, role } = useAuth();

  // Strict defense-in-depth: only system superusers can load or execute this component
  if (!isSuperuser && role !== 'platform_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' | 'users' | 'safety_logs'

  // Platform Data
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [safetyLogs, setSafetyLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [workflowFilter, setWorkflowFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Password Reset Modal (supports restaurant owner or individual user)
  const [activeTarget, setActiveTarget] = useState(null); // { type: 'owner' | 'user', id, name, username }
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [restRes, sumRes, userRes, logsRes] = await Promise.all([
        getPlatformRestaurants(),
        getPlatformSummary(),
        getPlatformUsers(),
        getPlatformSafetyLogs(),
      ]);
      setRestaurants(Array.isArray(restRes.data) ? restRes.data : []);
      setSummary(sumRes.data);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
      setSafetyLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch {
      toast.error('Failed to load platform control directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  const handleOpenResetModal = (target) => {
    setActiveTarget(target);
    generateRandomPassword();
    setCopied(false);
  };

  const handleCloseModal = () => {
    setActiveTarget(null);
    setNewPassword('');
    setCopied(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!activeTarget || !newPassword.trim()) return;

    if (newPassword.trim().length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setResetting(true);
    try {
      if (activeTarget.type === 'owner') {
        const res = await resetOwnerPassword(activeTarget.id, newPassword.trim());
        toast.success(res.data.detail || 'Master credentials updated.');
      } else {
        const res = await resetUserPassword(activeTarget.id, newPassword.trim());
        toast.success(res.data.detail || 'User password updated.');
      }
      handleCloseModal();
      fetchAllData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update credentials.';
      toast.error(msg);
    } finally {
      setResetting(false);
    }
  };

  const handleToggleStatus = async (restaurantId, currentName) => {
    try {
      const res = await toggleRestaurantStatus(restaurantId);
      toast.success(res.data.detail || 'Status updated.');
      fetchAllData();
    } catch {
      toast.error(`Failed to update status for ${currentName}.`);
    }
  };

  const copyToClipboard = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      setCopied(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filtered Lists
  const filteredRestaurants = restaurants.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.name.toLowerCase().includes(q) ||
      r.slug.toLowerCase().includes(q) ||
      r.owner?.username?.toLowerCase().includes(q) ||
      r.owner?.email?.toLowerCase().includes(q);
    const matchesWorkflow = workflowFilter === 'all' || r.workflow_type === workflowFilter;
    return matchesSearch && matchesWorkflow;
  });

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.first_name && u.first_name.toLowerCase().includes(q)) ||
      (u.last_name && u.last_name.toLowerCase().includes(q)) ||
      (u.restaurant?.name && u.restaurant.name.toLowerCase().includes(q))
    );
  });

  const filteredLogs = safetyLogs.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      l.description.toLowerCase().includes(q) ||
      l.event_type.toLowerCase().includes(q) ||
      (l.username && l.username.toLowerCase().includes(q)) ||
      (l.ip_address && l.ip_address.toLowerCase().includes(q));
    const matchesSeverity = severityFilter === 'all' || l.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  if (loading) return <LoadingSpinner fullPage text="Loading platform control center..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Platform Administration
          </h1>
        </div>
        <button
          onClick={fetchAllData}
          className="btn btn-secondary self-start sm:self-auto gap-2 text-xs font-bold"
        >
          <ArrowSyncRegular fontSize={14} />
          <span>Refresh All</span>
        </button>
      </div>

      {/* ═══════════ MACRO TELEMETRY ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">Platform GMV</span>
            <MoneyRegular fontSize={18} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            ₹{summary ? Number(summary.total_gmv).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
          </p>
          <span className="text-xs font-bold text-emerald-600 mt-1 inline-block">Settled cross-tenant</span>
        </div>

        <div className="stat-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">Registered Hotels & Venues</span>
            <BuildingShopRegular fontSize={18} className="text-orange-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {summary?.total_restaurants || restaurants.length}
          </p>
          <span className="text-xs font-bold text-slate-500 mt-1 inline-block">Total platform tenants</span>
        </div>

        <div className="stat-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">Total User Accounts</span>
            <PeopleRegular fontSize={18} className="text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {users.length}
          </p>
          <span className="text-xs font-bold text-blue-600 mt-1 inline-block">Across all restaurants</span>
        </div>

        <div className="stat-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">Safety & Audit Logs</span>
            <ShieldCheckmarkRegular fontSize={18} className="text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {safetyLogs.length}
          </p>
          <span className="text-xs font-bold text-purple-600 mt-1 inline-block">Security audit entries</span>
        </div>
      </div>

      {/* ═══════════ NAVIGATION TABS (iOS Liquid Glass Sliding Pills) ═══════════ */}
      <div className="pb-3 overflow-x-auto">
        <LiquidPills
          items={[
            { label: `Registered Hotels & Venues (${restaurants.length})`, value: 'restaurants', icon: BuildingShopRegular },
            { label: `All Registered Users (${users.length})`, value: 'users', icon: PeopleRegular },
            { label: `Safety & Security Logs (${safetyLogs.length})`, value: 'safety_logs', icon: AlertRegular },
          ]}
          value={activeTab}
          onChange={(val) => {
            setActiveTab(val);
            setSearchQuery('');
          }}
          layoutId="platform-admin-nav-pill"
          size="md"
        />
      </div>

      {/* ═══════════ SEARCH & FILTERS BAR ═══════════ */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <SearchRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none search-icon" fontSize={16} />
          <input
            type="text"
            placeholder={
              activeTab === 'restaurants'
                ? 'Search hotel name, slug, or owner username...'
                : activeTab === 'users'
                ? 'Search username, email, full name, or venue...'
                : 'Search event, IP, user, or description...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-with-icon-left min-h-[42px] pr-4 text-xs sm:text-sm"
          />
        </div>

        {activeTab === 'restaurants' && (
          <LiquidPills
            items={[
              { label: 'All Modes', value: 'all' },
              { label: 'Table', value: 'table' },
              { label: 'Token', value: 'token' },
              { label: 'Shop', value: 'shop' },
            ]}
            value={workflowFilter}
            onChange={setWorkflowFilter}
            layoutId="platform-admin-workflow-pill"
            size="sm"
          />
        )}

        {activeTab === 'safety_logs' && (
          <LiquidPills
            items={[
              { label: 'All Severity', value: 'all' },
              { label: 'Info', value: 'info' },
              { label: 'Warning', value: 'warning' },
              { label: 'Critical', value: 'critical' },
            ]}
            value={severityFilter}
            onChange={setSeverityFilter}
            layoutId="platform-admin-severity-pill"
            size="sm"
          />
        )}
      </div>

      {/* ═══════════ TAB 1: REGISTERED HOTELS / RESTAURANTS ═══════════ */}
      {activeTab === 'restaurants' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hotel / Restaurant</th>
                  <th>Master Owner</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Menu & Tables</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                      No hotels match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRestaurants.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div>
                          <p className="font-extrabold text-sm text-slate-900">{r.name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">/{r.slug}</p>
                          <p className="text-[11px] text-slate-400 capitalize mt-0.5">Mode: {r.workflow_type}</p>
                        </div>
                      </td>

                      <td>
                        {r.owner ? (
                          <div>
                            <p className="font-bold text-xs text-slate-800">{r.owner.username}</p>
                            <p className="text-xs text-slate-500">{r.owner.email || 'No email'}</p>
                            <span className="text-[11px] text-slate-400">
                              {r.owner.first_name} {r.owner.last_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No owner assigned</span>
                        )}
                      </td>

                      <td>
                        <span className="font-extrabold text-xs text-slate-800">
                          {r.metrics?.total_orders || 0} tickets
                        </span>
                      </td>

                      <td>
                        <span className="font-extrabold text-xs text-emerald-700">
                          ₹{Number(r.metrics?.total_revenue || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td>
                        <div className="text-xs text-slate-600">
                          <p>{r.metrics?.menu_count || 0} dishes</p>
                          <p>{r.metrics?.table_count || 0} tables • {r.metrics?.staff_count || 0} staff</p>
                        </div>
                      </td>

                      <td>
                        <button
                          onClick={() => handleToggleStatus(r.id, r.name)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                            r.is_active
                              ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-700 hover:bg-rose-500/20'
                          }`}
                          title="Click to toggle active/suspended status"
                        >
                          {r.is_active ? 'Active' : 'Suspended'}
                        </button>
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              handleOpenResetModal({
                                type: 'owner',
                                id: r.id,
                                name: r.name,
                                username: r.owner?.username || 'Owner',
                              })
                            }
                            className="btn btn-secondary px-3 py-1.5 text-xs font-bold gap-1.5"
                            title="Reset master owner password"
                          >
                            <KeyRegular fontSize={14} />
                            <span>Reset Creds</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ TAB 2: ALL REGISTERED USERS ═══════════ */}
      {activeTab === 'users' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User & Identity</th>
                  <th>Assigned Role</th>
                  <th>Assigned Hotel / Venue</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th className="text-right">Credential Management</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs">
                            {u.username[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                              <span>{u.username}</span>
                              {u.is_superuser && (
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                  Superadmin
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{u.email || 'No email registered'}</p>
                            {(u.first_name || u.last_name) && (
                              <p className="text-[11px] text-slate-400">
                                {u.first_name} {u.last_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="text-xs font-bold text-slate-700 capitalize">
                          {u.role}
                        </span>
                      </td>

                      <td>
                        {u.restaurant ? (
                          <div className="text-xs">
                            <p className="font-bold text-slate-800">{u.restaurant.name}</p>
                            <p className="text-slate-400 font-mono text-[11px]">/{u.restaurant.slug}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">System-Wide / Platform</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`text-xs font-bold ${
                            u.is_active ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td>
                        <span className="text-xs text-slate-500">
                          {new Date(u.date_joined).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </td>

                      <td className="text-right">
                        <button
                          onClick={() =>
                            handleOpenResetModal({
                              type: 'user',
                              id: u.id,
                              name: u.restaurant?.name || 'Platform Account',
                              username: u.username,
                            })
                          }
                          className="btn btn-secondary px-3 py-1.5 text-xs font-bold gap-1.5"
                          title="Reset user password"
                        >
                          <KeyRegular fontSize={14} />
                          <span>Reset Password</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ TAB 3: SAFETY & SECURITY LOGS ═══════════ */}
      {activeTab === 'safety_logs' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Severity</th>
                  <th>Event Type</th>
                  <th>User / IP</th>
                  <th>Venue Scope</th>
                  <th>Security Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                      No safety events match the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap">
                        <span className="text-xs font-mono text-slate-600">
                          {new Date(log.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`text-xs font-bold ${
                            log.severity === 'critical'
                              ? 'text-rose-700 font-black'
                              : log.severity === 'warning'
                              ? 'text-amber-700'
                              : 'text-blue-700'
                          }`}
                        >
                          {log.severity.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <span className="text-xs font-bold font-mono text-slate-800">
                          {log.event_type}
                        </span>
                      </td>

                      <td>
                        <div className="text-xs">
                          <p className="font-bold text-slate-800">{log.username || 'System'}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{log.ip_address || 'Internal'}</p>
                        </div>
                      </td>

                      <td>
                        <span className="text-xs text-slate-600">
                          {log.restaurant_name || 'Cross-Platform'}
                        </span>
                      </td>

                      <td>
                        <p className="text-xs text-slate-700 font-medium max-w-lg leading-relaxed">
                          {log.description}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: CREDENTIAL RESET ASSISTANCE ═══════════ */}
      {activeTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-md animate-fade-in"
          style={{
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <div className="glass-card max-w-md w-full p-6 sm:p-8 space-y-6 relative border border-white/80 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
                  <KeyRegular fontSize={18} />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 leading-tight">
                    Reset Account Credentials
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {activeTarget.name} ({activeTarget.username})
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 transition-colors"
              >
                <DismissRegular fontSize={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="form-label">New Master Password</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LockClosedRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fontSize={16} />
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="input pl-10 pr-4 py-2 font-mono text-xs font-bold"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="btn btn-secondary px-3 py-2 text-xs font-bold gap-1 shrink-0"
                    title="Generate secure password"
                  >
                    <ArrowSyncRegular fontSize={14} />
                    <span>Generate</span>
                  </button>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className={`btn px-3 py-2 text-xs font-bold gap-1 shrink-0 ${
                      copied ? 'btn-primary' : 'btn-secondary'
                    }`}
                    title="Copy password to clipboard"
                  >
                    {copied ? <CheckmarkRegular fontSize={14} /> : <CopyRegular fontSize={14} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                  Provide this password to the authorized user. They can sign in immediately at /login.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary flex-1 py-2 text-xs font-bold justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="btn btn-primary flex-1 py-2 text-xs font-bold justify-center shadow-lg shadow-orange-500/20"
                >
                  {resetting ? 'Updating...' : 'Confirm Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
