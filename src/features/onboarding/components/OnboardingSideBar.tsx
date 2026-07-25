'use client';

import React from 'react';
import { Building2, MapPin, CheckCircle2 } from 'lucide-react';
import { STEPS } from '../constants';
import type { OnboardingFormState } from '../types';

interface OnboardingSidebarProps {
    form: OnboardingFormState;
    step: number;
    totalSteps: number;
    completedFields: Record<number, number>;
    stepTotals: Record<number, number>;
}

export function OnboardingSidebar({ form, step, totalSteps, completedFields, stepTotals }: OnboardingSidebarProps) {
    const slugPreview = form.restaurant_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    return (
        <div className="hidden lg:flex flex-col gap-0 sticky top-32" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            <div className="bg-theme3 rounded-3xl border border-theme p-6 mb-4 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                        <Building2 size={20} color="white" />
                    </div>
                    <div>
                        <p className="text-xs text-theme2 font-medium">Setting up</p>
                        <p className="text-sm font-bold font-syne text-theme">{form.restaurant_name || 'Your Restaurant'}</p>
                    </div>
                </div>
                {form.restaurant_name && (
                    <div className="mt-3 px-3 py-2 rounded-xl text-xs font-mono" style={{ background: 'var(--accentlt)', color: 'var(--accent)' }}>
                        {slugPreview}.scanify.app
                    </div>
                )}
                {form.city && (
                    <div className="flex items-center gap-2 text-xs text-theme2 mt-2">
                        <MapPin size={12} style={{ color: 'var(--accent)' }} />
                        <span>{form.city}{form.pincode ? ` — ${form.pincode}` : ''}</span>
                    </div>
                )}
            </div>

            <div className="bg-theme3 rounded-3xl border border-theme p-6 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-theme2 mb-5">Your progress</p>
                <div className="relative">
                    {STEPS.map((s, idx) => {
                        const isDone = step > s.id;
                        const isActive = step === s.id;
                        const isPending = step < s.id;
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
                                        {isDone ? <CheckCircle2 size={16} color="white" /> : <Icon size={15} color={isActive ? 'white' : 'var(--text2)'} />}
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
                                        <p
                                            className="text-sm font-semibold"
                                            style={{ color: isActive ? 'var(--accent)' : isDone ? 'var(--text)' : 'var(--text2)', opacity: isPending ? 0.5 : 1 }}
                                        >
                                            {s.label}
                                        </p>
                                        {isDone && <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--accent)' }}>Done</span>}
                                        {isActive && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--accentlt)', color: 'var(--accent)' }}>Active</span>}
                                    </div>
                                    <p className="text-xs text-theme2" style={{ opacity: isPending ? 0.4 : 0.8 }}>{s.sublabel}</p>
                                    {isActive && (
                                        <div className="flex gap-1 mt-2">
                                            {Array.from({ length: stepTotals[s.id] }).map((_, fi) => (
                                                <div
                                                    key={fi}
                                                    className="h-1 flex-1 rounded-full transition-all duration-500"
                                                    style={{ background: fi < completedFields[s.id] ? 'var(--accent)' : 'var(--border)' }}
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
                        <span className="font-bold" style={{ color: 'var(--accent)' }}>{step - 1} / {totalSteps}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${((step - 1) / totalSteps) * 100}%`, background: 'var(--accent)' }} />
                    </div>
                </div>
            </div>

            <div className="mt-4 px-4 py-3 rounded-2xl border text-xs text-theme2 leading-relaxed" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                💡 All information can be edited later from your console settings.
            </div>
        </div>
    );
}