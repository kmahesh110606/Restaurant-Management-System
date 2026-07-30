/**
 * ThemeContext — Applies dynamic restaurant theming via CSS custom properties.
 */  // Header docstring explaining dynamic CSS custom property theming

import { createContext, useContext, useEffect, useState } from 'react';  // Import React hooks and context creator

const ThemeContext = createContext(null);  // Instantiate ThemeContext with default null value

export function ThemeProvider({ children, restaurantConfig }) {  // Export ThemeProvider component receiving children and restaurantConfig props
  const [theme, setTheme] = useState(restaurantConfig || null);  // State hook for storing active restaurant design tokens

  useEffect(() => {  // Lifecycle effect hook to update internal theme state when restaurantConfig prop updates
    if (restaurantConfig) {  // Check if restaurantConfig object was provided
      setTheme(restaurantConfig);  // Update theme state with new config
    }  // End conditional check
  }, [restaurantConfig]);  // Re-run effect when restaurantConfig reference changes

  // Apply CSS custom properties whenever theme changes
  useEffect(() => {  // Lifecycle effect hook to sync theme values to CSS custom properties on document root
    if (!theme) return;  // Return early if no theme configuration is set

    const root = document.documentElement;  // Get reference to <html> document root element
    if (theme.primary_color) root.style.setProperty('--color-primary', theme.primary_color);  // Update --color-primary CSS variable if set
    if (theme.secondary_color) root.style.setProperty('--color-secondary', theme.secondary_color);  // Update --color-secondary CSS variable if set
    if (theme.accent_color) root.style.setProperty('--color-accent', theme.accent_color);  // Update --color-accent CSS variable if set
    if (theme.font_family) {  // Check if custom font family is specified
      root.style.setProperty('--font-family', `'${theme.font_family}', system-ui, sans-serif`);  // Set --font-family CSS variable
      // Dynamically load the Google Font if it's not Inter
      if (theme.font_family !== 'Inter') {  // Check if font is non-default Google Font
        const link = document.createElement('link');  // Create new HTML <link> element
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.font_family)}:wght@300;400;500;600;700&display=swap`;  // Set font stylesheet URL
        link.rel = 'stylesheet';  // Set link relationship attribute to stylesheet
        document.head.appendChild(link);  // Append font stylesheet to document <head>
      }  // End non-Inter font check
    }  // End font family check

    return () => {  // Cleanup callback executed on unmount or theme change
      // Cleanup: reset to defaults (optional)
    };  // End cleanup callback
  }, [theme]);  // Re-run effect whenever theme object updates

  return (  // Return context provider wrapping children
    <ThemeContext.Provider value={{ theme, setTheme }}>  {/* Mount ThemeContext provider with state and setter */}
      {children}  {/* Render child components */}
    </ThemeContext.Provider>  {/* Close ThemeContext provider */}
  );  // End return statement
}  // End ThemeProvider component

export function useTheme() {  // Export custom hook to consume ThemeContext
  const context = useContext(ThemeContext);  // Retrieve current ThemeContext value
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');  // Guard against usage outside ThemeProvider
  return context;  // Return context value object
}  // End useTheme function

