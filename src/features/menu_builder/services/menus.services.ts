// src/features/menu_builder/services/menus.services.ts
//
// Business rules for menus: slug generation, the plan-limit error message,
// and the invariants the UI must not be allowed to break (never delete the
// last menu, never leave a hotel without a primary). Errors are thrown upward
// for useMenus to catch and toast, matching menu.services.ts.

import type { Menu } from '../types';
import { toMenuSlug } from '../../../lib/domains';
import {
  fetchMenusQuery,
  fetchTakenMenuSlugsQuery,
  insertMenuQuery,
  reorderMenusQuery,
  setPrimaryMenuQuery,
  softDeleteMenuQuery,
  updateMenuQuery,
} from '../queries/menus.queries';
import { TypedSupabaseClient } from '../../../types/supabase';

type ToastApi = { success: (msg: string) => void; error: (msg: string) => void };

/** Matches the message raised by the enforce_menu_limit database trigger. */
const MENU_LIMIT_MARKER = 'menu_limit_reached';

export function isMenuLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? '');
  return message.includes(MENU_LIMIT_MARKER);
}

/**
 * Turns a name into a slug that satisfies the `menus_slug_check` constraint
 * and is unique within the hotel.
 *
 * A name of only punctuation or non-Latin characters slugifies to an empty
 * string, which the constraint rejects, so fall back to a generic stem rather
 * than letting the insert fail.
 */
export function buildUniqueMenuSlug(name: string, taken: string[]): string {
  const base = toMenuSlug(name) || 'menu';
  const used = new Set(taken);

  if (!used.has(base)) return base;

  for (let n = 2; n < 100; n += 1) {
    const candidate = `${base}-${n}`;
    if (!used.has(candidate)) return candidate;
  }

  // Practically unreachable; keeps the function total rather than looping.
  return `${base}-${Date.now().toString(36)}`;
}

function nextSortOrder(menus: { sort_order?: number | null }[]): number {
  if (!menus.length) return 1;
  return Math.max(...menus.map((m) => m.sort_order ?? 0)) + 1;
}

// ── Read ───────────────────────────────────────────────────────────────────

export async function loadMenus(
  supabase: TypedSupabaseClient,
  hotelId: string
): Promise<Menu[]> {
  return fetchMenusQuery(supabase, hotelId);
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createMenu(
  supabase: TypedSupabaseClient,
  hotelId: string,
  name: string,
  existing: Menu[],
  toast: ToastApi
): Promise<Menu> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Give the menu a name');

  const taken = await fetchTakenMenuSlugsQuery(supabase, hotelId);
  const slug = buildUniqueMenuSlug(trimmed, taken);

  try {
    const menu = await insertMenuQuery(supabase, {
      hotel_id: hotelId,
      name: trimmed,
      slug,
      // The first menu a hotel ever gets must be primary, or nothing is served
      // at /<hotel-slug>. Every later one is secondary until promoted.
      is_primary: existing.length === 0,
      sort_order: nextSortOrder(existing),
    });

    toast.success(`Menu "${trimmed}" created`);
    return menu;
  } catch (err) {
    if (isMenuLimitError(err)) {
      throw new Error("You've reached the menu limit for your plan. Upgrade to add more.");
    }
    throw err;
  }
}

// ── Update ─────────────────────────────────────────────────────────────────

export async function renameMenuService(
  supabase: TypedSupabaseClient,
  id: string,
  name: string,
  toast: ToastApi
): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Give the menu a name');

  // The slug is deliberately NOT regenerated on rename: it is baked into
  // printed QR codes and any link the owner has already shared.
  await updateMenuQuery(supabase, id, { name: trimmed });
  toast.success('Menu renamed');
}

export async function setMenuActiveService(
  supabase: TypedSupabaseClient,
  menu: Menu,
  isActive: boolean,
  toast: ToastApi
): Promise<void> {
  // Hiding the primary menu would leave /<hotel-slug> resolving to nothing,
  // which is the URL on every QR code already in the wild.
  if (!isActive && menu.is_primary) {
    throw new Error('Make another menu primary before hiding this one.');
  }

  await updateMenuQuery(supabase, menu.id, { is_active: isActive });
  toast.success(isActive ? 'Menu is live' : 'Menu hidden');
}

export async function setPrimaryMenuService(
  supabase: TypedSupabaseClient,
  hotelId: string,
  menu: Menu,
  toast: ToastApi
): Promise<void> {
  if (!menu.is_active || menu.hidden_by_plan) {
    throw new Error('Only a live menu can be the primary one.');
  }

  await setPrimaryMenuQuery(supabase, hotelId, menu.id);
  toast.success(`"${menu.name}" is now your main menu`);
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function removeMenu(
  supabase: TypedSupabaseClient,
  menu: Menu,
  existing: Menu[],
  toast: ToastApi
): Promise<{ newPrimaryId: string | null }> {
  const remaining = existing.filter((m) => m.id !== menu.id && !m.hidden_by_plan);

  if (!remaining.length) {
    throw new Error('A hotel needs at least one menu. Create another before deleting this one.');
  }

  await softDeleteMenuQuery(supabase, menu.id);

  // Deleting the primary would leave the hotel with no menu at /<hotel-slug>,
  // so promote the next one rather than requiring a second manual step.
  let newPrimaryId: string | null = null;
  if (menu.is_primary) {
    const next = remaining.find((m) => m.is_active) ?? remaining[0]!;
    await setPrimaryMenuQuery(supabase, menu.hotel_id, next.id);
    newPrimaryId = next.id;
  }

  toast.success(`Menu "${menu.name}" deleted`);
  return { newPrimaryId };
}

// ── Reorder ────────────────────────────────────────────────────────────────

export async function persistMenuOrder(
  supabase: TypedSupabaseClient,
  menus: Menu[]
): Promise<void> {
  await reorderMenusQuery(
    supabase,
    menus.map((m, index) => ({ id: m.id, sort_order: index + 1 }))
  );
}
