'use client';
import React, { useState } from 'react';
import {
    Building2, MapPin,
    ChevronRight, ChevronLeft, Loader2, CheckCircle2,
    Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

import { STEPS } from '../constants';
import { useOnboarding } from '../hooks/useOnboarding';
import type {
    ProfileStepData,
    RestaurantStepData,
    RestaurantSubStep,
} from '../types';

import { subdomainUrlBuilderWithWindow } from '../../../context/Service';

import {
    SuccessScreen,
    ProfileStep,
    RestaurantStep
} from './OnboaringUIComponents'


// Main Component
export default function OnboardingPage() {
    const router = useRouter();

    const {
        currentStep,
        saving,
        error,
        clearError,
        profileData,
        profileErrors,
        setProfileErrors,
        submitProfile,
        restaurantData,
        restaurantErrors,
        setRestaurantErrors,
        submitRestaurant,
        previewSlug,
        createdSlug,
        goBack,
    } = useOnboarding();

    // ── Local form state (controlled, flushed to hook on submit) ──────────────
    const [localProfile, setLocalProfile] = useState<ProfileStepData>({ fullName: '', phone: '' });
    const [localRestaurant, setLocalRestaurant] = useState<RestaurantStepData>({
        restaurantName: '', restaurantType: [], cuisineType: [], serviceType: [],
        city: '', address: '', pincode: '', description: '', website: '', logoUrl: '',
    });

    // Sub-step within the restaurant section (1 = basic, 2 = location, 3 = types)
    const [subStep, setSubStep] = useState<RestaurantSubStep>(1);
    const [animDir, setAnimDir] = useState<'forward' | 'backward'>('forward');
    const [animating, setAnimating] = useState(false);

    // ── Sub-step validation (partial, before final submit) ────────────────────
    function validateSubStep(): boolean {
        if (currentStep === 'profile') return true; // validated on submit

        if (subStep === 1) {
            if (!localRestaurant.restaurantName.trim()) {
                setRestaurantErrors({ restaurantName: 'Restaurant name is required.' });
                return false;
            }
            if (!localRestaurant.description.trim()) {
                setRestaurantErrors({ description: 'Please add a short description.' });
                return false;
            }
        }
        if (subStep === 2) {
            const e: Partial<Record<keyof RestaurantStepData, string>> = {};
            if (!localRestaurant.address.trim()) e.address = 'Address is required.';
            if (!localRestaurant.city.trim()) e.city = 'City is required.';
            if (!localRestaurant.pincode.trim()) e.pincode = 'Pincode is required.';
            else if (!/^\d{4,10}$/.test(localRestaurant.pincode)) e.pincode = 'Enter a valid pincode.';
            if (Object.keys(e).length) { setRestaurantErrors(e); return false; }
        }
        return true;
    }

    function animate(cb: () => void, dir: 'forward' | 'backward') {
        if (animating) return;
        setAnimDir(dir);
        setAnimating(true);
        setTimeout(() => { cb(); setAnimating(false); }, 220);
    }

    // ── Navigation ────────────────────────────────────────────────────────────
    function handleNext() {
        clearError();
        setRestaurantErrors({});
        setProfileErrors({});

        if (currentStep === 'profile') {
            submitProfile(localProfile);
            return;
        }

        if (currentStep === 'restaurant') {
            if (!validateSubStep()) return;

            if (subStep < 3) {
                animate(() => setSubStep((s) => (s + 1) as RestaurantSubStep), 'forward');
            } else {
                // Final submit
                submitRestaurant(localRestaurant);
            }
        }
    }

    function handleBack() {
        clearError();
        if (currentStep === 'restaurant' && subStep > 1) {
            animate(() => setSubStep((s) => (s - 1) as RestaurantSubStep), 'backward');
        } else {
            goBack();
        }
    }

    // ── Field helpers ─────────────────────────────────────────────────────────
    function setProfileField(field: keyof ProfileStepData, value: string) {
        setLocalProfile((p) => ({ ...p, [field]: value }));
        setProfileErrors((e) => ({ ...e, [field]: undefined }));
    }

    function setRestaurantField(field: keyof RestaurantStepData, value: string) {
        setLocalRestaurant((r) => ({ ...r, [field]: value }));
        setRestaurantErrors((e) => ({ ...e, [field]: undefined }));
    }

    function setRestaurantArray<K extends 'restaurantType' | 'cuisineType' | 'serviceType'>(
        field: K,
        value: RestaurantStepData[K],
    ) {
        setLocalRestaurant((r) => ({ ...r, [field]: value }));
        setRestaurantErrors((e) => ({ ...e, [field]: undefined }));
    }

    // ── Progress calculation ──────────────────────────────────────────────────
    // Map currentStep + subStep → sidebar step number (1-3)
    const sidebarStep = currentStep === 'profile' ? 0 : subStep; // 0 means on profile (before step 1)

    function completedFor(stepId: number) {
        if (stepId === 1) return [localRestaurant.restaurantName, localRestaurant.description].filter(Boolean).length;
        if (stepId === 2) return [localRestaurant.address, localRestaurant.city, localRestaurant.pincode].filter(Boolean).length;
        if (stepId === 3) return [localRestaurant.restaurantType.length, localRestaurant.cuisineType.length, localRestaurant.serviceType.length].filter(Boolean).length;
        return 0;
    }
    const stepTotals = { 1: 2, 2: 3, 3: 3 };

    const overallPct = currentStep === 'profile'
        ? 0
        : Math.round(
            ((subStep - 1) / STEPS.length) * 100 +
            (completedFor(subStep) / stepTotals[subStep as 1 | 2 | 3]) * (100 / STEPS.length),
        );

    // ── Console redirect ──────────────────────────────────────────────────────
    function goToConsole() {
        if (window.location.hostname.includes('localhost')) {
            router.push(`/console?hotel=${createdSlug}`);
        } else {
            window.location.href = `https://${window.location.host}/console`;
        }
    }

    // ── Determine button label ────────────────────────────────────────────────
    const isVeryLastStep = currentStep === 'restaurant' && subStep === 3;
    const showBack = currentStep !== 'profile';

    // ─────────────────────────────────────────────────────────────────────────
    if (currentStep === 'done') {
        return (
            <div className="min-h-screen grid-bg relative overflow-hidden flex items-center justify-center px-4 pt-28 pb-12">
                <Toaster position="top-right" />
                <div className="w-full max-w-2xl bg-theme3 rounded-3xl border border-theme p-8 shadow-2xl" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                    <SuccessScreen
                        url={subdomainUrlBuilderWithWindow(createdSlug)}
                        onGoToConsole={goToConsole}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid-bg relative overflow-hidden">
            <Toaster position="top-right" />

            <div className="relative min-h-screen flex items-center justify-center px-4 pt-28 pb-12">
                <div className="w-full max-w-6xl grid lg:grid-cols-[1fr_380px] gap-8 items-start">

                    {/* ── LEFT: Form panel ── */}
                    <div
                        className="bg-theme3 backdrop-blur-xl rounded-3xl shadow-2xl border border-theme p-8 min-h-[520px] flex flex-col"
                        style={{ animation: 'fadeInUp 0.6s ease-out' }}
                    >
                        {/* Step header */}
                        <div className="mb-7">
                            {currentStep === 'profile' ? (
                                <>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                                            Let&apos;s get you set up
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-syne font-bold text-theme mb-1">Your Profile</h2>
                                    <p className="text-sm text-theme2 font-light leading-relaxed">
                                        We&apos;ll use these details for your account and to reach you if needed.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-2">
                                        {React.createElement(STEPS[subStep - 1].icon, { size: 14, style: { color: 'var(--accent)' } })}
                                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                                            Step {subStep} of {STEPS.length}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-syne font-bold text-theme mb-1">{STEPS[subStep - 1].label}</h2>
                                    <p className="text-sm text-theme2 font-light leading-relaxed">{STEPS[subStep - 1].description}</p>
                                </>
                            )}
                        </div>

                        {/* Step content */}
                        <div
                            key={`${currentStep}-${subStep}`}
                            className={!animating ? (animDir === 'forward' ? 'anim-forward' : 'anim-backward') : 'opacity-0'}
                            style={{ flex: 1 }}
                        >
                            {currentStep === 'profile' && (
                                <ProfileStep
                                    data={localProfile}
                                    errors={profileErrors}
                                    onChange={setProfileField}
                                />
                            )}
                            {currentStep === 'restaurant' && (
                                <RestaurantStep
                                    data={localRestaurant}
                                    errors={restaurantErrors}
                                    onChange={setRestaurantField}
                                    onArrayChange={setRestaurantArray}
                                    subStep={subStep}
                                />
                            )}
                        </div>

                        {/* General API error */}
                        {error && (
                            <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-200 mt-4">
                                ⚠ {error}
                            </p>
                        )}

                        {/* Progress bar */}
                        {currentStep === 'restaurant' && (
                            <div className="mt-6 mb-5">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs text-theme2">Overall progress</span>
                                    <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                                        {overallPct}%
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${overallPct}%`, background: 'var(--accent)' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex gap-3 mt-6">
                            {(currentStep === 'restaurant') && (
                                <button
                                    onClick={handleBack}
                                    className="flex-1 py-3 rounded-xl border text-theme font-semibold hover:bg-theme3 transition flex items-center justify-center gap-2 text-sm"
                                    style={{ borderColor: 'var(--border)' }}
                                >
                                    <ChevronLeft size={17} /> Back
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                disabled={saving}
                                className="flex-1 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                style={{ background: 'var(--accent)' }}
                            >
                                {saving ? (
                                    <><Loader2 size={17} className="animate-spin" /> Saving…</>
                                ) : isVeryLastStep ? (
                                    <><Sparkles size={17} /> Launch my restaurant</>
                                ) : (
                                    <>Continue <ChevronRight size={17} /></>
                                )}
                            </button>
                        </div>

                        <p className="text-center text-xs text-theme2 mt-4">
                            You can update all these details later from your dashboard.
                        </p>
                    </div>

                    {/* ── RIGHT: Progress sidebar ── */}
                    <div
                        className="hidden lg:flex flex-col gap-0 sticky top-32"
                        style={{ animation: 'fadeInUp 0.8s ease-out' }}
                    >
                        {/* Restaurant preview card */}
                        <div className="bg-theme3 rounded-3xl border border-theme p-6 mb-4 shadow-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                                    <Building2 size={20} color="white" />
                                </div>
                                <div>
                                    <p className="text-xs text-theme2 font-medium">Setting up</p>
                                    <p className="text-sm font-bold font-syne text-theme">
                                        {localRestaurant.restaurantName || 'Your Restaurant'}
                                    </p>
                                </div>
                            </div>
                            {previewSlug && (
                                <div className="mt-3 px-3 py-2 rounded-xl text-xs font-mono" style={{ background: 'var(--accentlt)', color: 'var(--accent)' }}>
                                    {previewSlug}.scanify.app
                                </div>
                            )}
                            {localRestaurant.city && (
                                <div className="flex items-center gap-2 text-xs text-theme2 mt-2">
                                    <MapPin size={12} style={{ color: 'var(--accent)' }} />
                                    <span>{localRestaurant.city}{localRestaurant.pincode ? ` — ${localRestaurant.pincode}` : ''}</span>
                                </div>
                            )}
                            {localRestaurant.cuisineType.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {localRestaurant.cuisineType.slice(0, 3).map((c) => (
                                        <span key={c} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--accentlt)', color: 'var(--accent)' }}>
                                            {c}
                                        </span>
                                    ))}
                                    {localRestaurant.cuisineType.length > 3 && (
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium text-theme2">
                                            +{localRestaurant.cuisineType.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Steps timeline (only shown during restaurant steps) */}
                        {currentStep === 'restaurant' && (
                            <div className="bg-theme3 rounded-3xl border border-theme p-6 shadow-xl">
                                <p className="text-xs font-bold uppercase tracking-widest text-theme2 mb-5">Your progress</p>
                                <div className="relative">
                                    {STEPS.map((s, idx) => {
                                        const isDone = subStep > s.id;
                                        const isActive = subStep === s.id;
                                        const isPending = subStep < s.id;
                                        const Icon = s.icon;
                                        return (
                                            <div key={s.id} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500"
                                                        style={{
                                                            background: isDone || isActive ? 'var(--accent)' : 'var(--border)',
                                                            opacity: isPending ? 0.4 : 1,
                                                            boxShadow: isActive ? '0 0 0 4px var(--accentlt)' : 'none',
                                                        }}
                                                    >
                                                        {isDone
                                                            ? <CheckCircle2 size={16} color="white" />
                                                            : <Icon size={15} color={isActive ? 'white' : 'var(--text2)'} />
                                                        }
                                                    </div>
                                                    {idx < STEPS.length - 1 && (
                                                        <div
                                                            className="w-0.5 my-1 rounded-full transition-all duration-700"
                                                            style={{ height: 40, background: isDone ? 'var(--accent)' : 'var(--border)', opacity: isPending ? 0.3 : 1 }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="pt-1 flex-1" style={{ paddingBottom: idx < STEPS.length - 1 ? '24px' : '0' }}>
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <p className="text-sm font-semibold" style={{ color: isActive ? 'var(--accent)' : isDone ? 'var(--text)' : 'var(--text2)', opacity: isPending ? 0.5 : 1 }}>
                                                            {s.label}
                                                        </p>
                                                        {isDone && <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--accent)' }}>Done</span>}
                                                        {isActive && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--accentlt)', color: 'var(--accent)' }}>Active</span>}
                                                    </div>
                                                    <p className="text-xs text-theme2" style={{ opacity: isPending ? 0.4 : 0.8 }}>{s.sublabel}</p>
                                                    {isActive && (
                                                        <div className="flex gap-1 mt-2">
                                                            {Array.from({ length: stepTotals[s.id as 1 | 2 | 3] }).map((_, fi) => (
                                                                <div
                                                                    key={fi}
                                                                    className="h-1 flex-1 rounded-full transition-all duration-500"
                                                                    style={{ background: fi < completedFor(s.id) ? 'var(--accent)' : 'var(--border)' }}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
                                    <div className="flex items-center justify-between text-xs text-theme2 mb-2">
                                        <span>Steps completed</span>
                                        <span className="font-bold" style={{ color: 'var(--accent)' }}>{subStep - 1} / {STEPS.length}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${((subStep - 1) / STEPS.length) * 100}%`, background: 'var(--accent)' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 px-4 py-3 rounded-2xl border text-xs text-theme2 leading-relaxed" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                            💡 All information can be edited later from your console settings.
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}