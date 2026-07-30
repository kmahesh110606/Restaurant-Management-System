/**
 * RecipeManagement — Internal recipe management with Fluent UI icons and improved card grid layout & spacing.
 */

import { useEffect, useState } from 'react';
import {
  Book24Filled,
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Save24Regular,
  Clock24Regular,
  Food24Regular,
} from '@fluentui/react-icons';
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
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E53935]/10 border border-[#E53935]/20 flex items-center justify-center text-[#FF5252]">
            <Book24Filled className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">Recipe Book</h1>
            <p className="text-xs text-[#9E9E9E] font-medium mt-0.5">Internal kitchen preparation guides & ingredient specs</p>
          </div>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary px-5 py-2.5 rounded-xl font-extrabold flex items-center gap-2">
          <Add24Regular className="text-lg" />
          <span>Add Recipe</span>
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-center bg-[#1A1A1D] border-[#26262A] rounded-2xl space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-[#242428] border border-[#2E2E33] flex items-center justify-center">
            <Book24Filled className="text-3xl text-[#FF5252]" />
          </div>
          <p className="text-xl font-extrabold text-[#FAFAFA]">No recipes configured</p>
          <p className="text-xs text-[#71717A] max-w-sm">Create step-by-step instructions and ingredient lists for your kitchen staff.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="card p-6 bg-[#1A1A1D] border-[#26262A] hover:border-[#3E3E45] rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between mb-3 pb-3 border-b border-[#26262A]">
                  <h3 className="font-extrabold text-lg text-[#FAFAFA]">{recipe.menu_item_name}</h3>
                  <div className="flex gap-1.5">
                    <button onClick={() => openModal(recipe)} className="btn btn-ghost btn-sm p-2 rounded-xl text-[#A1A1AA] hover:text-[#FAFAFA]">
                      <Edit24Regular className="text-base" />
                    </button>
                    <button onClick={() => handleDelete(recipe.id)} className="btn btn-ghost btn-sm p-2 rounded-xl text-[#FF5252] hover:bg-[#E53935]/15">
                      <Delete24Regular className="text-base" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mb-4 text-xs font-bold text-[#FFB300] bg-[#FFB300]/10 px-3.5 py-2 rounded-xl border border-[#FFB300]/20">
                  <span className="flex items-center gap-1.5"><Clock24Regular className="text-sm" /> Prep: {recipe.prep_time_minutes}m</span>
                  <span className="flex items-center gap-1.5"><Food24Regular className="text-sm" /> Cook: {recipe.cook_time_minutes}m</span>
                  <span>🍽 Serves: {recipe.serves}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-[11px] font-black text-[#71717A] uppercase tracking-wider mb-1">Ingredients</h4>
                    <p className="text-xs text-[#D4D4D8] whitespace-pre-line leading-relaxed font-medium bg-[#141416] p-3 rounded-xl border border-[#222226]">{recipe.ingredients}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-[#71717A] uppercase tracking-wider mb-1">Instructions</h4>
                    <p className="text-xs text-[#D4D4D8] whitespace-pre-line leading-relaxed font-medium bg-[#141416] p-3 rounded-xl border border-[#222226]">{recipe.instructions}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Recipe Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Recipe' : 'Add Recipe'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Menu Item *</label>
            <select value={form.menu_item} onChange={(e) => setForm({ ...form, menu_item: e.target.value })} className="input text-sm font-semibold" required disabled={!!editing}>
              <option value="">Select item</option>
              {menuItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Ingredients *</label>
            <textarea value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} className="input text-sm font-medium" rows={4} required placeholder="List each ingredient on a new line" />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Instructions *</label>
            <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} className="input text-sm font-medium" rows={5} required placeholder="Step-by-step cooking instructions" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Prep Time (min)</label>
              <input type="number" value={form.prep_time_minutes} onChange={(e) => setForm({ ...form, prep_time_minutes: parseInt(e.target.value) })} className="input text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Cook Time (min)</label>
              <input type="number" value={form.cook_time_minutes} onChange={(e) => setForm({ ...form, cook_time_minutes: parseInt(e.target.value) })} className="input text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Serves</label>
              <input type="number" value={form.serves} onChange={(e) => setForm({ ...form, serves: parseInt(e.target.value) })} className="input text-sm font-semibold" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-[#71717A] mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input text-sm font-medium" rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary px-4 py-2 rounded-xl text-xs font-extrabold">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2">
              <Save24Regular className="text-base" />
              <span>{submitting ? 'Saving...' : 'Save Recipe'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
