import type {
    ProfileStepData,
    RestaurantStepData,
    ProfileErrors,
    RestaurantErrors,
} from '../types';

// ─── Slug generation ───────────────────────────────────────────────────────────
export function generateSlug(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

// ─── Validation ────────────────────────────────────────────────────────────────
export function validateProfile(data: ProfileStepData): ProfileErrors {
    const errors: ProfileErrors = {};

    if (!data.fullName.trim()) {
        errors.fullName = 'Full name is required.';
    }

    if (!data.phone.trim()) {
        errors.phone = 'Phone number is required.';
    } else if (!/^\+?[\d\s\-]{7,15}$/.test(data.phone)) {
        errors.phone = 'Enter a valid phone number.';
    }

    return errors;
}

export function validateRestaurant(data: RestaurantStepData): RestaurantErrors {
    const errors: RestaurantErrors = {};

    if (!data.restaurantName.trim()) {
        errors.restaurantName = 'Restaurant name is required.';
    }
    if (!data.restaurantType.length) {
        errors.restaurantType = 'Select at least one restaurant type.';
    }
    if (!data.cuisineType.length) {
        errors.cuisineType = 'Select at least one cuisine type.';
    }
    if (!data.serviceType.length) {
        errors.serviceType = 'Select at least one service type.';
    }
    if (!data.description.trim()) {
        errors.description = 'Please add a short description.';
    }
    if (!data.address.trim()) {
        errors.address = 'Street address is required.';
    }
    if (!data.city.trim()) {
        errors.city = 'City is required.';
    }
    if (!data.pincode.trim()) {
        errors.pincode = 'Pincode is required.';
    } else if (!/^\d{4,10}$/.test(data.pincode)) {
        errors.pincode = 'Enter a valid pincode.';
    }

    return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
    return Object.values(errors).some(Boolean);
}