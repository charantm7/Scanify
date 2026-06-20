// src/features/menu/services/menu.services.ts
//
// Orchestration layer: composes queries, shapes data for the UI, owns
// success-toast copy and validation-adjacent transforms (e.g. variant
// cleanup). Errors are thrown upward and handled centrally by useMenu's
// run-style wrappers — mirroring how AuthSignIn/AuthSignUp behave in
// services/login.services.ts.

import type { Category, MenuItem, ItemFormValues, PriceVariant } from '../types';
import {
  fetchCategoriesQuery,
  fetchItemsQuery,
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
  };
}

// ── Read ─────────────────────────────────────────────────────────────────

export async function loadMenuData(supabase: TypedSupabaseClient, hotelId: string): Promise<Category[]> {
  const categories = await fetchCategoriesQuery(supabase, hotelId);
  if (!categories.length) return [];

  const items = await fetchItemsQuery(supabase, hotelId);

  return categories.map((c) => ({
    ...c,
    icon: c.icon ?? null,
    items: items.filter((i) => i.category_id === c.id),
  }));
}

// ── Categories ───────────────────────────────────────────────────────────

export async function createCategory(
  supabase: TypedSupabaseClient,
  hotelId: string,
  name: string,
  icon: string | null,
  existing: Category[],
  toast: ToastApi
): Promise<Category> {
  const data = await insertCategoryQuery(supabase, {
    hotel_id: hotelId,
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

export async function persistItemOrder(supabase: TypedSupabaseClient, items: MenuItem[]) {
  await reorderItemsQuery(
    supabase,
    items.map((item, index) => ({ id: item.id, sort_order: index + 1 }))
  );
}
