import EmptyState from '../../components/EmptyState';
/**
 * ConfigPage — Full administrative restaurant configuration suite.
 * Profile, workflow model selection, dynamic brand colors/fonts,
 * tax rates, logo uploads, and business operating settings.
 */

import { useEffect, useState } from 'react';
import {
  ArrowUploadRegular,
  CheckmarkCircleRegular,
  SaveRegular,
  ColorRegular,
  FoodRegular,
  SparkleRegular,
  ReceiptRegular,
  DeleteRegular,
  PaintBrushRegular,
} from '@fluentui/react-icons';
import { useAuth } from '../../contexts/AuthContext';
import { updateRestaurant, getRestaurant, removeMenuBackground } from '../../api/config';
import LoadingSpinner from '../../components/LoadingSpinner';
import CustomSelect from '../../components/ui/CustomSelect';
import toast from 'react-hot-toast';


const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://localhost/media/')) {
    return url.replace('http://localhost/media/', '/media/');
  }
  if (url.startsWith('http://localhost:8000/media/')) {
    return url.replace('http://localhost:8000/media/', '/media/');
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return parsed.pathname;
      }
    } catch {
      // ignore
    }
    return url;
  }
  return url.startsWith('/') ? url : `/${url}`;
};

const BRAND_TEMPLATES = [
  {
    id: 'amber-bistro',
    name: 'Warm Amber Bistro',
    tag: 'Warm & Cozy',
    primary: '#EA580C',
    secondary: '#D97706',
    accent: '#F59E0B',
    font: 'Plus Jakarta Sans',
  },
  {
    id: 'emerald-cafe',
    name: 'Emerald Garden Cafe',
    tag: 'Fresh & Organic',
    primary: '#059669',
    secondary: '#10B981',
    accent: '#34D399',
    font: 'Outfit',
  },
  {
    id: 'royal-indigo',
    name: 'Royal Sapphire Lounge',
    tag: 'Upscale Fine Dining',
    primary: '#4F46E5',
    secondary: '#6366F1',
    accent: '#818CF8',
    font: 'Inter',
  },
  {
    id: 'crimson-artisan',
    name: 'Crimson Artisan Pizzeria',
    tag: 'Bold & Vibrant',
    primary: '#DC2626',
    secondary: '#EA580C',
    accent: '#F87171',
    font: 'Plus Jakarta Sans',
  },
  {
    id: 'midnight-grill',
    name: 'Midnight Velvet Steakhouse',
    tag: 'Dark Modern Luxury',
    primary: '#0F172A',
    secondary: '#B45309',
    accent: '#F59E0B',
    font: 'Outfit',
  },
  {
    id: 'rose-patisserie',
    name: 'Rose Gold Patisserie',
    tag: 'Sweet & Chic',
    primary: '#E11D48',
    secondary: '#F43F5E',
    accent: '#FB7185',
    font: 'Plus Jakarta Sans',
  },
];

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
const FONT_OPTIONS = FONTS.map((font) => ({ value: font, label: font }));

export default function ConfigPage() {
  const { restaurant: authRestaurant, setRestaurant } = useAuth();
  const [config, setConfig] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  const [deletingBg, setDeletingBg] = useState(false);

  useEffect(() => {
    if (authRestaurant?.slug) {
      getRestaurant(authRestaurant.slug)
        .then(({ data }) => setConfig(data))
        .catch(() => setLoadError(true))
        .finally(() => setLoading(false));
    }
  }, [authRestaurant]);

  const handleBgFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBgFile(file);
      setBgPreview(URL.createObjectURL(file));
      toast.success('New menu background selected! Click "Save Changes" to apply.');
    }
  };

  const handleRemoveBg = async () => {
    if (bgFile || bgPreview) {
      setBgFile(null);
      setBgPreview(null);
    }
    if (config?.menu_background) {
      setDeletingBg(true);
      try {
        const { data } = await removeMenuBackground(authRestaurant.slug);
        setConfig(data);
      setRestaurant(data);
        toast.success('Custom menu background removed! Default brand mesh restored.');
      } catch {
        toast.error('Failed to remove menu background.');
      } finally {
        setDeletingBg(false);
      }
    } else {
      toast.success('Staged background cleared.');
    }
  };

  const applyBrandTemplate = (tmpl) => {
    setConfig((prev) => ({
      ...prev,
      primary_color: tmpl.primary,
      secondary_color: tmpl.secondary,
      accent_color: tmpl.accent,
      font_family: tmpl.font,
    }));
    toast.success(`Applied "${tmpl.name}" brand identity! Remember to save changes.`);
  };

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
      setRestaurant(data);
      setBgFile(null);
      setBgPreview(null);
      setLogoFile(null);
      toast.success('Restaurant settings saved! Brand & background changes applied.');
    } catch {
      toast.error('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loadError) return <EmptyState title="Could not load settings" actionLabel="Retry" onAction={() => window.location.reload()} />;

  if (loading || !config) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const logoUrl = getMediaUrl(config.logo);
  const activeMenuBgUrl = getMediaUrl(config.menu_background);

  return (
    <div className="animate-fade-in space-y-8 pb-16 max-w-5xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Restaurant Settings</h1>

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

        {/* ═══════════ 3. BRAND THEMING, TEMPLATES & MENU BACKGROUND ═══════════ */}
        <div className="glass-card p-6 rounded-2xl space-y-6 border border-gray-200/80">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200/60">
            <div className="flex items-center gap-2">
              <ColorRegular fontSize={18} className="text-[var(--color-primary)]" />
              <h2 className="text-sm font-extrabold text-gray-900">Brand Templates & Visual Identity</h2>
            </div>
            <span className="text-[11px] font-semibold text-gray-400">
              Adapts customer menu, ambient canvas & UI accents
            </span>
          </div>

          {/* 3A: 1-Click Brand Template Presets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="form-label mb-0">Brand Template Presets</label>
              <span className="text-[11px] text-gray-400">Click any preset to instant-theme</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {BRAND_TEMPLATES.map((tmpl) => {
                const isActive = config.primary_color?.toLowerCase() === tmpl.primary.toLowerCase();
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => applyBrandTemplate(tmpl)}
                    className={`p-3 rounded-2xl text-left border transition-all duration-200 relative group flex flex-col justify-between h-28 ${
                      isActive
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)] shadow-sm ring-1 ring-[var(--color-primary)]'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600">
                          {tmpl.tag}
                        </span>
                        {isActive && (
                          <CheckmarkCircleRegular fontSize={14} className="text-[var(--color-primary)]" />
                        )}
                      </div>
                      <h4 className="text-xs font-black text-gray-900 leading-tight">
                        {tmpl.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ background: tmpl.primary }} title={`Primary: ${tmpl.primary}`} />
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ background: tmpl.secondary }} title={`Secondary: ${tmpl.secondary}`} />
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ background: tmpl.accent }} title={`Accent: ${tmpl.accent}`} />
                      <span className="text-[10px] text-gray-400 ml-auto font-medium truncate">{tmpl.font.split(' ')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3B: Custom Hex Palette */}
          <div>
            <label className="form-label mb-2">Custom Color Palette</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-600 mb-1 block">Primary Brand Color</label>
                <div className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-white shadow-2xs">
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
                <label className="text-[11px] font-bold text-gray-600 mb-1 block">Secondary Brand Color</label>
                <div className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-white shadow-2xs">
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
                <label className="text-[11px] font-bold text-gray-600 mb-1 block">Accent Brand Color</label>
                <div className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-white shadow-2xs">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="form-label">Display Typography</label>
              <CustomSelect
                value={config.font_family || 'Plus Jakarta Sans'}
                onChange={(val) => setConfig({ ...config, font_family: val })}
                options={FONT_OPTIONS}
              />
            </div>

            {/* Logo upload */}
            <div>
              <label className="form-label">Venue Logo</label>
              <div className="flex items-center gap-3">
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
                    className="w-11 h-11 rounded-xl object-contain border border-gray-200 p-1 bg-white shrink-0"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 3C: Customer Menu Background & Wallpaper Management */}
          <div className="pt-5 border-t border-gray-200/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">
                  Customer Menu Background & Wallpaper
                </h3>
                <p className="text-xs text-gray-500">
                  Custom image or brand wallpaper layered behind the customer digital QR menu.
                </p>
              </div>
              <span className={`badge text-xs font-bold py-1 px-3 self-start sm:self-center ${
                bgPreview ? 'badge-pending' : config.menu_background ? 'badge-ready' : 'bg-gray-100 text-gray-700'
              }`}>
                {bgPreview ? 'New Image Staged' : config.menu_background ? 'Custom Image Active' : 'Default Brand Mesh Active'}
              </span>
            </div>

            {/* Interactive Preview Canvas */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-inner flex items-center justify-center p-4">
              {bgPreview || activeMenuBgUrl ? (
                <>
                  <img
                    src={bgPreview || activeMenuBgUrl}
                    alt="Menu Background Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/30 to-slate-900/10 pointer-events-none" />
                  <div className="relative z-10 text-center text-white px-4 max-w-md">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-orange-300 mb-1">
                      Menu background
                    </p>
                    <p className="text-base font-black tracking-tight drop-shadow-sm">
                      {config.name || 'Restaurant'} Digital Menu
                    </p>
                    <p className="text-[11px] text-white/80 mt-1">
                      {bgPreview ? 'Staged image preview. Click "Save Changes" to publish.' : 'Currently active behind all dishes and category tabs.'}
                    </p>
                  </div>
                </>
              ) : (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
                  style={{
                    background: `radial-gradient(circle at 50% 40%, ${config.primary_color || '#EA580C'}22 0%, ${config.secondary_color || '#10B981'}15 50%, #F8FAFC 100%)`,
                  }}
                >
                  <PaintBrushRegular fontSize={30} style={{ color: config.primary_color || '#EA580C' }} className="mb-2" />
                  <p className="text-xs font-bold text-gray-800">
                    Dynamic Brand Gradient Mesh Active
                  </p>
                  <p className="text-[11px] text-gray-500 max-w-sm mt-0.5">
                    Colors {config.primary_color} & {config.secondary_color} generate an organic fluid mesh. Upload an image below for a custom restaurant wallpaper.
                  </p>
                </div>
              )}
            </div>

            {/* Actions: Add / Edit / Delete */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <label className="btn btn-secondary btn-sm text-xs font-bold gap-2 cursor-pointer shadow-xs">
                  <ArrowUploadRegular fontSize={14} />
                  <span>{config.menu_background || bgFile ? 'Edit / Replace Background' : 'Upload Menu Background'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBgFileChange}
                    className="hidden"
                  />
                </label>

                {(config.menu_background || bgFile) && (
                  <button
                    type="button"
                    onClick={handleRemoveBg}
                    disabled={deletingBg}
                    className="btn btn-danger btn-sm text-xs font-bold gap-1.5"
                    title="Remove custom menu background and revert to brand mesh"
                  >
                    <DeleteRegular fontSize={14} />
                    <span>{deletingBg ? 'Removing...' : 'Delete Background'}</span>
                  </button>
                )}
              </div>

              <span className="text-[11px] text-gray-400">
                Recommended: 1920×1080 JPEG/PNG image or high-res texture pattern.
              </span>
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
