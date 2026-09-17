import { TypedSupabaseClient } from '../../../types/supabase';
import type { Category, MenuItem } from '../types';


const CATEGORY_COLUMNS = 'id, menu_id, name, icon, sort_order';
const ITEM_COLUMNS =
  'id, name, description, price, variants, image_url, is_available, hidden_by_plan, ' +
  'dietary_type, tags, sort_order, spice_level, category_id, ' +
  'serving_size, preparation_time, calories, ingredients, allergens';

// ── Categories ───────────────────────────────────────────────────────────

/**
 * Categories belong to a menu, not directly to the hotel, so the builder loads
 * them per selected menu. Filtering by hotel_id here would pull in every other
 * menu's categories.
 */
export async function fetchCategoriesQuery(supabase: TypedSupabaseClient, menuId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .eq('menu_id', menuId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Array<Omit<Category, 'items' | 'hotel_id'>>;
}

export async function insertCategoryQuery(
  supabase: TypedSupabaseClient,
  payload: {
    hotel_id: string;
    // NOT NULL since the menus migration — an insert without it is rejected.
    menu_id: string;
    name: string;
    icon: string | null;
    sort_order: number;
  }
) {
  const { data, error } = await supabase
    .from('categories')
    .insert(payload as any)
    .select(CATEGORY_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Omit<Category, 'items' | 'hotel_id'>;
}

export async function updateCategoryQuery(
  supabase: TypedSupabaseClient,
  id: string,
  patch: Partial<{ name: string; icon: string | null }>
) {
  const { error } = await supabase.from('categories').update(patch as any).eq('id', id);
  if (error) throw error;
}

export async function deleteCategoryQuery(supabase: TypedSupabaseClient, id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderCategoriesQuery(
  supabase: TypedSupabaseClient,
  updates: { id: string; sort_order: number }[]
) {
  const results = await Promise.all(
    updates.map(({ id, sort_order }) => supabase.from('categories').update({ sort_order }).eq('id', id))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

// ── Items ────────────────────────────────────────────────────────────────

/**
 * Scoped to the given categories rather than the whole hotel, so switching
 * menus doesn't load every item the hotel owns.
 */
export async function fetchItemsQuery(supabase: TypedSupabaseClient, categoryIds: string[]) {
  if (!categoryIds.length) return [];

  const { data, error } = await supabase
    .from('menu_items')
    .select(ITEM_COLUMNS)
    .in('category_id', categoryIds)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as MenuItem[];
}

export async function insertItemQuery(
  supabase: TypedSupabaseClient,
  payload: Omit<MenuItem, 'id'>
) {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(payload as any)
    .select(ITEM_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as MenuItem;
}

export async function updateItemQuery(
  supabase: TypedSupabaseClient,
  id: string,
  patch: Partial<MenuItem>
) {
  const { error } = await supabase.from('menu_items').update(patch as any).eq('id', id);
  if (error) throw error;
}

export async function deleteItemQuery(supabase: TypedSupabaseClient, id: string) {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderItemsQuery(
  supabase: TypedSupabaseClient,
  updates: { id: string; sort_order: number }[]
) {
  const results = await Promise.all(
    updates.map(({ id, sort_order }) => supabase.from('menu_items').update({ sort_order }).eq('id', id))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}
