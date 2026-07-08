// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '../../../../features/billing/lib/supabase-admin';
import { fulfillSubscriptionPayment } from '../../../../features/billing/lib/fulfill-subscription';

// Razorpay requires the RAW request body (unparsed) for signature
// verification — do not use req.json() before verifying.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const eventId: string | undefined = event.id ?? req.headers.get('x-razorpay-event-id') ?? undefined;

  // Razorpay doesn't always send a stable top-level event id on every
  // event type, so fall back to a deterministic hash of payload+type.
  const dedupeId =
    eventId ??
    crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!).update(rawBody).digest('hex');

  // ---- Idempotency check (read-only) ----
  // We only INSERT the webhook_events row AFTER successful processing (see
  // end of try block). Checking first and inserting last means a
  // mid-processing crash leaves no row, so Razorpay's retry will correctly
  // re-attempt fulfilment instead of being silently skipped.
  const { data: existingEvent } = await supabaseAdmin
    .from('webhook_events')
    .select('id')
    .eq('razorpay_event_id', dedupeId)
    .maybeSingle();

  if (existingEvent) {
    return NextResponse.json({ status: 'already_processed' });
  }

  try {
    switch (event.event) {
      case 'payment.captured':
      case 'order.paid': {
        const paymentEntity = event.payload?.payment?.entity;
        const orderId: string | undefined = paymentEntity?.order_id ?? event.payload?.order?.entity?.id;
        const paymentId: string | undefined = paymentEntity?.id;

        if (!orderId) break;

        const { data: payment } = await supabaseAdmin
          .from('payments')
          .select('*')
          .eq('razorpay_order_id', orderId)
          .single();

        if (!payment) {
          console.error('Webhook: no matching payment row for order', orderId);
          break;
        }

        // Already activated via the verify route (the common path) — skip.
        if (payment.status === 'captured') break;

        const now = new Date();

        await supabaseAdmin
          .from('payments')
          .update({
            status: 'captured',
            razorpay_payment_id: paymentId ?? payment.razorpay_payment_id,
            raw_webhook_payload: event,
            updated_at: now.toISOString(),
          })
          .eq('razorpay_order_id', orderId);

        // Shared with the verify route — identical fulfilment logic, so
        // whichever path (browser redirect vs webhook) lands first, the
        // resulting subscription state is always the same.
        await fulfillSubscriptionPayment(
          { ...payment, razorpay_payment_id: paymentId ?? payment.razorpay_payment_id },
          paymentId ?? payment.razorpay_payment_id,
          now
        );
        break;
      }

      case 'payment.failed': {
        const paymentEntity = event.payload?.payment?.entity;
        const orderId: string | undefined = paymentEntity?.order_id;
        if (!orderId) break;

        await supabaseAdmin
          .from('payments')
          .update({
            status: 'failed',
            failure_reason: paymentEntity?.error_description ?? 'payment_failed',
            raw_webhook_payload: event,
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', orderId);
        break;
      }

      case 'refund.processed': {
        const refundEntity = event.payload?.refund?.entity;
        const paymentId: string | undefined = refundEntity?.payment_id;
        if (!paymentId) break;

        await supabaseAdmin
          .from('payments')
          .update({ status: 'refunded', raw_webhook_payload: event, updated_at: new Date().toISOString() })
          .eq('razorpay_payment_id', paymentId);

        // Business decision: refunds don't auto-downgrade here. Handle
        // manually or extend this case if you want auto-revocation.
        break;
      }

      default:
        // Unhandled event types are fine to ignore — log for visibility.
        console.log('Unhandled Razorpay webhook event:', event.event);
    }

    // Record success LAST so a crash mid-processing doesn't get
    // permanently marked as "already processed" — Razorpay will retry.
    await supabaseAdmin.from('webhook_events').insert({
      razorpay_event_id: dedupeId,
      event_type: event.event,
      payload: event,
    });

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook processing error:', err);
    // Return 500 so Razorpay retries. No webhook_events row was written,
    // so the idempotency check above will allow the retry through.
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
