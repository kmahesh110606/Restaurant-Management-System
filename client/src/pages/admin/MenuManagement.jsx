/**
 * MenuManagement — Rebuilt CRUD for categories and menu items with Fluent UI icons and updated spacing.
 */

import { useEffect, useState } from 'react';
import {
  Food24Filled,
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Save24Regular,
  Image24Regular,
} from '@fluentui/react-icons';
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

  // Category handlers
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
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E53935]/10 border border-[#E53935]/20 flex items-center justify-center text-[#FF5252]">
            <Food24Filled className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">Menu Management</h1>
            <p className="text-xs text-[#9E9E9E] font-medium mt-0.5">Manage menu items, prices, tags, and category structure</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-[#1A1A1D] p-1.5 rounded-2xl border border-[#26262A]">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              activeTab === 'items' ? 'bg-[#E53935] text-white shadow-md shadow-[#E53935]/25' : 'text-[#71717A] hover:text-[#FAFAFA]'
            }`}
          >
            Menu Items ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              activeTab === 'categories' ? 'bg-[#E53935] text-white shadow-md shadow-[#E53935]/25' : 'text-[#71717A] hover:text-[#FAFAFA]'
            }`}
          >
            Categories ({categories.length})
          </button>
        </div>
      </div>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => openItemModal()} className="btn btn-primary px-5 py-2.5 rounded-xl font-extrabold flex items-center gap-2" id="add-menu-item-btn">
              <Add24Regular className="text-lg" />
              <span>Add Menu Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((item) => {
              const imgUrl = item.image ? (item.image.startsWith('http') ? item.image : `${API_BASE}${item.image}`) : null;
              return (
                <div key={item.id} className="card overflow-hidden bg-[#1A1A1D] border-[#26262A] hover:border-[#3E3E45] rounded-2xl shadow-xl flex flex-col justify-between">
                  {imgUrl && (
                    <img src={imgUrl} alt={item.name} className="w-full h-44 object-cover border-b border-[#26262A]" />
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-1.5">
                        <h3 className="font-extrabold text-base text-[#FAFAFA]">{item.name}</h3>
                        <span className="font-black text-[#FFB300] text-base">₹{parseFloat(item.price).toFixed(0)}</span>
                      </div>
                      <p className="text-xs font-bold text-[#71717A] uppercase tracking-wider mb-3">{item.category_name}</p>
                      {item.description && (
                        <p className="text-xs text-[#9E9E9E] line-clamp-2 leading-relaxed mb-3">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        {!item.is_available && <span className="badge badge-cancelled">Unavailable</span>}
                        {item.is_vegetarian && <span className="badge badge-veg text-xs">Veg</span>}
                        {item.is_vegan && <span className="badge badge-vegan text-xs">Vegan</span>}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#26262A]">
                      <button onClick={() => openItemModal(item)} className="btn btn-secondary btn-sm flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5">
                        <Edit24Regular className="text-base" /> Edit
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="btn btn-danger btn-sm px-3 rounded-xl">
                        <Delete24Regular className="text-base" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => openCatModal()} className="btn btn-primary px-5 py-2.5 rounded-xl font-extrabold flex items-center gap-2" id="add-category-btn">
              <Add24Regular className="text-lg" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="card overflow-hidden bg-[#1A1A1D] border-[#26262A] shadow-2xl rounded-2xl">
            <table className="data-table w-full text-left">
              <thead>
                <tr className="bg-[#141416] border-b border-[#26262A] text-[11px] font-black uppercase tracking-wider text-[#71717A]">
                  <th className="py-4 px-5">Name</th>
                  <th className="py-4 px-5">Description</th>
                  <th className="py-4 px-5">Display Order</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262A] text-sm font-medium">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#222226] transition-colors">
                    <td className="py-4 px-5 font-bold text-[#FAFAFA]">{cat.name}</td>
                    <td className="py-4 px-5 text-xs text-[#9E9E9E]">{cat.description || '—'}</td>
                    <td className="py-4 px-5 font-mono text-xs font-bold text-[#FFB300]">{cat.display_order}</td>
                    <td className="py-4 px-5 text-xs font-bold">
                      {cat.is_active ? (
                        <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Active</span>
                      ) : (
                        <span className="text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">Inactive</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openCatModal(cat)} className="btn btn-secondary btn-sm p-2 rounded-xl text-xs">
                          <Edit24Regular className="text-base" />
                        </button>
                        <button onClick={() => handleDeleteCat(cat.id)} className="btn btn-danger btn-sm p-2 rounded-xl text-xs">
                          <Delete24Regular className="text-base" />
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

      {/* Item Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'} size="lg">
        <form onSubmit={handleItemSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input text-sm font-semibold" required />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Price (₹) *</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input text-sm font-semibold" required />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input text-sm font-semibold" required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Spice Level</label>
              <select value={form.spice_level} onChange={(e) => setForm({ ...form, spice_level: parseInt(e.target.value) })} className="input text-sm font-semibold">
                <option value={0}>None</option>
                <option value={1}>Mild</option>
                <option value={2}>Medium</option>
                <option value={3}>Hot</option>
                <option value={4}>Extra Hot</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input text-sm font-medium" rows={3} />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Image</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-[#333]" />
              )}
              <label className="btn btn-secondary text-xs font-extrabold cursor-pointer flex items-center gap-2 py-2 px-4 rounded-xl">
                <Image24Regular className="text-base" /> {imagePreview ? 'Change Image' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                className="w-4 h-4 accent-[#E53935]" />
              <span className="text-xs font-extrabold text-[#FAFAFA]">Available</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.is_vegetarian} onChange={(e) => setForm({ ...form, is_vegetarian: e.target.checked })}
                className="w-4 h-4 accent-[#4CAF50]" />
              <span className="text-xs font-extrabold text-[#FAFAFA]">Vegetarian</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.is_vegan} onChange={(e) => setForm({ ...form, is_vegan: e.target.checked })}
                className="w-4 h-4 accent-[#26A69A]" />
              <span className="text-xs font-extrabold text-[#FAFAFA]">Vegan</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary px-4 py-2 rounded-xl text-xs font-extrabold">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2">
              <Save24Regular className="text-base" />
              <span>{submitting ? 'Saving...' : 'Save Item'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={catModalOpen} onClose={() => setCatModalOpen(false)} title={editingCat ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleCatSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Name *</label>
            <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="input text-sm font-semibold" required />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Description</label>
            <textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className="input text-sm font-medium" rows={2} />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Display Order</label>
            <input type="number" value={catForm.display_order} onChange={(e) => setCatForm({ ...catForm, display_order: parseInt(e.target.value) })} className="input text-sm font-semibold" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={catForm.is_active} onChange={(e) => setCatForm({ ...catForm, is_active: e.target.checked })}
              className="w-4 h-4 accent-[#E53935]" />
            <span className="text-xs font-extrabold text-[#FAFAFA]">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setCatModalOpen(false)} className="btn btn-secondary px-4 py-2 rounded-xl text-xs font-extrabold">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2">
              <Save24Regular className="text-base" />
              <span>{submitting ? 'Saving...' : 'Save Category'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
