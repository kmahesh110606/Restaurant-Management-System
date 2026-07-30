/**
 * LoginPage — Staff-only login (username/password).
 * No Google OAuth — that's for restaurant owners only via Signup.
 */

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { IoLockClosed, IoPerson, IoFlame, IoEye, IoEyeOff, IoArrowBack } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const inputStyle = {
    width: '100%',
    padding: '14px 14px 14px 44px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '12px',
    color: '#E0E0E0',
    fontSize: '0.95rem',
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: '#121212',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background effects */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(229,57,53,0.06), transparent)',
        top: '-20%',
        right: '-10%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,179,0,0.04), transparent)',
        bottom: '-10%',
        left: '-5%',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
        {/* Back to landing */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#616161',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '24px',
            transition: 'color 0.2s',
          }}
        >
          <IoArrowBack size={16} /> Back to home
        </Link>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #E53935, #FF8F00)',
            marginBottom: '16px',
            boxShadow: '0 4px 20px rgba(229,57,53,0.3)',
          }}>
            <IoFlame size={28} color="white" />
          </div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 900,
            color: '#FAFAFA',
            letterSpacing: '-0.02em',
            marginBottom: '6px',
          }}>
            Staff Login
          </h1>
          <p style={{ color: '#616161', fontSize: '0.95rem', fontWeight: 500 }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: '#1E1E1E',
          borderRadius: '20px',
          padding: '32px 28px',
          border: '1px solid #272727',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#9E9E9E',
              marginBottom: '6px',
            }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <IoPerson style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#616161',
              }} size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                style={inputStyle}
                required
                autoFocus
                id="login-username"
                onFocus={e => { e.target.style.borderColor = '#E53935'; e.target.style.boxShadow = '0 0 0 3px rgba(229,57,53,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = '#333'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#9E9E9E',
              marginBottom: '6px',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <IoLockClosed style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#616161',
              }} size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{ ...inputStyle, paddingRight: '44px' }}
                required
                id="login-password"
                onFocus={e => { e.target.style.borderColor = '#E53935'; e.target.style.boxShadow = '0 0 0 3px rgba(229,57,53,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = '#333'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#616161',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #E53935, #C62828)',
              color: 'white',
              fontWeight: 800,
              fontSize: '1rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(229,57,53,0.3)',
              fontFamily: 'Inter, sans-serif',
            }}
            id="login-submit"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Sign up link for restaurant owners */}
        <p style={{
          textAlign: 'center',
          color: '#616161',
          fontSize: '0.85rem',
          fontWeight: 500,
          marginTop: '24px',
        }}>
          Want to register a new restaurant?{' '}
          <Link to="/signup" style={{ color: '#FF5252', fontWeight: 700, textDecoration: 'none' }}>
            Sign up here
          </Link>
        </p>

        <p style={{
          textAlign: 'center',
          color: '#444',
          fontSize: '0.75rem',
          fontWeight: 500,
          marginTop: '16px',
        }}>
          DineFlow — Restaurant Management System
        </p>
      </div>
    </div>
  );
}
