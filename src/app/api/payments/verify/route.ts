// app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '../../../../features/billing/lib/supabase-admin';
import { getAuthUser } from '../../../../features/billing/lib/get-auth-user';
import { fulfillSubscriptionPayment } from '../../../../features/billing/lib/fulfill-subscription';

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

    const signatureValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

    if (!signatureValid) {
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

    if (payment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ---- Step 3: record signature verified (NOT yet fulfilled) ----
    const now = new Date();
    await supabaseAdmin
      .from('payments')
      .update({
        status: 'verified',
        razorpay_payment_id,
        razorpay_signature,
        updated_at: now.toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id);

    // ---- Step 4: activate the subscription (shared with the webhook path) ----
    // Idempotent via processed_fulfilments — safe to call even if the
    // webhook already fulfilled this exact payment.
    const { subUpdate, alreadyProcessed } = await fulfillSubscriptionPayment(
      payment,
      razorpay_payment_id,
      now
    );

    // Only flip to 'captured' once fulfilment has actually gone through —
    // if fulfillSubscriptionPayment threw above, we never reach this line,
    // and the row is left at 'verified' so a retry/webhook can still fulfil it.
    if (!alreadyProcessed) {
      await supabaseAdmin
        .from('payments')
        .update({ status: 'captured', updated_at: new Date().toISOString() })
        .eq('razorpay_order_id', razorpay_order_id);
    }

    // A same-cycle, mid-period upgrade doesn't touch current_period_end, so
    // subUpdate won't carry it — fetch the live value to report back accurately.
    let periodEnd = subUpdate?.current_period_end ?? null;
    if (!periodEnd) {
      const { data: liveSub } = await supabaseAdmin
        .from('subscriptions')
        .select('current_period_end')
        .eq('hotel_id', payment.hotel_id)
        .maybeSingle();
      periodEnd = liveSub?.current_period_end ?? null;
    }

    return NextResponse.json({
      success: true,
      plan: payment.plan,
      billingCycle: payment.billing_cycle,
      isProration: Boolean(payment.is_proration),
      periodEnd,
    });
  } catch (err) {
    console.error('verify error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}