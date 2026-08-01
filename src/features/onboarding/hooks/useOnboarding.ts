'use client';

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../../lib/supabase/client';
import { useToast } from '../../../hooks/useToast';

import type {
    Step,
    AnimDirection,
    OnboardingField,
    MultiSelectField,
    OnboardingFormState,
    OnboardingFormErrors,
    UseOnboardingReturn,
} from '../types';
import { STEP_TOTALS, TOTAL_STEPS } from '../constants';
import { fetchOnboardingSession, getFriendlyError, submitOnboarding } from '../services/onboarding.service';

const INITIAL_FORM: OnboardingFormState = {
    restaurant_name: '', description: '', logo_url: '',
    address: '', city: '', pincode: '',
    cuisine_types: [], restaurant_types: [], service_types: [],
    name: '', phone: '', website: '', email: ''
};

export function useOnboarding(): UseOnboardingReturn {
    const router = useRouter();
    const toast = useToast();
    const supabase = getSupabaseClient();

    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [animDir, setAnimDir] = useState<AnimDirection>('forward');
    const [animating, setAnimating] = useState(false);
    const [done, setDone] = useState(false);
    const [createdSlug, setCreatedSlug] = useState('');

    const [form, setForm] = useState<OnboardingFormState>(INITIAL_FORM);
    const [errors, setErrors] = useState<OnboardingFormErrors>({});

    // wraps all async actions: handles the loading flag + a single error/toast path
    const run = useCallback(async (action: () => Promise<void>) => {
        setLoading(true);
        try {
            await action();
        } catch (err) {
            toast.error(getFriendlyError(err));
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Gate: require a session, then prefill the admin name from auth metadata
    useEffect(() => {
        fetchOnboardingSession(supabase)
            .then((session) => {
                if (!session) {
                    router.push('/login');
                    return;
                }
                setUserId(session.user.id);
                setEmail(session.user.email)
                const fullName = session.user.user_metadata?.full_name;
                if (fullName) {
                    setForm((f) => ({ ...f, name: fullName }));
                }
            })
            .catch(() => {
                toast.error('Could not verify your session. Please sign in again.');
                router.push('/login');
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    const set = useCallback((field: OnboardingField) => {
        return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const value = e.target.value;
            setForm((f) => ({ ...f, [field]: value }));
            setErrors((err) => ({ ...err, [field]: undefined }));
        };
    }, []);

    const togglePill = useCallback((field: MultiSelectField, value: string) => {
        setForm((f) => {
            const current = f[field];
            const next = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];
            return { ...f, [field]: next };
        });
        setErrors((err) => ({ ...err, [field]: undefined }));
    }, []);

    const validateStep = useCallback((s: Step): boolean => {
        const e: OnboardingFormErrors = {};

        if (s === 1) {
            if (!form.restaurant_name.trim()) e.restaurant_name = 'Restaurant name is required';
            if (!form.description.trim()) e.description = 'Please add a short description';
        }
        if (s === 2) {
            if (!form.address.trim()) e.address = 'Address is required';
            if (!form.city.trim()) e.city = 'City is required';
            if (!form.pincode.trim()) e.pincode = 'Pincode is required';
            else if (!/^\d{4,10}$/.test(form.pincode)) e.pincode = 'Enter a valid pincode';
        }
        if (s === 3) {
            if (form.cuisine_types.length === 0) e.cuisine_types = 'Select at least one cuisine';
            if (form.restaurant_types.length === 0) e.restaurant_types = 'Select at least one restaurant type';
            if (form.service_types.length === 0) e.service_types = 'Select at least one service type';
        }
        if (s === 4) {
            if (!form.name.trim()) e.name = 'Your name is required';
            if (!form.phone.trim()) e.phone = 'Phone number is required';
            else if (!/^\+?[\d\s\-]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    }, [form]);

    const goNext = useCallback(() => {
        if (!validateStep(step) || animating) return;
        setAnimDir('forward');
        setAnimating(true);
        setTimeout(() => {
            setStep((s) => (s + 1) as Step);
            setAnimating(false);
        }, 220);
    }, [step, animating, validateStep]);

    const goPrev = useCallback(() => {
        if (animating) return;
        setAnimDir('backward');
        setAnimating(true);
        setTimeout(() => {
            setStep((s) => (s - 1) as Step);
            setAnimating(false);
        }, 220);
    }, [animating]);

    const handleSubmit = useCallback(async () => {
        if (!validateStep(4)) return;
        if (!userId) {
            toast.error('Session expired. Please sign in again.');
            return;
        }

        setErrors((err) => ({ ...err, general: undefined }));
        await run(async () => {
            try {
                const slug = await submitOnboarding(supabase, userId, form, email);
                setCreatedSlug(slug);
                toast.success('Restaurant profile created! 🎉');
                setDone(true);
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Something went wrong.';
                setErrors((e) => ({ ...e, general: msg }));
                throw err;
            }
        });
    }, [form, userId, supabase, toast, run, validateStep, email]);

    const goToConsole = useCallback(() => {
        window.location.href = `https://${window.location.host}/console`;
    }, []);

    const completedFields: Record<number, number> = {
        1: [form.restaurant_name, form.description].filter(Boolean).length,
        2: [form.address, form.city, form.pincode].filter(Boolean).length,
        3: [
            form.cuisine_types.length > 0,
            form.restaurant_types.length > 0,
            form.service_types.length > 0,
        ].filter(Boolean).length,
        4: [form.name, form.phone].filter(Boolean).length,
    };

    return {
        step,
        totalSteps: TOTAL_STEPS,
        loading,
        done,
        animDir,
        animating,
        form,
        errors,
        createdSlug,
        menuUrl: done ? `${window.location.origin}/console` : '',
        completedFields,
        stepTotals: STEP_TOTALS,
        set,
        togglePill,
        goNext,
        goPrev,
        handleSubmit,
        goToConsole,
    };
}