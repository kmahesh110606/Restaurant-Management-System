/**
 * SignupPage — Multi-step onboarding wizard for restaurant owners.
 * Features glassmorphism, Fluent UI icons, dynamic slug generation,
 * interactive workflow selection, theme customizer, and review card.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PersonRegular,
  LockClosedRegular,
  MailRegular,
  FoodRegular,
  ColorRegular,
  CheckmarkCircleRegular,
  ArrowRightRegular,
  ArrowLeftRegular,
  CallRegular,
  LocationRegular,
  EyeRegular,
  EyeOffRegular,
  TableSimpleRegular,
  TicketHorizontalRegular,
  BuildingShopRegular,
  SparkleRegular,
  CheckmarkRegular,
} from '@fluentui/react-icons';
import { useAuth } from '../../contexts/AuthContext';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import toast from 'react-hot-toast';

const STEPS = [
  { label: 'Account', icon: PersonRegular },
  { label: 'Restaurant', icon: FoodRegular },
  { label: 'Workflow', icon: SparkleRegular },
  { label: 'Branding', icon: ColorRegular },
  { label: 'Review', icon: CheckmarkCircleRegular },
];

const WORKFLOW_OPTIONS = [
  {
    value: 'table',
    title: 'Table-Based (Dine-In)',
    description: 'Customers scan QR code at table, browse menu, and order directly. Waiter serves order.',
    icon: TableSimpleRegular,
    badge: 'Recommended for Dine-In',
  },
  {
    value: 'token',
    title: 'Token-Based (Fast Casual / QSR)',
    description: 'Customers order at counter, receive a token number, and pick up when order is ready.',
    icon: TicketHorizontalRegular,
    badge: 'Ideal for Food Courts',
  },
  {
    value: 'shop',
    title: 'Counter POS / Shop',
    description: 'Cashier/biller creates orders directly and prints invoices on payment.',
    icon: BuildingShopRegular,
    badge: 'Great for Retail & Bakeries',
  },
];

const FONT_OPTIONS = [
  { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Outfit', value: 'Outfit' },
  { label: 'Roboto', value: 'Roboto' },
];

export default function SignupPage() {
  const { signupRestaurant, loginWithGoogle, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Owner Account
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    phone_number: '',
    // Step 2: Restaurant Details
    restaurant_name: '',
    restaurant_slug: '',
    restaurant_description: '',
    restaurant_address: '',
    restaurant_phone: '',
    // Step 3: Workflow
    workflow_type: 'table',
    // Step 4: Theming
    primary_color: '#EA580C',
    secondary_color: '#10B981',
    accent_color: '#EA580C',
    font_family: 'Plus Jakarta Sans',
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    const paths = { admin: '/dashboard', waiter: '/waiter', kitchen: '/kitchen', biller: '/billing' };
    navigate(paths[role] || '/dashboard', { replace: true });
  }

  const updateForm = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
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
      setLoading(true);
      const data = await loginWithGoogle(credential);
      toast.success(`Welcome back, ${data.user.first_name || data.user.username}!`);
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('Google authentication failed. Please sign up using the form.');
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentStep = () => {
    if (step === 0) {
      if (!form.first_name.trim() || !form.last_name.trim()) {
        toast.error('Please enter your full name');
        return false;
      }
      if (!form.email.trim() || !form.email.includes('@')) {
        toast.error('Please enter a valid email address');
        return false;
      }
      if (!form.username.trim()) {
        toast.error('Please enter a username');
        return false;
      }
      if (!form.password || form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
    } else if (step === 1) {
      if (!form.restaurant_name.trim()) {
        toast.error('Please enter your restaurant name');
        return false;
      }
      if (!form.restaurant_slug.trim()) {
        toast.error('Please provide a valid slug for your restaurant URL');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);
      await signupRestaurant({
        user: {
          username: form.username,
          password: form.password,
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          phone_number: form.phone_number,
        },
        restaurant: {
          name: form.restaurant_name,
          slug: form.restaurant_slug,
          description: form.restaurant_description,
          address: form.restaurant_address,
          phone: form.restaurant_phone || form.phone_number,
          workflow_type: form.workflow_type,
          primary_color: form.primary_color,
          secondary_color: form.secondary_color,
          accent_color: form.accent_color,
          font_family: form.font_family,
        },
      });

      toast.success('Restaurant registered successfully! Welcome to your dashboard.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.user?.username?.[0] ||
        err.response?.data?.restaurant?.slug?.[0] ||
        'Registration failed. Please check your details.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform"
            style={{ background: 'var(--color-primary)' }}
          >
            <FoodRegular fontSize={22} />
          </div>
          <span className="text-2xl font-black tracking-tight text-gray-900">
            Savoré<span className="text-[var(--color-primary)]">RMS</span>
          </span>
        </Link>
        <p className="text-sm font-semibold text-gray-500">Create and launch your restaurant management system</p>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-2xl glass-card p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        {/* Step Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-gray-200/80 rounded-full z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--color-primary)] rounded-full z-0 transition-all duration-300"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />

            {STEPS.map((s, idx) => {
              const StepIcon = s.icon;
              const isCompleted = idx < step;
              const isCurrent = idx === step;

              return (
                <div key={s.label} className="relative z-10 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (idx < step) setStep(idx);
                    }}
                    disabled={idx > step}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                      isCompleted
                        ? 'bg-[var(--color-primary)] text-white shadow-md shadow-orange-500/30'
                        : isCurrent
                        ? 'bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] shadow-md'
                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? <CheckmarkRegular fontSize={14} /> : <StepIcon fontSize={16} />}
                  </button>
                  <span
                    className={`text-[11px] font-bold mt-1.5 hidden sm:inline ${
                      isCurrent ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════ STEP 1: OWNER ACCOUNT ═══════════ */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Owner Account</h2>
              <p className="text-xs text-gray-500 mt-0.5">Enter your administrative credentials to manage the restaurant</p>
            </div>

            {/* Google Sign-in Shortcut */}
            <div className="pb-3 border-b border-gray-100">
              <GoogleAuthButton onSuccess={handleGoogleSuccess} text="signup_with" />
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">or sign up with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <PersonRegular fontSize={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={(e) => updateForm('first_name', e.target.value)}
                    placeholder="Jane"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Last Name *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <PersonRegular fontSize={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={form.last_name}
                    onChange={(e) => updateForm('last_name', e.target.value)}
                    placeholder="Doe"
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Email Address *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <MailRegular fontSize={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="jane@restaurant.com"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <CallRegular fontSize={16} />
                  </span>
                  <input
                    type="tel"
                    value={form.phone_number}
                    onChange={(e) => updateForm('phone_number', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Admin Username *</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => updateForm('username', e.target.value)}
                  placeholder="janedoe"
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">Password *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <LockClosedRegular fontSize={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    placeholder="At least 6 characters"
                    className="input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOffRegular fontSize={16} /> : <EyeRegular fontSize={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 2: RESTAURANT PROFILE ═══════════ */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Restaurant Profile</h2>
              <p className="text-xs text-gray-500 mt-0.5">Details about your venue and customer portal URL</p>
            </div>

            <div>
              <label className="form-label">Restaurant Name *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <FoodRegular fontSize={16} />
                </span>
                <input
                  type="text"
                  required
                  value={form.restaurant_name}
                  onChange={(e) => updateForm('restaurant_name', e.target.value)}
                  placeholder="e.g. Savoré Grand Bistro"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Restaurant Slug (Public Menu URL) *</label>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50 focus-within:border-[var(--color-primary)]">
                <span className="px-3.5 py-2.5 text-xs font-semibold text-gray-400 bg-gray-100 flex items-center select-none border-r border-gray-200">
                  yoursite.com/
                </span>
                <input
                  type="text"
                  required
                  value={form.restaurant_slug}
                  onChange={(e) => updateForm('restaurant_slug', e.target.value)}
                  placeholder="savore-grand-bistro"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-gray-900 bg-white outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">This slug will be in your QR codes and customer menu link.</p>
            </div>

            <div>
              <label className="form-label">Short Description / Tagline</label>
              <textarea
                value={form.restaurant_description}
                onChange={(e) => updateForm('restaurant_description', e.target.value)}
                placeholder="Artisanal dining with authentic regional flavors."
                rows={2}
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Physical Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <LocationRegular fontSize={16} />
                  </span>
                  <input
                    type="text"
                    value={form.restaurant_address}
                    onChange={(e) => updateForm('restaurant_address', e.target.value)}
                    placeholder="123 Culinary Boulevard"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Restaurant Contact Phone</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <CallRegular fontSize={16} />
                  </span>
                  <input
                    type="tel"
                    value={form.restaurant_phone}
                    onChange={(e) => updateForm('restaurant_phone', e.target.value)}
                    placeholder="+91 80 1234 5678"
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 3: WORKFLOW TYPE ═══════════ */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Select Operating Workflow</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Customize how customers order and how kitchen & billing staff interact with tickets
              </p>
            </div>

            <div className="space-y-3.5">
              {WORKFLOW_OPTIONS.map((opt) => {
                const isSelected = form.workflow_type === opt.value;
                const Icon = opt.icon;

                return (
                  <div
                    key={opt.value}
                    onClick={() => updateForm('workflow_type', opt.value)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                      isSelected
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)] shadow-md'
                        : 'border-gray-200/80 bg-white/70 hover:bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[var(--color-primary)] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <Icon fontSize={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-gray-900">{opt.title}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{opt.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════ STEP 4: BRANDING & THEMING ═══════════ */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Brand Colors & Typography</h2>
              <p className="text-xs text-gray-500 mt-0.5">Set the brand theme for your customer-facing digital menu and staff portal</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Primary Color</label>
                <div className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-white">
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={(e) => updateForm('primary_color', e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.primary_color}
                    onChange={(e) => updateForm('primary_color', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Secondary Color</label>
                <div className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-white">
                  <input
                    type="color"
                    value={form.secondary_color}
                    onChange={(e) => updateForm('secondary_color', e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.secondary_color}
                    onChange={(e) => updateForm('secondary_color', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Accent Color</label>
                <div className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-white">
                  <input
                    type="color"
                    value={form.accent_color}
                    onChange={(e) => updateForm('accent_color', e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.accent_color}
                    onChange={(e) => updateForm('accent_color', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase text-gray-800 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Primary Font</label>
              <select
                value={form.font_family}
                onChange={(e) => updateForm('font_family', e.target.value)}
                className="input"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Preview Box */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 space-y-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Live Preview</p>
              <div
                className="p-4 rounded-xl text-white shadow-sm flex items-center justify-between"
                style={{ background: form.primary_color, fontFamily: form.font_family }}
              >
                <div>
                  <h4 className="font-bold text-sm">{form.restaurant_name || 'Your Restaurant'}</h4>
                  <p className="text-xs opacity-90">Customer Ordering Preview</p>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-900 bg-white shadow-sm"
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 5: REVIEW & LAUNCH ═══════════ */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Review Your Configuration</h2>
              <p className="text-xs text-gray-500 mt-0.5">Please confirm your restaurant setup before launching your workspace</p>
            </div>

            <div className="glass-panel p-5 space-y-4 border border-gray-200/80">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
                <span className="text-xs font-semibold text-gray-500">Administrator:</span>
                <span className="text-xs font-bold text-gray-900">
                  {form.first_name} {form.last_name} ({form.username})
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
                <span className="text-xs font-semibold text-gray-500">Restaurant:</span>
                <span className="text-xs font-bold text-gray-900">{form.restaurant_name}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
                <span className="text-xs font-semibold text-gray-500">Customer Menu Link:</span>
                <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                  /{form.restaurant_slug}/menu
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
                <span className="text-xs font-semibold text-gray-500">Workflow Model:</span>
                <span className="badge badge-confirmed font-bold capitalize">{form.workflow_type} based</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Brand Primary:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-gray-300" style={{ background: form.primary_color }} />
                  <span className="text-xs font-mono font-bold text-gray-700">{form.primary_color}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-orange-50/70 border border-orange-200/60 rounded-xl text-xs text-orange-800 font-medium">
              💡 Your workspace will immediately be set up with default menu categories, POS billing terminal, kitchen ticket stream, and customer QR portal.
            </div>
          </div>
        )}

        {/* ═══════════ NAVIGATION BUTTONS ═══════════ */}
        <div className="mt-8 pt-5 border-t border-gray-200/80 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="btn btn-secondary px-4 py-2.5 text-xs font-bold gap-2"
            >
              <ArrowLeftRegular fontSize={14} />
              Back
            </button>
          ) : (
            <Link to="/login" className="text-xs font-bold text-gray-500 hover:text-gray-900">
              Already have an account? Log in
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary px-5 py-2.5 text-xs font-bold gap-2 ml-auto"
            >
              Next Step
              <ArrowRightRegular fontSize={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary px-6 py-2.5 text-xs font-bold gap-2 ml-auto shadow-lg shadow-orange-500/25"
            >
              {loading ? (
                'Setting Up Workspace...'
              ) : (
                <>
                  Launch Restaurant
                  <CheckmarkCircleRegular fontSize={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
