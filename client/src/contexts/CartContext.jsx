/**
 * CartContext — Manages the customer's shopping cart state.
 */  // Header docstring explaining CartContext purpose

import { createContext, useContext, useState, useCallback } from 'react';  // Import React hooks and context creator

const CartContext = createContext(null);  // Instantiate CartContext with default null value

export function CartProvider({ children }) {  // Export CartProvider component to wrap app components
  const [items, setItems] = useState([]);  // State hook storing array of cart item objects

  const addItem = useCallback((menuItem, quantity = 1, notes = '') => {  // Define memoized function to add items to cart
    setItems((prev) => {  // Update items state with functional state update callback
      const existing = prev.find((i) => i.menu_item.id === menuItem.id);  // Search for item matching menu_item ID
      if (existing) {  // Check if item already exists in cart
        return prev.map((i) =>  // Map through previous items to update quantity
          i.menu_item.id === menuItem.id  // Match target item ID
            ? { ...i, quantity: i.quantity + quantity }  // Increment quantity for matched item
            : i  // Return unchanged item for others
        );  // End map call
      }  // End existing check
      return [...prev, { menu_item: menuItem, quantity, notes }];  // Append new item object to cart array if not already present
    });  // End setItems callback
  }, []);  // Empty dependency array for addItem callback

  const removeItem = useCallback((menuItemId) => {  // Define memoized function to remove item from cart
    setItems((prev) => prev.filter((i) => i.menu_item.id !== menuItemId));  // Filter out target menu item ID
  }, []);  // Empty dependency array for removeItem callback

  const updateQuantity = useCallback((menuItemId, quantity) => {  // Define memoized function to update item quantity
    if (quantity <= 0) {  // Check if target quantity is zero or negative
      setItems((prev) => prev.filter((i) => i.menu_item.id !== menuItemId));  // Remove item if quantity falls to zero or below
    } else {  // If quantity is positive
      setItems((prev) =>  // Update quantity for matched menu item ID
        prev.map((i) =>  // Map items array
          i.menu_item.id === menuItemId ? { ...i, quantity } : i  // Set new quantity on target item
        )  // End map call
      );  // End setItems callback
    }  // End quantity conditional
  }, []);  // Empty dependency array for updateQuantity callback

  const updateItemNotes = useCallback((menuItemId, notes) => {  // Define memoized function to update special instructions for cart item
    setItems((prev) =>  // Update items state
      prev.map((i) =>  // Map through items array
        i.menu_item.id === menuItemId ? { ...i, notes } : i  // Update notes field for matched item ID
      )  // End map call
    );  // End setItems callback
  }, []);  // Empty dependency array for updateItemNotes callback

  const clearCart = useCallback(() => setItems([]), []);  // Define memoized function to reset cart to empty array

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);  // Calculate total count of all item quantities in cart
  const totalAmount = items.reduce(  // Calculate total price of all items in cart
    (sum, i) => sum + i.menu_item.price * i.quantity,  // Multiply item price by quantity and add to total sum
    0  // Initial accumulator value
  );  // End totalAmount calculation reduce

  return (  // Return context provider wrapping children
    <CartContext.Provider  {/* Mount CartContext provider */}
      value={{  /* Provide value object to context consumers */
        items, totalItems, totalAmount,  // Expose items array, total item count, and total amount sum
        addItem, removeItem, updateQuantity, updateItemNotes, clearCart,  // Expose cart manipulator functions
      }}  /* End context value prop */
    >  {/* Provider tag */}
      {children}  {/* Render child components inside provider */}
    </CartContext.Provider>  {/* Close CartContext provider */}
  );  // End return statement
}  // End CartProvider component

export function useCart() {  // Export custom hook to consume CartContext
  const context = useContext(CartContext);  // Retrieve current CartContext value
  if (!context) throw new Error('useCart must be used within a CartProvider');  // Guard against usage outside CartProvider
  return context;  // Return context value object
}  // End useCart function

