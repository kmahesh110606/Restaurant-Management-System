/**
 * MenuCard — Dish card for the customer menu grid.
 * Image header, veg/vegan/spice badges, price, quantity stepper, add-to-cart.
 */

import { useState } from 'react';
import {
  AddRegular,
  SubtractRegular,
  LeafOneRegular,
  FoodRegular,
} from '@fluentui/react-icons';
import { useCart } from '../contexts/CartContext';

export default function MenuCard({ item, currency = '₹', readOnly = false }) {
  const { items, addItem, updateQuantity } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);

  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(item, 1);
  };

  const handleIncrement = () => {
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(item.id, quantity - 1);
  };

  const spiceDots = Array.from({ length: item.spice_level || 0 }, (_, i) => i);

  return (
    <div className="glass-card overflow-hidden group animate-fade-in">
      {/* Image */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-gray-100">
        {item.image ? (
          <>
            {!imageLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <FoodRegular fontSize={40} className="text-gray-300" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {item.is_vegetarian && (
            <span className="badge badge-veg text-[10px]">
              <LeafOneRegular fontSize={10} /> Veg
            </span>
          )}
          {item.is_vegan && (
            <span className="badge badge-vegan text-[10px]">Vegan</span>
          )}
        </div>

        {/* Availability overlay */}
        {item.is_available === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm font-bold">Unavailable</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-1">
            {item.name}
          </h3>
          {spiceDots.length > 0 && (
            <div className="flex gap-0.5 shrink-0 mt-0.5">
              {spiceDots.map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-red-500" />
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-base font-extrabold text-gray-900">
            {currency}{parseFloat(item.price).toFixed(2)}
          </span>

          {!readOnly && item.is_available !== false && (
            <>
              {quantity === 0 ? (
                <button
                  onClick={handleAdd}
                  className="btn btn-primary btn-sm gap-1.5"
                >
                  <AddRegular fontSize={14} />
                  Add
                </button>
              ) : (
                <div className="flex items-center gap-0">
                  <button
                    onClick={handleDecrement}
                    className="w-8 h-8 rounded-l-xl bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary-100)] transition-colors"
                  >
                    <SubtractRegular fontSize={14} />
                  </button>
                  <span className="w-8 h-8 flex items-center justify-center text-xs font-bold bg-[var(--color-primary-50)] text-[var(--color-primary)]">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="w-8 h-8 rounded-r-xl bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-[var(--color-primary-dark)] transition-colors"
                  >
                    <AddRegular fontSize={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
