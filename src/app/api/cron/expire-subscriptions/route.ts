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

  const { data: expiredSubs, error: expiredSubsError } = await supabaseAdmin
    .from('subscriptions')
    .select(`
    id,
    user_id,
    plan,
    billing_cycle,
    pending_plan,
    pending_billing_cycle
  `)
    .eq('status', 'active')
    .lt('current_period_end', now);

  if (expiredSubsError) {
    console.error('Failed to fetch expired subscriptions:', expiredSubsError);
    return NextResponse.json(
      { error: 'Failed to process subscriptions' },
      { status: 500 }
    );
  }

  if (expiredSubs?.length) {
    for (const sub of expiredSubs) {
      const updatePayload: Record<string, unknown> = {
        status: 'expired',
        updated_at: now,
      };

      // Apply scheduled downgrade before expiring.
      if (sub.pending_plan) {
        updatePayload.plan = sub.pending_plan;
        updatePayload.billing_cycle =
          sub.pending_billing_cycle ?? sub.billing_cycle;
        updatePayload.pending_plan = null;
        updatePayload.pending_billing_cycle = null;

        results.downgradesQueuedForExpiry++;
      }

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update(updatePayload)
        .eq('id', sub.id);

      if (error) {
        console.error(
          `Failed to expire subscription ${sub.id}:`,
          error
        );
        continue;
      }

      results.subscriptionsExpired++;
    }
  }

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

    results.trialsExpired = expiredTrials.length;
  }

  return NextResponse.json({ ok: true, ...results, ranAt: now });
}
