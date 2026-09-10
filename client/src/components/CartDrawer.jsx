/**
 * CartDrawer — Slide-in cart panel from the right.
 * Glassmorphic panel with item list, quantity controls, subtotal, and checkout CTA.
 */

import {
  DismissRegular,
  AddRegular,
  SubtractRegular,
  DeleteRegular,
  CartRegular,
} from '@fluentui/react-icons';
import { useCart } from '../contexts/CartContext';

export default function CartDrawer({ isOpen, onClose, onCheckout, currency = '₹' }) {
  const { items, updateQuantity, removeItem, totalItems, totalAmount } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 glass-overlay animate-overlay" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md glass-modal rounded-l-3xl rounded-r-none flex flex-col animate-drawer">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100/60">
          <div className="flex items-center gap-2.5">
            <CartRegular fontSize={20} className="text-[var(--color-primary)]" />
            <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
            <span className="badge badge-role text-[10px]">{totalItems} items</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 transition-colors"
          >
            <DismissRegular fontSize={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <CartRegular fontSize={40} className="text-gray-300 mb-3" />
              <p className="text-sm font-bold text-gray-900">Your cart is empty</p>
              <p className="text-xs text-gray-500 mt-1">Browse the menu to add items</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="solid-card p-3.5 flex gap-3">
                {/* Image */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    >
                      <DeleteRegular fontSize={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-gray-900">
                      {currency}{(item.price * item.quantity).toFixed(2)}
                    </span>

                    <div className="flex items-center gap-0">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-l-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <SubtractRegular fontSize={12} />
                      </button>
                      <span className="w-7 h-7 flex items-center justify-center text-xs font-bold bg-gray-50 text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-r-lg bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-[var(--color-primary-dark)] transition-colors"
                      >
                        <AddRegular fontSize={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Subtotal + Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">Subtotal</span>
              <span className="text-lg font-extrabold text-gray-900">
                {currency}{totalAmount.toFixed(2)}
              </span>
            </div>

            <button
              onClick={onCheckout}
              className="btn btn-primary w-full btn-lg justify-center"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
