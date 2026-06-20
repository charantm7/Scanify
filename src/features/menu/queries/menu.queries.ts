import { TypedSupabaseClient } from '../../../types/supabase';
import type { Category, MenuItem } from '../types';


const CATEGORY_COLUMNS = 'id, name, sort_order';
const ITEM_COLUMNS =
  'id, name, description, price, variants, image_url, is_available, dietary_type, tags, sort_order, category_id';

// ── Categories ───────────────────────────────────────────────────────────

export async function fetchCategoriesQuery(supabase: TypedSupabaseClient, hotelId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .eq('hotel_id', hotelId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Array<Omit<Category, 'items' | 'hotel_id'>>;
}

export async function insertCategoryQuery(
  supabase: TypedSupabaseClient,
  payload: { hotel_id: string; name: string; icon: string | null; sort_order: number }
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

export async function fetchItemsQuery(supabase: TypedSupabaseClient, hotelId: string) {
  const { data, error } = await supabase
    .from('menu_items')
    .select(ITEM_COLUMNS)
    .eq('hotel_id', hotelId)
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
    .single();
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
