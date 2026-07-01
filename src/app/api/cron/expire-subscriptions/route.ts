// app/api/cron/expire-subscriptions/route.ts
//
// Call this on a schedule (Vercel Cron, or any external scheduler) e.g.
// hourly: "0 * * * *". Protect it with CRON_SECRET so it can't be hit
// publicly.
//
// vercel.json:
// { "crons": [{ "path": "/api/cron/expire-subscriptions", "schedule": "0 * * * *" }] }

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../features/billing/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date().toISOString();
  const results = {
    trialsExpired: 0,
    subscriptionsExpired: 0,
    warnedExpiring: 0,
    downgradesQueuedForExpiry: 0,
  };

  // 0. Subscriptions reaching period_end WITH a pending downgrade queued:
  //    this system has no auto-debit, so we do NOT auto-renew anyone for
  //    free here — that would let a downgrade become a permanent free
  //    ride. Instead we just commit the plan change so that `plan` (the
  //    one the user will be billed for next) reflects their downgrade
  //    choice, then let the normal expiry branch below run and drop
  //    status to 'expired'. The user pays through checkout like any
  //    other lapsed subscription, but the price they see/pay is now the
  //    downgraded plan's price, not the old one.
  const { data: pendingDowngrades } = await supabaseAdmin
    .from('subscriptions')
    .select('id, hotel_id, pending_plan, pending_billing_cycle')
    .eq('status', 'active')
    .lt('current_period_end', now)
    .not('pending_plan', 'is', null);

  if (pendingDowngrades?.length) {
    for (const sub of pendingDowngrades) {
      await supabaseAdmin
        .from('subscriptions')
        .update({
          plan: sub.pending_plan,
          billing_cycle: sub.pending_billing_cycle ?? 'monthly',
          pending_plan: null,
          pending_billing_cycle: null,
          updated_at: now,
        })
        .eq('id', sub.id);
      results.downgradesQueuedForExpiry += 1;
    }
  }

  // 1. Trials that have run out and were never converted to a paid charge.
  const { data: expiredTrials } = await supabaseAdmin
    .from('subscriptions')
    .select('id, hotel_id, user_id')
    .eq('status', 'trialing')
    .lt('trial_ends_at', now);

  if (expiredTrials?.length) {
    const hotelIds = expiredTrials.map((s) => s.hotel_id);
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'expired', updated_at: now })
      .in('hotel_id', hotelIds);

    // Drop these users back to no active plan. Adjust if you want a
    // specific "locked" plan value instead of null.
    const userIds = expiredTrials.map((s) => s.user_id);
    await supabaseAdmin.from('users').update({ plan: null }).in('id', userIds);

    results.trialsExpired = expiredTrials.length;
  }

  // 2. Active paid subscriptions whose period has fully lapsed with no renewal.
  const { data: expiredSubs } = await supabaseAdmin
    .from('subscriptions')
    .select('id, hotel_id, user_id')
    .eq('status', 'active')
    .lt('current_period_end', now);

  if (expiredSubs?.length) {
    const hotelIds = expiredSubs.map((s) => s.hotel_id);
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'expired', updated_at: now })
      .in('hotel_id', hotelIds);

    const userIds = expiredSubs.map((s) => s.user_id);
    await supabaseAdmin.from('users').update({ plan: null }).in('id', userIds);

    results.subscriptionsExpired = expiredSubs.length;
  }

  // 3. Mark subscriptions entering their final 3 days as "expiring" so the
  //    UI can show a renewal nudge (purely informational status).
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const { data: expiringSoon } = await supabaseAdmin
    .from('subscriptions')
    .select('id, hotel_id')
    .eq('status', 'active')
    .lt('current_period_end', threeDaysFromNow)
    .gt('current_period_end', now);

  if (expiringSoon?.length) {
    const hotelIds = expiringSoon.map((s) => s.hotel_id);
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'expiring', updated_at: now })
      .in('hotel_id', hotelIds);
    results.warnedExpiring = expiringSoon.length;
  }

  return NextResponse.json({ ok: true, ...results, ranAt: now });
}
