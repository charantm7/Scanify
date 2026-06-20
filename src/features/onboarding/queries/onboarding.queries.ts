import type { SupabaseClient, Session, PostgrestError, AuthError } from '@supabase/supabase-js';
import type { HotelInsert, HotelRow } from '../../../types/supabase';
import { TypedSupabaseClient, PlanType, SubscriptionStatus } from '../../../types/supabase';
import { buildSlug } from '../constants';

/**
 * NOTE: cuisine_types / restaurant_types / service_types are not yet part of the
 * generated `HotelInsert` type. Once the `hotels` table has these columns added
 * (see README in this folder), regenerate your Supabase types and drop this
 * intersection — `HotelInsert` will cover it natively.
 */
export type HotelInsertWithPreferences = HotelInsert & {
    cuisine_type: string[];
    restaurant_type: string[];
    service_type: string[];
};

export interface UserProfileUpdate {
    name: string;
    phone: string;
    restaurant_name: string;
    onboarding_complete: boolean;
    email: string;
}

export interface SubscriptionRecord {
    user_id: string;
    plan: PlanType;
    status: SubscriptionStatus;
    hotel_id: string;
    trial_ends_at: string;
}

export async function getSession(supabase: SupabaseClient): Promise<{
    session: Session | null;
    error: AuthError | null;
}> {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
}

export async function insertHotel(
    supabase: SupabaseClient,
    payload: HotelInsertWithPreferences
): Promise<HotelRow | null> {
    const { data, error } = await supabase.from('hotels').insert(payload).select().maybeSingle();
    if (error) {
        throw error
    }
    return data;

}

export async function updateUserProfile(
    supabase: SupabaseClient,
    userId: string,
    data: UserProfileUpdate
) {
    const { error } = await supabase.from('users').update(data).eq('id', userId);
    if (error) {
        throw error
    }
}

export async function createSubscriptionRecord(
    supabase: TypedSupabaseClient,
    payload: SubscriptionRecord,
) {
    const { error } = await supabase.from('subscriptions').insert(payload as any);
    if (error) {
        throw error;
    }
}


export async function generateUniqueSlug(
    supabase: TypedSupabaseClient,
    restaurantName: string
) {
    const baseSlug = buildSlug(restaurantName);

    const { data, error } = await supabase.from('hotels').select('slug').like('slug', `${baseSlug}`);

    if (error) throw error;

    if (!data || data.length === 0) {
        return baseSlug;
    }

    const existingSlug = new Set(data.map((row) => row.slug))

    let slug = baseSlug;
    let counter = 1

    while (existingSlug.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}