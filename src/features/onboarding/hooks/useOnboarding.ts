import { useCallback, useState } from "react";

import { useRouter } from "next/navigation";
import { OnboardingStep, ProfileStepData, RestaurantStepData, MenuUrlStepData } from "../types";
import { ONBOARDING_STEPS } from "../constants";
import { useApp } from "../../../context/AppContext";
import { updateUserProfile } from "../../authentication/query/auth.query";
import { generateSlug } from "../services/onboarding.service";

export function useOnboarding() {
    const router = useRouter();
    const { user, supabase } = useApp();

    const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile');

    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [profileData, setProfileData] = useState<ProfileStepData>({ fullName: '', phone: '' });
    const [restaurantData, setRestaurantData] = useState<RestaurantStepData>({
        restaurantName: '',
        restaurantType: [],
        cuisineType: [],
        serviceType: [],
        city: '',
        address: '',
        description: '',
    });

    const [menuUrlData, setMenuUrlData] = useState<MenuUrlStepData>({ slug: '' });

    const [slugChecking, setSlugChecking] = useState(false);
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

    // Derived constants

    const stepIndex = ONBOARDING_STEPS.indexOf(currentStep);
    const totalStep = ONBOARDING_STEPS.length - 1;
    const progresspct = Math.round((stepIndex / totalStep) * 100);
    const isFirstStep = currentStep === 'profile';
    const isLastStep = currentStep === 'menu-url';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const menuPreview = menuUrlData.slug ? `${appUrl}/menu/${menuUrlData.slug}` : '';

    function clearError() { setError(null) };

    async function run(action: () => Promise<void>) {
        setSaving(true);
        setError(null);

        try {
            await action();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    }

    function goBack() {
        const idx = ONBOARDING_STEPS.indexOf(currentStep);
        if (idx > 0) setCurrentStep(ONBOARDING_STEPS[idx - 1]);
    }

    // profile

    const submitProfile = useCallback(async (data: ProfileStepData) => {
        if (!data.fullName.trim()) { setError('Full name is required.'); return; }
        if (!user?.id) { setError('Session expired. Please sign in again.'); return; }

        await run(async () => {
            setProfileData(data);

            await updateUserProfile(
                supabase,
                {
                    id: user.id,
                    name: data.fullName.trim(),
                    phone: data.phone.trim() || null
                });
            setCurrentStep('restaurant');
        })
    }, [user?.id, supabase]);

    function validate(data: RestaurantStepData) {
        if (!data.restaurantName.trim()) { setError('Restaurant name is required.'); return; }
        if (!data.restaurantType) { setError('Restaurant Type is required.'); return; }
        if (!data.cuisineType) { setError('Cuisine Type is required.'); return; }
        if (!data.serviceType) { setError('Service Type is required.'); return; }
    }

    const submitRestaurant = useCallback(async (data: RestaurantStepData) => {
        validate(data);

        await run(async () => {
            setRestaurantData(data);

            const autoSlug = generateSlug(data.restaurantName)
            setMenuUrlData({ slug: autoSlug })
        })
    }, [])

}