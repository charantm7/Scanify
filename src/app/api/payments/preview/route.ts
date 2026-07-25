// app/api/payments/preview/route.ts
//
// Read-only checkout breakdown. Called by the Checkout modal/page BEFORE
// the user confirms — never writes to the DB and never creates a Razorpay
// order. Uses the exact same decision engine as create-order, so the
// numbers shown here are guaranteed to match what actually gets charged.
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../features/billing/lib/supabase-admin';
import { getAuthUser } from '../../../../features/billing/lib/get-auth-user';
import {
    isValidPlan,
    isValidCycle,
    getPlanPricing,
    PlanKey,
    BillingCycle,
} from '../../../../features/billing/lib/plans';
import { buildSubscriptionDecision } from '../../../../features/billing/lib/subscription-decision';

// GST is currently not collected on Scanify subscriptions (no GSTIN capture
// flow yet). We surface an explicit `taxPaise: 0` field (rather than
// omitting tax entirely) so the checkout UI has a stable place to render a
// tax line the moment tax collection is turned on, without an API shape
// change. See the `taxNote` string for the user-facing explanation.
const TAX_PAISE = 0;
const TAX_NOTE = 'GST is not currently collected on Scanify subscriptions.';
const TRIAL_LABEL = '4-day';

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

        const stickerPrice = getPlanPricing(plan as PlanKey, billingCycle as BillingCycle).amountPaise;

        const base = {
            plan,
            billingCycle,
            currentPlan: existingSub?.plan ?? null,
            currentBillingCycle: existingSub?.billing_cycle ?? null,
            taxPaise: TAX_PAISE,
            taxNote: TAX_NOTE,
        };

        switch (decision.type) {
            case 'same':
                return NextResponse.json({
                    ...base,
                    type: 'same',
                    payable: false,
                    message: 'You are already subscribed to this plan.',
                });

            case 'trial_blocked':
                return NextResponse.json({
                    ...base,
                    type: 'trial_blocked',
                    payable: false,
                    message: 'Your free trial has already been used. Choose a plan to continue.',
                });

            case 'trial_start':
                return NextResponse.json({
                    ...base,
                    type: 'trial_start',
                    payable: false,
                    message: `Start your ${TRIAL_LABEL} free trial — no payment required now.`,
                });

            case 'downgrade':
                return NextResponse.json({
                    ...base,
                    type: 'downgrade',
                    payable: false,
                    originalPricePaise: stickerPrice,
                    effectiveAt: decision.currentPeriodEnd,
                    message:
                        'This plan takes effect at the end of your current billing period. You will not be charged today.',
                });

            case 'fresh_purchase':
                return NextResponse.json({
                    ...base,
                    type: 'fresh_purchase',
                    payable: true,
                    originalPricePaise: stickerPrice,
                    creditPaise: 0,
                    amountPaise: stickerPrice + TAX_PAISE,
                    subtotalPaise: stickerPrice,
                });

            case 'upgrade':
            case 'cycle_change':
                return NextResponse.json({
                    ...base,
                    type: decision.type,
                    payable: true,
                    originalPricePaise: decision.originalPricePaise,
                    creditPaise: decision.creditPaise,
                    daysRemaining: decision.daysRemaining,
                    subtotalPaise: decision.amountPaise,
                    amountPaise: (decision.amountPaise ?? 0) + TAX_PAISE,
                    periodWillReset: Boolean(decision.resetPeriod),
                });

            default:
                return NextResponse.json({ error: 'Could not compute checkout preview' }, { status: 500 });
        }
    } catch (err) {
        console.error('preview error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
