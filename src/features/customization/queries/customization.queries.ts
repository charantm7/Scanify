// features/customization/queries/customization.queries.ts
// Typed Supabase query wrappers — no business logic here.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DBMenuCustomization } from '../types';

export async function fetchCustomization(
    supabase: SupabaseClient,
    hotelId: string,
): Promise<DBMenuCustomization | null> {
    const { data, error } = await supabase
        .from('menu_customizations')
        .select('*')
        .eq('hotel_id', hotelId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function upsertCustomization(
    supabase: SupabaseClient,
    hotelId: string,
    payload: Partial<Omit<DBMenuCustomization, 'id' | 'hotel_id' | 'created_at' | 'updated_at'>>,
): Promise<DBMenuCustomization> {
    const { data, error } = await supabase
        .from('menu_customizations')
        .upsert(
            { hotel_id: hotelId, ...payload, updated_at: new Date().toISOString() },
            { onConflict: 'hotel_id' },
        )
        .select()
        .single();

    if (error) throw error;
    return data;
}
