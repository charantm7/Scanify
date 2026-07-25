
import type { DBMenuCustomization, FontFamily, ShadowIntensity } from "./types";

export const DEFAULT_CUSTOMIZATION: Omit<DBMenuCustomization, "id" | "hotel_id" | "created_at" | "updated_at"> = {
    primary_color: "#C8622A",
    background_color: "#FAFAF8",
    surface_color: "#FFFFFF",
    text_color: "#1A1A1A",
    accent_color: "#C8622A",
    muted_color: "#6B7280",

    font_family: "inter",
    base_font_size: 16,
    heading_weight: 700,

    border_radius: 12,
    shadow_intensity: "soft",

    menu_layout: "card",
    category_style: "pill",

    show_logo: true,
    show_cover_image: true,
    show_ratings: true,
    show_address: true,
    show_search: true,
    show_categories: true,
    show_item_images: true,
    show_descriptions: true,
    show_tags: true,
    show_spice_level: true,
    show_serving_size: true,
    show_dietary_badge: true,
    show_scanify_badge: true,
};

export const FONT_STACKS: Record<FontFamily, string> = {
    inter: "'Inter', sans-serif",
    poppins: "'Poppins', sans-serif",
    syne: "'Syne', sans-serif",
    outfit: "'Outfit', sans-serif",
    playfair: "'Playfair Display', serif",
    dm_sans: "'DM Sans', sans-serif",
    instrument_sans: "'Instrument Sans', sans-serif",
};

export const SHADOW_MAP: Record<ShadowIntensity, { sm: string; md: string; lg: string }> = {
    none: { sm: "none", md: "none", lg: "none" },
    soft: {
        sm: "0 1px 3px rgba(0,0,0,0.06)",
        md: "0 4px 12px rgba(0,0,0,0.08)",
        lg: "0 12px 28px rgba(0,0,0,0.10)",
    },
    medium: {
        sm: "0 1px 4px rgba(0,0,0,0.10)",
        md: "0 4px 16px rgba(0,0,0,0.13)",
        lg: "0 16px 36px rgba(0,0,0,0.16)",
    },
    strong: {
        sm: "0 2px 6px rgba(0,0,0,0.16)",
        md: "0 6px 22px rgba(0,0,0,0.20)",
        lg: "0 20px 48px rgba(0,0,0,0.26)",
    },
};

export const DIETARY_CONFIG = {
    veg: {
        label: 'Veg',
        dot: '#16A34A',
        ring: '#15803D',
    },

    non_veg: {
        label: 'Non-Veg',
        dot: '#DC2626',
        ring: '#B91C1C',
    },

    egg: {
        label: 'Contains Egg',
        dot: '#F59E0B',
        ring: '#D97706',
    },

    vegan: {
        label: 'Vegan',
        dot: '#10B981',
        ring: '#059669',
    },

    dairy: {
        label: 'Contains Dairy',
        dot: '#3B82F6',
        ring: '#2563EB',
    },

    gluten_free: {
        label: 'Gluten Free',
        dot: '#F97316',
        ring: '#EA580C',
    },

    jain: {
        label: 'Jain',
        dot: '#A855F7',
        ring: '#9333EA',
    },
} as const;

export const SPICE_CONFIG = {
    none: { label: "", peppers: 0, color: "transparent" },
    mild: { label: "Mild", peppers: 1, color: "#f59e0b" },
    medium: { label: "Medium", peppers: 2, color: "#f97316" },
    hot: { label: "Hot", peppers: 3, color: "#ef4444" },
    extra_hot: { label: "Extra Hot", peppers: 4, color: "#b91c1c" },
} as const;


export const QUERY_KEYS = {
    menuPage: (slug: string) => ["menu", "page", slug] as const,
    hotel: (slug: string) => ["menu", "hotel", slug] as const,
    menu: (hotelId: string) => ["menu", "items", hotelId] as const,
    theme: (hotelId: string) => ["menu", "theme", hotelId] as const,
} as const;

export const SCROLL_OFFSET_PX = 80;
export const IO_ROOT_MARGIN = "-28% 0px -65% 0px";