'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ONBOARDING_STEPS } from '../constants';
import { generateSlug, validateProfile, validateRestaurant, hasErrors } from '../services/onboarding.service';
import { updateUserProfile, insertHotel, checkSlugAvailable } from '../queries/onboarding.queries';
import type {
    OnboardingStep,
    ProfileStepData,
    RestaurantStepData,
    ProfileErrors,
    RestaurantErrors,
} from '../types';

// Replace with your actual AppContext import path
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../hooks/useToast';

// ─── Default state ─────────────────────────────────────────────────────────────
const DEFAULT_PROFILE: ProfileStepData = { fullName: '', phone: '' };

const DEFAULT_RESTAURANT: RestaurantStepData = {
    restaurantName: '',
    restaurantType: [],
    cuisineType: [],
    serviceType: [],
    city: '',
    address: '',
    pincode: '',
    description: '',
    website: '',
    logoUrl: '',
};

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useOnboarding() {
    const router = useRouter();
    const toast = useToast();
    const { user, supabase } = useApp();

    // ── Navigation ────────────────────────────────────────────────────────────
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile');

    const stepIndex = ONBOARDING_STEPS.indexOf(currentStep);
    const totalSteps = ONBOARDING_STEPS.length - 1; // exclude 'done'
    const progressPct = Math.round((stepIndex / totalSteps) * 100);
    const isFirstStep = stepIndex === 0;
    const isLastStep = currentStep === 'restaurant';

    function goBack() {
        const idx = ONBOARDING_STEPS.indexOf(currentStep);
        if (idx > 0) setCurrentStep(ONBOARDING_STEPS[idx - 1]);
    }

    function goForward() {
        const idx = ONBOARDING_STEPS.indexOf(currentStep);
        if (idx < ONBOARDING_STEPS.length - 1) setCurrentStep(ONBOARDING_STEPS[idx + 1]);
    }

    // ── Async helpers ─────────────────────────────────────────────────────────
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function clearError() { setError(null); }

    async function run(action: () => Promise<void>) {
        setSaving(true);
        setError(null);
        try {
            await action();
        } catch (err) {
            setError(err instanceof Error && err.message);
        } finally {
            setSaving(false);
        }
    }

    // ── Profile step ──────────────────────────────────────────────────────────
    const [profileData, setProfileData] = useState<ProfileStepData>(DEFAULT_PROFILE);
    const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});

    const submitProfile = useCallback(async (data: ProfileStepData) => {
        const errors = validateProfile(data);
        if (hasErrors(errors)) { setProfileErrors(errors); return; }
        if (!user?.id) { setError('Session expired. Please sign in again.'); return; }

        await run(async () => {
            setProfileData(data);
            // We don't persist yet — profile is saved together with restaurant on final submit
            goForward();
        });
    }, [user?.id]);

    // ── Restaurant step ───────────────────────────────────────────────────────
    const [restaurantData, setRestaurantData] = useState<RestaurantStepData>(DEFAULT_RESTAURANT);
    const [restaurantErrors, setRestaurantErrors] = useState<RestaurantErrors>({});

    // Slug preview
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const previewSlug = generateSlug(restaurantData.restaurantName);
    const menuPreview = previewSlug ? `${appUrl}/menu/${previewSlug}` : '';

    // Slug availability (debounced externally or on demand)
    const [slugChecking, setSlugChecking] = useState(false);
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

    const checkSlug = useCallback(async (name: string) => {
        const slug = generateSlug(name);
        if (!slug) return;
        setSlugChecking(true);
        try {
            const available = await checkSlugAvailable(supabase, slug);
            setSlugAvailable(available);
        } catch {
            setSlugAvailable(null);
        } finally {
            setSlugChecking(false);
        }
    }, [supabase]);

    // Final submit — persists both profile + restaurant in one go
    const submitRestaurant = useCallback(async (data: RestaurantStepData) => {
        const errors = validateRestaurant(data);
        if (hasErrors(errors)) { setRestaurantErrors(errors); return; }
        if (!user?.id) { setError('Session expired. Please sign in again.'); return; }

        await run(async () => {
            setRestaurantData(data);

            const slug = generateSlug(data.restaurantName);

            // 1. Insert hotel row (with new array columns)
            await insertHotel(supabase, {
                owner_id: user.id,
                name: data.restaurantName.trim(),
                slug,
                description: data.description.trim(),
                logo_url: data.logoUrl.trim() || null,
                address: data.address.trim(),
                pincode: data.pincode.trim(),
                website: data.website.trim() || null,
                restaurant_type: data.restaurantType,
                cuisine_type: data.cuisineType,
                service_type: data.serviceType,
            });

            // 2. Update user profile + mark onboarding complete
            await updateUserProfile(supabase, {
                id: user.id,
                name: profileData.fullName.trim(),
                phone: profileData.phone.trim() || null,
                restaurantName: data.restaurantName.trim(),
            });

            setCurrentStep('done');
        });
    }, [user?.id, supabase, profileData]);

    // ── Derived slug for success screen ───────────────────────────────────────
    const createdSlug = generateSlug(restaurantData.restaurantName);

    return {
        // Navigation
        currentStep,
        stepIndex,
        progressPct,
        isFirstStep,
        isLastStep,
        goBack,

        // Async state
        saving,
        error,
        clearError,

        // Profile
        profileData,
        profileErrors,
        setProfileErrors,
        submitProfile,

        // Restaurant
        restaurantData,
        restaurantErrors,
        setRestaurantErrors,
        submitRestaurant,

        // Slug
        previewSlug,
        menuPreview,
        slugChecking,
        slugAvailable,
        checkSlug,

        // Done
        createdSlug,
    };
}