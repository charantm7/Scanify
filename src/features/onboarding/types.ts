import type { LucideIcon } from 'lucide-react';
import type { ChangeEvent } from 'react';

export type Step = 1 | 2 | 3 | 4;
export type AnimDirection = 'forward' | 'backward';

export interface StepConfig {
    id: Step;
    label: string;
    sublabel: string;
    icon: LucideIcon;
    description: string;
}

export interface OnboardingFormState {
    // Step 1 — Basic Info
    restaurant_name: string;
    description: string;
    logo_url: string;
    // Step 2 — Location
    address: string;
    city: string;
    pincode: string;
    // Step 3 — Preferences (multi-select)
    cuisine_types: string[];
    restaurant_types: string[];
    service_types: string[];
    // Step 4 — Contact
    name: string;
    phone: string;
    website: string;
    email: string;
}

/** Fields rendered as pill multi-selects */
export type MultiSelectField = 'cuisine_types' | 'restaurant_types' | 'service_types';

/** Fields rendered as plain text inputs/textareas */
export type OnboardingField = Exclude<keyof OnboardingFormState, MultiSelectField>;

export interface OnboardingFormErrors {
    restaurant_name?: string;
    description?: string;
    address?: string;
    city?: string;
    pincode?: string;
    cuisine_types?: string;
    restaurant_types?: string;
    service_types?: string;
    name?: string;
    phone?: string;
    general?: string;
}

export interface UseOnboardingReturn {
    step: Step;
    totalSteps: number;
    loading: boolean;
    done: boolean;
    animDir: AnimDirection;
    animating: boolean;
    form: OnboardingFormState;
    errors: OnboardingFormErrors;
    createdSlug: string;
    /** Live menu URL, only populated once `done` is true */
    menuUrl: string;
    completedFields: Record<number, number>;
    stepTotals: Record<number, number>;

    set: (field: OnboardingField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    togglePill: (field: MultiSelectField, value: string) => void;
    goNext: () => void;
    goPrev: () => void;
    handleSubmit: () => Promise<void>;
    goToConsole: () => void;
}