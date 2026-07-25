/**
 * MenuCard — Displays a menu item in the customer view.
 */

import { IoAdd, IoRemove, IoLeaf, IoFlame } from 'react-icons/io5';
import { useCart } from '../contexts/CartContext';

const SPICE_LABELS = ['', 'Mild', 'Medium', 'Hot', 'Extra Hot'];
const API_BASE = import.meta.env.VITE_API_URL || '';

export default function MenuCard({ item }) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.menu_item.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const imageUrl = item.image
    ? (item.image.startsWith('http') ? item.image : `${API_BASE}${item.image}`)
    : null;

  return (
    <div className="card overflow-hidden group animate-fade-in">
      {/* Image */}
      {imageUrl && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {item.is_vegetarian && (
            <span className="badge badge-veg">
              <IoLeaf className="mr-1" size={12} /> Veg
            </span>
          )}
          {item.is_vegan && (
            <span className="badge badge-vegan">
              <IoLeaf className="mr-1" size={12} /> Vegan
            </span>
          )}
          {item.spice_level > 0 && (
            <span className="badge" style={{
              background: 'rgb(239 68 68 / 0.15)',
              color: '#ef4444',
            }}>
              <IoFlame className="mr-1" size={12} />
              {SPICE_LABELS[item.spice_level]}
            </span>
          )}
        </div>

        {/* Name & Description */}
        <h3 className="font-semibold text-[var(--color-text-heading)] text-base mb-1">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-[var(--color-accent)]">
            ₹{parseFloat(item.price).toFixed(0)}
          </span>

          {quantity === 0 ? (
            <button
              onClick={() => addItem(item)}
              className="btn btn-primary btn-sm"
              id={`add-item-${item.id}`}
            >
              <IoAdd size={18} /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, quantity - 1)}
                className="btn btn-secondary btn-icon btn-sm"
              >
                <IoRemove size={16} />
              </button>
              <span className="font-semibold text-[var(--color-text-heading)] min-w-[24px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, quantity + 1)}
                className="btn btn-primary btn-icon btn-sm"
              >
                <IoAdd size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
