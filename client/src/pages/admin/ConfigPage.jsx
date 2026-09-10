/**
 * ConfigPage — Full administrative restaurant configuration suite.
 * Profile, workflow model selection, dynamic brand colors/fonts,
 * tax rates, logo uploads, and business operating settings.
 */

import { useEffect, useState } from 'react';
import {
  SettingsRegular,
  SaveRegular,
  ColorRegular,
  CheckmarkCircleRegular,
  ArrowUploadRegular,
  FoodRegular,
  SparkleRegular,
  ReceiptRegular,
  GlobeRegular,
  CallRegular,
  LocationRegular,
} from '@fluentui/react-icons';
import { useAuth } from '../../contexts/AuthContext';
import { updateRestaurant, getRestaurant } from '../../api/config';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

const WORKFLOW_OPTIONS = [
  {
    value: 'table',
    title: 'Table-Based (Dine-In)',
    description: 'Customers scan QR code at table, browse menu, and order directly. Waiters deliver food.',
  },
  {
    value: 'token',
    title: 'Token-Based (QSR / Food Court)',
    description: 'Customers order at counter, receive a token number, and collect when their ticket is ready.',
  },
  {
    value: 'shop',
    title: 'POS Counter / Retail',
    description: 'Cashier/biller creates orders directly and prints invoices on payment.',
  },
];

const FONTS = ['Plus Jakarta Sans', 'Inter', 'Outfit', 'Roboto'];

export default function ConfigPage() {
  const { restaurant: authRestaurant } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);

  useEffect(() => {
    if (authRestaurant?.slug) {
      getRestaurant(authRestaurant.slug)
        .then(({ data }) => setConfig(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [authRestaurant]);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      const fields = [
        'name', 'description', 'address', 'phone', 'workflow_type',
        'primary_color', 'secondary_color', 'accent_color', 'font_family',
        'default_language', 'tax_rate', 'currency',
      ];
      fields.forEach((f) => {
        if (config[f] !== undefined && config[f] !== null) {
          formData.append(f, config[f]);
        }
      });
      if (logoFile) formData.append('logo', logoFile);
      if (bgFile) formData.append('menu_background', bgFile);

      const { data } = await updateRestaurant(authRestaurant.slug, formData);
      setConfig(data);
      toast.success('Restaurant settings saved! Brand changes applied.');
    } catch {
      toast.error('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const logoUrl = config.logo
    ? config.logo.startsWith('http')
      ? config.logo
      : `${API_BASE}${config.logo}`
    : null;

  return (
    <div className="animate-fade-in space-y-8 pb-16 max-w-5xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20"
            style={{ background: '#2563EB' }}
          >
            <SettingsRegular fontSize={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Restaurant Settings</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Configure brand identity, operating workflow, taxes, and customer ordering
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary px-6 py-2.5 text-xs font-bold gap-2 shadow-md shadow-orange-500/25"
        >
          <SaveRegular fontSize={14} />
          {saving ? 'Saving Settings...' : 'Save Changes'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ═══════════ 1. PROFILE & DETAILS ═══════════ */}
        <div className="glass-card p-6 rounded-2xl space-y-5 border border-gray-200/80">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200/60">
            <FoodRegular fontSize={18} className="text-[var(--color-primary)]" />
            <h2 className="text-sm font-extrabold text-gray-900">Restaurant Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Restaurant Name *</label>
              <input
                required
                value={config.name || ''}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="form-label">Public Menu URL Slug</label>
              <input
                disabled
                value={config.slug || ''}
                className="input bg-gray-100/70 cursor-not-allowed font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Tagline / Description</label>
            <textarea
              rows={2}
              value={config.description || ''}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Physical Address</label>
              <input
                value={config.address || ''}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="form-label">Telephone</label>
              <input
                value={config.phone || ''}
                onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* ═══════════ 2. WORKFLOW MODEL ═══════════ */}
        <div className="glass-card p-6 rounded-2xl space-y-5 border border-gray-200/80">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200/60">
            <SparkleRegular fontSize={18} className="text-[var(--color-primary)]" />
            <h2 className="text-sm font-extrabold text-gray-900">Operating Workflow Model</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {WORKFLOW_OPTIONS.map((opt) => {
              const isSelected = config.workflow_type === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => setConfig({ ...config, workflow_type: opt.value })}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)] shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <h3 className="text-xs font-black text-gray-900 mb-1">{opt.title}</h3>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{opt.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════ 3. BRAND THEMING & ASSETS ═══════════ */}
        <div className="glass-card p-6 rounded-2xl space-y-5 border border-gray-200/80">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200/60">
            <ColorRegular fontSize={18} className="text-[var(--color-primary)]" />
            <h2 className="text-sm font-extrabold text-gray-900">Visual Theming & Branding</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Primary Color</label>
              <div className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-white">
                <input
                  type="color"
                  value={config.primary_color || '#EA580C'}
                  onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                />
                <input
                  type="text"
                  value={config.primary_color || '#EA580C'}
                  onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                  className="w-full text-xs font-mono font-bold uppercase outline-none"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Secondary Color</label>
              <div className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-white">
                <input
                  type="color"
                  value={config.secondary_color || '#10B981'}
                  onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                />
                <input
                  type="text"
                  value={config.secondary_color || '#10B981'}
                  onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                  className="w-full text-xs font-mono font-bold uppercase outline-none"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Accent Color</label>
              <div className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-white">
                <input
                  type="color"
                  value={config.accent_color || '#EA580C'}
                  onChange={(e) => setConfig({ ...config, accent_color: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                />
                <input
                  type="text"
                  value={config.accent_color || '#EA580C'}
                  onChange={(e) => setConfig({ ...config, accent_color: e.target.value })}
                  className="w-full text-xs font-mono font-bold uppercase outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">Display Typography</label>
            <select
              value={config.font_family || 'Plus Jakarta Sans'}
              onChange={(e) => setConfig({ ...config, font_family: e.target.value })}
              className="input sm:w-64"
            >
              {FONTS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Logo upload */}
          <div>
            <label className="form-label">Venue Logo</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="text-xs text-gray-500 file:btn file:btn-secondary file:py-1.5 file:px-3 file:text-xs file:mr-3"
              />
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-12 h-12 rounded-xl object-contain border border-gray-200 p-1 bg-white"
                />
              )}
            </div>
          </div>
        </div>

        {/* ═══════════ 4. BUSINESS & TAX SETTINGS ═══════════ */}
        <div className="glass-card p-6 rounded-2xl space-y-5 border border-gray-200/80">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200/60">
            <ReceiptRegular fontSize={18} className="text-[var(--color-primary)]" />
            <h2 className="text-sm font-extrabold text-gray-900">Taxation & Currency</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Tax Rate (%) *</label>
              <input
                type="number"
                step="0.1"
                value={config.tax_rate || 5}
                onChange={(e) => setConfig({ ...config, tax_rate: parseFloat(e.target.value) || 0 })}
                className="input"
              />
            </div>

            <div>
              <label className="form-label">Currency Symbol</label>
              <input
                value={config.currency || '₹'}
                onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="form-label">Language Code</label>
              <input
                value={config.default_language || 'en'}
                onChange={(e) => setConfig({ ...config, default_language: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary px-8 py-3 text-xs font-bold gap-2 shadow-lg shadow-orange-500/25"
          >
            <SaveRegular fontSize={16} />
            {saving ? 'Saving...' : 'Save Restaurant Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
