import { TypedSupabaseClient } from "../../../types/supabase";
import { MenuScanRow, MenuItemRow, QrCodeRow } from "../../../types/supabase";


export interface MenuScansWithItem extends MenuScanRow {
    item: MenuItemRow
    qr: QrCodeRow
}


// Menu scan read
export async function getMenuScans(
    supabase: TypedSupabaseClient,
    hotelId: string,
    since: Date
): Promise<MenuScansWithItem[]> {
    const { data, error } = await supabase
        .from('menu_scans')
        .select(`*, item:menu_items(*), qr:qr_codes(*)`)
        .eq('hotel_id', hotelId)
        .gte('scanned_at', since.toISOString())
        .order('scanned_at', { ascending: false })

    if (error) throw new Error(`getMenuScans: ${error?.message}`);

    return data ?? [];
}


export async function getPrevMenuScan(
    supabase: TypedSupabaseClient,
    hotelId: string,
    prevSince: Date,
    since: Date
) {
    const { data, error } = await supabase
        .from('menu_scans')
        .select('event_type, scanned_at')
        .eq('hotel_id', hotelId)
        .gte('scanned_at', prevSince.toISOString())
        .lt('scanned_at', since.toISOString());

    if (error) {
        throw new Error(`getPrevScans: ${error.message}`);
    }

    return data ?? [];
}
