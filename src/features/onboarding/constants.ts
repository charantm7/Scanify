import { Store, Navigation, Utensils, ContactRound } from 'lucide-react';
import type { StepConfig } from './types';

export const STEPS: StepConfig[] = [
    {
        id: 1,
        label: 'Basic Info',
        sublabel: 'Restaurant identity',
        icon: Store,
        description: 'Tell us about your restaurant — name, vibe, and how guests see you.',
    },
    {
        id: 2,
        label: 'Location',
        sublabel: 'Where you are',
        icon: Navigation,
        description: 'Your address helps guests find you and keeps your profile accurate.',
    },
    {
        id: 3,
        label: 'Preferences',
        sublabel: 'Cuisine & service',
        icon: Utensils,
        description: 'Help guests know what to expect — cuisine, restaurant type, and how you serve.',
    },
    {
        id: 4,
        label: 'Contact',
        sublabel: 'Admin details',
        icon: ContactRound,
        description: "We'll use these details for your account and to reach you if needed.",
    },
];

export const TOTAL_STEPS = STEPS.length;

/** Number of required fields counted toward the progress bar, per step */
export const STEP_TOTALS: Record<number, number> = {
    1: 2, // restaurant_name, description
    2: 3, // address, city, pincode
    3: 3, // cuisine_types, restaurant_types, service_types
    4: 2, // name, phone
};

export const CUISINE_TYPES = [
    'South Indian', 'North Indian', 'Karnataka', 'Andhra', 'Kerala',
    'Tamil Nadu', 'Hyderabadi', 'Punjabi', 'Gujarati', 'Rajasthani',
    'Bengali', 'Maharashtrian', 'Goan',
    'Chinese', 'Indo-Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese',
    'Italian', 'French', 'Spanish', 'Greek',
    'American', 'Mexican',
    'Arabic', 'Lebanese', 'Turkish', 'Persian',
    'Biryani', 'Seafood',
    'Vegetarian', 'Vegan', 'Jain',
    'Street Food', 'BBQ & Grill', 'Bakery', 'Desserts',
    'Cafe', 'Juice Bar', 'Fast Food', 'Multi-Cuisine',
] as const;

export const RESTAURANT_TYPES = [
    'Casual Dining', 'Fine Dining', 'Fast Food', 'Cafe',
    'Cloud Kitchen', 'Bakery', 'Buffet', 'Bar',
    'Restaurant & Bar', 'Food Truck', 'Canteen', 'Pizzeria',
    'Seafood Restaurant', 'BBQ Restaurant', 'Multi-Outlet Chain', 'Hotel Restaurant',
] as const;

export const SERVICE_TYPES = [
    'Dine-In', 'Takeaway', 'Delivery', 'Drive-Thru', 'Curbside Pickup',
] as const;

/** Turns a restaurant name into a URL-safe slug used for the subdomain */
export function buildSlug(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}