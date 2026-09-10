/**
 * LoginPage — Staff login with glassmorphic card on gradient background.
 * Supports username/password and Google OAuth.
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
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
            <FoodRegular fontSize={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to your restaurant dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 sm:p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="form-group mb-0">
              <label className="form-label">Username</label>
              <div className="relative">
                <PersonRegular className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fontSize={16} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input pl-10"
                  autoFocus
                  id="login-username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group mb-0">
              <label className="form-label">Password</label>
              <div className="relative">
                <LockClosedRegular className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fontSize={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input pl-10 pr-10"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffRegular fontSize={16} /> : <EyeRegular fontSize={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg justify-center mt-2"
              id="login-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRightRegular fontSize={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
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
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-[var(--color-primary)] font-bold hover:underline">
            Register your restaurant
          </Link>
        </p>
      </div>
    </div>
  );
}
