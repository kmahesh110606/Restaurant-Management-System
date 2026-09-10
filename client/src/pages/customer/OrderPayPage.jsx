/**
 * CheckoutPage — Order review + customer info + place order.
 * Supports table-based and token-based workflows.
 */

import { useState } from 'react';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import {
  ReceiptRegular,
  PersonRegular,
  PhoneRegular,
  NoteRegular,
  ArrowLeftRegular,
  CheckmarkCircleRegular,
} from '@fluentui/react-icons';
import { useCart } from '../../contexts/CartContext';
import { createOrder } from '../../api/orders';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { restaurantConfig, slug } = useOutletContext() || {};
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, totalAmount, clearCart } = useCart();

  const tableNumber = searchParams.get('table');
  const currency = restaurantConfig?.currency || '₹';
  const taxRate = parseFloat(restaurantConfig?.tax_rate || 0);

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = totalAmount;
  const taxAmount = subtotal * (taxRate / 100);
  const finalAmount = subtotal + taxAmount;

  const handlePlaceOrder = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        restaurant_slug: slug,
        phone_number: phoneNumber.trim(),
        customer_name: customerName.trim(),
        notes: notes.trim(),
        items: items.map((item) => ({
          menu_item: item.id,
          quantity: item.quantity,
          notes: item.notes || '',
        })),
      };

      if (tableNumber) {
        payload.table_number = parseInt(tableNumber);
      }

      const { data } = await createOrder(payload);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/${slug}/order/${data.id}`);
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to place order. Please try again.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-fade-in">
        <ReceiptRegular fontSize={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mb-4">Add some items from the menu to get started.</p>
        <button
          onClick={() => navigate(`/${slug}/menu`)}
          className="btn btn-primary"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors"
      >
        <ArrowLeftRegular fontSize={16} />
        Back to menu
      </button>

      <h1 className="text-xl font-extrabold text-gray-900">Checkout</h1>

      {/* Order Summary */}
      <div className="glass-card p-5 space-y-3">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <ReceiptRegular fontSize={16} className="text-[var(--color-primary)]" />
          Order Summary
        </h2>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">{item.quantity}x</span>
                <span className="font-medium text-gray-700">{item.name}</span>
              </div>
              <span className="font-bold text-gray-900">
                {currency}{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-semibold">{currency}{subtotal.toFixed(2)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax ({taxRate}%)</span>
              <span className="font-semibold">{currency}{taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base pt-1">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-extrabold text-gray-900">{currency}{finalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Table info */}
      {tableNumber && (
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-50)] flex items-center justify-center">
            <span className="text-sm font-bold text-[var(--color-primary)]">T{tableNumber}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Table {tableNumber}</p>
            <p className="text-xs text-gray-500">Your order will be delivered to this table</p>
          </div>
        </div>
      )}

      {/* Customer Info */}
      <div className="glass-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <PersonRegular fontSize={16} className="text-[var(--color-primary)]" />
          Your Details
        </h2>

        <div className="form-group">
          <label className="form-label">Name (optional)</label>
          <div className="relative">
            <PersonRegular className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fontSize={16} />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              className="input pl-10"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <div className="relative">
            <PhoneRegular className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fontSize={16} />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="input pl-10"
              required
            />
          </div>
        </div>

        <div className="form-group mb-0">
          <label className="form-label">Special Instructions (optional)</label>
          <div className="relative">
            <NoteRegular className="absolute left-3 top-3 text-gray-400" fontSize={16} />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any allergies or special requests..."
              className="input pl-10"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Place Order */}
      <button
        onClick={handlePlaceOrder}
        disabled={submitting}
        className="btn btn-primary w-full btn-xl justify-center"
      >
        {submitting ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <CheckmarkCircleRegular fontSize={20} />
            Place Order — {currency}{finalAmount.toFixed(2)}
          </>
        )}
      </button>
    </div>
  );
}
