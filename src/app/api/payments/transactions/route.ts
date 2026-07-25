// app/api/payments/transactions/route.ts
//
// Returns the authenticated account's payment/transaction history —
// everything ever charged (or attempted) against their subscription:
// fresh purchases, renewals, upgrades/cycle-switches (prorated), and their
// outcomes (created/captured/failed/refunded). Downgrades never appear
// here since they're deferred and never charge anything.
//
// Scoped strictly to the calling user's own hotel — never trust a
// hotel_id/user_id from the client, always derive it from the session.
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../features/billing/lib/supabase-admin';
import { getAuthUser } from '../../../../features/billing/lib/get-auth-user';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
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

    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(searchParams.get('limit')) || DEFAULT_PAGE_SIZE)
    );
    // Cursor-based pagination on created_at (stable, indexed, and payments
    // are effectively immutable once captured/failed/refunded — no risk of
    // a row "moving" between pages the way offset pagination can suffer).
    const cursor = searchParams.get('cursor'); // ISO timestamp of the last row on the previous page

    let query = supabaseAdmin
      .from('payments')
      .select(
        'id, plan, billing_cycle, amount_paise, currency, status, is_renewal, is_proration, razorpay_order_id, razorpay_payment_id, failure_reason, subscription_id, created_at, updated_at'
      )
      .eq('hotel_id', hotel.id)
      // Ownership belt-and-braces: hotel_id already scopes this to the
      // account, but user_id is checked too in case a hotel is ever
      // transferred between owners in the future.
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit + 1); // fetch one extra to know if there's a next page

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: payments, error: paymentsErr } = await query;

    if (paymentsErr) {
      console.error('Failed to fetch transactions:', paymentsErr);
      return NextResponse.json({ error: 'Could not load transaction history' }, { status: 500 });
    }

    const hasMore = (payments?.length ?? 0) > limit;
    const page = hasMore ? payments!.slice(0, limit) : payments ?? [];
    const nextCursor = hasMore ? page[page.length - 1]?.created_at ?? null : null;

    return NextResponse.json({
      transactions: page,
      nextCursor,
      hasMore,
    });
  } catch (err) {
    console.error('transactions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
