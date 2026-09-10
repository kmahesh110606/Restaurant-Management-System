/**
 * LoginPage — iOS 28 Liquid Glass Staff Authentication.
 * Features ambient fluid mesh backdrop, frosted glass card,
 * safe icon spacing, and tactile micro-interactions.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PersonRegular,
  LockClosedRegular,
  EyeRegular,
  EyeOffRegular,
  FoodRegular,
  ArrowRightRegular,
} from '@fluentui/react-icons';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, getDefaultPath } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.success('Welcome back!');
      navigate(getDefaultPath());
    } catch (err) {
      const message = err.response?.data?.detail || 'Invalid credentials';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Welcome back!');
      navigate(getDefaultPath());
    } catch (err) {
      const message = err.response?.data?.detail || 'Google login failed';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm bg-mesh-canvas flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' }}
            >
              <FoodRegular fontSize={22} />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Staff Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Sign in to access your operations dashboard
          </p>
        </div>

        {/* Liquid Glass Login Card */}
        <div className="glass-card p-7 sm:p-9 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="form-group mb-0">
              <label className="form-label">Username</label>
              <div className="relative">
                <PersonRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fontSize={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input input-with-icon-left"
                  autoFocus
                  id="login-username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group mb-0">
              <label className="form-label">Password</label>
              <div className="relative">
                <LockClosedRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fontSize={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input input-with-icon-left input-with-icon-right"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffRegular fontSize={18} /> : <EyeRegular fontSize={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg justify-center mt-2 shadow-lg shadow-orange-500/25"
              id="login-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRightRegular fontSize={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200/80" />
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-slate-200/80" />
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed')}
              shape="pill"
              size="large"
              text="continue_with"
              width="100%"
            />
          </div>
        </div>

        {/* Signup Link */}
        <p className="text-center text-xs sm:text-sm text-slate-500 mt-6 font-medium">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-orange-600 font-bold hover:underline">
            Register your restaurant
          </Link>
        </p>
      </div>
    </div>
  );
}
