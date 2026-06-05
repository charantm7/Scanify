import {
    Store, Navigation, ContactRound
} from 'lucide-react';
import { OnboardingStep } from './types';

export const STEPS = [
    {
        id: 1, label: 'Basic Info', sublabel: 'Restaurant identity', icon: Store,
        description: 'Tell us about your restaurant — name, vibe, and how guests see you.',
    },
    {
        id: 2, label: 'Location', sublabel: 'Where you are', icon: Navigation,
        description: 'Your address helps guests find you and keeps your profile accurate.',
    },
    {
        id: 3, label: 'Contact', sublabel: 'Admin details', icon: ContactRound,
        description: 'Well use these details for your account and to reach you if needed.',
    },
] as const;

export const ONBOARDING_STEPS: OnboardingStep[] = [
    'restaurant',
    'profile',
    'done',
];


export const STEP_LABELS: Record<OnboardingStep, string> = {
    'profile': 'Your Profile',
    'restaurant': 'Your Restaurant',
    'menu-url': 'Your Menu URL',
    'done': 'All set!'
};


export const CUISINE_TYPES = [
    'South Indian',
    'North Indian',
    'Karnataka',
    'Andhra',
    'Kerala',
    'Tamil Nadu',
    'Hyderabadi',
    'Punjabi',
    'Gujarati',
    'Rajasthani',
    'Bengali',
    'Maharashtrian',
    'Goan',

    'Chinese',
    'Indo-Chinese',
    'Japanese',
    'Korean',
    'Thai',
    'Vietnamese',

    'Italian',
    'French',
    'Spanish',
    'Greek',

    'American',
    'Mexican',

    'Arabic',
    'Lebanese',
    'Turkish',
    'Persian',

    'Biryani',
    'Seafood',

    'Vegetarian',
    'Vegan',
    'Jain',

    'Street Food',
    'BBQ & Grill',

    'Bakery',
    'Desserts',
    'Cafe',
    'Juice Bar',

    'Fast Food',
    'Multi-Cuisine',
] as const;

export const RESTAURANT_TYPES = [
    'Casual Dining',
    'Fine Dining',
    'Fast Food',
    'Cafe',
    'Cloud Kitchen',
    'Bakery',
    'Buffet',
    'Bar',
    'Restaurant & Bar',
    'Food Truck',
    'Canteen',
    'Pizzeria',
    'Seafood Restaurant',
    'BBQ Restaurant',
    'Multi-Outlet Chain',
    'Hotel Restaurant',
] as const;

export const SERVICE_TYPES = [
    'Dine-In',
    'Takeaway',
    'Delivery',
    'Drive-Thru',
    'Curbside Pickup',
] as const;