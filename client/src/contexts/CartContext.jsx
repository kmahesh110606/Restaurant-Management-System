/**
 * CartContext — Shopping cart state for customer ordering.
 * Scoped per restaurant slug. Persisted to localStorage.
 * No pre-filled demo items — starts empty.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

import { cartReducer, calculateTotals } from './cartState';

const CartContext = createContext(null);

function getStorageKey(slug) {
  return `rms_cart_${slug || 'default'}`;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ slug: null, items: [] });
  const { slug: restaurantSlug, items } = cart;
  const setItems = useCallback((update) => {
    setCart((current) => ({ ...current, items: typeof update === 'function' ? update(current.items) : update }));
  }, []);
  const setRestaurantSlug = useCallback((slug) => {
    setCart((current) => {
      if (current.slug === slug) return current;
      let saved = [];
      try { saved = JSON.parse(localStorage.getItem(getStorageKey(slug)) || '[]'); } catch { /* An invalid saved cart starts empty. */ }
      return { slug, items: Array.isArray(saved) ? saved.filter((item) => item && Number.isInteger(item.quantity) && item.quantity > 0 && Number.isFinite(item.price)) : [] };
    });
  }, []);
  useEffect(() => {
    if (restaurantSlug) {
      try { localStorage.setItem(getStorageKey(restaurantSlug), JSON.stringify(items)); } catch { /* Ordering remains available without persistence. */ }
    }
  }, [items, restaurantSlug]);

  const dispatch = useCallback((action) => {
    setItems((previous) => cartReducer(previous, action));
  }, [setItems]);
  const addItem = useCallback((item, quantity = 1, notes = '') => {
    dispatch({ type: 'ADD_ITEM', payload: { item, quantity, notes } });
  }, [dispatch]);
  const updateQuantity = useCallback((itemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  }, [dispatch]);
  const updateItemNotes = useCallback((itemId, notes) => {
    dispatch({ type: 'UPDATE_NOTES', payload: { itemId, notes } });
  }, [dispatch]);
  const removeItem = useCallback((itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  }, [dispatch]);
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    if (restaurantSlug) {
      try { localStorage.removeItem(getStorageKey(restaurantSlug)); } catch { /* Cart still clears without storage. */ }
    }
  }, [dispatch, restaurantSlug]);
  const { totalItems, totalAmount } = calculateTotals(items);

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
