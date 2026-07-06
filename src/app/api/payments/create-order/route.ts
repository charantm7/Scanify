// app/api/payments/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '../../../../features/billing//lib/razorpay';
import { supabaseAdmin } from '../../../../features/billing//lib/supabase-admin';
import { getAuthUser } from '../../../../features/billing//lib/get-auth-user';
import { isValidPlan, isValidCycle, getPlanPricing, comparePlans, calculateProratedUpgrade, PlanKey, BillingCycle, compareSubscription } from '../../../../features/billing/lib/plans';
import { determineSubscriptionAction, SubscriptionAction } from '../../../../features/billing/subscriptions/subscription.service';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const plan: unknown = body?.plan;
    const billingCycle: unknown = body?.billingCycle;

    if (!isValidPlan(plan) || !isValidCycle(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid plan or billingCycle' },
        { status: 400 }
      );
    }

    const { amountPaise, durationDays } = getPlanPricing(
      plan as PlanKey,
      billingCycle as BillingCycle
    );

    // Find the user's hotel (one owner_id -> one hotel per your schema).
    const { data: hotel, error: hotelErr } = await supabaseAdmin
      .from('hotels')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (hotelErr || !hotel) {
      return NextResponse.json(
        { error: 'No hotel found for this account. Complete onboarding first.' },
        { status: 400 }
      );
    }

    // Fetch (or lazily create) the subscription row for this hotel.
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('hotel_id', hotel.id)
      .maybeSingle();

    const now = new Date();


    const decision = await determineSubscriptionAction(existingSub, plan as PlanKey, billingCycle as BillingCycle)

    switch (decision.action) {
      case 'same':
        return NextResponse.json(
          {
            error: "You are already subscribed to this plan."
          },
          {
            status: 400
          }
        );

      case 'downgrade':
        const { error: downgradeErr } = await supabaseAdmin
          .from('subscriptions')
          .update({
            pending_plan: plan,
            pending_billing_cycle: billingCycle,
            updated_at: now.toISOString(),
          })
          .eq('hotel_id', hotel.id);

        if (downgradeErr) {
          console.error('Downgrade scheduling failed:', downgradeErr);
          return NextResponse.json({ error: 'Could not schedule downgrade' }, { status: 500 });
        }

        return NextResponse.json({
          downgradeScheduled: true,
          effectiveAt: existingSub.current_period_end,
          newPlan: plan,
        });

      case 'upgrade':

        const periodEnd = new Date(existingSub.current_period_end);
        const proration = calculateProratedUpgrade(
          existingSub.plan as PlanKey,
          plan as PlanKey,
          existingSub.billing_cycle as BillingCycle,
          billingCycle as BillingCycle,
          periodEnd,
          now
        );

        // No time left to prorate (edge case: cron hasn't run yet but
        // period technically already ended) — fall through to full
        // fresh-purchase charge below instead of a $0 prorate.
        if (proration) {
          const receipt = `upg_${hotel.id.slice(0, 8)}_${Date.now()}`;

          const order = await razorpay.orders.create({
            amount: proration.payablePaise,
            currency: 'INR',
            receipt,
            notes: {
              hotel_id: hotel.id,
              user_id: user.id,
              plan,
              billing_cycle: billingCycle,
              is_proration: 'true',
              days_remaining: String(proration.daysRemaining),
              previous_plan: existingSub.plan,
            },
          });

          const { error: payErr } = await supabaseAdmin.from('payments').insert({
            user_id: user.id,
            hotel_id: hotel.id,
            subscription_id: existingSub.id,
            plan,
            billing_cycle: billingCycle,
            amount_paise: proration.payablePaise,
            currency: 'INR',
            razorpay_order_id: order.id,
            status: 'created',
            is_renewal: false,
            is_proration: true,
          });

          if (payErr) {
            console.error('Proration payment row insert failed:', payErr);
            return NextResponse.json({ error: 'Could not initialize upgrade payment' }, { status: 500 });
          }

          // pending_plan marks intent; verify/webhook will set plan to
          // this WITHOUT touching current_period_end, since this is a
          // mid-cycle upgrade, not a renewal.
          await supabaseAdmin
            .from('subscriptions')
            .update({
              pending_plan: plan,
              pending_billing_cycle: billingCycle,
              provider_subscription_id: order.id,
              updated_at: now.toISOString(),
            })
            .eq('hotel_id', hotel.id);

          return NextResponse.json({
            orderId: order.id,
            amount: proration.payablePaise,
            currency: 'INR',
            keyId: process.env.RAZORPAY_KEY_ID,
            isProration: true,
            daysRemaining: proration.daysRemaining,
            hotelId: hotel.id,
          });
        }
        break;

      case 'new':
        const receipt = `sub_${hotel.id.slice(0, 8)}_${Date.now()}`;

        const order = await razorpay.orders.create({
          amount: amountPaise,
          currency: 'INR',
          receipt,
          notes: {
            hotel_id: hotel.id,
            user_id: user.id,
            plan,
            billing_cycle: billingCycle,
            is_renewal: String(Boolean(existingSub && existingSub.plan)),
          },
        });

        const { error: paymentInsertErr } = await supabaseAdmin.from('payments').insert({
          user_id: user.id,
          hotel_id: hotel.id,
          subscription_id: existingSub?.id ?? null,
          plan,
          billing_cycle: billingCycle,
          amount_paise: amountPaise,
          currency: 'INR',
          razorpay_order_id: order.id,
          status: 'created',
          is_renewal: Boolean(existingSub && existingSub.status === 'active'),
        });

        if (paymentInsertErr) {
          console.error('Payment row insert failed:', paymentInsertErr);
          return NextResponse.json({ error: 'Could not initialize payment' }, { status: 500 });
        }

        // Mark the subscription's intent so the verify route knows what to
        // activate once payment is confirmed, even if the user's tab closes.
        await supabaseAdmin.from('subscriptions').upsert(
          {
            hotel_id: hotel.id,
            user_id: user.id,
            plan: existingSub?.plan ?? plan, // don't change live plan until payment verified
            billing_cycle: existingSub?.billing_cycle ?? billingCycle,
            status: existingSub?.status ?? 'past_due',
            pending_plan: plan,
            pending_billing_cycle: billingCycle,
            payment_provider: 'razorpay',
            provider_subscription_id: order.id,
          },
          { onConflict: 'hotel_id' }
        );

        return NextResponse.json({
          orderId: order.id,
          amount: amountPaise,
          currency: 'INR',
          keyId: process.env.RAZORPAY_KEY_ID,
          durationDays,
          hotelId: hotel.id,
        });



      default:
        return NextResponse.json(
          {
            error: "Invalid subscription action"
          },
          {
            status: 400
          }
        );
    }

  } catch (err) {
    console.error('create-order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
