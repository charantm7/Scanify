import type { TypedSupabaseClient, SubscriptionRow, SubscriptionInsert, SubscriptionUpdate } from "../../types/supabase";

// ─────────────────────────
// Read
// ─────────────────────────

/**
 * Fetch a user's subscription row.
 * subscriptions has UNIQUE(user_id) — one row per user, always.
 * Returns null if the user has never had a subscription (edge case).
 */
export async function getSubscription(
    supabase: TypedSupabaseClient,
    userId: string,
): Promise<SubscriptionRow | null> {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) throw new Error(`getSubscription: ${error.message}`);
    return data;
}


// ─────────────────────────────────────────────────────────────────────────────
// WRITE  (admin client only — RLS blocks anon/authenticated writes)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Upsert a subscription row from a Razorpay webhook event.
 * Uses conflict on user_id — creates on first payment, updates on renewal.
 *
 *   Requires the admin client (service role).
 *   Never call this from a component or with the anon key.
 */
export async function upsertSubscription(
    supabase: TypedSupabaseClient,
    payload: SubscriptionInsert,
): Promise<SubscriptionRow> {
    const { data, error } = await supabase
        .from('subscriptions')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

    if (error) throw new Error(`upsertSubscription: ${error.message}`);
    return data;
}


/**
 * Look up a subscription by Razorpay's provider ID.
 * Used in webhook handlers when the event payload has a subscription ID
 * but not a user_id directly.
 *
 *   Requires the admin client (service role).
 */
export async function getSubscriptionByProviderId(
    supabase: TypedSupabaseClient,
    providerSubscriptionId: string,
): Promise<SubscriptionRow | null> {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('provider_subscription_id', providerSubscriptionId)
        .maybeSingle();

    if (error) throw new Error(`getSubscriptionByProviderId: ${error.message}`);
    return data;
}