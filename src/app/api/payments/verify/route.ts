// app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '../../../../features/billing//lib/supabase-admin';
import { getAuthUser } from '../../../../features/billing//lib/get-auth-user';
import { getPlanPricing, PlanKey, BillingCycle } from '../../../../features/billing//lib/plans';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
    }

    // ---- Step 1: verify signature (HMAC-SHA256 of order_id|payment_id) ----
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Mark the payment row failed if it exists, but never fulfil it.
      await supabaseAdmin
        .from('payments')
        .update({ status: 'failed', failure_reason: 'signature_mismatch' })
        .eq('razorpay_order_id', razorpay_order_id);

      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // ---- Step 2: load the payment row we created in create-order ----
    const { data: payment, error: paymentErr } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (paymentErr || !payment) {
      return NextResponse.json({ error: 'Unknown order' }, { status: 404 });
    }

    // Ownership check — this payment must belong to the calling user.
    if (payment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Idempotency — if webhook already processed this, don't double-apply.
    if (payment.status === 'captured') {
      return NextResponse.json({ alreadyProcessed: true, success: true });
    }

    // ---- Step 3: mark payment captured ----
    await supabaseAdmin
      .from('payments')
      .update({
        status: 'captured',
        razorpay_payment_id,
        razorpay_signature,
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id);

    // ---- Step 4: activate the subscription ----
    const plan = payment.plan as PlanKey;
    const cycle = payment.billing_cycle as BillingCycle;
    const now = new Date();

    let subUpdate: Record<string, unknown>;

    if (payment.is_proration) {
      // Mid-cycle upgrade: change the plan, leave current_period_end
      // untouched — the user already paid for the remaining days at
      // the new plan's rate via the proration charge.
      subUpdate = {
        plan,
        billing_cycle: cycle,
        pending_plan: null,
        pending_billing_cycle: null,
        last_payment_id: razorpay_payment_id,
        provider_subscription_id: razorpay_order_id,
        updated_at: now.toISOString(),
      };
    } else {
      // Fresh purchase or renewal: full new period starting now.
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
        last_payment_id: razorpay_payment_id,
        provider_subscription_id: razorpay_order_id,
        cancel_at_period_end: false,
        updated_at: now.toISOString(),
      };
    }

    const { error: subUpdateErr } = await supabaseAdmin
      .from('subscriptions')
      .update(subUpdate)
      .eq('hotel_id', payment.hotel_id);

    if (subUpdateErr) {
      console.error('Subscription activation failed:', subUpdateErr);
      // Payment is captured in Razorpay & our DB — this is now a support
      // case, not a user-facing failure. Don't tell the user it failed.
    }

    await supabaseAdmin.from('users').update({ plan }).eq('id', user.id);

    const { data: finalSub } = await supabaseAdmin
      .from('subscriptions')
      .select('current_period_end')
      .eq('hotel_id', payment.hotel_id)
      .single();

    return NextResponse.json({
      success: true,
      plan,
      billingCycle: cycle,
      isProration: Boolean(payment.is_proration),
      periodEnd: finalSub?.current_period_end ?? null,
    });
  } catch (err) {
    console.error('verify error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
