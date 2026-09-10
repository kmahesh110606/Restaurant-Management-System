/**
 * CartContext — Shopping cart state for customer ordering.
 * Scoped per restaurant slug. Persisted to localStorage.
 * No pre-filled demo items — starts empty.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

function getStorageKey(slug) {
  return `rms_cart_${slug || 'default'}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurantSlug, setRestaurantSlug] = useState(null);

  // Load cart from localStorage when slug changes
  useEffect(() => {
    if (restaurantSlug) {
      try {
        const saved = localStorage.getItem(getStorageKey(restaurantSlug));
        if (saved) {
          setItems(JSON.parse(saved));
        } else {
          setItems([]);
        }
      } catch {
        setItems([]);
      }
    }
  }, [restaurantSlug]);

  // Persist cart whenever items change
  useEffect(() => {
    if (restaurantSlug) {
      try {
        localStorage.setItem(getStorageKey(restaurantSlug), JSON.stringify(items));
      } catch {
        // Ignore storage errors
      }
    }
  }, [items, restaurantSlug]);

  const addItem = useCallback((menuItem, quantity = 1, notes = '') => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === menuItem.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          id: menuItem.id,
          name: menuItem.name,
          price: parseFloat(menuItem.price),
          image: menuItem.image,
          quantity,
          notes,
          is_vegetarian: menuItem.is_vegetarian,
          is_vegan: menuItem.is_vegan,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const updateItemNotes = useCallback((itemId, notes) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, notes } : i))
    );
  }, []);

  const removeItem = useCallback((itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (restaurantSlug) {
      localStorage.removeItem(getStorageKey(restaurantSlug));
    }
  }, [restaurantSlug]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        updateItemNotes,
        removeItem,
        clearCart,
        totalItems,
        totalAmount,
        restaurantSlug,
        setRestaurantSlug,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
