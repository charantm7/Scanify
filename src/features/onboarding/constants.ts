import { Store, Navigation, ContactRound } from 'lucide-react';
import type { OnboardingStep } from './types';

// ─── Step flow order ───────────────────────────────────────────────────────────
export const ONBOARDING_STEPS: OnboardingStep[] = ['profile', 'restaurant', 'done'];

// ─── Sidebar step metadata ─────────────────────────────────────────────────────
export const STEPS = [
    {
        id: 1,
        label: 'Basic Info',
        sublabel: 'Restaurant identity',
        icon: Store,
        description: 'Tell us about your restaurant — name, vibe, and how guests see you.',
        fields: 3, // restaurantName + description + logoUrl
    },
    {
        id: 2,
        label: 'Location',
        sublabel: 'Where you are',
        icon: Navigation,
        description: 'Your address helps guests find you and keeps your profile accurate.',
        fields: 3, // address + city + pincode
    },
    {
        id: 3,
        label: 'Contact',
        sublabel: 'Admin details',
        icon: ContactRound,
        description: "We'll use these details for your account and to reach you if needed.",
        fields: 2, // fullName + phone
    },
] as const;

// ─── Cuisine types ─────────────────────────────────────────────────────────────
export const CUISINE_TYPES = [
    // Indian regional
    'South Indian', 'North Indian', 'Karnataka', 'Andhra', 'Kerala',
    'Tamil Nadu', 'Hyderabadi', 'Punjabi', 'Gujarati', 'Rajasthani',
    'Bengali', 'Maharashtrian', 'Goan',
    // Asian
    'Chinese', 'Indo-Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese',
    // European
    'Italian', 'French', 'Spanish', 'Greek',
    // Americas
    'American', 'Mexican',
    // Middle-Eastern
    'Arabic', 'Lebanese', 'Turkish', 'Persian',
    // Specialty
    'Biryani', 'Seafood',
    // Diet-based
    'Vegetarian', 'Vegan', 'Jain',
    // Format
    'Street Food', 'BBQ & Grill', 'Bakery', 'Desserts',
    'Cafe', 'Juice Bar', 'Fast Food', 'Multi-Cuisine',
] as const;

// ─── Restaurant types ──────────────────────────────────────────────────────────
export const RESTAURANT_TYPES = [
    'Casual Dining', 'Fine Dining', 'Fast Food', 'Cafe',
    'Cloud Kitchen', 'Bakery', 'Buffet', 'Bar',
    'Restaurant & Bar', 'Food Truck', 'Canteen', 'Pizzeria',
    'Seafood Restaurant', 'BBQ Restaurant', 'Multi-Outlet Chain', 'Hotel Restaurant',
] as const;

// ─── Service types ─────────────────────────────────────────────────────────────
export const SERVICE_TYPES = [
    'Dine-In', 'Takeaway', 'Delivery', 'Drive-Thru', 'Curbside Pickup',
] as const;