/**
 * ConfigPage — Restaurant configuration: workflow, theme, logo, language.
 */

import { useEffect, useState } from 'react';
import { IoSave, IoColorPalette } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { updateRestaurant, getRestaurant } from '../../api/config';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      const fields = [
        'name', 'description', 'address', 'phone', 'workflow_type',
        'primary_color', 'secondary_color', 'accent_color', 'font_family',
        'default_language', 'tax_rate', 'currency',
      ];
      fields.forEach((f) => { if (config[f] !== undefined) formData.append(f, config[f]); });
      if (logoFile) formData.append('logo', logoFile);
      if (bgFile) formData.append('menu_background', bgFile);

      const { data } = await updateRestaurant(authRestaurant.slug, formData);
      setConfig(data);
      toast.success('Configuration saved!');
    } catch (err) {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const logoUrl = config.logo ? (config.logo.startsWith('http') ? config.logo : `${API_BASE}${config.logo}`) : null;

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">⚙️ Restaurant Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          <IoSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* General */}
      <div className="card p-5 mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">General</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Restaurant Name</label>
            <input value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Description</label>
            <textarea value={config.description || ''} onChange={(e) => setConfig({ ...config, description: e.target.value })} className="input" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Phone</label>
              <input value={config.phone || ''} onChange={(e) => setConfig({ ...config, phone: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Currency</label>
              <input value={config.currency} onChange={(e) => setConfig({ ...config, currency: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Address</label>
            <textarea value={config.address || ''} onChange={(e) => setConfig({ ...config, address: e.target.value })} className="input" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Tax Rate (%)</label>
              <input type="number" step="0.01" value={config.tax_rate} onChange={(e) => setConfig({ ...config, tax_rate: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Default Language</label>
              <select value={config.default_language} onChange={(e) => setConfig({ ...config, default_language: e.target.value })} className="input">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="kn">Kannada</option>
                <option value="ml">Malayalam</option>
                <option value="mr">Marathi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div className="card p-5 mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Workflow</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'table', label: '🪑 Table-based', desc: 'QR on each table' },
            { value: 'token', label: '🎫 Token-based', desc: 'Counter pickup' },
            { value: 'shop', label: '🏪 Shop / Biller', desc: 'Direct billing' },
          ].map((wf) => (
            <button
              key={wf.value}
              type="button"
              onClick={() => setConfig({ ...config, workflow_type: wf.value })}
              className={`p-4 rounded-[var(--radius-xl)] border-2 text-left transition-all ${
                config.workflow_type === wf.value
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                  : 'border-[var(--color-border-light)] hover:border-[var(--color-border)]'
              }`}
            >
              <p className="font-semibold text-[var(--color-text-heading)]">{wf.label}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{wf.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="card p-5 mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
          <IoColorPalette size={20} /> Theme
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { key: 'primary_color', label: 'Primary' },
            { key: 'secondary_color', label: 'Secondary' },
            { key: 'accent_color', label: 'Accent' },
          ].map((c) => (
            <div key={c.key}>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{c.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config[c.key]}
                  onChange={(e) => setConfig({ ...config, [c.key]: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-[var(--color-border)] cursor-pointer"
                />
                <input
                  value={config[c.key]}
                  onChange={(e) => setConfig({ ...config, [c.key]: e.target.value })}
                  className="input flex-1"
                  maxLength={7}
                />
              </div>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Font Family</label>
          <select value={config.font_family} onChange={(e) => setConfig({ ...config, font_family: e.target.value })} className="input">
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Outfit">Outfit</option>
            <option value="Poppins">Poppins</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
          </select>
        </div>
      </div>

      {/* Branding */}
      <div className="card p-5 mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Branding</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Logo</label>
            {logoUrl && <img src={logoUrl} alt="Logo" className="w-20 h-20 rounded-xl object-cover mb-2" />}
            <label className="btn btn-secondary cursor-pointer">
              {logoUrl ? 'Change Logo' : 'Upload Logo'}
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="hidden" />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Menu Background</label>
            <label className="btn btn-secondary cursor-pointer">
              Upload Background
              <input type="file" accept="image/*" onChange={(e) => setBgFile(e.target.files[0])} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
