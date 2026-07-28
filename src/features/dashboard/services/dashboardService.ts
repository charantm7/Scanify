import type { SupabaseClient } from '@supabase/supabase-js';
import type { DashboardStats } from '../types';

export async function fetchDashboardStats(
    supabase: SupabaseClient,
    hotelId: string
): Promise<DashboardStats> {
    const [{ count: qrCount, error: qrError }, { count: scanCount, error: scanError }] =
        await Promise.all([
            supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId),
            supabase.from('menu_scans').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId),
        ]);

    if (qrError) throw qrError;
    if (scanError) throw scanError;

    return { qrCount: qrCount ?? 0, scanCount: scanCount ?? 0 };
}