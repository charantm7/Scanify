// features/customization/services/customization.service.ts
// Business logic: load, save, apply presets.

import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchCustomization, upsertCustomization } from '../queries/customization.queries';
import { DEFAULT_CUSTOMIZATION } from '../../menu/constant';
import type { CustomizationDraft, DBMenuCustomization, PresetTheme } from '../types';

/** Load customization or return defaults if not yet created. */
export async function loadCustomization(
    supabase: SupabaseClient,
    hotelId: string,
): Promise<CustomizationDraft> {
    const data = await fetchCustomization(supabase, hotelId);
    if (!data) return { ...DEFAULT_CUSTOMIZATION };

    // Strip DB-only fields
    const { id: _id, hotel_id: _hid, created_at: _c, updated_at: _u, ...draft } = data;
    return draft as CustomizationDraft;
}

/** Persist the full draft to the database. */
export async function saveCustomization(
    supabase: SupabaseClient,
    hotelId: string,
    draft: CustomizationDraft,
): Promise<DBMenuCustomization> {
    return upsertCustomization(supabase, hotelId, draft);
}

/** Merge a preset's config into the current draft. */
export function applyPreset(
    current: CustomizationDraft,
    preset: PresetTheme,
): CustomizationDraft {
    return { ...current, ...preset.config };
}
