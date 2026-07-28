'use client';

import React from 'react';
import {
    Building2, MapPin, Phone, User, FileText, Hash,
    ChevronRight, ChevronLeft, Loader2, Image as ImageIcon, Globe, Sparkles,
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import AuthNavbar from '../../components/shared/AuthNavbar';

import { Field, Input, Textarea } from './components/FormControls';
import { PillSelect } from './components/PillSelect';
import { SuccessScreen } from './components/SuccessScreen'
import { OnboardingSidebar } from './components/OnboardingSideBar';
import { useOnboarding } from './hooks/useOnboarding';
import { STEPS, CUISINE_TYPES, RESTAURANT_TYPES, SERVICE_TYPES } from './constants';
import KeyFrames from '../../components/ui/KeyFrames';

export default function OnboardingPage() {
    const {
        step, totalSteps, loading, done, animDir, animating,
        form, errors, menuUrl,
        completedFields, stepTotals,
        set, togglePill, goNext, goPrev, handleSubmit, goToConsole,
    } = useOnboarding();

    const currentStep = STEPS[step - 1];
    const progressPct =
        ((step - 1) / totalSteps) * 100 + (completedFields[step] / stepTotals[step]) * (100 / totalSteps);

    return (
        <div className="min-h-screen grid-bg relative overflow-hidden">

            <KeyFrames />

            <AuthNavbar />

            <div className="relative min-h-screen flex items-center justify-center px-4 pt-28 pb-12">
                <div className={`w-full ${done ? 'max-w-2xl' : 'max-w-6xl grid lg:grid-cols-[1fr_380px] gap-8 items-start'}`}>

                    {done ? (
                        <div className="md:bg-theme3 sm:bg-theme3  rounded-xl md:border md:border-theme md:p-8 sm:border sm:border-theme sm:p-8 p-2 md:shadow-2xl" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                            <SuccessScreen url={menuUrl} onGoToConsole={goToConsole} />
                        </div>
                    ) : (
                        <>
                            {/* ── LEFT: Form ── */}
                            <div className="md:bg-theme3 md:backdrop-blur-xl sm:bg-theme3 sm:backdrop-blur-xl rounded-xl md:shadow-2xl md:border md:border-theme sm:shadow-2xl sm:border sm:border-theme md:p-8 sm:p-8 p-4 min-h-[520px] flex flex-col" style={{ animation: 'fadeInUp 0.6s ease-out' }}>

                                <div className="mb-7">
                                    <div className="flex items-center gap-2 mb-2">
                                        <currentStep.icon size={14} style={{ color: 'var(--accent)' }} />
                                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                                            Step {step} of {totalSteps}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-syne font-bold text-theme mb-1">{currentStep.label}</h2>
                                    <p className="text-sm text-theme2 font-light leading-relaxed">{currentStep.description}</p>
                                </div>

                                <div
                                    key={step}
                                    className={!animating ? (animDir === 'forward' ? 'anim-forward' : 'anim-backward') : 'opacity-0'}
                                    style={{ flex: 1 }}
                                >
                                    {step === 1 && (
                                        <div className="space-y-5">
                                            <Field label="Restaurant / Hotel Name *" error={errors.restaurant_name}>
                                                <Input icon={Building2} placeholder="e.g. Grand Palace Hotel" value={form.restaurant_name} onChange={set('restaurant_name')} error={errors.restaurant_name} />
                                            </Field>
                                            <Field label="Description *" error={errors.description}>
                                                <Textarea icon={FileText} placeholder="Briefly describe your restaurant — cuisine, vibe, specialties…" value={form.description} onChange={set('description')} error={errors.description} />
                                            </Field>
                                            <Field label="Logo URL (optional)">
                                                <Input icon={ImageIcon} placeholder="https://your-logo.com/logo.png" value={form.logo_url} onChange={set('logo_url')} />
                                            </Field>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-5">
                                            <Field label="Street Address *" error={errors.address}>
                                                <Textarea icon={MapPin} placeholder="e.g. 42, MG Road, Near Central Mall" value={form.address} onChange={set('address')} error={errors.address} />
                                            </Field>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Field label="City *" error={errors.city}>
                                                    <Input placeholder="e.g. Bengaluru" value={form.city} onChange={set('city')} error={errors.city} />
                                                </Field>
                                                <Field label="Pincode *" error={errors.pincode}>
                                                    <Input icon={Hash} placeholder="560001" value={form.pincode} onChange={set('pincode')} error={errors.pincode} maxLength={10} inputMode="numeric" />
                                                </Field>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-6">
                                            <Field label="Cuisine Types *" hint={`${form.cuisine_types.length} selected`} error={errors.cuisine_types}>
                                                <PillSelect options={CUISINE_TYPES} selected={form.cuisine_types} onToggle={(v) => togglePill('cuisine_types', v)} />
                                            </Field>
                                            <Field label="Restaurant Type *" hint={`${form.restaurant_types.length} selected`} error={errors.restaurant_types}>
                                                <PillSelect options={RESTAURANT_TYPES} selected={form.restaurant_types} onToggle={(v) => togglePill('restaurant_types', v)} />
                                            </Field>
                                            <Field label="Service Types *" hint={`${form.service_types.length} selected`} error={errors.service_types}>
                                                <PillSelect options={SERVICE_TYPES} selected={form.service_types} onToggle={(v) => togglePill('service_types', v)} />
                                            </Field>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div className="space-y-5">
                                            <Field label="Your Full Name *" error={errors.name}>
                                                <Input icon={User} placeholder="e.g. Rahul Sharma" value={form.name} onChange={set('name')} error={errors.name} />
                                            </Field>
                                            <Field label="Admin Phone *" error={errors.phone}>
                                                <Input icon={Phone} placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} error={errors.phone} inputMode="tel" />
                                            </Field>
                                            <Field label="Website (optional)">
                                                <Input icon={Globe} placeholder="https://yourrestaurant.com" value={form.website} onChange={set('website')} />
                                            </Field>
                                            {errors.general && (
                                                <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-200">⚠ {errors.general}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Progress */}
                                <div className="mt-6 mb-5">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs text-theme2">Overall progress</span>
                                        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                                            {Math.round(progressPct)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${progressPct}%`, background: 'var(--accent)' }}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {step > 1 && (
                                        <button onClick={goPrev} className="flex-1 py-3 rounded-xl border text-theme font-semibold hover:bg-theme3 transition flex items-center justify-center gap-2 text-sm" style={{ borderColor: 'var(--border)' }}>
                                            <ChevronLeft size={17} /> Back
                                        </button>
                                    )}
                                    {step < totalSteps ? (
                                        <button onClick={goNext} className="flex-1 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 text-sm" style={{ background: 'var(--accent)' }}>
                                            Continue <ChevronRight size={17} />
                                        </button>
                                    ) : (
                                        <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm" style={{ background: 'var(--accent)' }}>
                                            {loading ? <><Loader2 size={17} className="animate-spin" /> Saving…</> : <><Sparkles size={17} /> Launch</>}
                                        </button>
                                    )}
                                </div>

                                <p className="text-center text-xs text-theme2 mt-4">You can update all these details later from your dashboard.</p>
                            </div>

                            {/* ── RIGHT: Sidebar ── */}
                            <OnboardingSidebar
                                form={form}
                                step={step}
                                totalSteps={totalSteps}
                                completedFields={completedFields}
                                stepTotals={stepTotals}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}