import type { SupabaseClient } from '@supabase/supabase-js';
import type { HotelInsertPayload } from '../types';

// ─── User profile update ───────────────────────────────────────────────────────
export async function updateUserProfile(
    supabase: SupabaseClient,
    {
        id,
        name,
        phone,
        restaurantName,
    }: {
        id: string;
        name: string;
        phone: string | null;
        restaurantName: string;
    },
) {
    const { error } = await supabase
        .from('users')
        .update({
            name,
            phone,
            restaurant_name: restaurantName,
            onboarding_complete: true,
        })
        .eq('id', id);

    if (error) throw error;
}

// ─── Hotel / restaurant insert ─────────────────────────────────────────────────
// Requires new columns on the `hotels` table:
//   restaurant_type  text[]
//   cuisine_type     text[]
//   service_type     text[]
//   website          text
//
// Migration SQL (run in Supabase SQL editor):
//   ALTER TABLE hotels
//     ADD COLUMN IF NOT EXISTS restaurant_type text[] DEFAULT '{}',
//     ADD COLUMN IF NOT EXISTS cuisine_type     text[] DEFAULT '{}',
//     ADD COLUMN IF NOT EXISTS service_type     text[] DEFAULT '{}',
//     ADD COLUMN IF NOT EXISTS website          text;
export async function insertHotel(
    supabase: SupabaseClient,
    payload: HotelInsertPayload,
) {
    const { error } = await supabase.from('hotels').insert(payload);
    if (error) throw error;
}

// ─── Slug uniqueness check ─────────────────────────────────────────────────────
export async function checkSlugAvailable(
    supabase: SupabaseClient,
    slug: string,
): Promise<boolean> {
    const { data, error } = await supabase
        .from('hotels')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

    if (error) throw error;
    return data === null; // true = available
}