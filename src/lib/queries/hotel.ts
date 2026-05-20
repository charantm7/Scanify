/*
All the queries for 'hotels'
*/

import type { TypedSupabaseClient, HotelRow, HotelInsert, HotelUpdate } from "../../types/supabase";

// Reads --------------------------

/**
* Fetch the owners hotel
* Hotel has a unique(ownerId) constraint - one hotel per user
* Used in the AppContext Bootstrap
 */
export async function getHotelByOwner(
    supabase: TypedSupabaseClient,
    ownerId: string
): Promise<HotelRow | null> {

    const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle();

    if (error) {
        console.error('[query:hotel] getHotelByOwner error:', error.message);
        return null;
    }

    return data;
}

/***
 * Check the slug is already taken before creating/updating a hotel
 * Returns true if same slug is present in DB and exclues current hotel's own slug.
 * Used in onboarding while creating hotel and in settings form.
 */
export async function isSlugTaken(
    supabase: TypedSupabaseClient,
    slug: string,
    excludeHotelId: string
): Promise<boolean> {
    let query = supabase
        .from('hotels')
        .select('id')
        .eq('slug', slug)

    if (excludeHotelId) {
        query = query.neq('id', excludeHotelId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) throw new Error(`isSlugTaken: ${error.message}`);

    return data !== null;
}

/**
 * Fetch the Hotel using slug
 * Slug is unique constraint for identification of hotel using hotel name.
 * Used in MenuDisplay panel to get hotel
 */
export async function getHotelBySlug(
    supabase: TypedSupabaseClient,
    slug: string,
): Promise<HotelRow | null> {
    const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

    if (error) {
        console.error('[query:hotel] getHotelBySlug error:', error.message);
        return null;
    }
    return data;
}



// Hotel Writes ------------------------------

/***
 * creates hotel during onboarding
 */
export async function createHotel(
    supabase: TypedSupabaseClient,
    payload: HotelInsert,
): Promise<HotelRow> {
    const { data, error } = await supabase
        .from('hotels')
        .insert(payload)
        .select()
        .single();

    if (error) throw new Error(`createHotel: ${error.message}`);
    return data;
}

/**
 * Update hotel settings (name, description, address, theme, etc.).
 * slug updates go through isSlugTaken() first.
 */

export async function updateHotel(
    supabase: TypedSupabaseClient,
    hotelId: string,
    patch: HotelUpdate,
): Promise<HotelRow> {
    const { data, error } = await supabase
        .from('hotels')
        .update(patch)
        .eq('id', hotelId)
        .select()
        .single();

    if (error) throw new Error(`updateHotel: ${error.message}`);
    return data;
}

/**
 * Soft-delete: deactivate a hotel instead of deleting it.
 * Keeps all menu data intact. The public menu page will 404.
 */
export async function deactivateHotel(
    supabase: TypedSupabaseClient,
    hotelId: string,
): Promise<void> {
    const { error } = await supabase
        .from('hotels')
        .update({ is_active: false })
        .eq('id', hotelId);

    if (error) throw new Error(`deactivateHotel: ${error.message}`);
}