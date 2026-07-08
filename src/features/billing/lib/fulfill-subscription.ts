// lib/fulfill-subscription.ts
//
// Single source of truth for "a payment was captured — now apply it to the
// subscription row." Used by BOTH /api/payments/verify (the common,
// browser-driven path) and /api/payments/webhook (the durable, Razorpay-
// driven fallback), so the two fulfilment paths can never drift apart.
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
  subUpdate: SubscriptionUpdate;
  periodReset: boolean;
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

  const { error: subUpdateErr } = await supabaseAdmin
    .from('subscriptions')
    .update(subUpdate)
    .eq('hotel_id', payment.hotel_id);

  if (subUpdateErr) {
    // Payment is captured in Razorpay & our `payments` table — this is now
    // a support/reconciliation case, not something to surface to the user
    // as a failed payment. Log loudly so it can be manually fixed.
    console.error(
      `[fulfillSubscriptionPayment] Failed to update subscription for hotel ${payment.hotel_id} after payment ${razorpayPaymentId}:`,
      subUpdateErr
    );
  }

  // Keep users.plan (the denormalized convenience column used across the
  // rest of the app for plan-gating) in sync.
  await supabaseAdmin.from('users').update({ plan }).eq('id', payment.user_id);

  return { subUpdate, periodReset: needsFreshPeriod };
}
