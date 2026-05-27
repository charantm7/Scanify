import { TypedSupabaseClient } from "../../../types/supabase";
import { MenuScanRow } from "../../../types/supabase";

// Menu scan read
export async function getMenuScans(
    supabase: TypedSupabaseClient,
    hotelId: string,
    since: Date
): Promise<MenuScanRow[]> {
    const { data, error } = await supabase
        .from('menu_scans')
        .select('*')
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
