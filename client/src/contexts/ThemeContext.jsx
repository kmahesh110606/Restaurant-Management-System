/**
 * ThemeContext — Applies dynamic restaurant theming via CSS custom properties.
 */

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children, restaurantConfig }) {
  const [theme, setTheme] = useState(restaurantConfig || null);

  useEffect(() => {
    if (restaurantConfig) {
      setTheme(restaurantConfig);
    }
  }, [restaurantConfig]);

  // Apply CSS custom properties whenever theme changes
  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;
    if (theme.primary_color) root.style.setProperty('--color-primary', theme.primary_color);
    if (theme.secondary_color) root.style.setProperty('--color-secondary', theme.secondary_color);
    if (theme.accent_color) root.style.setProperty('--color-accent', theme.accent_color);
    if (theme.font_family) {
      root.style.setProperty('--font-family', `'${theme.font_family}', system-ui, sans-serif`);
      // Dynamically load the Google Font if it's not Inter
      if (theme.font_family !== 'Inter') {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.font_family)}:wght@300;400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }

    return () => {
      // Cleanup: reset to defaults (optional)
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
