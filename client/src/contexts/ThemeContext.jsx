/**
 * ThemeContext — Applies dynamic restaurant theming via CSS custom properties.
 * Fetches restaurant public config from API and applies branding (colors, fonts).
 * Falls back to sensible defaults if restaurant has no custom branding.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/client';

const DEFAULT_THEME = {
  primary_color: '#EA580C',
  secondary_color: '#10B981',
  accent_color: '#EA580C',
  font_family: 'Plus Jakarta Sans',
  name: 'Restaurant',
  currency: '₹',
};

const ThemeContext = createContext(null);

/**
 * Lighten a hex color by a percentage (0-1).
 */
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round((255 - (num >> 16)) * percent));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round((255 - ((num >> 8) & 0x00FF)) * percent));
  const b = Math.min(255, (num & 0x0000FF) + Math.round((255 - (num & 0x0000FF)) * percent));
  return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.round((num >> 16) * (1 - percent)));
  const g = Math.max(0, Math.round(((num >> 8) & 0x00FF) * (1 - percent)));
  const b = Math.max(0, Math.round((num & 0x0000FF) * (1 - percent)));
  return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [restaurantConfig, setRestaurantConfig] = useState(null);
  const [themeLoading, setThemeLoading] = useState(false);

  /**
   * Fetch restaurant public config by slug and apply theming.
   */
  const loadRestaurantTheme = useCallback(async (slug) => {
    if (!slug) return;
    setThemeLoading(true);
    try {
      const { data } = await api.get(`/restaurants/${slug}/public/`);
      setRestaurantConfig(data);
      setTheme((prev) => ({
        ...prev,
        ...data,
        primary_color: data.primary_color || DEFAULT_THEME.primary_color,
        secondary_color: data.secondary_color || DEFAULT_THEME.secondary_color,
        accent_color: data.accent_color || DEFAULT_THEME.accent_color,
        font_family: data.font_family || DEFAULT_THEME.font_family,
        currency: data.currency || DEFAULT_THEME.currency,
      }));
    } catch {
      // Keep defaults if restaurant not found
    } finally {
      setThemeLoading(false);
    }
  }, []);

  /**
   * Apply CSS custom properties whenever theme changes.
   */
  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;
    const primary = theme.primary_color || DEFAULT_THEME.primary_color;
    const secondary = theme.secondary_color || DEFAULT_THEME.secondary_color;
    const accent = theme.accent_color || primary;
    const fontFamily = theme.font_family || DEFAULT_THEME.font_family;

    // Derive light/dark shades from primary
    const primaryLight = lightenColor(primary, 0.2);
    const primaryDark = darkenColor(primary, 0.15);
    const primary50 = lightenColor(primary, 0.92);
    const primary100 = lightenColor(primary, 0.85);

    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-light', primaryLight);
    root.style.setProperty('--color-primary-dark', primaryDark);
    root.style.setProperty('--color-primary-50', primary50);
    root.style.setProperty('--color-primary-100', primary100);
    root.style.setProperty('--color-secondary', secondary);
    root.style.setProperty('--color-secondary-light', lightenColor(secondary, 0.2));
    root.style.setProperty('--color-secondary-dark', darkenColor(secondary, 0.15));
    root.style.setProperty('--color-accent', accent);
    root.style.setProperty('--color-accent-light', lightenColor(accent, 0.2));
    root.style.setProperty('--color-accent-dark', darkenColor(accent, 0.15));

    // Shadow glows based on primary
    root.style.setProperty('--shadow-glow', `0 0 20px -4px ${primary}50`);
    root.style.setProperty('--shadow-glow-sm', `0 0 12px -2px ${primary}33`);

    // Font family
    root.style.setProperty('--font-family', `'${fontFamily}', system-ui, -apple-system, sans-serif`);

    // Load Google Font if non-default
    if (fontFamily && fontFamily !== 'Plus Jakarta Sans') {
      const existingLink = document.querySelector(`link[data-font="${fontFamily}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;500;600;700;800&display=swap`;
        link.rel = 'stylesheet';
        link.setAttribute('data-font', fontFamily);
        document.head.appendChild(link);
      }
    }
  }, [theme]);

  const updateTheme = useCallback((patch) => {
    setTheme((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
    setRestaurantConfig(null);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        updateTheme,
        resetTheme,
        restaurantConfig,
        setRestaurantConfig,
        loadRestaurantTheme,
        themeLoading,
        defaultTheme: DEFAULT_THEME,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
