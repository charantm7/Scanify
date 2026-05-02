'use client';


import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  Plus, Pencil, Trash2, Loader2, ChefHat, Tag,
  Image as ImageIcon, DollarSign, GripVertical,
  Eye, EyeOff, AlertTriangle, Zap, ChevronDown, ChevronRight,
  Check, X as XIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSupabaseClient } from '../../../lib/supabase/client';
import { useApp } from '../../../context/AppContext';
import {
  Button, Input, Textarea, Select, EmptyState,
  Modal, Alert, Badge, UpgradeNudge, Toggle,
} from '../../shared/ui';

// ─── State / Reducer ──────────────────────────────────────────────────────────
const INITIAL = { categories: [], loading: true, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'LOADED':
      return { ...state, categories: action.payload, loading: false, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter((c) => c.id !== action.payload) };
    case 'ADD_ITEM':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.category_id
            ? { ...c, items: [...(c.items || []), action.payload] }
            : c
        ),
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        categories: state.categories.map((c) => ({
          ...c,
          items: (c.items || []).map((i) =>
            i.id === action.payload.id ? { ...i, ...action.payload } : i
          ),
        })),
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        categories: state.categories.map((c) => ({
          ...c,
          items: (c.items || []).filter((i) => i.id !== action.payload),
        })),
      };
    default:
      return state;
  }
}

// ─── Inline editable text ─────────────────────────────────────────────────────
function InlineEdit({ value, onSave, placeholder = 'Enter name…' }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    const trimmed = val.trim();
    if (!trimmed) { setVal(value); setEditing(false); return; }
    if (trimmed !== value) onSave(trimmed);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(value); setEditing(false); } }}
        className="font-semibold text-sm text-theme bg-transparent border-b-2 outline-none w-48"
        style={{ borderColor: 'var(--accent)' }}
      />
    );
  }
  return (
    <span
      onClick={() => { setVal(value); setEditing(true); }}
      className="font-semibold text-sm text-theme cursor-text hover:underline"
      title="Click to rename"
    >
      {value || placeholder}
    </span>
  );
}

// ─── Item Form (used in Modal) ────────────────────────────────────────────────
const EMPTY_ITEM = {
  name: '', description: '', price: '', image_url: '', is_available: true,
};

function ItemForm({ initial = EMPTY_ITEM, onSubmit, loading, categories, currentCategoryId }) {
  const [form, setForm] = useState({ ...EMPTY_ITEM, ...initial });
  const [errors, setErrors] = useState({});

  function set(field) {
    return (val) => {
      setForm((f) => ({ ...f, [field]: val }));
      setErrors((e) => ({ ...e, [field]: '' }));
    };
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Item name is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = 'Enter a valid price';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSubmit({ ...form, price: parseFloat(Number(form.price).toFixed(2)) });
  }

  return (
    <div className="space-y-4">
      <Input
        label="Item Name *"
        placeholder="e.g. Butter Chicken"
        value={form.name}
        onChange={(e) => set('name')(e.target.value)}
        error={errors.name}
        icon={ChefHat}
      />
      <Textarea
        label="Description"
        placeholder="Brief description of the dish…"
        value={form.description ?? ""}
        onChange={(e) => set('description')(e.target.value)}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price (₹) *"
          placeholder="0.00"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => set('price')(e.target.value)}
          error={errors.price}
          icon={DollarSign}
        />
        <Input
          label="Image URL"
          placeholder="https://..."
          value={form.image_url ?? ""}
          onChange={(e) => set('image_url')(e.target.value)}
          icon={ImageIcon}
        />
      </div>
      <Toggle
        checked={form.is_available}
        onChange={set('is_available')}
        label="Available for ordering"
      />
      <div className="pt-2 flex justify-end gap-3">
        <Button variant="primary" loading={loading} onClick={handleSubmit}>
          {initial.id ? 'Save Changes' : 'Add Item'}
        </Button>
      </div>
    </div>
  );
}

// ─── Single item row ──────────────────────────────────────────────────────────
function ItemRow({ item, onEdit, onDelete, onToggle }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(item.id);
    setDeleting(false);
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-theme3 transition-colors group"
      style={{ borderColor: 'var(--border)' }}
    >
      <GripVertical size={14} className="text-theme2 opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-grab" />

      {/* Thumbnail */}
      <div
        className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
        style={{ background: 'var(--accentlt)' }}
      >
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <ChefHat size={16} style={{ color: 'var(--accent)' }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-theme truncate">{item.name}</p>
          {!item.is_available && <Badge variant="neutral">Hidden</Badge>}
        </div>
        {item.description && (
          <p className="text-xs text-theme2 truncate">{item.description}</p>
        )}
      </div>

      {/* Price */}
      <span className="text-sm font-bold text-theme flex-shrink-0">
        ₹{Number(item.price).toFixed(2)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggle(item)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-theme2 hover:bg-theme3 transition"
          title={item.is_available ? 'Hide item' : 'Show item'}
        >
          {item.is_available ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
        <button
          onClick={() => onEdit(item)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-theme2 hover:bg-theme3 transition"
          title="Edit item"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition"
          title="Delete item"
        >
          {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        </button>
      </div>
    </div>
  );
}

// ─── Category block ───────────────────────────────────────────────────────────
function CategoryBlock({ category, onRename, onDelete, onAddItem, onEditItem, onDeleteItem, onToggleItem, isAtCap }) {
  const [collapsed, setCollapsed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const items = category.items || [];

  async function handleDelete() {
    if (items.length > 0) {
      toast.error('Remove all items before deleting this category');
      return;
    }
    if (!confirm(`Delete category "${category.name}"?`)) return;
    setDeleting(true);
    await onDelete(category.id);
    setDeleting(false);
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      {/* Category header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--accentlt)' }}
      >
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          {collapsed ? <ChevronRight size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} /> : <ChevronDown size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
          <Tag size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <InlineEdit value={category.name} onSave={(name) => onRename(category.id, name)} />
          <Badge variant="default">{items.length}</Badge>
        </button>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => !isAtCap && onAddItem(category.id)}
            disabled={isAtCap}
            title={isAtCap ? 'Menu item limit reached' : 'Add item'}
          >
            <Plus size={13} /> Add item
          </Button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition disabled:opacity-50"
          >
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      </div>

      {/* Items */}
      {!collapsed && (
        <>
          {items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-theme2">No items yet.</p>
              {!isAtCap && (
                <button
                  onClick={() => onAddItem(category.id)}
                  className="mt-2 text-sm font-semibold underline"
                  style={{ color: 'var(--accent)' }}
                >
                  Add your first item
                </button>
              )}
            </div>
          ) : (
            items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
                onToggle={onToggleItem}
              />
            ))
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function MenuPanel() {
  const { hotel, menuItemCount, refreshMenuCount, isFreeTier, isOnTrial, limits } = useApp();
  const isAtMenuLimit = menuItemCount >= limits.maxMenuItems;
  const supabase = getSupabaseClient();
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // Modals
  const [itemModal, setItemModal] = useState({ open: false, item: null, categoryId: null });
  const [savingItem, setSavingItem] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // ── Load data ───────────────────────────────────────────────────────────────
  const loadMenu = useCallback(async () => {
    if (!hotel?.id) return;

    try {
      const { data: cats, error: catErr } = await supabase
        .from('categories')
        .select('id, name, sort_order')
        .eq('hotel_id', hotel.id)
        .order('sort_order', { ascending: true });

      if (catErr) throw catErr;

      if (!cats?.length) { dispatch({ type: 'LOADED', payload: [] }); return; }

      const { data: items, error: itemErr } = await supabase
        .from('menu_items')
        .select('id, name, description, price, image_url, is_available, sort_order, category_id')
        .eq('hotel_id', hotel.id)
        .order('sort_order', { ascending: true });

      if (itemErr) throw itemErr;

      const categoryMap = cats.map((c) => ({
        ...c,
        items: (items || []).filter((i) => i.category_id === c.id),
      }));

      dispatch({ type: 'LOADED', payload: categoryMap });
    } catch (err) {
      console.error('[MenuPanel] loadMenu:', err);
      dispatch({ type: 'ERROR', payload: err.message });
      toast.error('Failed to load menu');
    }
  }, [hotel?.id, supabase]);

  useEffect(() => { loadMenu(); }, [loadMenu]);

  // ── Category actions ─────────────────────────────────────────────────────────
  async function addCategory() {
    const name = newCatName.trim();
    if (!name) { toast.error('Category name required'); return; }
    setAddingCategory(true);
    try {
      const maxOrder = Math.max(0, ...state.categories.map((c) => c.sort_order ?? 0));
      const { data, error } = await supabase
        .from('categories')
        .insert({ hotel_id: hotel.id, name, sort_order: maxOrder + 1 })
        .select()
        .single();
      if (error) throw error;
      dispatch({ type: 'ADD_CATEGORY', payload: { ...data, items: [] } });
      setNewCatName('');
      toast.success(`Category "${name}" added`);
    } catch (err) {
      toast.error(err.message || 'Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  }

  async function renameCategory(id, name) {
    try {
      const { error } = await supabase.from('categories').update({ name }).eq('id', id);
      if (error) throw error;
      dispatch({ type: 'UPDATE_CATEGORY', payload: { id, name } });
      toast.success('Category renamed');
    } catch (err) {
      toast.error(err.message || 'Failed to rename');
    }
  }

  async function deleteCategory(id) {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      dispatch({ type: 'DELETE_CATEGORY', payload: id });
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  }

  // ── Item actions ──────────────────────────────────────────────────────────
  async function saveItem(formData) {
    setSavingItem(true);
    try {
      if (itemModal.item) {
        // Update
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: formData.name,
            description: formData.description || null,
            price: formData.price,
            image_url: formData.image_url || null,
            is_available: formData.is_available,
          })
          .eq('id', itemModal.item.id);
        if (error) throw error;
        dispatch({ type: 'UPDATE_ITEM', payload: { ...itemModal.item, ...formData } });
        toast.success('Item updated');
      } else {
        // Create
        if (isAtMenuLimit) { toast.error('Menu item limit reached — upgrade to add more'); return; }
        const maxOrder = Math.max(
          0,
          ...(state.categories.find((c) => c.id === itemModal.categoryId)?.items ?? []).map((i) => i.sort_order ?? 0)
        );
        const { data, error } = await supabase
          .from('menu_items')
          .insert({
            hotel_id: hotel.id,
            category_id: itemModal.categoryId,
            name: formData.name,
            description: formData.description || null,
            price: formData.price,
            image_url: formData.image_url || null,
            is_available: formData.is_available,
            sort_order: maxOrder + 1,
          })
          .select()
          .single();
        if (error) throw error;
        dispatch({ type: 'ADD_ITEM', payload: data });
        await refreshMenuCount();
        toast.success('Item added');
      }
      setItemModal({ open: false, item: null, categoryId: null });
    } catch (err) {
      toast.error(err.message || 'Failed to save item');
    } finally {
      setSavingItem(false);
    }
  }

  async function deleteItem(id) {
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
      dispatch({ type: 'DELETE_ITEM', payload: id });
      await refreshMenuCount();
      toast.success('Item deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete item');
    }
  }

  async function toggleItemAvailability(item) {
    const next = !item.is_available;
    dispatch({ type: 'UPDATE_ITEM', payload: { id: item.id, is_available: next } });
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: next })
        .eq('id', item.id);
      if (error) throw error;
    } catch (err) {
      // Rollback
      dispatch({ type: 'UPDATE_ITEM', payload: { id: item.id, is_available: item.is_available } });
      toast.error('Failed to update availability');
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  if (state.error) {
    return (
      <Alert
        type="error"
        title="Failed to load menu"
        message={state.error}
        action={<Button size="sm" onClick={loadMenu}>Retry</Button>}
      />
    );
  }

  const totalItems = menuItemCount;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-syne font-bold text-2xl text-theme">Menu Builder</h1>
          <p className="text-sm text-theme2 mt-0.5">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
            {(isFreeTier || isOnTrial) && ` · ${isOnTrial ? "Trial" : "Free"} plan: ${totalItems}/${limits.maxMenuItems}`}
          </p>
        </div>
      </div>

      {/* Free tier cap nudge */}
      {isFreeTier && isAtMenuLimit && (
        <Alert
          type="warning"
          title={`Item limit reached (${limits.maxMenuItems}/${limits.maxMenuItems} on ${isOnTrial ? "Trial" : "Free"} plan)`}
          message="Upgrade to Starter or Pro to add unlimited items."
          action={
            <button
              className="flex-shrink-0 flex items-center gap-1 text-xs font-bold"
              style={{ color: 'var(--accent)' }}
            >
              <Zap size={12} /> Upgrade
            </button>
          }
        />
      )}

      {/* Add category row */}
      <div className="flex gap-2">
        <input
          placeholder="New category name (e.g. Starters, Mains, Desserts)"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          className="flex-1 px-4 py-2.5 rounded-xl border bg-card text-theme text-sm placeholder:text-theme2 outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition"
          style={{ borderColor: 'var(--border)' }}
        />
        <Button variant="primary" loading={addingCategory} onClick={addCategory}>
          <Plus size={15} /> Add Category
        </Button>
      </div>

      {/* Categories */}
      {state.categories.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="No categories yet"
          description="Start by adding a category like 'Starters', 'Mains', or 'Drinks', then add items to it."
          action={
            <Button variant="primary" onClick={() => { setNewCatName('Mains'); setTimeout(addCategory, 100); }}>
              <Plus size={15} /> Add first category
            </Button>
          }
        />
      ) : (
        state.categories.map((cat) => (
          <CategoryBlock
            key={cat.id}
            category={cat}
            isAtCap={isFreeTier && isAtMenuLimit}
            onRename={renameCategory}
            onDelete={deleteCategory}
            onAddItem={(catId) => setItemModal({ open: true, item: null, categoryId: catId })}
            onEditItem={(item) => setItemModal({ open: true, item, categoryId: item.category_id })}
            onDeleteItem={deleteItem}
            onToggleItem={toggleItemAvailability}
          />
        ))
      )}


      {isFreeTier && !isAtMenuLimit && totalItems > 10 && (
        <UpgradeNudge message={`${limits.maxMenuItems - totalItems} item slot${limits.maxMenuItems - totalItems !== 1 ? 's' : ''} left on Free plan — upgrade for unlimited`} />
      )}

      {/* Item modal */}
      <Modal
        open={itemModal.open}
        onClose={() => setItemModal({ open: false, item: null, categoryId: null })}
        title={itemModal.item ? 'Edit Item' : 'Add Item'}
      >
        <ItemForm
          initial={itemModal.item || EMPTY_ITEM}
          onSubmit={saveItem}
          loading={savingItem}
          currentCategoryId={itemModal.categoryId}
        />
      </Modal>
    </div>
  );
}