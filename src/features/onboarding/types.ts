import { CUISINE_TYPES, RESTAURANT_TYPES, SERVICE_TYPES } from "./constants";

export type OnboardingStep = | 'profile' | 'restaurant' | 'menu-url' | 'done';

export type CuisineType = (typeof CUISINE_TYPES)[number];

export type RestaurantType =
    (typeof RESTAURANT_TYPES)[number];


export interface ProfileStepData {
    fullName: string;
    phone: string;
}

export type ServiceType =
    (typeof SERVICE_TYPES)[number];

export interface RestaurantStepData {
    restaurantName: string;
    restaurantType: RestaurantType[];
    cuisineType: CuisineType[];
    serviceType: ServiceType[];
    city: string;
    address: string;
    description: string;
}


export interface MenuUrlStepData {
    slug: string;
}
