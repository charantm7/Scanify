// features/menu/types.ts
// Aligned 1-to-1 with the actual Supabase schema (database.types.ts).
// DietaryType / ItemTag / SpiceLevel are imported from menu_builder — single source of truth.

import type { Json } from "../../types/database.types";
import type { DietaryType, ItemTag, SpiceLevel } from "../menu_builder/types";

// Re-export so callers can import from one place
export type { DietaryType as DietaryFlag, ItemTag, SpiceLevel };

// ── Customization enums ────────────────────────────────────────────────────────
export type MenuLayout = "card" | "list" | "compact";
export type CategoryStyle = "pill" | "underline" | "card";
export type FontFamily = "inter" | "poppins" | "syne" | "outfit" | "playfair" | "dm_sans" | "instrument_sans";
export type ShadowIntensity = "none" | "soft" | "medium" | "strong";

// ── hotels row ─────────────────────────────────────────────────────────────────
export interface DBHotel {
    id: string;
    created_at: string;
    updated_at: string;
    owner_id: string;
    name: string;
    description: string | null;
    logo_url: string | null;
    cover_image_url: string | null;
    slug: string | null;
    address: string | null;
    pincode: string | null;
    phone: string | null;
    website: string | null;
    google_maps_url: string | null;
    is_active: boolean;
    is_open: boolean | null;       // nullable in real DB
    open_time: string | null;
    close_time: string | null;
    theme_color: string | null;
    currency: string;
    rating: number | null;         // nullable in real DB
    review_count: number | null;   // nullable in real DB
    cuisine_type: string[] | null;
    service_type: string[] | null;
    restaurant_type: string[] | null;
    deleted_at: string | null;
}

// ── categories row ─────────────────────────────────────────────────────────────
export interface DBCategory {
    id: string;
    created_at: string;
    hotel_id: string;
    name: string;
    description: string | null;
    cover_image: string | null;
    icon: string | null;
    sort_order: number;
    is_active: boolean;
    deleted_at: string | null;
}

// ── menu_items row ─────────────────────────────────────────────────────────────
// Exact match to database.types.ts menu_items.Row.
// dietary_type stores DietaryType values ("veg", "non_veg", etc.)
// spice_level stores SpiceLevel values ("mild", "hot", etc.)
// tags stores ItemTag[] values ("bestseller", "chefs_special", etc.)
export interface DBMenuItem {
    id: string;
    created_at: string;
    updated_at: string;
    hotel_id: string;
    category_id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
    sort_order: number;
    dietary_type: DietaryType | null;  // written by menu_builder
    spice_level: SpiceLevel | null;    // written by menu_builder
    tags: ItemTag[] | null;            // written by menu_builder
    variants: string[] | null;
    serving_size: string | null;
    preparation_time: number | null;
    ingredients: string[] | null;
    allergens: string[] | null;
    calories: number | null;
    deleted_at: string | null;
}

// ── menu_item_images row ───────────────────────────────────────────────────────
export interface DBMenuItemImage {
    id: string;
    item_id: string;
    hotel_id: string;
    url: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
    created_at: string;
}

// ── menu_customizations row ────────────────────────────────────────────────────
export interface DBMenuCustomization {
    id: string;
    hotel_id: string;
    primary_color: string;
    background_color: string;
    surface_color: string;
    text_color: string;
    accent_color: string;
    muted_color: string;
    font_family: FontFamily;
    base_font_size: number;
    heading_weight: number;
    border_radius: number;
    shadow_intensity: ShadowIntensity;
    menu_layout: MenuLayout;
    category_style: CategoryStyle;
    show_logo: boolean;
    show_cover_image: boolean;
    show_ratings: boolean;
    show_address: boolean;
    show_search: boolean;
    show_categories: boolean;
    show_item_images: boolean;
    show_descriptions: boolean;
    show_tags: boolean;
    show_spice_level: boolean;
    show_serving_size: boolean;
    show_dietary_badge: boolean;
    show_scanify_badge: boolean;
    created_at: string;
    updated_at: string;
}

// ── Composed view models ───────────────────────────────────────────────────────
export interface MenuItem extends DBMenuItem {
    images: DBMenuItemImage[];
}

export interface MenuCategory extends DBCategory {
    items: MenuItem[];
}

export interface MenuPageData {
    hotel: DBHotel;
    categories: MenuCategory[];
    customization: DBMenuCustomization;
}

// ── Theme tokens ───────────────────────────────────────────────────────────────
// Includes both --color-* (menu components) and legacy --bg/--accent/etc.
// (globals.css utilities). Index signature allows both sets.
export interface ThemeTokens {
    "--color-primary": string;
    "--color-bg": string;
    "--color-surface": string;
    "--color-text": string;
    "--color-accent": string;
    "--color-muted": string;
    "--color-accent-lt": string;
    "--color-border": string;
    "--color-border2": string;
    "--border-radius": string;
    "--font-family": string;
    "--shadow-sm": string;
    "--shadow-md": string;
    "--shadow-lg": string;
    // Legacy aliases consumed by globals.css utilities
    [key: string]: string;
}

// ── Search ─────────────────────────────────────────────────────────────────────
export interface SearchResult {
    item: MenuItem;
    categoryName: string;
    matchScore: number;
}

// ── Analytics ──────────────────────────────────────────────────────────────────
export type MenuEventType =
    | "page_view"
    | "search"
    | "category_click"
    | "item_view"
    | "item_modal_open";

export interface MenuScanEvent {
    hotel_id: string;
    qr_code_id?: string;
    item_id?: string;
    event_type: MenuEventType;
    metadata?: Json;
    session_id?: string;
}