import { User, Building2, Clock, ShieldAlert } from 'lucide-react';
import type { SettingsTabId } from '../types';

export const SETTINGS_TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'restaurant', label: 'Restaurant', icon: Building2 },
    { id: 'hours', label: 'Operating Hours', icon: Clock },
    { id: 'danger', label: 'Danger Zone', icon: ShieldAlert },
] as const;

export const PASSWORD_MIN_LENGTH = 8;

export const EMPTY_RESTAURANT_FORM = {
    name: '',
    description: '',
    logo_url: '',
    address: '',
    phone: '',
    website: '',
    google_maps_url: '',
    cuisine_type: [],
    service_type: [],
    restaurant_type: [],
};


export const CUISINE_OPTIONS = [
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
];

export const RESTAURANT_TYPE_OPTIONS = [
    'Casual Dining', 'Fine Dining', 'Fast Food', 'Cafe',
    'Cloud Kitchen', 'Bakery', 'Buffet', 'Bar',
    'Restaurant & Bar', 'Food Truck', 'Canteen', 'Pizzeria',
    'Seafood Restaurant', 'BBQ Restaurant', 'Multi-Outlet Chain', 'Hotel Restaurant',
];

export const SERVICE_TYPE_OPTIONS = [
    'Dine-In', 'Takeaway', 'Delivery', 'Drive-Thru', 'Curbside Pickup',
];

export type SettingsTabDef = (typeof SETTINGS_TABS)[number];