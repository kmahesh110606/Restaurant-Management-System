/**
 * MenuManagement — CRUD for categories and menu items with image uploads,
 * pricing, tags (veg/vegan/spicy), availability toggles, and glassmorphic styling.
 */

import { useEffect, useState } from 'react';
import {
  FoodRegular,
  AddRegular,
  EditRegular,
  DeleteRegular,
  SaveRegular,
} from '@fluentui/react-icons';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem,
} from '../../api/menu';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import LiquidPills from '../../components/ui/LiquidPills';
import CustomSelect from '../../components/ui/CustomSelect';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function MenuManagement() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'categories'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  // Item form state
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '',
    is_available: true, is_vegetarian: false, is_vegan: false,
    spice_level: 0, preparation_time: 15,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Category form state
  const [catForm, setCatForm] = useState({ name: '', description: '', display_order: 0, is_active: true });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getCategories(), getMenuItems()])
      .then(([catRes, itemRes]) => {
        setCategories(catRes.data.results || catRes.data || []);
        setItems(itemRes.data.results || itemRes.data || []);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // Item handlers
  const openItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name, description: item.description || '', price: item.price,
        category: item.category, is_available: item.is_available,
        is_vegetarian: item.is_vegetarian, is_vegan: item.is_vegan,
        spice_level: item.spice_level, preparation_time: item.preparation_time,
      });
      setImagePreview(item.image ? (item.image.startsWith('http') ? item.image : `${API_BASE}${item.image}`) : null);
    } else {
      if (categories.length === 0) {
        toast.error('Please create at least one category before adding dishes.');
        setActiveTab('categories');
        openCatModal();
        return;
      }
      setEditingItem(null);
      setForm({
        name: '', description: '', price: '', category: categories[0]?.id || '',
        is_available: true, is_vegetarian: false, is_vegan: false,
        spice_level: 0, preparation_time: 15,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error('Dish name is required.');
      return;
    }
    if (!form.category) {
      toast.error('Please select a category for this dish.');
      return;
    }
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) {
      toast.error('Please enter a valid price.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          formData.append(key, val);
        }
      });
      if (imageFile) formData.append('image', imageFile);

      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
        toast.success('Menu item updated!');
      } else {
        await createMenuItem(formData);
        toast.success('Menu item created!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      const errMsg = err.response?.data
        ? typeof err.response.data === 'string'
          ? err.response.data
          : Object.entries(err.response.data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join(' | ')
        : err.message || 'Failed to save menu item.';
      toast.error(errMsg);
      console.error('Failed to save menu item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await deleteMenuItem(id);
      toast.success('Menu item deleted.');
      fetchData();
    } catch {
      toast.error('Failed to delete item.');
    }
  };

  // Category handlers
  const openCatModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ name: cat.name, description: cat.description || '', display_order: cat.display_order, is_active: cat.is_active });
    } else {
      setEditingCat(null);
      setCatForm({ name: '', description: '', display_order: categories.length + 1, is_active: true });
    }
    setCatModalOpen(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, catForm);
        toast.success('Category updated!');
      } else {
        await createCategory(catForm);
        toast.success('Category created!');
      }
      setCatModalOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCat = async (id) => {
    if (!confirm('Delete this category and all its items?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted.');
      fetchData();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  if (loadError) return <EmptyState title="Could not load this page" subtitle="Check your connection and try again." actionLabel="Retry" onAction={() => window.location.reload()} />;

  if (loading) {
    return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6 pb-16 max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Menu Catalog</h1>
          <span className="badge badge-ready font-bold text-xs py-1 px-3">
            {items.length} Active Dishes
          </span>
        </div>

        {/* iOS Liquid Glass Tab Switcher with Spring Wobble */}
        <div className="flex flex-wrap items-center gap-3">
          <LiquidPills
            items={[
              { label: `Menu Items (${items.length})`, value: 'items' },
              { label: `Categories (${categories.length})`, value: 'categories' },
            ]}
            value={activeTab}
            onChange={setActiveTab}
            layoutId="menu-management-tabs-pill"
            size="sm"
          />

          {activeTab === 'items' ? (
            <button
              id="btn-add-item"
              onClick={() => openItemModal()}
              className="btn btn-primary px-4 py-2 text-xs font-bold gap-1.5"
            >
              <AddRegular fontSize={14} /> Add Item
            </button>
          ) : (
            <button
              id="btn-add-category"
              onClick={() => openCatModal()}
              className="btn btn-primary px-4 py-2 text-xs font-bold gap-1.5"
            >
              <AddRegular fontSize={14} /> Add Category
            </button>
          )}
        </div>
      </div>

      {/* ═══════════ ITEMS TAB ═══════════ */}
      {activeTab === 'items' && (
        <div>
          {items.length === 0 ? (
            <EmptyState
              icon={FoodRegular}
              title="No menu items yet"
              subtitle="Add your first dish to start serving guests."
              actionLabel="Add Menu Item"
              onAction={() => openItemModal()}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((item) => {
                const imgUrl = item.image
                  ? item.image.startsWith('http')
                    ? item.image
                    : `${API_BASE}${item.image}`
                  : null;

                return (
                  <div
                    key={item.id}
                    className="glass-card border border-white/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.name}
                        className="w-full h-44 object-cover border-b border-gray-100"
                      />
                    ) : (
                      <div className="w-full h-28 bg-gray-50 flex items-center justify-center text-gray-300 border-b border-gray-100">
                        <FoodRegular fontSize={36} />
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-extrabold text-base text-gray-900">{item.name}</h3>
                          <span className="font-black text-base text-[var(--color-primary)]">
                            ₹{parseFloat(item.price).toFixed(0)}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                          {item.category_name || 'General'}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {!item.is_available && (
                            <span className="badge badge-cancelled">Sold Out</span>
                          )}
                          {item.is_vegetarian && (
                            <span className="badge badge-veg">Veg</span>
                          )}
                          {item.is_vegan && (
                            <span className="badge badge-vegan">Vegan</span>
                          )}
                          {item.spice_level > 0 && (
                            <span className="badge bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-semibold">
                              {['Mild', 'Medium', 'Hot', 'Extra Hot'][item.spice_level - 1] || 'Spicy'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => openItemModal(item)}
                          className="btn btn-secondary flex-1 py-1.5 text-xs font-bold gap-1.5"
                        >
                          <EditRegular fontSize={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="btn btn-danger px-3 py-1.5 text-xs font-bold"
                        >
                          <DeleteRegular fontSize={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ CATEGORIES TAB ═══════════ */}
      {activeTab === 'categories' && (
        <div className="solid-card bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="font-bold text-gray-900">{cat.name}</td>
                    <td className="text-gray-500 text-xs">{cat.description || '—'}</td>
                    <td className="font-mono text-xs font-bold text-[var(--color-primary)]">
                      {cat.display_order}
                    </td>
                    <td>
                      {cat.is_active ? (
                        <span className="badge badge-ready">Active</span>
                      ) : (
                        <span className="badge badge-cancelled">Inactive</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openCatModal(cat)}
                          className="btn btn-secondary btn-sm p-1.5"
                        >
                          <EditRegular fontSize={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCat(cat.id)}
                          className="btn btn-danger btn-sm p-1.5"
                        >
                          <DeleteRegular fontSize={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ ITEM MODAL ═══════════ */}
      {modalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          title={editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          size="lg"
        >
          <form onSubmit={handleItemSubmit} className="space-y-4 p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Dish Name *</label>
                <input
                  id="item-dish-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Truffle Risotto"
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">Category *</label>
                <CustomSelect
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  value={form.category}
                  onChange={(val) => setForm({ ...form, category: val })}
                  placeholder="Select a category..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Price (₹) *</label>
                <input
                  id="item-price"
                  type="number"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">Prep Time (Mins)</label>
                <input
                  id="item-prep-time"
                  type="number"
                  value={form.preparation_time}
                  onChange={(e) => setForm({ ...form, preparation_time: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">Spice Level (0-3)</label>
                <CustomSelect
                  options={[
                    { value: 0, label: 'Mild (0)' },
                    { value: 1, label: 'Medium (1)' },
                    { value: 2, label: 'Hot (2)' },
                    { value: 3, label: 'Extra Spicy (3)' },
                  ]}
                  value={form.spice_level}
                  onChange={(val) => setForm({ ...form, spice_level: parseInt(val) })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                id="item-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Delicious slow-cooked arborio rice with wild forest mushrooms."
                className="input"
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                  className="rounded text-[var(--color-primary)]"
                />
                Available for Order
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_vegetarian}
                  onChange={(e) => setForm({ ...form, is_vegetarian: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                Vegetarian
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_vegan}
                  onChange={(e) => setForm({ ...form, is_vegan: e.target.checked })}
                  className="rounded text-teal-600"
                />
                Vegan
              </label>
            </div>

            {/* Image upload */}
            <div>
              <label className="form-label">Dish Photo</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-xs text-gray-500 file:btn file:btn-secondary file:py-1.5 file:px-3 file:text-xs file:mr-3"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn btn-secondary px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                id="btn-save-dish"
                type="submit"
                disabled={submitting}
                className="btn btn-primary px-6 text-xs font-bold gap-1.5"
              >
                <SaveRegular fontSize={14} />
                {submitting ? 'Saving...' : 'Save Dish'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═══════════ CATEGORY MODAL ═══════════ */}
      {catModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setCatModalOpen(false)}
          title={editingCat ? 'Edit Category' : 'Add Category'}
          size="sm"
        >
          <form onSubmit={handleCatSubmit} className="space-y-4 p-2">
            <div>
              <label className="form-label">Category Name *</label>
              <input
                id="cat-name"
                required
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="e.g. Starters"
                className="input"
              />
            </div>

            <div>
              <label className="form-label">Sort Order</label>
              <input
                id="cat-order"
                type="number"
                value={catForm.display_order}
                onChange={(e) => setCatForm({ ...catForm, display_order: parseInt(e.target.value) || 0 })}
                className="input"
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                id="cat-description"
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                rows={2}
                className="input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="btn btn-secondary px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                id="btn-save-category"
                type="submit"
                disabled={submitting}
                className="btn btn-primary px-6 text-xs font-bold"
              >
                {submitting ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
