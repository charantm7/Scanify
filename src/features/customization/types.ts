import { FontFamily, MenuLayout, CategoryStyle, ShadowIntensity, DBMenuCustomization } from "../menu/types";

export type { ShadowIntensity, CategoryStyle, MenuLayout, FontFamily }

export type { DBMenuCustomization };

export type CustomizationDraft = Omit<DBMenuCustomization, 'id' | 'hotel_id' | 'created_at' | 'updated_at'>;

export interface PresetTheme {
    id: string;
    name: string;
    emoji: string;
    description: string;
    palette: {
        primary_color: string;
        background_color: string;
        surface_color: string;
        text_color: string;
        accent_color: string;
        muted_color: string;
    };
    typography: {
        font_family: FontFamily;
        border_radius: number;
        shadow_intensity: ShadowIntensity;
    };
}