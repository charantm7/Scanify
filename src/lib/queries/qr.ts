import type { TypedSupabaseClient, QrCodeRow, QrCodeInsert, QrCodeUpdate } from '../../types/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all QR codes for a hotel, newest first.
 * Used in the console QrPanel.
 */
export async function getQrCodes(
    supabase: TypedSupabaseClient,
    hotelId: string,
): Promise<QrCodeRow[]> {
    const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('hotel_id', hotelId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`getQrCodes: ${error.message}`);
    return data ?? [];
}

/**
 * Count QR codes for a hotel.
 * Used to enforce the plan's max_qr_codes limit before creating a new one.
 */
export async function getQrCodeCount(
    supabase: TypedSupabaseClient,
    hotelId: string,
): Promise<number> {
    const { count, error } = await supabase
        .from('qr_codes')
        .select('id', { count: 'exact', head: true })
        .eq('hotel_id', hotelId);

    if (error) throw new Error(`getQrCodeCount: ${error.message}`);
    return count ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────────────────────────────────────

export async function createQrCode(
    supabase: TypedSupabaseClient,
    payload: QrCodeInsert,
): Promise<QrCodeRow> {
    const { data, error } = await supabase
        .from('qr_codes')
        .insert(payload)
        .select()
        .single();

    if (error) throw new Error(`createQrCode: ${error.message}`);
    return data;
}

export async function updateQrCode(
    supabase: TypedSupabaseClient,
    qrId: string,
    patch: QrCodeUpdate,
): Promise<QrCodeRow> {
    const { data, error } = await supabase
        .from('qr_codes')
        .update(patch)
        .eq('id', qrId)
        .select()
        .single();

    if (error) throw new Error(`updateQrCode: ${error.message}`);
    return data;
}

export async function deleteQrCode(
    supabase: TypedSupabaseClient,
    qrId: string,
): Promise<void> {
    const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', qrId);

    if (error) throw new Error(`deleteQrCode: ${error.message}`);
}
