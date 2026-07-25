// app/api/payments/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { razorpay, RAZORPAY_KEY_ID } from '../../../../features/billing/lib/razorpay';
import { supabaseAdmin } from '../../../../features/billing/lib/supabase-admin';
import { getAuthUser } from '../../../../features/billing/lib/get-auth-user';
import {
  isValidPlan,
  isValidCycle,
  getPlanPricing,
  PlanKey,
  BillingCycle,
  TRIAL_DAYS,
} from '../../../../features/billing/lib/plans';
import { buildSubscriptionDecision } from '../../../../features/billing/lib/subscription-decision';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const plan: unknown = body?.plan;
    const billingCycle: unknown = body?.billingCycle;
    const wantsTrial = Boolean(body?.startTrial);

    if (!isValidPlan(plan) || !isValidCycle(billingCycle)) {
      return NextResponse.json({ error: 'Invalid plan or billingCycle' }, { status: 400 });
    }

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

    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('hotel_id', hotel.id)
      .maybeSingle();

    const now = new Date();

    const decision = buildSubscriptionDecision(
      existingSub,
      plan as PlanKey,
      billingCycle as BillingCycle,
      wantsTrial,
      now
    );

    switch (decision.type) {
      // ------------------------------------------------------------------
      // Already on exactly this plan + cycle — nothing to do.
      // ------------------------------------------------------------------
      case 'same':
        return NextResponse.json(
          { error: 'You are already subscribed to this plan.' },
          { status: 400 }
        );

      // ------------------------------------------------------------------
      // Trial guard: onboarding already created a `trialing` subscription
      // row for every account, so this endpoint must NEVER hand out a
      // second trial. Use the existing subscription state instead.
      // ------------------------------------------------------------------
      case 'trial_blocked': {
        const message =
          existingSub?.status === 'trialing'
            ? 'Your free trial is already active.'
            : 'Your free trial has already been used. Choose a plan to continue.';
        return NextResponse.json(
          {
            error: message,
            trialAlreadyActive: existingSub?.status === 'trialing',
            trialEndsAt: existingSub?.trial_ends_at ?? null,
          },
          { status: 400 }
        );
      }

      // Defensive fallback ONLY — reachable if a hotel somehow exists
      // without ever going through onboarding's subscription creation.
      // Grants exactly one trial so the account isn't permanently stuck.
      case 'trial_start': {
        const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

        const { error: trialErr } = await supabaseAdmin.from('subscriptions').upsert(
          {
            hotel_id: hotel.id,
            user_id: user.id,
            plan: plan as PlanKey,
            billing_cycle: billingCycle as BillingCycle,
            status: 'trialing',
            trial_used: true,
            trial_ends_at: trialEnd.toISOString(),
            current_period_start: now.toISOString(),
            current_period_end: trialEnd.toISOString(),
            updated_at: now.toISOString(),
          },
          { onConflict: 'hotel_id' }
        );

        if (trialErr) {
          console.error('Trial creation failed:', trialErr);
          return NextResponse.json({ error: 'Could not start trial' }, { status: 500 });
        }

        return NextResponse.json({ trialStarted: true, trialEndsAt: trialEnd.toISOString() });
      }

      // ------------------------------------------------------------------
      // Downgrades NEVER apply immediately — store as a pending change and
      // apply it once the current period actually expires (see the cron).
      // ------------------------------------------------------------------
      case 'downgrade':

        {
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
            effectiveAt: decision.currentPeriodEnd,
            newPlan: plan,
            newBillingCycle: billingCycle,
          });
        }

      // ------------------------------------------------------------------
      // Upgrade (plan tier up) or cycle_change (same tier, Monthly <->
      // Annual switch) — both are immediate, credit-based charges.
      // ------------------------------------------------------------------
      case 'upgrade':
      case 'cycle_change':
        {
          const amountPaise = decision.amountPaise!;
          const receipt = `chg_${hotel.id.slice(0, 8)}_${Date.now()}`;

          const order = await razorpay.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt,
            notes: {
              hotel_id: hotel.id,
              user_id: user.id,
              plan: plan as string,
              billing_cycle: billingCycle as string,
              change_type: decision.type,
              is_proration: 'true',
              days_remaining: String(decision.daysRemaining ?? ''),
              previous_plan: existingSub?.plan ?? '',
              previous_billing_cycle: existingSub?.billing_cycle ?? '',
            },
          });

          const { error: payErr } = await supabaseAdmin.from('payments').insert({
            user_id: user.id,
            hotel_id: hotel.id,
            subscription_id: existingSub?.id ?? null,
            plan: plan as PlanKey,
            billing_cycle: billingCycle as BillingCycle,
            amount_paise: amountPaise,
            currency: 'INR',
            razorpay_order_id: order.id,
            status: 'created',
            is_renewal: false,
            is_proration: true,
          });

          if (payErr) {
            console.error('Proration payment row insert failed:', payErr);
            return NextResponse.json({ error: 'Could not initialize payment' }, { status: 500 });
          }

          // Record intent — verify/webhook will finalise plan + (possibly)
          // reset the period once payment is confirmed captured.
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
            amount: amountPaise,
            currency: 'INR',
            keyId: RAZORPAY_KEY_ID,
            isProration: true,
            changeType: decision.type,
            daysRemaining: decision.daysRemaining,
            creditPaise: decision.creditPaise,
            originalPricePaise: decision.originalPricePaise,
            hotelId: hotel.id,
          });
        }

      // ------------------------------------------------------------------
      // No live paid subscription to prorate against (trial ended,
      // cancelled, expired, or brand new) — full sticker price, fresh
      // period.
      // ------------------------------------------------------------------
      case 'fresh_purchase': {
        const { amountPaise, durationDays } = getPlanPricing(
          plan as PlanKey,
          billingCycle as BillingCycle
        );
        const receipt = `sub_${hotel.id.slice(0, 8)}_${Date.now()}`;
        const isRenewal = Boolean(existingSub && existingSub.plan === plan);

        const order = await razorpay.orders.create({
          amount: amountPaise,
          currency: 'INR',
          receipt,
          notes: {
            hotel_id: hotel.id,
            user_id: user.id,
            plan: plan as string,
            billing_cycle: billingCycle as string,
            is_renewal: String(isRenewal),
          },
        });

        const { error: paymentInsertErr } = await supabaseAdmin.from('payments').insert({
          user_id: user.id,
          hotel_id: hotel.id,
          subscription_id: existingSub?.id ?? null,
          plan: plan as PlanKey,
          billing_cycle: billingCycle as BillingCycle,
          amount_paise: amountPaise,
          currency: 'INR',
          razorpay_order_id: order.id,
          status: 'created',
          is_renewal: isRenewal,
          is_proration: false,
        });

        if (paymentInsertErr) {
          console.error('Payment row insert failed:', paymentInsertErr);
          return NextResponse.json({ error: 'Could not initialize payment' }, { status: 500 });
        }

        // Record intent so verify/webhook knows what to activate once
        // payment is confirmed — don't touch the LIVE plan/status until
        // then, so an abandoned checkout can't silently change access.
        await supabaseAdmin.from('subscriptions').upsert(
          {
            hotel_id: hotel.id,
            user_id: user.id,
            plan: existingSub?.plan ?? (plan as PlanKey),
            billing_cycle: existingSub?.billing_cycle ?? (billingCycle as BillingCycle),
            status: existingSub?.status ?? 'past_due',
            pending_plan: plan,
            pending_billing_cycle: billingCycle,
            payment_provider: 'razorpay',
            provider_subscription_id: order.id,
            updated_at: now.toISOString(),
          },
          { onConflict: 'hotel_id' }
        );

        return NextResponse.json({
          orderId: order.id,
          amount: amountPaise,
          currency: 'INR',
          keyId: RAZORPAY_KEY_ID,
          isProration: false,
          durationDays,
          hotelId: hotel.id,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid subscription action' }, { status: 400 });
    }
  } catch (err) {
    console.error('create-order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
