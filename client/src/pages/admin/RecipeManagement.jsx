/**
 * RecipeManagement — CRUD for internal recipes.
 */

import { useEffect, useState } from 'react';
import { IoAdd, IoCreate, IoTrash, IoSave, IoBook } from 'react-icons/io5';
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from '../../api/recipes';
import { getMenuItems } from '../../api/menu';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function RecipeManagement() {
  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    menu_item: '', ingredients: '', instructions: '',
    prep_time_minutes: 0, cook_time_minutes: 0, serves: 1, notes: '',
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([getRecipes(), getMenuItems()])
      .then(([recRes, itemRes]) => {
        setRecipes(recRes.data.results || recRes.data);
        setMenuItems(itemRes.data.results || itemRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (recipe = null) => {
    if (recipe) {
      setEditing(recipe);
      setForm({
        menu_item: recipe.menu_item, ingredients: recipe.ingredients,
        instructions: recipe.instructions, prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes, serves: recipe.serves, notes: recipe.notes || '',
      });
    } else {
      setEditing(null);
      setForm({ menu_item: '', ingredients: '', instructions: '', prep_time_minutes: 0, cook_time_minutes: 0, serves: 1, notes: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await updateRecipe(editing.id, form);
        toast.success('Recipe updated!');
      } else {
        await createRecipe(form);
        toast.success('Recipe created!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save recipe.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this recipe?')) return;
    try {
      await deleteRecipe(id);
      toast.success('Recipe deleted.');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">📖 Recipe Management</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Internal reference — not visible to customers</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <IoAdd size={18} /> Add Recipe
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="card p-12 text-center">
          <IoBook size={48} className="mx-auto text-[var(--color-text-muted)] mb-3" />
          <p className="text-lg font-semibold text-[var(--color-text-heading)]">No recipes yet</p>
          <p className="text-[var(--color-text-muted)]">Add recipes for your menu items</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-[var(--color-text-heading)]">{recipe.menu_item_name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => openModal(recipe)} className="btn btn-ghost btn-sm"><IoCreate size={16} /></button>
                  <button onClick={() => handleDelete(recipe.id)} className="btn btn-ghost btn-sm text-[var(--color-danger)]"><IoTrash size={16} /></button>
                </div>
              </div>
              <div className="flex gap-3 mb-3 text-xs text-[var(--color-text-muted)]">
                <span>⏱ Prep: {recipe.prep_time_minutes}m</span>
                <span>🍳 Cook: {recipe.cook_time_minutes}m</span>
                <span>🍽 Serves: {recipe.serves}</span>
              </div>
              <div className="mb-2">
                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1">Ingredients</h4>
                <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line line-clamp-4">{recipe.ingredients}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1">Instructions</h4>
                <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line line-clamp-4">{recipe.instructions}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Recipe' : 'Add Recipe'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Menu Item *</label>
            <select value={form.menu_item} onChange={(e) => setForm({ ...form, menu_item: e.target.value })} className="input" required disabled={!!editing}>
              <option value="">Select item</option>
              {menuItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Ingredients *</label>
            <textarea value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} className="input" rows={4} required placeholder="List each ingredient on a new line" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Instructions *</label>
            <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} className="input" rows={5} required placeholder="Step-by-step cooking instructions" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Prep Time (min)</label>
              <input type="number" value={form.prep_time_minutes} onChange={(e) => setForm({ ...form, prep_time_minutes: parseInt(e.target.value) })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Cook Time (min)</label>
              <input type="number" value={form.cook_time_minutes} onChange={(e) => setForm({ ...form, cook_time_minutes: parseInt(e.target.value) })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Serves</label>
              <input type="number" value={form.serves} onChange={(e) => setForm({ ...form, serves: parseInt(e.target.value) })} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary"><IoSave size={16} /> {submitting ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
