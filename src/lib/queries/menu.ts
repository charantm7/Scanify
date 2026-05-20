import type {
    TypedSupabaseClient,
    MenuItemRow,
    MenuItemInsert,
    MenuItemUpdate,
    CategoryRow,
    CategoryUpdate,
    CategoryInsert
} from '../../types/supabase'


// Types

// Categories with their items nested
// Used in the /menu/[slug] page
export interface CategoryWithItems extends CategoryRow {
    items: MenuItemRow[];
}

// Full menu data is fetched for public menu.
export interface PublicMenuData {
    items: MenuItemRow[];
    categories: CategoryRow[];
}


// Category Read ────────────────────────

// Fetch all categories for a hotel, ordered by sort_order.
// Used in console menuPanel
export async function getCategories(
    supabase: TypedSupabaseClient,
    hotelId: string,
): Promise<CategoryRow[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('hotel_id', hotelId)
        .order('sort_order', { ascending: true });

    if (error) throw new Error(`getCategories: ${error.message}`);
    return data ?? [];
}

// Category Write ────────────────────────

// Creates new category
export async function createCategory(
    supabase: TypedSupabaseClient,
    payload: CategoryInsert,
): Promise<CategoryRow> {
    const { data, error } = await supabase
        .from('categories')
        .insert(payload)
        .select()
        .single();

    if (error) throw new Error(`createCategory: ${error.message}`);
    return data;
}

// Update the category by its category Id
export async function updateCategory(
    supabase: TypedSupabaseClient,
    categoryId: string,
    patch: CategoryUpdate,
): Promise<CategoryRow> {
    const { data, error } = await supabase
        .from('categories')
        .update(patch)
        .eq('id', categoryId)
        .select()
        .single();

    if (error) throw new Error(`updateCategory: ${error.message}`);
    return data;
}

// Delete category, ON DELETE CASCADE it removes the menu items in this category automatically
export async function deleteCategory(
    supabase: TypedSupabaseClient,
    categoryId: string,
): Promise<void> {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

    if (error) throw new Error(`deleteCategory: ${error.message}`);
}


/**
 * Bulk-update sort_order for multiple categories in one round-trip.
 * Used when the user drags to reorder categories in the console.
 */
export async function reorderCategories(
    supabase: TypedSupabaseClient,
    updates: Array<{ id: string; sort_order: number }>,
): Promise<void> {
    const promises = updates.map(({ id, sort_order }) =>
        supabase.from('categories').update({ sort_order }).eq('id', id),
    );
    const results = await Promise.all(promises);
    const failed = results.find(r => r.error);
    if (failed?.error) throw new Error(`reorderCategories: ${failed.error.message}`);
}


// ─────────────────────────────────────────────────────────────────────────────
// MENU ITEMS — READ
// ─────────────────────────────────────────────────────────────────────────────


/**
 * Fetch all menu items for a hotel.
 * Returns all items regardless of availability — used in the console editor.
 */
export async function getMenuItems(
    supabase: TypedSupabaseClient,
    hotelId: string,
): Promise<MenuItemRow[]> {
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('hotel_id', hotelId)
        .order('sort_order', { ascending: true });

    if (error) throw new Error(`getMenuItems: ${error.message}`);
    return data ?? [];
}


/**
 * Count menu items for a hotel.
 * Used during AppContext bootstrap to check against plan limits.
 * head:true means Supabase returns only the count, not the rows — very fast.
 */
export async function getMenuItemCount(
    supabase: TypedSupabaseClient,
    hotelId: string,
): Promise<number> {
    const { count, error } = await supabase
        .from('menu_items')
        .select('id', { count: 'exact', head: true })
        .eq('hotel_id', hotelId);

    if (error) throw new Error(`getMenuItemCount: ${error.message}`);
    return count ?? 0;
}


/**
 * Fetch only available items for a specific category.
 * Used on the public /menu/[slug] page to render one category section.
 */
export async function getPublicMenuData(
    supabase: TypedSupabaseClient,
    hotelId: string,
): Promise<PublicMenuData> {
    const [categoriesResult, itemsResult] = await Promise.all([
        supabase
            .from('categories')
            .select('*')
            .eq('hotel_id', hotelId)
            .order('sort_order', { ascending: true }),

        supabase
            .from('menu_items')
            .select('*')
            .eq('hotel_id', hotelId)
            .eq('is_available', true)
            .order('sort_order', { ascending: true }),
    ]);

    if (categoriesResult.error) throw new Error(`getPublicMenuData(categories): ${categoriesResult.error.message}`);
    if (itemsResult.error) throw new Error(`getPublicMenuData(items): ${itemsResult.error.message}`);

    return {
        categories: categoriesResult.data ?? [],
        items: itemsResult.data ?? [],
    };
}



// ─────────────────────────────────────────────────────────────────────────────
// MENU ITEMS — WRITE
// ─────────────────────────────────────────────────────────────────────────────

export async function createMenuItem(
    supabase: TypedSupabaseClient,
    payload: MenuItemInsert,
): Promise<MenuItemRow> {
    const { data, error } = await supabase
        .from('menu_items')
        .insert(payload)
        .select()
        .single();

    if (error) throw new Error(`createMenuItem: ${error.message}`);
    return data;
}

export async function updateMenuItem(
    supabase: TypedSupabaseClient,
    itemId: string,
    patch: MenuItemUpdate,
): Promise<MenuItemRow> {
    const { data, error } = await supabase
        .from('menu_items')
        .update(patch)
        .eq('id', itemId)
        .select()
        .single();

    if (error) throw new Error(`updateMenuItem: ${error.message}`);
    return data;
}


export async function deleteMenuItem(
    supabase: TypedSupabaseClient,
    itemId: string,
): Promise<void> {
    const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

    if (error) throw new Error(`deleteMenuItem: ${error.message}`);
}


/**
 * Toggle a single item's availability on/off.
 * Used in the console for quick "86 this item" without opening the edit form.
 * Requires plan: item_availability_toggle = true.
 */
export async function toggleItemAvailability(
    supabase: TypedSupabaseClient,
    itemId: string,
    isAvailable: boolean,
): Promise<void> {
    const { error } = await supabase
        .from('menu_items')
        .update({ is_available: isAvailable })
        .eq('id', itemId);

    if (error) throw new Error(`toggleItemAvailability: ${error.message}`);
}

/**
 * Bulk-update sort_order for multiple items.
 * Used when the user drags to reorder items within a category.
 */
export async function reorderMenuItems(
    supabase: TypedSupabaseClient,
    updates: Array<{ id: string; sort_order: number }>,
): Promise<void> {
    const promises = updates.map(({ id, sort_order }) =>
        supabase.from('menu_items').update({ sort_order }).eq('id', id),
    );
    const results = await Promise.all(promises);
    const failed = results.find(r => r.error);
    if (failed?.error) throw new Error(`reorderMenuItems: ${failed.error.message}`);
}
