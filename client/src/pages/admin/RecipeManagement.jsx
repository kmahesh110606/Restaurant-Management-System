/**
 * RecipeManagement — Internal recipe repository for kitchen preparation.
 * Linked to menu items with ingredient lists, prep & cook times, and instructions.
 */

import { useEffect, useState } from 'react';
import {
  BookOpenRegular,
  AddRegular,
  EditRegular,
  DeleteRegular,
  SaveRegular,
  ClockRegular,
  FoodRegular,
  TimerRegular,
  PeopleRegular,
} from '@fluentui/react-icons';
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from '../../api/recipes';
import { getMenuItems } from '../../api/menu';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

export default function RecipeManagement() {
  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    menu_item: '',
    ingredients: '',
    instructions: '',
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    serves: 1,
    notes: '',
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([getRecipes(), getMenuItems()])
      .then(([recRes, itemRes]) => {
        setRecipes(recRes.data.results || recRes.data || []);
        setMenuItems(itemRes.data.results || itemRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (recipe = null) => {
    if (recipe) {
      setEditing(recipe);
      setForm({
        menu_item: recipe.menu_item,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes,
        serves: recipe.serves,
        notes: recipe.notes || '',
      });
    } else {
      setEditing(null);
      setForm({
        menu_item: menuItems[0]?.id || '',
        ingredients: '',
        instructions: '',
        prep_time_minutes: 10,
        cook_time_minutes: 15,
        serves: 1,
        notes: '',
      });
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
    } catch {
      toast.error('Failed to save recipe.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await deleteRecipe(id);
      toast.success('Recipe deleted.');
      fetchData();
    } catch {
      toast.error('Failed to delete recipe.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-16 max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shadow-purple-500/20"
            style={{ background: '#7C3AED' }}
          >
            <BookOpenRegular fontSize={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Kitchen Recipes</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Internal preparation guides, ingredient quantities, and cooking methods
            </p>
          </div>
        </div>

        <button
          onClick={() => openModal()}
          className="btn btn-primary px-4 py-2 text-xs font-bold gap-1.5"
        >
          <AddRegular fontSize={14} /> Add New Recipe
        </button>
      </div>

      {/* ═══════════ RECIPES GRID ═══════════ */}
      {recipes.length === 0 ? (
        <EmptyState
          icon={BookOpenRegular}
          title="No recipes cataloged"
          subtitle="Document preparation steps and ingredients for kitchen consistency."
          actionLabel="Create Recipe"
          onAction={() => openModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {recipes.map((rec) => (
            <div
              key={rec.id}
              className="solid-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100">
                  <h3 className="font-extrabold text-base text-gray-900">
                    {rec.menu_item_name || 'Dish Recipe'}
                  </h3>
                  <span className="badge badge-veg text-xs font-bold">
                    {rec.serves} {rec.serves === 1 ? 'portion' : 'portions'}
                  </span>
                </div>

                {/* Times */}
                <div className="flex items-center gap-4 py-2.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <ClockRegular fontSize={14} className="text-gray-400" />
                    <span>Prep: <strong className="text-gray-900">{rec.prep_time_minutes}m</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TimerRegular fontSize={14} className="text-gray-400" />
                    <span>Cook: <strong className="text-gray-900">{rec.cook_time_minutes}m</strong></span>
                  </div>
                </div>

                {/* Ingredients snippet */}
                <div className="space-y-1.5 py-2 border-t border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Ingredients
                  </p>
                  <p className="text-xs text-gray-700 whitespace-pre-line line-clamp-3 leading-relaxed">
                    {rec.ingredients}
                  </p>
                </div>

                {/* Instructions snippet */}
                <div className="space-y-1.5 py-2 border-t border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Instructions
                  </p>
                  <p className="text-xs text-gray-600 whitespace-pre-line line-clamp-3 leading-relaxed">
                    {rec.instructions}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openModal(rec)}
                  className="btn btn-secondary flex-1 py-1.5 text-xs font-bold gap-1.5"
                >
                  <EditRegular fontSize={14} /> View & Edit
                </button>
                <button
                  onClick={() => handleDelete(rec.id)}
                  className="btn btn-danger btn-sm p-2"
                >
                  <DeleteRegular fontSize={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════ RECIPE MODAL ═══════════ */}
      {modalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          title={editing ? 'Edit Recipe' : 'Add Kitchen Recipe'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4 p-2">
            <div>
              <label className="form-label">Linked Menu Item *</label>
              <select
                required
                value={form.menu_item}
                onChange={(e) => setForm({ ...form, menu_item: e.target.value })}
                className="input"
              >
                {menuItems.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (₹{parseFloat(m.price).toFixed(0)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Prep Time (Mins)</label>
                <input
                  type="number"
                  value={form.prep_time_minutes}
                  onChange={(e) => setForm({ ...form, prep_time_minutes: parseInt(e.target.value) || 0 })}
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">Cook Time (Mins)</label>
                <input
                  type="number"
                  value={form.cook_time_minutes}
                  onChange={(e) => setForm({ ...form, cook_time_minutes: parseInt(e.target.value) || 0 })}
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">Portions / Serves</label>
                <input
                  type="number"
                  min="1"
                  value={form.serves}
                  onChange={(e) => setForm({ ...form, serves: parseInt(e.target.value) || 1 })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Ingredients & Measurements *</label>
              <textarea
                required
                rows={4}
                value={form.ingredients}
                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                placeholder="e.g.&#10;200g Arborio Rice&#10;50g Truffle Butter&#10;500ml Vegetable Stock"
                className="input"
              />
            </div>

            <div>
              <label className="form-label">Preparation & Cooking Steps *</label>
              <textarea
                required
                rows={5}
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="Step 1: Sweat onions in butter until translucent...&#10;Step 2: Add rice and toast for 2 mins...&#10;Step 3: Gradually incorporate hot stock..."
                className="input"
              />
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
                type="submit"
                disabled={submitting}
                className="btn btn-primary px-6 text-xs font-bold gap-1.5"
              >
                <SaveRegular fontSize={14} />
                {submitting ? 'Saving...' : 'Save Recipe'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
