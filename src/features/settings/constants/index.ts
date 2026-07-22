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
    'North Indian', 'South Indian', 'Chinese', 'Continental',
    'Italian', 'Mexican', 'Fast Food', 'Bakery', 'Multi-Cuisine',
];

export const SERVICE_TYPE_OPTIONS = ['Dine-in', 'Takeaway', 'Delivery', 'Buffet'];

export const RESTAURANT_TYPE_OPTIONS = ['Casual Dining', 'Fine Dining', 'Cafe', 'Cloud Kitchen', 'QSR', 'Bar & Lounge'];

export type SettingsTabDef = (typeof SETTINGS_TABS)[number];