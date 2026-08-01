import type { SupabaseClient, Session } from '@supabase/supabase-js';
import type { OnboardingFormState } from '../types';
import { buildSlug } from '../constants';
import {
    createSubscriptionRecord,
    generateUniqueSlug,
    getSession,
    insertHotel,
    updateUserProfile,
    type HotelInsertWithPreferences,
} from '../queries/onboarding.queries';

/**
 * Fetches the current Supabase session for the onboarding gate.
 * Throws if Supabase itself errors (network/auth issues) so the caller's
 * `run()` wrapper can surface it via toast — a missing session (logged out)
 * is a *normal* case and is just returned as `null`.
 */
export async function fetchOnboardingSession(supabase: SupabaseClient): Promise<Session | null> {
    const { session, error } = await getSession(supabase);
    if (error) throw error;
    return session;
}

/**
 * Persists the full onboarding form: creates the hotel record, marks the
 * owning user's profile as onboarded, and returns the generated slug.
 */
export async function submitOnboarding(
    supabase: SupabaseClient,
    userId: string,
    form: OnboardingFormState,
    email: string
): Promise<string> {
    const slug = await generateUniqueSlug(supabase, form.restaurant_name);
    const hotelPayload: HotelInsertWithPreferences = {
        owner_id: userId,
        name: form.restaurant_name.trim(),
        description: form.description.trim(),
        logo_url: form.logo_url.trim() || null,
        address: `${form.address.trim()}, ${form.city.trim()}`,
        pincode: form.pincode.trim(),
        slug,
        cuisine_type: form.cuisine_types,
        restaurant_type: form.restaurant_types,
        service_type: form.service_types,
    };

    const hotelData = await insertHotel(supabase, hotelPayload);


    await updateUserProfile(supabase, userId, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        restaurant_name: form.restaurant_name.trim(),
        onboarding_complete: true,
        email: email
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 4);

    await createSubscriptionRecord(supabase, {
        hotel_id: hotelData.id,
        user_id: userId,
        plan: 'starter',
        status: 'trialing',
        trial_ends_at: expiresAt.toISOString(),
        trial_used: true,
    })

    return slug;
}


export function getFriendlyError(err: any) {
    if (!err) {
        return 'Something went wrong.';
    }

    if (err.code === '23505') {
        switch (err.constraint) {
            case 'hotels_owner_id_key':
                return 'A restaurant with this name already exists.';

            case 'users_phone_key':
                return 'This phone number is already registered.';

            case 'subscriptions_user_id_key':
                return 'You already have an active subscription.';

            default:
                return 'This information already exists.';
        }
    }

    if (err.code === '42501') {
        return 'You do not have permission to perform this action.';
    }

    return err.message;
}
