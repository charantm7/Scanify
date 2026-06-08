import { CUISINE_TYPES, RESTAURANT_TYPES, SERVICE_TYPES } from './constants';

// ─── Step identifiers ──────────────────────────────────────────────────────────
export type OnboardingStep = 'profile' | 'restaurant' | 'done';

export type RestaurantSubStep = 1 | 2 | 3;

// ─── Enum-like types derived from constants ────────────────────────────────────
export type CuisineType = (typeof CUISINE_TYPES)[number];
export type RestaurantType = (typeof RESTAURANT_TYPES)[number];
export type ServiceType = (typeof SERVICE_TYPES)[number];

// ─── Step data shapes ──────────────────────────────────────────────────────────
export interface ProfileStepData {
    fullName: string;
    phone: string;
}

export interface RestaurantStepData {
    restaurantName: string;
    restaurantType: RestaurantType[];
    cuisineType: CuisineType[];
    serviceType: ServiceType[];
    city: string;
    address: string;
    pincode: string;
    description: string;
    website: string;
    logoUrl: string;
}

// ─── Validation errors ─────────────────────────────────────────────────────────
export type ProfileErrors = Partial<Record<keyof ProfileStepData, string>>;
export type RestaurantErrors = Partial<Record<keyof RestaurantStepData | 'general', string>>;

// ─── Supabase insert payload ───────────────────────────────────────────────────
// Extend / replace with your generated `HotelInsert` type from supabase types.
export interface HotelInsertPayload {
    owner_id: string;
    name: string;
    slug: string;
    description: string;
    logo_url: string | null;
    address: string;
    pincode: string;
    website: string | null;
    // New columns — add these to your hotels table migration:
    restaurant_type: RestaurantType[];
    cuisine_type: CuisineType[];
    service_type: ServiceType[];
}