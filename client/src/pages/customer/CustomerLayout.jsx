/**
 * CustomerLayout — Layout wrapper for customer-facing pages.
 * Loads restaurant config and applies theming.
 */

import { Outlet, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRestaurantPublic } from '../../api/config';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { CartProvider } from '../../contexts/CartContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function CustomerLayout() {
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getRestaurantPublic(slug)
      .then(({ data }) => setRestaurant(data))
      .catch(() => setError('Restaurant not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)] mb-2">
          Restaurant Not Found
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          The restaurant you're looking for doesn't exist or is currently unavailable.
        </p>
      </div>
    );
  }

  const logoUrl = restaurant.logo
    ? (restaurant.logo.startsWith('http') ? restaurant.logo : `${API_BASE}${restaurant.logo}`)
    : null;

  return (
    <ThemeProvider restaurantConfig={restaurant}>
      <CartProvider>
        <div className="min-h-screen">
          {/* Header */}
          <header className="glass sticky top-0 z-40 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              {logoUrl && (
                <img src={logoUrl} alt={restaurant.name} className="w-10 h-10 rounded-full object-cover" />
              )}
              <div>
                <h1 className="text-lg font-bold text-[var(--color-text-heading)]">
                  {restaurant.name}
                </h1>
                {restaurant.description && (
                  <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[250px]">
                    {restaurant.description}
                  </p>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="max-w-4xl mx-auto px-4 py-4">
            <Outlet context={{ restaurant }} />
          </main>
        </div>
      </CartProvider>
    </ThemeProvider>
  );
}
