/**
 * MenuPage — Customer-facing menu page accessed via QR code.
 * URL: /:slug/menu?table=N  or  /:slug/menu
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import { IoSearch, IoCart, IoFilter } from 'react-icons/io5';
import { getCategoriesNested } from '../../api/menu';
import { useCart } from '../../contexts/CartContext';
import MenuCard from '../../components/MenuCard';
import CartDrawer from '../../components/CartDrawer';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MenuPage() {
  const { restaurant } = useOutletContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { totalItems, totalAmount } = useCart();

  const tableNumber = searchParams.get('table');
  const tokenNumber = searchParams.get('token');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [filterVeg, setFilterVeg] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    getCategoriesNested(restaurant.slug)
      .then(({ data }) => {
        const cats = data.results || data;
        setCategories(cats);
        if (cats.length > 0) setActiveCategory(cats[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [restaurant.slug]);

  const handleCheckout = () => {
    setCartOpen(false);
    const params = new URLSearchParams();
    if (tableNumber) params.set('table', tableNumber);
    if (tokenNumber) params.set('token', tokenNumber);
    navigate(`/${restaurant.slug}/cart?${params.toString()}`);
  };

  // Filter items
  const filteredCategories = categories.map((cat) => ({
    ...cat,
    items: (cat.items || []).filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchesVeg = !filterVeg || item.is_vegetarian;
      return matchesSearch && matchesVeg;
    }),
  })).filter((cat) => cat.items.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Table/Token indicator */}
      {(tableNumber || tokenNumber) && (
        <div className="mb-4 p-3 rounded-[var(--radius-lg)] glass text-center animate-fade-in">
          <span className="text-sm text-[var(--color-text-secondary)]">
            {tableNumber ? `📍 Table ${tableNumber}` : `🎫 Token ${tokenNumber}`}
          </span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex gap-2 mb-4 animate-fade-in">
        <div className="relative flex-1">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            id="menu-search"
          />
        </div>
        <button
          onClick={() => setFilterVeg(!filterVeg)}
          className={`btn ${filterVeg ? 'btn-success' : 'btn-secondary'} btn-sm`}
          id="veg-filter-btn"
        >
          <IoFilter size={16} /> Veg
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none animate-fade-in">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`btn btn-sm whitespace-nowrap transition-all ${
              activeCategory === cat.id ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu items by category */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-text-secondary)]">No items found</p>
        </div>
      ) : (
        filteredCategories.map((cat) => (
          <div key={cat.id} id={`cat-${cat.id}`} className="mb-8">
            <h2 className="text-xl font-bold text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-[var(--color-primary)]" />
              {cat.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cat.items.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Floating cart button */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-30">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setCartOpen(true)}
              className="btn btn-accent btn-lg w-full shadow-xl"
              id="view-cart-btn"
              style={{ boxShadow: '0 -4px 20px rgb(245 158 11 / 0.3)' }}
            >
              <IoCart size={20} />
              <span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
              <span className="ml-auto font-bold">₹{totalAmount.toFixed(0)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
    </div>
  );
}
