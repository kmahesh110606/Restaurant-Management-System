/**
 * CartContext — Manages the customer's shopping cart state.
 */

import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((menuItem, quantity = 1, notes = '') => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menu_item.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item.id === menuItem.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { menu_item: menuItem, quantity, notes }];
    });
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setItems((prev) => prev.filter((i) => i.menu_item.id !== menuItemId));
  }, []);

  const updateQuantity = useCallback((menuItemId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.menu_item.id !== menuItemId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.menu_item.id === menuItemId ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const updateItemNotes = useCallback((menuItemId, notes) => {
    setItems((prev) =>
      prev.map((i) =>
        i.menu_item.id === menuItemId ? { ...i, notes } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce(
    (sum, i) => sum + i.menu_item.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items, totalItems, totalAmount,
        addItem, removeItem, updateQuantity, updateItemNotes, clearCart,
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
