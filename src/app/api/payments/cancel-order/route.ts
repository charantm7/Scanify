import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../features/billing/lib/supabase-admin';
import { getAuthUser } from '../../../../features/billing/lib/get-auth-user';


export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await req.json().catch(() => null);
        const orderId = body?.orderId;

        if (typeof orderId !== 'string' || !orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }


        const { error: paymentError } = await supabaseAdmin
            .from('payments')
            .update({
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
            })
            .eq('razorpay_order_id', orderId)
            .eq('status', 'created');

        if (paymentError) throw new Error(paymentError.message);

        return NextResponse.json({ cancelled: true });
    } catch (err) {
        console.error('payment cancellation error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
