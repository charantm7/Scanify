import type { Json } from "../../types/database.types";

export type DietaryFlag =
    | "veg"
    | "non_veg"
    | "vegan"
    | "jain"
    | "gluten_free"
    | "dairy"
    | "egg";

export type SpiceLevel = "none" | "mild" | "medium" | "hot" | "extra_hot";
export type MenuLayout = "card" | "list" | "grid";
export type CategoryStyle = "pill" | "underline" | "card";
export type FontFamily = "inter" | "poppins" | "syne" | "outfit" | "playfair" | "dm_sans";
export type ShadowIntensity = "none" | "soft" | "medium" | "strong";

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
    is_open: boolean | null;
    open_time: string | null;
    close_time: string | null;
    theme_color: string | null;
    currency: string;
    rating: number | null;
    review_count: number | null;
    cuisine_type: string[] | null;
    service_type: string[] | null;
    restaurant_type: string[] | null;
    deleted_at: string | null;
}

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
    dietary_type: string | null;
    spice_level: string | null;
    tags: string[] | null;
    variants: string[] | null;
    serving_size: string | null;
    preparation_time: number | null;
    ingredients: string[] | null;
    allergens: string[] | null;
    calories: number | null;
    deleted_at: string | null;
}

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
}

export interface SearchResult {
    item: MenuItem;
    categoryName: string;
    matchScore: number;
}

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