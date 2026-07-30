/**
 * SignupPage — Multi-step restaurant owner signup.
 *
 * Steps:
 *   1. Account Details (name, email, username, password) + Google OAuth option
 *   2. Restaurant Details (name, slug, description, address, workflow)
 *   3. Theming (colors, font)
 *   4. Review & Submit
 */

import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  IoPerson, IoLockClosed, IoMail, IoRestaurant,
  IoColorPalette, IoCheckmarkCircle, IoArrowForward,
  IoArrowBack, IoFlame, IoCall, IoLocationSharp,
  IoText, IoEye, IoEyeOff,
} from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import toast from 'react-hot-toast';

const WORKFLOW_OPTIONS = [
  { value: 'table', label: 'Table-based', desc: 'Customers order from their table via QR codes' },
  { value: 'token', label: 'Token-based', desc: 'Customers get a token number at the counter' },
  { value: 'shop', label: 'Shop / Counter', desc: 'Biller takes orders directly at the counter' },
];

const STEPS = [
  { label: 'Account', icon: IoPerson },
  { label: 'Restaurant', icon: IoRestaurant },
  { label: 'Theming', icon: IoColorPalette },
  { label: 'Review', icon: IoCheckmarkCircle },
];

export default function SignupPage() {
  const { signupRestaurant, loginWithGoogle, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleFilled, setGoogleFilled] = useState(false);

  // Form state
  const [form, setForm] = useState({
    // Account
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    phone_number: '',
    // Restaurant
    restaurant_name: '',
    restaurant_slug: '',
    restaurant_description: '',
    restaurant_address: '',
    restaurant_phone: '',
    workflow_type: 'table',
    // Theming
    primary_color: '#E53935',
    secondary_color: '#1a1a1a',
    accent_color: '#FFB300',
    font_family: 'Inter',
    // Google token (optional)
    google_id_token: '',
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    const paths = { admin: '/admin', waiter: '/staff/waiter', kitchen: '/staff/kitchen', biller: '/biller' };
    navigate(paths[role] || '/admin', { replace: true });
  }

  const updateForm = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from restaurant name
      if (field === 'restaurant_name') {
        updated.restaurant_slug = value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      }
      return updated;
    });
  };

  const handleGoogleSuccess = async (credential) => {
    try {
      // Try to login first (existing owner)
      const data = await loginWithGoogle(credential);
      toast.success(`Welcome back, ${data.user.first_name || data.user.username}!`);
      navigate('/admin', { replace: true });
    } catch {
      // If login fails, decode token for signup prefill
      try {
        const payload = JSON.parse(atob(credential.split('.')[1]));
        setForm(prev => ({
          ...prev,
          first_name: payload.given_name || '',
          last_name: payload.family_name || '',
          email: payload.email || '',
          username: (payload.email || '').split('@')[0],
          google_id_token: credential,
        }));
        setGoogleFilled(true);
        toast.success('Google account linked! Complete your restaurant details.');
        setStep(1); // Skip to restaurant details
      } catch {
        toast.error('Could not process Google account.');
      }
    }
  };

  const validateStep = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        if (!form.first_name.trim()) return 'First name is required';
        if (!form.email.trim()) return 'Email is required';
        if (!form.username.trim()) return 'Username is required';
        if (!googleFilled && form.password.length < 8) return 'Password must be at least 8 characters';
        return null;
      case 1:
        if (!form.restaurant_name.trim()) return 'Restaurant name is required';
        if (!form.restaurant_slug.trim()) return 'Restaurant slug is required';
        return null;
      case 2:
        return null; // Theming is optional
      default:
        return null;
    }
  };

  const nextStep = () => {
    const error = validateStep(step);
    if (error) {
      toast.error(error);
      return;
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = await signupRestaurant(form);
      toast.success(`Welcome to DineFlow, ${data.user.first_name || data.user.username}!`);
      navigate('/admin', { replace: true });
    } catch (err) {
      const detail = err.response?.data;
      if (detail && typeof detail === 'object') {
        // Show field-specific errors
        const msgs = Object.entries(detail)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');
        toast.error(msgs || 'Signup failed.');
      } else {
        toast.error(detail?.detail || 'Signup failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px 12px 42px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '10px',
    color: '#E0E0E0',
    fontSize: '0.95rem',
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#9E9E9E',
    marginBottom: '6px',
  };

  const iconStyle = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#616161',
  };

  // Preview colors
  const previewBg = useMemo(() => form.primary_color, [form.primary_color]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#121212',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background effects */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${form.primary_color}10, transparent)`,
        top: '-10%',
        right: '-10%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${form.accent_color}08, transparent)`,
        bottom: '-15%',
        left: '-5%',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '560px', position: 'relative' }}>
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

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #E53935, #FF8F00)',
            marginBottom: '16px',
          }}>
            <IoFlame size={26} color="white" />
          </div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 900,
            color: '#FAFAFA',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}>
            Create Your Restaurant
          </h1>
          <p style={{ color: '#616161', fontSize: '0.95rem', fontWeight: 500 }}>
            Set up your DineFlow account in minutes
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0',
          marginBottom: '36px',
        }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: i === step ? 'rgba(229,57,53,0.12)' : i < step ? 'rgba(76,175,80,0.1)' : 'transparent',
                  cursor: i <= step ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
                onClick={() => { if (i <= step) setStep(i); }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  background: i < step ? '#4CAF50' : i === step ? '#E53935' : '#333',
                  color: 'white',
                }}>
                  {i < step ? <IoCheckmarkCircle size={14} /> : i + 1}
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: i === step ? '#E53935' : i < step ? '#4CAF50' : '#616161',
                }}
                  className="hidden sm:inline"
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: '24px',
                  height: '2px',
                  background: i < step ? '#4CAF50' : '#333',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div style={{
          background: '#1E1E1E',
          borderRadius: '20px',
          padding: '32px 28px',
          border: '1px solid #272727',
        }}>
          {/* Step 0: Account */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FAFAFA', marginBottom: '4px' }}>Owner Account</h2>
                <p style={{ fontSize: '0.85rem', color: '#616161' }}>Your personal account details</p>
              </div>

              {/* Google OAuth */}
              {!googleFilled && (
                <>
                  <GoogleAuthButton
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google sign-in failed')}
                    text="signup_with"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: '#333' }} />
                    <span style={{ fontSize: '0.8rem', color: '#616161', fontWeight: 600 }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: '#333' }} />
                  </div>
                </>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <div style={{ position: 'relative' }}>
                    <IoPerson size={16} style={iconStyle} />
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={e => updateForm('first_name', e.target.value)}
                      placeholder="John"
                      style={inputStyle}
                      id="signup-first-name"
                      onFocus={e => { e.target.style.borderColor = '#E53935'; e.target.style.boxShadow = '0 0 0 3px rgba(229,57,53,0.15)'; }}
                      onBlur={e => { e.target.style.borderColor = '#333'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <div style={{ position: 'relative' }}>
                    <IoPerson size={16} style={iconStyle} />
                    <input
                      type="text"
                      value={form.last_name}
                      onChange={e => updateForm('last_name', e.target.value)}
                      placeholder="Doe"
                      style={inputStyle}
                      id="signup-last-name"
                      onFocus={e => { e.target.style.borderColor = '#E53935'; e.target.style.boxShadow = '0 0 0 3px rgba(229,57,53,0.15)'; }}
                      onBlur={e => { e.target.style.borderColor = '#333'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email *</label>
                <div style={{ position: 'relative' }}>
                  <IoMail size={16} style={iconStyle} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => updateForm('email', e.target.value)}
                    placeholder="john@restaurant.com"
                    style={inputStyle}
                    id="signup-email"
                    onFocus={e => { e.target.style.borderColor = '#E53935'; e.target.style.boxShadow = '0 0 0 3px rgba(229,57,53,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = '#333'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Username *</label>
                <div style={{ position: 'relative' }}>
                  <IoPerson size={16} style={iconStyle} />
                  <input
                    type="text"
                    value={form.username}
                    onChange={e => updateForm('username', e.target.value)}
                    placeholder="johndoe"
                    style={inputStyle}
                    id="signup-username"
                    onFocus={e => { e.target.style.borderColor = '#E53935'; e.target.style.boxShadow = '0 0 0 3px rgba(229,57,53,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = '#333'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {!googleFilled && (
                <div>
                  <label style={labelStyle}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <IoLockClosed size={16} style={iconStyle} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => updateForm('password', e.target.value)}
                      placeholder="Min 8 characters"
                      style={{ ...inputStyle, paddingRight: '42px' }}
                      id="signup-password"
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
              )}

              <div>
                <label style={labelStyle}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <IoCall size={16} style={iconStyle} />
                  <input
                    type="tel"
                    value={form.phone_number}
                    onChange={e => updateForm('phone_number', e.target.value)}
                    placeholder="+91 9876543210"
                    style={inputStyle}
                    id="signup-phone"
                    onFocus={e => { e.target.style.borderColor = '#E53935'; e.target.style.boxShadow = '0 0 0 3px rgba(229,57,53,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = '#333'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Restaurant */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FAFAFA', marginBottom: '4px' }}>Restaurant Details</h2>
                <p style={{ fontSize: '0.85rem', color: '#616161' }}>Tell us about your restaurant</p>
              </div>

              <div>
                <label style={labelStyle}>Restaurant Name *</label>
                <div style={{ position: 'relative' }}>
                  <IoRestaurant size={16} style={iconStyle} />
                  <input
                    type="text"
                    value={form.restaurant_name}
                    onChange={e => updateForm('restaurant_name', e.target.value)}
                    placeholder="Spice Garden"
                    style={inputStyle}
                    id="signup-restaurant-name"
                    autoFocus
                    onFocus={e => { e.target.style.borderColor = '#E53935'; e.target.style.boxShadow = '0 0 0 3px rgba(229,57,53,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = '#333'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>URL Slug *</label>
                <div style={{ position: 'relative' }}>
                  <IoText size={16} style={iconStyle} />
                  <input
                    type="text"
                    value={form.restaurant_slug}
                    onChange={e => updateForm('restaurant_slug', e.target.value)}
                    placeholder="spice-garden"
                    style={inputStyle}
                    id="signup-restaurant-slug"
                    onFocus={e => { e.target.style.borderColor = '#E53935'; e.target.style.boxShadow = '0 0 0 3px rgba(229,57,53,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = '#333'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {form.restaurant_slug && (
                  <p style={{ fontSize: '0.75rem', color: '#616161', marginTop: '4px' }}>
                    Your menu URL: dineflow.app/<span style={{ color: '#FFB300', fontWeight: 700 }}>{form.restaurant_slug}</span>/menu
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={form.restaurant_description}
                  onChange={e => updateForm('restaurant_description', e.target.value)}
                  placeholder="A brief description of your restaurant..."
                  style={{ ...inputStyle, paddingLeft: '14px', minHeight: '80px', resize: 'vertical' }}
                  id="signup-restaurant-desc"
                  onFocus={e => { e.target.style.borderColor = '#E53935'; e.target.style.boxShadow = '0 0 0 3px rgba(229,57,53,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#333'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Address</label>
                  <div style={{ position: 'relative' }}>
                    <IoLocationSharp size={16} style={iconStyle} />
                    <input
                      type="text"
                      value={form.restaurant_address}
                      onChange={e => updateForm('restaurant_address', e.target.value)}
                      placeholder="123 Main St"
                      style={inputStyle}
                      id="signup-restaurant-address"
                      onFocus={e => { e.target.style.borderColor = '#E53935'; e.target.style.boxShadow = '0 0 0 3px rgba(229,57,53,0.15)'; }}
                      onBlur={e => { e.target.style.borderColor = '#333'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Restaurant Phone</label>
                  <div style={{ position: 'relative' }}>
                    <IoCall size={16} style={iconStyle} />
                    <input
                      type="tel"
                      value={form.restaurant_phone}
                      onChange={e => updateForm('restaurant_phone', e.target.value)}
                      placeholder="+91 22 12345678"
                      style={inputStyle}
                      id="signup-restaurant-phone"
                      onFocus={e => { e.target.style.borderColor = '#E53935'; e.target.style.boxShadow = '0 0 0 3px rgba(229,57,53,0.15)'; }}
                      onBlur={e => { e.target.style.borderColor = '#333'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
              </div>

              {/* Workflow Selection */}
              <div>
                <label style={labelStyle}>Ordering Workflow *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {WORKFLOW_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${form.workflow_type === opt.value ? '#E53935' : '#333'}`,
                        background: form.workflow_type === opt.value ? 'rgba(229,57,53,0.08)' : '#1a1a1a',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="radio"
                        name="workflow"
                        value={opt.value}
                        checked={form.workflow_type === opt.value}
                        onChange={e => updateForm('workflow_type', e.target.value)}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: `2px solid ${form.workflow_type === opt.value ? '#E53935' : '#616161'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {form.workflow_type === opt.value && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E53935' }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#E0E0E0', fontSize: '0.9rem' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.78rem', color: '#616161' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Theming */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FAFAFA', marginBottom: '4px' }}>Customize Theme</h2>
                <p style={{ fontSize: '0.85rem', color: '#616161' }}>Choose your brand colors (can be changed later)</p>
              </div>

              {/* Color Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                {[
                  { key: 'primary_color', label: 'Primary', desc: 'Main brand color' },
                  { key: 'secondary_color', label: 'Secondary', desc: 'Background accent' },
                  { key: 'accent_color', label: 'Accent', desc: 'Highlights' },
                ].map(c => (
                  <div key={c.key} style={{ textAlign: 'center' }}>
                    <label style={{ ...labelStyle, textAlign: 'center' }}>{c.label}</label>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <input
                        type="color"
                        value={form[c.key]}
                        onChange={e => updateForm(c.key, e.target.value)}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          border: '2px solid #333',
                          cursor: 'pointer',
                          background: 'transparent',
                          padding: 0,
                        }}
                      />
                      <span style={{ fontSize: '0.7rem', color: '#616161', fontWeight: 600 }}>{form[c.key]}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Font Family */}
              <div>
                <label style={labelStyle}>Font Family</label>
                <select
                  value={form.font_family}
                  onChange={e => updateForm('font_family', e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '14px', appearance: 'auto' }}
                  id="signup-font-family"
                >
                  {['Inter', 'Roboto', 'Outfit', 'Poppins', 'Nunito', 'Lato', 'Open Sans', 'Montserrat'].map(f => (
                    <option key={f} value={f} style={{ background: '#1a1a1a', color: '#E0E0E0' }}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              <div style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #272727',
                background: '#121212',
              }}>
                <p style={{ fontSize: '0.8rem', color: '#616161', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${form.primary_color}, ${form.primary_color}cc)`,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}>
                    Primary Button
                  </div>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${form.accent_color}, ${form.accent_color}cc)`,
                    color: '#1a1a1a',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}>
                    Accent Button
                  </div>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: form.secondary_color,
                    border: '1px solid #333',
                    color: '#E0E0E0',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}>
                    Secondary
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FAFAFA', marginBottom: '4px' }}>Review & Submit</h2>
                <p style={{ fontSize: '0.85rem', color: '#616161' }}>Confirm your details and create your restaurant</p>
              </div>

              {/* Summary */}
              {[
                { title: 'Owner Account', items: [
                  { label: 'Name', value: `${form.first_name} ${form.last_name}`.trim() },
                  { label: 'Email', value: form.email },
                  { label: 'Username', value: form.username },
                  { label: 'Phone', value: form.phone_number || '—' },
                ]},
                { title: 'Restaurant', items: [
                  { label: 'Name', value: form.restaurant_name },
                  { label: 'Slug', value: form.restaurant_slug },
                  { label: 'Workflow', value: WORKFLOW_OPTIONS.find(w => w.value === form.workflow_type)?.label },
                  { label: 'Address', value: form.restaurant_address || '—' },
                ]},
              ].map((section, si) => (
                <div key={si} style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#121212',
                  border: '1px solid #272727',
                }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#E53935', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {section.title}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {section.items.map((item, ii) => (
                      <div key={ii}>
                        <div style={{ fontSize: '0.75rem', color: '#616161', fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontSize: '0.9rem', color: '#E0E0E0', fontWeight: 600 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Theme preview */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                background: '#121212',
                border: '1px solid #272727',
              }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#E53935', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Theme
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {[form.primary_color, form.secondary_color, form.accent_color].map((c, i) => (
                    <div key={i} style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: c,
                      border: '2px solid #333',
                    }} />
                  ))}
                  <span style={{ fontSize: '0.85rem', color: '#9E9E9E', fontWeight: 600, marginLeft: '8px' }}>
                    Font: {form.font_family}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '28px',
            gap: '12px',
          }}>
            {step > 0 ? (
              <button
                onClick={prevStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: '1px solid #333',
                  background: 'transparent',
                  color: '#E0E0E0',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, sans-serif',
                }}
                id="signup-prev-btn"
              >
                <IoArrowBack size={16} /> Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #E53935, #C62828)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 12px rgba(229,57,53,0.3)',
                  fontFamily: 'Inter, sans-serif',
                }}
                id="signup-next-btn"
              >
                Next <IoArrowForward size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #E53935, #C62828)',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 20px rgba(229,57,53,0.35)',
                  fontFamily: 'Inter, sans-serif',
                }}
                id="signup-submit-btn"
              >
                {loading ? 'Creating...' : 'Create Restaurant'} <IoFlame size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Login link */}
        <p style={{ textAlign: 'center', color: '#616161', fontSize: '0.85rem', fontWeight: 500, marginTop: '24px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#FF5252', fontWeight: 700, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
