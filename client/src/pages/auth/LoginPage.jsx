/**
 * LoginPage — Staff-only login.
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoLockClosed, IoPerson } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    const paths = { admin: '/admin', waiter: '/staff/waiter', kitchen: '/staff/kitchen', biller: '/biller' };
    navigate(paths[role] || '/admin', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(username, password);
      toast.success(`Welcome, ${data.user.first_name || data.user.username}!`);
      const paths = { admin: '/admin', waiter: '/staff/waiter', kitchen: '/staff/kitchen', biller: '/biller' };
      const from = location.state?.from?.pathname || paths[data.role] || '/admin';
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'radial-gradient(ellipse at top, var(--color-secondary-light) 0%, var(--color-bg) 70%)',
      }}
    >
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] mb-4 shadow-lg">
            <IoLockClosed size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Staff Login</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Sign in to access your dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Username
            </label>
            <div className="relative">
              <IoPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="input pl-10"
                required
                autoFocus
                id="login-username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Password
            </label>
            <div className="relative">
              <IoLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input pl-10"
                required
                id="login-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full"
            id="login-submit"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
          Restaurant Management System
        </p>
      </div>
    </div>
  );
}
