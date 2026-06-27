// features/customization/types/index.ts
// All types for the customization feature — aligned 1-to-1 with the
// menu_customizations table and the menu/types.ts enums.

import type {
    DBMenuCustomization,
    MenuLayout,
    CategoryStyle,
    FontFamily,
    ShadowIntensity,
} from '../../../features/menu/types';

export type { MenuLayout, CategoryStyle, FontFamily, ShadowIntensity };
export type { DBMenuCustomization };

// ── Preset theme ───────────────────────────────────────────────────────────────
export interface PresetTheme {
    id: string;
    name: string;
    description: string;
    emoji: string;
    /** plan required; undefined = available to all */
    plan?: 'starter' | 'growth' | 'pro';
    config: Partial<Omit<DBMenuCustomization, 'id' | 'hotel_id' | 'created_at' | 'updated_at'>>;
}

// ── Local editor state ─────────────────────────────────────────────────────────
export type CustomizationDraft = Omit<DBMenuCustomization, 'id' | 'hotel_id' | 'created_at' | 'updated_at'>;

export type CustomizationTab = 'theme' | 'layout' | 'typography' | 'visibility';

// ── Save state ─────────────────────────────────────────────────────────────────
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
