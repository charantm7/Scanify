// src/features/menu/services/menu.services.ts
//
// Orchestration layer: composes queries, shapes data for the UI, owns
// success-toast copy and validation-adjacent transforms (e.g. variant
// cleanup). Errors are thrown upward and handled centrally by useMenu's
// run-style wrappers — mirroring how AuthSignIn/AuthSignUp behave in
// services/login.services.ts.

import type { Category, MenuItem, ItemFormValues, PriceVariant } from '../types';
import {
  fetchMenuTreeQuery,
  insertCategoryQuery,
  updateCategoryQuery,
  deleteCategoryQuery,
  reorderCategoriesQuery,
  insertItemQuery,
  updateItemQuery,
  deleteItemQuery,
  reorderItemsQuery,
} from '../queries/menu.queries';
import { TypedSupabaseClient } from '../../../types/supabase';


type ToastApi = { success: (msg: string) => void; error: (msg: string) => void };

function nextSortOrder(items: { sort_order?: number | null }[]): number {
  if (!items.length) return 1;
  return Math.max(...items.map((i) => i.sort_order ?? 0)) + 1;
}

function sanitizeVariants(variants: PriceVariant[]): PriceVariant[] | null {
  const cleaned = variants
    .filter((v) => v.label.trim() && !Number.isNaN(Number(v.price)))
    .map((v) => ({ id: v.id, label: v.label.trim(), price: Number(v.price) }));
  return cleaned.length ? cleaned : null;
}

// These three tolerate undefined as well as empty. The form type guarantees
// the fields, but a saved draft or an older cached form shape should not be
// able to crash a save — it should just mean "not specified".

function optionalText(value: string | undefined): string | null {
  return value?.trim() || null;
}

/** Empty -> null, so an unfilled optional number isn't stored as 0. */
function optionalInt(value: string | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

function optionalList(values: string[] | undefined): string[] | null {
  const cleaned = (values ?? []).map((v) => v.trim()).filter(Boolean);
  return cleaned.length ? cleaned : null;
}

function buildItemPayload(form: ItemFormValues) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    price: Number(parseFloat(form.price).toFixed(2)),
    variants: sanitizeVariants(form.variants),
    image_url: form.image_url.trim() || null,
    is_available: form.is_available,
    dietary_type: form.dietary_type || null,
    tags: form.tags.length ? form.tags : null,
    spice_level: form.spice_level || null,

    // Extended details. Always written, even on a plan that cannot display
    // them: the owner's content is preserved so an upgrade brings it straight
    // back, and the public menu decides what to SHOW (see
    // features/menu/utils/plan-presentation.ts).
    serving_size: optionalText(form.serving_size),
    preparation_time: optionalInt(form.preparation_time),
    calories: optionalInt(form.calories),
    ingredients: optionalList(form.ingredients),
    allergens: optionalList(form.allergens),
  };
}

// ── Read ─────────────────────────────────────────────────────────────────

export async function loadMenuData(
  supabase: TypedSupabaseClient,
  menuId: string
): Promise<Category[]> {
  const categories = await fetchMenuTreeQuery(supabase, menuId);

  return categories.map((c) => ({
    ...c,
    icon: c.icon ?? null,
    items: c.items ?? [],
  }));
}

// ── Categories ───────────────────────────────────────────────────────────

export async function createCategory(
  supabase: TypedSupabaseClient,
  hotelId: string,
  menuId: string,
  name: string,
  icon: string | null,
  existing: Category[],
  toast: ToastApi
): Promise<Category> {
  const data = await insertCategoryQuery(supabase, {
    hotel_id: hotelId,
    menu_id: menuId,
    name,
    icon,
    sort_order: nextSortOrder(existing),
  });
  toast.success(`Category "${name}" added`);
  return { ...data, items: [] };
}

export async function renameCategoryService(supabase: TypedSupabaseClient, id: string, name: string, toast: ToastApi) {
  await updateCategoryQuery(supabase, id, { name });
  toast.success('Category renamed');
}

export async function updateCategoryIconService(supabase: TypedSupabaseClient, id: string, icon: string, toast: ToastApi) {
  await updateCategoryQuery(supabase, id, { icon });
  toast.success('Category icon updated');
}

export async function removeCategory(supabase: TypedSupabaseClient, id: string, toast: ToastApi) {
  await deleteCategoryQuery(supabase, id);
  toast.success('Category deleted');
}

export async function persistCategoryOrder(supabase: TypedSupabaseClient, categories: Category[]) {
  await reorderCategoriesQuery(
    supabase,
    categories.map((c, index) => ({ id: c.id, sort_order: index + 1 }))
  );
}

// ── Items ────────────────────────────────────────────────────────────────

export async function createItem(
  supabase: TypedSupabaseClient,
  hotelId: string,
  categoryId: string,
  form: ItemFormValues,
  existing: MenuItem[],
  toast: ToastApi
): Promise<MenuItem> {
  const data = await insertItemQuery(supabase, {
    ...buildItemPayload(form),
    hotel_id: hotelId,
    category_id: categoryId,
    sort_order: nextSortOrder(existing),
  });
  toast.success('Item added');
  return data;
}

export async function updateItemService(
  supabase: TypedSupabaseClient,
  id: string,
  form: ItemFormValues,
  toast: ToastApi
) {
  const payload = buildItemPayload(form);
  await updateItemQuery(supabase, id, payload);
  toast.success('Item updated');
  return payload;
}

export async function removeItem(supabase: TypedSupabaseClient, id: string, toast: ToastApi) {
  await deleteItemQuery(supabase, id);
  toast.success('Item deleted');
}

export async function setItemAvailabilityService(supabase: TypedSupabaseClient, id: string, isAvailable: boolean) {
  await updateItemQuery(supabase, id, { is_available: isAvailable });
}

/** Matches the message raised by the enforce_menu_item_limit database trigger. */
const ITEM_LIMIT_MARKER = 'item_limit_reached';

export function isItemLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? '');
  return message.includes(ITEM_LIMIT_MARKER);
}

/**
 * Swaps which items a downgrade keeps out of service.
 *
 * `hidden_by_plan` is deliberately separate from `is_available`: that column is
 * the owner's "sold out today" switch, and reusing it would make an automatic
 * plan action indistinguishable from their own choice.
 *
 * Bringing an item back is only possible while the plan has a free slot, which
 * the database enforces — so the supported move is to hide something else
 * first. The raw trigger message is translated here into that instruction.
 */
export async function setItemPlanHiddenService(
  supabase: TypedSupabaseClient,
  id: string,
  hidden: boolean
) {
  try {
    await updateItemQuery(supabase, id, { hidden_by_plan: hidden });
  } catch (err) {
    if (isItemLimitError(err)) {
      throw new Error(
        'Your plan is full. Hide another item first, then bring this one back.'
      );
    }
    throw err;
  }
}

export async function persistItemOrder(supabase: TypedSupabaseClient, items: MenuItem[]) {
  await reorderItemsQuery(
    supabase,
    items.map((item, index) => ({ id: item.id, sort_order: index + 1 }))
  );
}
