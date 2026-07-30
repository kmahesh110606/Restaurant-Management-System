/**
 * ConfigPage — Rebuilt restaurant configuration with Microsoft Fluent UI icons and enhanced form layout & spacing.
 */

import { useEffect, useState } from 'react';
import {
  Settings24Filled,
  Save24Regular,
  Color24Regular,
  CheckmarkCircle24Regular,
  CloudArrowUp24Regular,
} from '@fluentui/react-icons';
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
      toast.success('Configuration saved successfully!');
    } catch (err) {
      toast.error('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const logoUrl = config.logo ? (config.logo.startsWith('http') ? config.logo : `${API_BASE}${config.logo}`) : null;

  return (
    <div className="animate-fade-in w-full pb-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E53935]/10 border border-[#E53935]/20 flex items-center justify-center text-[#FF5252]">
            <Settings24Filled className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">Restaurant Settings</h1>
            <p className="text-xs text-[#9E9E9E] mt-0.5 font-medium">Configure profile, workflow modes, dynamic brand themes, and media</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary px-6 py-2.5 rounded-xl font-extrabold shadow-lg shadow-[#E53935]/25 flex items-center gap-2 active:scale-95"
          id="save-config-btn"
        >
          <Save24Regular className="text-lg" />
          <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Info Column */}
        <div className="card p-7 bg-[#1A1A1D] border-[#26262A] shadow-2xl space-y-6 rounded-2xl">
          <h2 className="text-base font-extrabold text-[#FAFAFA] flex items-center gap-2.5 pb-4 border-b border-[#26262A]">
            <span className="w-3 h-3 rounded-full bg-[#E53935]" /> General Business Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-[#71717A] uppercase tracking-wider mb-2">
                Restaurant Name *
              </label>
              <input
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="input text-sm font-semibold py-2.5"
                placeholder="Restaurant Name"
                id="config-name"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#71717A] uppercase tracking-wider mb-2">
                Description / Tagline
              </label>
              <textarea
                value={config.description || ''}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                className="input text-sm font-medium"
                rows={3}
                placeholder="A brief tagline or description of your restaurant"
                id="config-desc"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#71717A] uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  value={config.phone || ''}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  className="input text-sm font-semibold py-2.5"
                  placeholder="+91 9876543210"
                  id="config-phone"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#71717A] uppercase tracking-wider mb-2">
                  Currency Code
                </label>
                <input
                  value={config.currency}
                  onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                  className="input text-sm font-semibold uppercase py-2.5"
                  placeholder="INR"
                  id="config-currency"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#71717A] uppercase tracking-wider mb-2">
                Address
              </label>
              <textarea
                value={config.address || ''}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="input text-sm font-medium"
                rows={2}
                placeholder="Street address, city"
                id="config-address"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#71717A] uppercase tracking-wider mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.tax_rate}
                  onChange={(e) => setConfig({ ...config, tax_rate: e.target.value })}
                  className="input text-sm font-semibold py-2.5"
                  id="config-tax"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#71717A] uppercase tracking-wider mb-2">
                  Default Language
                </label>
                <select
                  value={config.default_language}
                  onChange={(e) => setConfig({ ...config, default_language: e.target.value })}
                  className="input text-sm font-semibold py-2.5"
                  id="config-lang"
                >
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

        {/* Workflow & Theme Column */}
        <div className="space-y-6">
          {/* Ordering Workflow Card */}
          <div className="card p-7 bg-[#1A1A1D] border-[#26262A] shadow-2xl space-y-4 rounded-2xl">
            <h2 className="text-base font-extrabold text-[#FAFAFA] flex items-center gap-2.5 pb-4 border-b border-[#26262A]">
              <span className="w-3 h-3 rounded-full bg-[#FFB300]" /> Ordering Workflow Mode
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: 'table', label: 'Table-based', icon: '🪑', desc: 'QR code on each table' },
                { value: 'token', label: 'Token-based', icon: '🎫', desc: 'Counter pickup tokens' },
                { value: 'shop', label: 'Shop / Biller', icon: '🏪', desc: 'Direct cashier billing' },
              ].map((wf) => {
                const isSelected = config.workflow_type === wf.value;
                return (
                  <button
                    key={wf.value}
                    type="button"
                    onClick={() => setConfig({ ...config, workflow_type: wf.value })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#E53935] bg-[#E53935]/10 shadow-lg shadow-[#E53935]/15 ring-1 ring-[#E53935]'
                        : 'border-[#28282C] bg-[#141416] hover:border-[#3E3E45] hover:bg-[#202024]'
                    }`}
                  >
                    <div>
                      <div className="text-2xl mb-2">{wf.icon}</div>
                      <p className="font-extrabold text-sm text-[#FAFAFA]">{wf.label}</p>
                      <p className="text-[11px] text-[#9E9E9E] mt-1 font-medium leading-relaxed">{wf.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-black text-[#FF5252]">
                        <CheckmarkCircle24Regular className="text-base" /> Active
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Settings Card */}
          <div className="card p-7 bg-[#1A1A1D] border-[#26262A] shadow-2xl space-y-5 rounded-2xl">
            <h2 className="text-base font-extrabold text-[#FAFAFA] flex items-center gap-2.5 pb-4 border-b border-[#26262A]">
              <Color24Regular className="text-[#FF5252] text-xl" /> Dynamic Brand Theme Colors
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: 'primary_color', label: 'Primary' },
                { key: 'secondary_color', label: 'Secondary' },
                { key: 'accent_color', label: 'Accent' },
              ].map((c) => (
                <div key={c.key} className="space-y-2">
                  <label className="block text-xs font-extrabold text-[#71717A] uppercase tracking-wider">{c.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config[c.key]}
                      onChange={(e) => setConfig({ ...config, [c.key]: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-[#333] cursor-pointer bg-transparent p-0 flex-shrink-0"
                    />
                    <input
                      value={config[c.key]}
                      onChange={(e) => setConfig({ ...config, [c.key]: e.target.value })}
                      className="input text-xs font-mono font-bold py-2.5 flex-1"
                      maxLength={7}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#71717A] uppercase tracking-wider mb-2">
                Font Family
              </label>
              <select
                value={config.font_family}
                onChange={(e) => setConfig({ ...config, font_family: e.target.value })}
                className="input text-sm font-semibold py-2.5"
              >
                <option value="Inter">Inter (Recommended)</option>
                <option value="Roboto">Roboto</option>
                <option value="Outfit">Outfit</option>
                <option value="Poppins">Poppins</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
              </select>
            </div>
          </div>

          {/* Branding Card */}
          <div className="card p-7 bg-[#1A1A1D] border-[#26262A] shadow-2xl space-y-5 rounded-2xl">
            <h2 className="text-base font-extrabold text-[#FAFAFA] flex items-center gap-2.5 pb-4 border-b border-[#26262A]">
              <CloudArrowUp24Regular className="text-[#FFB300] text-xl" /> Branding Assets
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-extrabold text-[#71717A] uppercase tracking-wider mb-2">
                  Restaurant Logo
                </label>
                {logoUrl && (
                  <img src={logoUrl} alt="Logo" className="w-20 h-20 rounded-xl object-cover mb-3 border border-[#333]" />
                )}
                <label className="btn btn-secondary text-xs font-extrabold cursor-pointer inline-flex items-center gap-2 py-2 px-4 rounded-xl">
                  <CloudArrowUp24Regular className="text-base" />
                  <span>{logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                  <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#71717A] uppercase tracking-wider mb-2">
                  Menu Background
                </label>
                <label className="btn btn-secondary text-xs font-extrabold cursor-pointer inline-flex items-center gap-2 py-2 px-4 rounded-xl">
                  <CloudArrowUp24Regular className="text-base" />
                  <span>Upload Background</span>
                  <input type="file" accept="image/*" onChange={(e) => setBgFile(e.target.files[0])} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
