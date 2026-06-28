
import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_CUSTOMIZATION } from "../../menu/constant";
import { CustomizationDraft, PresetTheme, DBMenuCustomization } from "../types";
import { fetchCustomization, upsertCustomization } from "../queries/customization.queries";

export function hexToRgba(hex: string, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

export function lightenHex(hex: string, amount = 0.9) {
    const r = Math.round(parseInt(hex.slice(1, 3), 16) + (255 - parseInt(hex.slice(1, 3), 16)) * amount);
    const g = Math.round(parseInt(hex.slice(3, 5), 16) + (255 - parseInt(hex.slice(3, 5), 16)) * amount);
    const b = Math.round(parseInt(hex.slice(5, 7), 16) + (255 - parseInt(hex.slice(5, 7), 16)) * amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}



export async function loadCustomization(
    supabase: SupabaseClient,
    hotelId: string,
): Promise<DBMenuCustomization> {
    const data = await fetchCustomization(supabase, hotelId);
    return data;
}

export function applyPreset(
    current: CustomizationDraft,
    preset: PresetTheme,
): CustomizationDraft {
    return { ...current, ...preset.palette, primary_color: preset.palette.accent_color, ...preset.typography };
}


export async function saveCustomization(
    supabase: SupabaseClient,
    hotelId: string,
    draft: CustomizationDraft,
): Promise<DBMenuCustomization> {
    return await upsertCustomization(supabase, hotelId, draft);
}
