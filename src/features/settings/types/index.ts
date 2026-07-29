export interface ProfileFormData {
    name: string;
}

export interface EmailFormData {
    email: string;
}

export interface PasswordFormData {
    current: string;
    next: string;
    confirm: string;
}

export type PasswordFieldKey = keyof PasswordFormData;

export interface PasswordFieldErrors {
    current?: string;
    next?: string;
    confirm?: string;
}

export interface RestaurantFormData {
    name: string;
    description: string;
    logo_url: string;
    address: string;
    phone: string;
    website: string;
    rating: string;
    review_count: number;
    google_maps_url: string;
    cuisine_type: string[];
    service_type: string[];
    restaurant_type: string[];
}

export interface OperatingHoursFormData {
    is_open: boolean;
    open_time: string | null; // 'HH:mm'
    close_time: string | null;
}

export type SettingsTabId = 'profile' | 'restaurant' | 'hours' | 'danger';

export interface SettingsTab {
    id: SettingsTabId;
    label: string;
}