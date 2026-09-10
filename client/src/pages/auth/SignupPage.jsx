/**
 * SignupPage — iOS 28 Liquid Glass Multi-Step Onboarding Wizard.
 * Features pure RMS (Restaurant Management System) branding,
 * responsive non-clipping stepper, safe icon input fields,
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
  { label: 'Venue', icon: FoodRegular },
  { label: 'Workflow', icon: SparkleRegular },
  { label: 'Branding', icon: ColorRegular },
  { label: 'Review', icon: CheckmarkCircleRegular },
];

const WORKFLOW_OPTIONS = [
  {
    value: 'table',
    title: 'Table-Based (Dine-In)',
    description: 'Guests scan QR codes at tables, customize dishes, and order directly. Waitstaff serve courses.',
    icon: TableSimpleRegular,
    badge: 'Recommended for Dine-In',
  },
  {
    value: 'token',
    title: 'Token-Based (Fast Casual / QSR)',
    description: 'Guests order at counter, receive sequential tokens, and pick up when order status is ready.',
    icon: TicketHorizontalRegular,
    badge: 'Ideal for Food Courts',
  },
  {
    value: 'shop',
    title: 'Counter POS / Bakery',
    description: 'Cashier creates orders directly and prints invoices on fast payment checkout.',
    icon: BuildingShopRegular,
    badge: 'Great for Retail & Delis',
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
      toast.success(`Welcome, ${data.user.first_name || data.user.username}!`);
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
        toast.error('Please specify a URL slug for your restaurant');
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
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      await signupRestaurant({
        user: {
          username: form.username.trim(),
          password: form.password,
          email: form.email.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone_number: form.phone_number.trim(),
        },
        restaurant: {
          name: form.restaurant_name.trim(),
          slug: form.restaurant_slug.trim(),
          description: form.restaurant_description.trim(),
          address: form.restaurant_address.trim(),
          phone: form.restaurant_phone.trim(),
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
    <div className="min-h-screen bg-gradient-warm bg-mesh-canvas flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Brand Header */}
      <div className="mb-6 text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' }}
          >
            <FoodRegular fontSize={20} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tight text-slate-900">
              RMS
            </span>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Setup Wizard
            </span>
          </div>
        </Link>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Create and launch your modern restaurant operating suite
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-2xl glass-card p-6 sm:p-10 relative z-10 shadow-2xl">
        {/* Step Progress Bar & Pills */}
        <div className="mb-8 px-2">
          <div className="flex items-center justify-between relative">
            {/* Background Line */}
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200/80 rounded-full z-0" />
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full z-0 transition-all duration-300"
              style={{ width: `calc(${(step / (STEPS.length - 1)) * 100}% - 2rem)` }}
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
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                      isCompleted
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-500/30 ring-4 ring-orange-500/10'
                        : isCurrent
                        ? 'bg-white text-orange-600 border-2 border-orange-500 shadow-lg ring-4 ring-orange-500/15'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? <CheckmarkRegular fontSize={14} /> : <StepIcon fontSize={16} />}
                  </button>
                  <span
                    className={`text-[11px] font-bold mt-2 hidden sm:inline transition-colors ${
                      isCurrent ? 'text-slate-900 font-extrabold' : 'text-slate-400'
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Admin Account</h2>
                <p className="text-xs text-slate-500 mt-0.5">Primary administrator credentials for restaurant operations</p>
              </div>
              <GoogleAuthButton onSuccess={handleGoogleSuccess} text="Quick Signup" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name *</label>
                <div className="relative">
                  <PersonRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fontSize={16} />
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={(e) => updateForm('first_name', e.target.value)}
                    placeholder="Jane"
                    className="input input-with-icon-left"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Last Name *</label>
                <div className="relative">
                  <PersonRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fontSize={16} />
                  <input
                    type="text"
                    required
                    value={form.last_name}
                    onChange={(e) => updateForm('last_name', e.target.value)}
                    placeholder="Doe"
                    className="input input-with-icon-left"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Email Address *</label>
                <div className="relative">
                  <MailRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fontSize={16} />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="jane@restaurant.com"
                    className="input input-with-icon-left"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <div className="relative">
                  <CallRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fontSize={16} />
                  <input
                    type="tel"
                    value={form.phone_number}
                    onChange={(e) => updateForm('phone_number', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="input input-with-icon-left"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Admin Username *</label>
                <div className="relative">
                  <PersonRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fontSize={16} />
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => updateForm('username', e.target.value)}
                    placeholder="janedoe"
                    className="input input-with-icon-left"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Password *</label>
                <div className="relative">
                  <LockClosedRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fontSize={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    placeholder="At least 6 characters"
                    className="input input-with-icon-left input-with-icon-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Restaurant Profile</h2>
              <p className="text-xs text-slate-500 mt-0.5">Details about your venue and public customer QR portal URL</p>
            </div>

            <div>
              <label className="form-label">Restaurant Name *</label>
              <div className="relative">
                <FoodRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fontSize={16} />
                <input
                  type="text"
                  required
                  value={form.restaurant_name}
                  onChange={(e) => updateForm('restaurant_name', e.target.value)}
                  placeholder="e.g. Grand Bistro & Bar"
                  className="input input-with-icon-left"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Restaurant Slug (Public Menu URL) *</label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20">
                <span className="px-3.5 py-2.5 text-xs font-semibold text-slate-500 bg-slate-100 flex items-center select-none border-r border-slate-200">
                  rms-hub.com/
                </span>
                <input
                  type="text"
                  required
                  value={form.restaurant_slug}
                  onChange={(e) => updateForm('restaurant_slug', e.target.value)}
                  placeholder="grand-bistro-bar"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">This unique slug will appear on your table QR codes and digital menus.</p>
            </div>

            <div>
              <label className="form-label">Short Tagline / Bio</label>
              <textarea
                value={form.restaurant_description}
                onChange={(e) => updateForm('restaurant_description', e.target.value)}
                placeholder="Artisanal dining with authentic regional flavors and fresh daily specials."
                rows={2}
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Physical Address</label>
                <div className="relative">
                  <LocationRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fontSize={16} />
                  <input
                    type="text"
                    value={form.restaurant_address}
                    onChange={(e) => updateForm('restaurant_address', e.target.value)}
                    placeholder="123 Culinary Boulevard"
                    className="input input-with-icon-left"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Contact Phone</label>
                <div className="relative">
                  <CallRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fontSize={16} />
                  <input
                    type="tel"
                    value={form.restaurant_phone}
                    onChange={(e) => updateForm('restaurant_phone', e.target.value)}
                    placeholder="+91 80 1234 5678"
                    className="input input-with-icon-left"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 3: OPERATING WORKFLOW ═══════════ */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Operating Workflow</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select how customers place orders and how kitchen tickets are fulfilled
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
                        ? 'border-orange-500 bg-orange-50/70 shadow-md shadow-orange-500/10 ring-2 ring-orange-500/20'
                        : 'border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon fontSize={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">{opt.title}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-orange-600 text-white'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">{opt.description}</p>
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
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Theme & Typography</h2>
              <p className="text-xs text-slate-500 mt-0.5">Customize your customer QR menu color identity and typeface</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Primary Color</label>
                <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white">
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={(e) => updateForm('primary_color', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.primary_color}
                    onChange={(e) => updateForm('primary_color', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Secondary Color</label>
                <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white">
                  <input
                    type="color"
                    value={form.secondary_color}
                    onChange={(e) => updateForm('secondary_color', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.secondary_color}
                    onChange={(e) => updateForm('secondary_color', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Accent Color</label>
                <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white">
                  <input
                    type="color"
                    value={form.accent_color}
                    onChange={(e) => updateForm('accent_color', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.accent_color}
                    onChange={(e) => updateForm('accent_color', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase text-slate-800 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Display Typeface</label>
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
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-2.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Customer Preview</p>
              <div
                className="p-4 rounded-xl text-white shadow-sm flex items-center justify-between"
                style={{ background: form.primary_color, fontFamily: form.font_family }}
              >
                <div>
                  <h4 className="font-bold text-sm">{form.restaurant_name || 'Your Restaurant'}</h4>
                  <p className="text-xs opacity-90">Digital QR Menu Experience</p>
                </div>
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 bg-white shadow-xs">
                  Order Now
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 5: REVIEW & LAUNCH ═══════════ */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Review & Launch</h2>
              <p className="text-xs text-slate-500 mt-0.5">Confirm your configuration to initialize your workspace</p>
            </div>

            <div className="glass-panel p-5 space-y-4 border border-slate-200/80">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <span className="text-xs font-semibold text-slate-500">Administrator:</span>
                <span className="text-xs font-bold text-slate-900">
                  {form.first_name} {form.last_name} ({form.username})
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <span className="text-xs font-semibold text-slate-500">Restaurant:</span>
                <span className="text-xs font-bold text-slate-900">{form.restaurant_name}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <span className="text-xs font-semibold text-slate-500">Menu Slug:</span>
                <span className="text-xs font-mono font-bold text-orange-600">
                  /{form.restaurant_slug}/menu
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <span className="text-xs font-semibold text-slate-500">Operating Workflow:</span>
                <span className="badge badge-confirmed font-bold capitalize">{form.workflow_type} based</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Primary Color:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-slate-300" style={{ background: form.primary_color }} />
                  <span className="text-xs font-mono font-bold text-slate-700">{form.primary_color}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-orange-50/70 border border-orange-200/60 rounded-2xl text-xs text-orange-800 font-medium">
              💡 Your workspace will immediately be configured with your menu repository, live kitchen display, cashier billing terminal, and desk QR codes.
            </div>
          </div>
        )}

        {/* ═══════════ NAVIGATION BUTTONS ═══════════ */}
        <div className="mt-8 pt-5 border-t border-slate-200/80 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="btn btn-secondary px-4 py-2.5 text-xs font-bold gap-1.5"
            >
              <ArrowLeftRegular fontSize={14} />
              Back
            </button>
          ) : (
            <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-900">
              Already registered? Sign in
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary px-5 py-2.5 text-xs font-bold gap-1.5 ml-auto shadow-md shadow-orange-500/20"
            >
              <span>Next Step</span>
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
                'Initializing Suite...'
              ) : (
                <>
                  <span>Launch Workspace</span>
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
