/**
 * MenuManagement — CRUD for categories and menu items with image upload.
 */

import { useEffect, useState } from 'react';
import { IoAdd, IoCreate, IoTrash, IoImage, IoSave, IoClose } from 'react-icons/io5';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem,
} from '../../api/menu';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function MenuManagement() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items'); // items | categories
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
        setCategories(catRes.data.results || catRes.data);
        setItems(itemRes.data.results || itemRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // ---- Item handlers ----
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
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (imageFile) formData.append('image', imageFile);

      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
        toast.success('Item updated!');
      } else {
        await createMenuItem(formData);
        toast.success('Item created!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await deleteMenuItem(id);
      toast.success('Item deleted.');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  // ---- Category handlers ----
  const openCatModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ name: cat.name, description: cat.description || '', display_order: cat.display_order, is_active: cat.is_active });
    } else {
      setEditingCat(null);
      setCatForm({ name: '', description: '', display_order: 0, is_active: true });
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
    } catch (err) {
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
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Menu Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('items')}
            className={`btn btn-sm ${activeTab === 'items' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Items ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`btn btn-sm ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Categories ({categories.length})
          </button>
        </div>
      </div>

      {/* Items tab */}
      {activeTab === 'items' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => openItemModal()} className="btn btn-primary" id="add-menu-item-btn">
              <IoAdd size={18} /> Add Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item) => {
              const imgUrl = item.image ? (item.image.startsWith('http') ? item.image : `${API_BASE}${item.image}`) : null;
              return (
                <div key={item.id} className="card overflow-hidden">
                  {imgUrl && (
                    <img src={imgUrl} alt={item.name} className="w-full h-36 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-[var(--color-text-heading)]">{item.name}</h3>
                      <span className="font-bold text-[var(--color-accent)]">₹{parseFloat(item.price).toFixed(0)}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">{item.category_name}</p>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {!item.is_available && <span className="badge badge-cancelled">Unavailable</span>}
                      {item.is_vegetarian && <span className="badge badge-veg text-xs">Veg</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openItemModal(item)} className="btn btn-secondary btn-sm flex-1">
                        <IoCreate size={14} /> Edit
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="btn btn-danger btn-sm">
                        <IoTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Categories tab */}
      {activeTab === 'categories' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => openCatModal()} className="btn btn-primary" id="add-category-btn">
              <IoAdd size={18} /> Add Category
            </button>
          </div>

          <div className="card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Order</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="font-medium">{cat.name}</td>
                    <td className="text-[var(--color-text-muted)]">{cat.description || '—'}</td>
                    <td>{cat.display_order}</td>
                    <td>{cat.is_active ? '✅' : '❌'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openCatModal(cat)} className="btn btn-secondary btn-sm">
                          <IoCreate size={14} />
                        </button>
                        <button onClick={() => handleDeleteCat(cat.id)} className="btn btn-danger btn-sm">
                          <IoTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Item Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'} size="lg">
        <form onSubmit={handleItemSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Price *</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Spice Level</label>
              <select value={form.spice_level} onChange={(e) => setForm({ ...form, spice_level: parseInt(e.target.value) })} className="input">
                <option value={0}>None</option>
                <option value={1}>Mild</option>
                <option value={2}>Medium</option>
                <option value={3}>Hot</option>
                <option value={4}>Extra Hot</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={3} />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Image</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
              )}
              <label className="btn btn-secondary cursor-pointer">
                <IoImage size={16} /> {imagePreview ? 'Change' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-primary)]" />
              <span className="text-sm">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_vegetarian} onChange={(e) => setForm({ ...form, is_vegetarian: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-success)]" />
              <span className="text-sm">Vegetarian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_vegan} onChange={(e) => setForm({ ...form, is_vegan: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-success)]" />
              <span className="text-sm">Vegan</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <IoSave size={16} /> {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={catModalOpen} onClose={() => setCatModalOpen(false)} title={editingCat ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleCatSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Name *</label>
            <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Description</label>
            <textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className="input" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Display Order</label>
            <input type="number" value={catForm.display_order} onChange={(e) => setCatForm({ ...catForm, display_order: parseInt(e.target.value) })} className="input" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={catForm.is_active} onChange={(e) => setCatForm({ ...catForm, is_active: e.target.checked })}
              className="w-4 h-4 accent-[var(--color-primary)]" />
            <span className="text-sm">Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setCatModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <IoSave size={16} /> {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
