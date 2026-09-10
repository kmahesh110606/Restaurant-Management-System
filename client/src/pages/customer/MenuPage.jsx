/**
 * MenuPage — Customer-facing menu with workflow-adaptive behavior.
 * Fetches categories and menu items from API based on restaurant slug.
 * Adapts UI based on workflow_type: table (self-order), token (counter), shop (biller), view-only.
 */

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  SearchRegular,
  DismissRegular,
  CartRegular,
  InfoRegular,
} from '@fluentui/react-icons';
import { getCategoriesNested } from '../../api/menu';
import { useCart } from '../../contexts/CartContext';
import MenuCard from '../../components/MenuCard';
import CartDrawer from '../../components/CartDrawer';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function MenuPage() {
  const { restaurantConfig, slug } = useOutletContext() || {};
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { totalItems, totalAmount } = useCart();

  const tableNumber = searchParams.get('table');

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currency = restaurantConfig?.currency || '₹';
  const workflowType = restaurantConfig?.workflow_type || 'table';

  // Determine if self-ordering is allowed
  const allowSelfOrdering = workflowType === 'table' || workflowType === 'token';
  const isViewOnly = !allowSelfOrdering;

  // Fetch menu data
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    getCategoriesNested(slug)
      .then(({ data }) => {
        const cats = data.results || data;
        if (Array.isArray(cats)) {
          setCategories(cats);
          const allItems = cats.flatMap((c) => (c.items || []).map((item) => ({
            ...item,
            category_slug: c.name?.toLowerCase(),
            category_name: c.name,
          })));
          setMenuItems(allItems);
        }
      })
      .catch(() => {
        setError('Unable to load menu. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory === 'all' ||
        item.category_slug?.includes(activeCategory.toLowerCase()) ||
        item.category_name?.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [menuItems, activeCategory, searchQuery]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <EmptyState
        title="Couldn't load menu"
        subtitle={error}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="relative pb-24 animate-fade-in max-w-6xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {restaurantConfig?.name || 'Our Menu'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {tableNumber
              ? `Ordering for Table ${tableNumber}`
              : restaurantConfig?.description || 'Browse our curated dishes and place your order'}
          </p>
          {isViewOnly && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold">
              <InfoRegular fontSize={14} />
              <span>This is a view-only menu. Please ask your waiter to place an order.</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72 shrink-0">
          <SearchRegular className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fontSize={16} />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 pr-9 py-2.5 rounded-full text-sm"
            id="dish-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <DismissRegular fontSize={14} />
            </button>
          )}
        </div>
      </div>

      {/* ═══════════ CATEGORY TABS ═══════════ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60'
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const slug = cat.name?.toLowerCase();
          const isActive = activeCategory === slug;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(slug)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* ═══════════ MENU GRID ═══════════ */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="No dishes found"
          subtitle="Try a different category or search term."
          actionLabel="Reset Filters"
          onAction={() => { setActiveCategory('all'); setSearchQuery(''); }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item, index) => (
            <div key={item.id} style={{ animationDelay: `${index * 0.04}s` }}>
              <MenuCard
                item={item}
                currency={currency}
                readOnly={isViewOnly}
              />
            </div>
          ))}
        </div>
      )}

      {/* ═══════════ FLOATING CART FAB ═══════════ */}
      {allowSelfOrdering && totalItems > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-30 animate-slide-up">
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="group flex items-center gap-3 px-5 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold text-sm rounded-full shadow-xl transition-all duration-200 active:scale-95"
            id="floating-cart-btn"
          >
            <CartRegular fontSize={18} className="transition-transform group-hover:scale-110" />
            <span>{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
            <span className="text-xs opacity-80">•</span>
            <span>{currency}{totalAmount.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onCheckout={() => {
          setCartDrawerOpen(false);
          navigate(`/${slug}/cart${tableNumber ? `?table=${tableNumber}` : ''}`);
        }}
        currency={currency}
      />
    </div>
  );
}
