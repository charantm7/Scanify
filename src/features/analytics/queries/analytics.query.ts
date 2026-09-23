import { TypedSupabaseClient } from "../../../types/supabase";
import { MenuScanRow, MenuItemRow, QrCodeRow } from "../../../types/supabase";


/**
 * Upper bound on rows pulled into the browser for client-side aggregation.
 * Past this, the counts should be computed in Postgres (see the note in
 * PERF_AUDIT.md) rather than shipped row by row.
 */
const MAX_SCAN_ROWS = 20_000;

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
    // `*, item:menu_items(*), qr:qr_codes(*)` pulled every column of every
    // scan plus the entire joined item row — description, ingredients,
    // allergens, image_url — for each one. On a busy restaurant over 30 days
    // that is megabytes over the wire to compute counts from, and it is the
    // single slowest request in the dashboard.
    //
    // The aggregation below reads exactly these fields and nothing else.
    const { data, error } = await supabase
        .from('menu_scans')
        .select(
            'event_type, scanned_at, item_id, qr_code_id, item:menu_items(id, name), qr:qr_codes(id, label)'
        )
        .eq('hotel_id', hotelId)
        .gte('scanned_at', since.toISOString())
        .order('scanned_at', { ascending: false })
        .limit(MAX_SCAN_ROWS);

    if (error) throw new Error(`getMenuScans: ${error?.message}`);

    return (data ?? []) as unknown as MenuScansWithItem[];
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
        .lt('scanned_at', since.toISOString())
        .limit(MAX_SCAN_ROWS);

    if (error) {
        throw new Error(`getPrevScans: ${error.message}`);
    }

    return data ?? [];
}
