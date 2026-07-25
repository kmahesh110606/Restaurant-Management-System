/**
 * CartPage — Order summary, phone number input, checkout.
 * URL: /:slug/cart?table=N
 */

import { useState } from 'react';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5';
import { useCart } from '../../contexts/CartContext';
import { createOrder } from '../../api/orders';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { restaurant } = useOutletContext();
  const { items, totalAmount, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tableNumber = searchParams.get('table');

  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number.');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        restaurant_slug: restaurant.slug,
        phone_number: phone,
        customer_name: customerName,
        notes,
        items: items.map((i) => ({
          menu_item: i.menu_item.id,
          quantity: i.quantity,
          notes: i.notes || '',
        })),
      };
      if (tableNumber) payload.table_number = parseInt(tableNumber);

      const { data } = await createOrder(payload);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/${restaurant.slug}/order/${data.id}?table=${tableNumber || ''}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost mb-4"
      >
        <IoArrowBack size={18} /> Back to Menu
      </button>

      <h1 className="text-2xl font-bold text-[var(--color-text-heading)] mb-6">
        Order Summary
      </h1>

      {/* Items list */}
      <div className="card p-4 mb-6">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
          Items ({items.length})
        </h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.menu_item.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border-light)] last:border-0">
              <div className="flex-1">
                <p className="font-medium text-[var(--color-text-heading)]">{item.menu_item.name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  ₹{parseFloat(item.menu_item.price).toFixed(0)} × {item.quantity}
                </p>
              </div>
              <span className="font-semibold text-[var(--color-text-heading)]">
                ₹{(item.menu_item.price * item.quantity).toFixed(0)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-border)]">
          <span className="font-semibold text-[var(--color-text-heading)]">Total</span>
          <span className="text-2xl font-bold text-[var(--color-accent)]">
            ₹{totalAmount.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Table/Token info */}
      {tableNumber && (
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-text-secondary)]">📍 Table</span>
            <span className="text-lg font-bold text-[var(--color-text-heading)]">{tableNumber}</span>
          </div>
        </div>
      )}

      {/* Customer info form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card p-4 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
            Your Details
          </h2>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="input"
              required
              id="phone-input"
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Required for order tracking and table mapping
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Name (optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              className="input"
              id="name-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Special Instructions (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any allergies or special requests?"
              className="input"
              rows={3}
              id="notes-input"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || items.length === 0}
          className="btn btn-accent btn-lg w-full"
          id="place-order-btn"
        >
          {submitting ? (
            <span className="animate-pulse-soft">Placing Order...</span>
          ) : (
            <>
              <IoCheckmarkCircle size={20} /> Place Order — ₹{totalAmount.toFixed(0)}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
