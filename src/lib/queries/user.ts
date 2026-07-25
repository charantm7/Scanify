import { TypedSupabaseClient, UserRow, PlanLimitsRow, UserInsert, UserUpdate } from "../../types/supabase";

// Read
// Fetch the public.users from the given userId

export async function getUserProfile(
    supabase: TypedSupabaseClient,
    userId: string,
): Promise<UserRow | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

    if (error) {
        console.error('[query:user] getUserProfile error:', error.message);
        return null;
    }

    return data;
}

// Fetch the public.user with only onboarding column

export async function getUserProfileWithOnboarding(
    supabase: TypedSupabaseClient,
    userId: string,
): Promise<Pick<UserRow, 'onboarding_complete'> | null> {
    const { data, error } = await supabase
        .from('users')
        .select('onboarding_complete')
        .eq('id', userId)
        .maybeSingle()

    if (error) {
        console.error('[query:user] getUserProfileWithOnboarding error:', error.message);
        return null;
    }

    return data;
}

// Fetch the plan limits

export async function getAllPlanLimits(
    supabase: TypedSupabaseClient,
): Promise<PlanLimitsRow[]> {
    const { data, error } = await supabase.from('plan_limits').select('*');

    if (error) {
        console.error('[query:user] getAllPlanLimits error:', error.message);
        return [];
    }

    return data ?? [];
}


// Write 
// Create the public.users row after a new auth signup.

export async function createUserProfile(
    supabase: TypedSupabaseClient,
    payload: UserInsert
): Promise<UserRow> {
    const { data, error } = await supabase
        .from('users')
        .insert(payload)
        .select()
        .single();
    if (error) {
        console.error('[query:user] createUserProfile error:', error.message);
        return null;
    }

    return data;
}

// Update UserProfile
// Updatable fields: name, phone, restaurant_name, onboarding_complete, email, is_verified etc..
// Returns the full updated row so callers can sync local state.

export async function updateUserProfile(
    supabase: TypedSupabaseClient,
    userId: string,
    patch: UserUpdate
): Promise<UserRow> {
    const { data, error } = await supabase
        .from('users')
        .update(patch)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('[query:user] updateUserProfile error:', error.message);
        return null;
    }

    return data;
}

/**
 * Mark onboarding as complete. Thin wrapper over updateUserProfile
 * so call-sites are explicit about intent.
 */

export async function completeOnboarding(
    supabase: TypedSupabaseClient,
    userId: string,
): Promise<void> {
    const { error } = await supabase
        .from('users')
        .update({ onboarding_complete: true })
        .eq('id', userId);

    if (error) throw new Error("completeOnboarding: ${error.message}")

}
