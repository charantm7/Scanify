// app/api/cron/expire-subscriptions/route.ts
//
// Runs on a schedule (e.g. hourly) to keep subscription lifecycle state
// correct without any recurring/auto-debit billing:
//
//   1. Trials past `trial_ends_at`            -> status = 'expired'
//   2. Active subs nearing `current_period_end` (within EXPIRING_WINDOW_DAYS)
//                                               -> status = 'expiring' (soft
//                                                  warning flag; still full
//                                                  access, just surfaced in
//                                                  the UI as "renews soon")
//   3. Subs (status 'active' OR 'expiring') whose `current_period_end` has
//      actually passed:
//        - If a downgrade is pending (pending_plan set), apply it to the
//          `plan`/`billing_cycle` columns first.
//        - Either way, transition to status = 'expired'.
//
// BUG FIX: previously step 3 only queried `status = 'active'`, so any
// subscription that a prior cron run had already flagged 'expiring' would
// never be picked up again once its period actually ended — it would sit
// in 'expiring' forever instead of transitioning to 'expired'. Both step 2
// and step 3 now correctly treat 'active' and 'expiring' as the same "live"
// state, differing only in how close the row is to its period end.
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../features/billing/lib/supabase-admin';

const EXPIRING_WINDOW_DAYS = 3;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const expiringWindowIso = new Date(
    now.getTime() + EXPIRING_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const results = {
    trialsExpired: 0,
    subscriptionsExpired: 0,
    markedExpiring: 0,
    downgradesApplied: 0,
  };

  try {
    // ------------------------------------------------------------------
    // Step 1: expire trials whose trial_ends_at has passed.
    // ------------------------------------------------------------------
    const { data: expiredTrials, error: expiredTrialsErr } = await supabaseAdmin
      .from('subscriptions')
      .select('id, user_id')
      .eq('status', 'trialing')
      .lt('trial_ends_at', nowIso);

    if (expiredTrialsErr) {
      console.error('Failed to fetch expired trials:', expiredTrialsErr);
    } else if (expiredTrials?.length) {
      const trialIds = expiredTrials.map((s) => s.id);
      const userIds = expiredTrials.map((s) => s.user_id);
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'expired', updated_at: nowIso })
        .in('id', trialIds);

      const { error: hotelError } = await supabaseAdmin
        .from('hotel')
        .update({ is_active: false })
        .in('owner_id', userIds)

      if (hotelError) {
        console.log(hotelError)
      }

      if (error) {
        console.error('Failed to expire trials:', error);
      } else {
        results.trialsExpired = trialIds.length;
      }
    }

    // ------------------------------------------------------------------
    // Step 2: for every subscription whose period has ACTUALLY ended
    // (status 'active' OR 'expiring' — see bug-fix note above), apply any
    // pending downgrade and transition to 'expired'.
    // ------------------------------------------------------------------
    const { data: lapsedSubs, error: lapsedErr } = await supabaseAdmin
      .from('subscriptions')
      .select('id, plan, billing_cycle, pending_plan, pending_billing_cycle, status')
      .in('status', ['active', 'expiring'])
      .lt('current_period_end', nowIso);

    if (lapsedErr) {
      console.error('Failed to fetch lapsed subscriptions:', lapsedErr);
      return NextResponse.json({ error: 'Failed to process subscriptions' }, { status: 500 });
    }

    if (lapsedSubs?.length) {
      for (const sub of lapsedSubs) {
        const updatePayload: Record<string, unknown> = {
          status: 'expired',
          updated_at: nowIso,
        };

        // Apply the scheduled downgrade BEFORE the subscription lapses, so
        // the account's `plan` column reflects the downgraded tier from
        // this point on (access itself still ends with `expired`, since
        // there's no auto-debit to silently start a new paid period —
        // the user must check out again to reactivate, now at the
        // downgraded plan's price).
        if (sub.pending_plan) {
          updatePayload.plan = sub.pending_plan;
          updatePayload.billing_cycle = sub.pending_billing_cycle ?? sub.billing_cycle;
          updatePayload.pending_plan = null;
          updatePayload.pending_billing_cycle = null;
          results.downgradesApplied++;
        }

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update(updatePayload)
          .eq('id', sub.id);

        if (error) {
          console.error(`Failed to expire subscription ${sub.id}:`, error);
          continue;
        }

        // Keep the denormalized users.plan column in sync when a pending
        // downgrade changed the effective plan.
        if (sub.pending_plan) {
          const { data: subRow } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('id', sub.id)
            .maybeSingle();
          if (subRow?.user_id) {
            await supabaseAdmin
              .from('users')
              .update({ plan: sub.pending_plan })
              .eq('id', subRow.user_id);
          }
        }

        results.subscriptionsExpired++;
      }
    }

    // ------------------------------------------------------------------
    // Step 3: flag subscriptions nearing expiry (still fully 'active',
    // period end within the warning window but NOT yet passed) as
    // 'expiring' — a soft, non-destructive UI signal to renew soon. Only
    // rows still 'active' are eligible here; anything already 'expiring'
    // simply stays 'expiring' until step 2 catches it on a later run.
    // ------------------------------------------------------------------
    const { data: soonToExpire, error: soonErr } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('status', 'active')
      .gte('current_period_end', nowIso)
      .lt('current_period_end', expiringWindowIso);

    if (soonErr) {
      console.error('Failed to fetch soon-to-expire subscriptions:', soonErr);
    } else if (soonToExpire?.length) {
      const ids = soonToExpire.map((s) => s.id);
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'expiring', updated_at: nowIso })
        .in('id', ids);

      if (error) {
        console.error('Failed to mark subscriptions as expiring:', error);
      } else {
        results.markedExpiring = ids.length;
      }
    }

    return NextResponse.json({ ok: true, ...results, ranAt: nowIso });
  } catch (err) {
    console.error('Cron expire-subscriptions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
