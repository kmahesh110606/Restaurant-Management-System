/**
 * CartDrawer — Slide-out cart panel for customer ordering.
 */

import { IoClose, IoAdd, IoRemove, IoTrash, IoCart } from 'react-icons/io5';
import { useCart } from '../contexts/CartContext';

export default function CartDrawer({ isOpen, onClose, onCheckout }) {
  const { items, totalItems, totalAmount, updateQuantity, removeItem, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md h-full bg-[var(--color-bg-card)] flex flex-col animate-slide-right shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-light)]">
          <div className="flex items-center gap-2">
            <IoCart size={22} className="text-[var(--color-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">
              Your Cart ({totalItems})
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <IoClose size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <IoCart size={48} className="text-[var(--color-text-muted)] mb-3" />
              <p className="text-[var(--color-text-secondary)]">Your cart is empty</p>
              <p className="text-sm text-[var(--color-text-muted)]">Add items from the menu</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.menu_item.id}
                className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg)] border border-[var(--color-border-light)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-text-heading)] truncate">
                    {item.menu_item.name}
                  </p>
                  <p className="text-sm text-[var(--color-accent)]">
                    ₹{parseFloat(item.menu_item.price).toFixed(0)} each
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.menu_item.id, item.quantity - 1)}
                    className="btn btn-secondary btn-icon btn-sm"
                  >
                    <IoRemove size={14} />
                  </button>
                  <span className="font-semibold min-w-[20px] text-center text-[var(--color-text-heading)]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.menu_item.id, item.quantity + 1)}
                    className="btn btn-primary btn-icon btn-sm"
                  >
                    <IoAdd size={14} />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.menu_item.id)}
                  className="btn-icon btn-ghost text-[var(--color-danger)]"
                >
                  <IoTrash size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[var(--color-border-light)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">Subtotal</span>
              <span className="text-xl font-bold text-[var(--color-text-heading)]">
                ₹{totalAmount.toFixed(0)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="btn btn-accent btn-lg w-full"
              id="checkout-btn"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={clearCart}
              className="btn btn-ghost w-full text-sm"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
