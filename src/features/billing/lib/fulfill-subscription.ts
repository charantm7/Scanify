// lib/fulfill-subscription.ts
//
// Single source of truth for "a payment was captured — now apply it to the
// subscription row." Used by BOTH /api/payments/verify (the common,
// browser-driven path) and /api/payments/webhook (the durable, Razorpay-
// driven fallback), so the two fulfilment paths can never drift apart.
//
// Both the subscriptions row and the denormalized users.plan column are
// written atomically via a single Postgres RPC (fulfill_subscription_payment)
// so they can never go out of sync with each other. Idempotency is enforced
// inside that RPC via a unique constraint on processed_fulfilments
// (razorpay_payment_id) — if verify and the webhook both reach this function
// for the same payment, the second call is a safe no-op.
//
// Correctness note on current_period_end:
//   - A same-cycle plan-tier upgrade (e.g. starter-monthly -> growth-monthly)
//     keeps the existing current_period_end — the user already paid (via
//     the proration charge) only for the remaining days of the CURRENT
//     period at the new plan's rate.
//   - ANY billing-cycle change (monthly <-> annual, in either direction) —
//     or a fresh purchase/renewal — resets current_period_start/end to a
//     brand new full period for the destination cycle, because the user is
//     now paying for a new commitment length, not just a mid-cycle swap.
//
// We detect "did the cycle change" by comparing the payment's billing_cycle
// against the subscription row's CURRENT billing_cycle at fulfilment time
// (i.e. the value from *before* this update runs). This needs no extra
// schema column and stays correct no matter which route (verify vs
// webhook) reaches this function first.
import { supabaseAdmin } from './supabase-admin';
import { getPlanPricing, PlanKey, BillingCycle } from './plans';
import { PaymentRow, SubscriptionUpdate } from '../../../types/supabase';


export interface FulfilmentResult {
  subUpdate: SubscriptionUpdate | null;
  periodReset: boolean;
  alreadyProcessed?: boolean;
}

export async function fulfillSubscriptionPayment(
  payment: PaymentRow,
  razorpayPaymentId: string,
  now: Date = new Date()
): Promise<FulfilmentResult> {
  const plan = payment.plan as PlanKey;
  const cycle = payment.billing_cycle as BillingCycle;

  // Look at the subscription row as it stands BEFORE this fulfilment writes
  // to it, so we can tell whether the billing cycle is actually changing.
  const { data: currentSub } = await supabaseAdmin
    .from('subscriptions')
    .select('billing_cycle')
    .eq('hotel_id', payment.hotel_id)
    .maybeSingle();

  const cycleChanged = Boolean(currentSub && currentSub.billing_cycle !== cycle);

  // A fresh period is needed for: any non-proration payment (fresh
  // purchase/renewal), OR a proration payment whose billing cycle changed.
  const needsFreshPeriod = !payment.is_proration || cycleChanged;

  let subUpdate: SubscriptionUpdate;

  if (needsFreshPeriod) {
    const { durationDays } = getPlanPricing(plan, cycle);
    const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    subUpdate = {
      plan,
      billing_cycle: cycle,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      pending_plan: null,
      pending_billing_cycle: null,
      last_payment_id: razorpayPaymentId,
      provider_subscription_id: payment.razorpay_order_id,
      cancel_at_period_end: false,
      updated_at: now.toISOString(),
    };
  } else {
    // Mid-cycle, same-cycle plan-tier upgrade: swap the plan, keep the
    // existing current_period_end. Also force status back to 'active' in
    // case the account had drifted into 'expiring' (renewal reminder) —
    // upgrading mid-cycle should always clear that flag.
    subUpdate = {
      plan,
      billing_cycle: cycle,
      status: 'active',
      pending_plan: null,
      pending_billing_cycle: null,
      last_payment_id: razorpayPaymentId,
      provider_subscription_id: payment.razorpay_order_id,
      updated_at: now.toISOString(),
    };
  }

  // Single atomic write: subscriptions + users.plan + idempotency record,
  // all inside one Postgres function. See migration for the SQL body.
  const { error: rpcError } = await supabaseAdmin.rpc('fulfill_subscription_payment', {
    p_hotel_id: payment.hotel_id,
    p_user_id: payment.user_id,
    p_razorpay_payment_id: razorpayPaymentId,
    p_plan: subUpdate.plan,
    p_billing_cycle: subUpdate.billing_cycle,
    p_status: subUpdate.status,
    p_current_period_start: subUpdate.current_period_start ?? null,
    p_current_period_end: subUpdate.current_period_end ?? null,
    p_needs_fresh_period: needsFreshPeriod,
    p_last_payment_id: subUpdate.last_payment_id,
    p_provider_subscription_id: subUpdate.provider_subscription_id,
    p_now: now.toISOString(),
  });

  if (rpcError) {
    // The unique-violation case (Postgres code 23505) means this payment was
    // already fulfilled by the other path (verify vs webhook race) — that's
    // expected and safe, not a failure.
    if (rpcError.code === '23505') {
      return { subUpdate: null, periodReset: false, alreadyProcessed: true };
    }

    // Anything else: Razorpay has the money, our DB write failed. This is
    // a "customer paid, got nothing" incident — record it durably and page
    // a human immediately, don't just log and hope someone greps for it.
    await supabaseAdmin.from('failed_fulfilments').insert({
      hotel_id: payment.hotel_id,
      user_id: payment.user_id,
      razorpay_payment_id: razorpayPaymentId,
      payload: subUpdate,
      error_message: rpcError.message,
      status: 'pending_retry',
      created_at: now.toISOString(),
    });


    throw new Error(
      `[fulfillSubscriptionPayment] Failed to fulfil payment ${razorpayPaymentId} for hotel ${payment.hotel_id}: ${rpcError.message}`
    );
  }

  return { subUpdate, periodReset: needsFreshPeriod };
}