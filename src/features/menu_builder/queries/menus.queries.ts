// src/features/menu_builder/queries/menus.queries.ts
//
// Raw Supabase access for the `menus` table. No toasts, no business rules —
// those live in services/menus.services.ts, matching how menu.queries.ts and
// menu.services.ts are split.

import { TypedSupabaseClient } from '../../../types/supabase';
import type { Menu } from '../types';

const MENU_COLUMNS =
  'id, hotel_id, name, slug, description, is_primary, is_active, hidden_by_plan, sort_order';

/**
 * Every menu the owner has, including ones a downgrade parked
 * (`hidden_by_plan`) — the builder must show those so the owner can decide
 * what to do about them. Soft-deleted rows are excluded.
 */
export async function fetchMenusQuery(
  supabase: TypedSupabaseClient,
  hotelId: string
): Promise<Menu[]> {
  const { data, error } = await supabase
    .from('menus')
    .select(MENU_COLUMNS)
    .eq('hotel_id', hotelId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as Menu[];
}

export async function insertMenuQuery(
  supabase: TypedSupabaseClient,
  payload: {
    hotel_id: string;
    name: string;
    slug: string;
    description?: string | null;
    is_primary?: boolean;
    sort_order: number;
  }
): Promise<Menu> {
  const { data, error } = await supabase
    .from('menus')
    .insert(payload as never)
    .select(MENU_COLUMNS)
    .single();

  if (error) throw error;
  return data as unknown as Menu;
}

export async function updateMenuQuery(
  supabase: TypedSupabaseClient,
  id: string,
  patch: Partial<{
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    hidden_by_plan: boolean;
    sort_order: number;
    /**
     * Only set alongside hidden_by_plan, when swapping which menu is live.
     * For an ordinary promotion use setPrimaryMenuQuery, which clears the old
     * primary first — the partial unique index allows just one per hotel.
     */
    is_primary: boolean;
  }>
): Promise<void> {
  const { error } = await supabase.from('menus').update(patch as never).eq('id', id);
  if (error) throw error;
}

/**
 * Soft delete. The menus row keeps its slug reservation out of the way of the
 * `(hotel_id, slug)` unique constraint only while it exists, so a soft-deleted
 * menu still blocks reuse of its slug — acceptable, and it means a mistaken
 * delete is recoverable rather than cascading every category and item away.
 */
export async function softDeleteMenuQuery(
  supabase: TypedSupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('menus')
    .update({ deleted_at: new Date().toISOString(), is_primary: false } as never)
    .eq('id', id);
  if (error) throw error;
}

/**
 * Moves the primary flag. Done as two sequential writes because the partial
 * unique index `menus_one_primary_per_hotel` would reject any moment where two
 * rows in the same hotel are primary — so the old one must be cleared first.
 */
export async function setPrimaryMenuQuery(
  supabase: TypedSupabaseClient,
  hotelId: string,
  menuId: string
): Promise<void> {
  const { error: clearError } = await supabase
    .from('menus')
    .update({ is_primary: false } as never)
    .eq('hotel_id', hotelId)
    .eq('is_primary', true);
  if (clearError) throw clearError;

  const { error: setError } = await supabase
    .from('menus')
    .update({ is_primary: true } as never)
    .eq('id', menuId);
  if (setError) throw setError;
}

export async function reorderMenusQuery(
  supabase: TypedSupabaseClient,
  updates: { id: string; sort_order: number }[]
): Promise<void> {
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from('menus').update({ sort_order } as never).eq('id', id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

/** Slugs already taken for this hotel, so a new one can be de-duplicated. */
export async function fetchTakenMenuSlugsQuery(
  supabase: TypedSupabaseClient,
  hotelId: string
): Promise<string[]> {
  // Includes soft-deleted rows on purpose: the unique constraint covers them
  // too, so reusing their slug would fail at insert time.
  const { data, error } = await supabase
    .from('menus')
    .select('slug')
    .eq('hotel_id', hotelId);

  if (error) throw error;
  return (data ?? []).map((row) => (row as { slug: string }).slug);
}
