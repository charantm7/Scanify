'use client';
import React, { useState, useEffect, ReactNode, InputHTMLAttributes } from 'react';
import {
    Building2, MapPin, Phone, User, FileText, Hash,
    ChevronRight, ChevronLeft, Loader2, CheckCircle2,
    Image as ImageIcon, Globe, Sparkles, ExternalLink,
    type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

import { STEPS, CUISINE_TYPES, RESTAURANT_TYPES, SERVICE_TYPES } from '../constants';
import { useOnboarding } from '../hooks/useOnboarding';
import type {
    ProfileStepData,
    RestaurantStepData,
    CuisineType,
    RestaurantType,
    ServiceType,
    RestaurantSubStep
} from '../types';



// ─── Primitive UI atoms ────────────────────────────────────────────────────────
export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-theme mb-1.5">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1.5">⚠ {error}</p>}
        </div>
    );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    error?: string;
}

export function Input({ icon: Icon, error, className = '', ...props }: InputProps) {
    return (
        <div className="relative">
            {Icon && (
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme2 pointer-events-none">
                    <Icon size={15} />
                </div>
            )}
            <input
                {...props}
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-auth-input border rounded-xl outline-none transition-all
          text-theme placeholder:text-theme3 text-sm
          ${error
                        ? 'border-red-400 focus:ring-2 focus:ring-red-300'
                        : 'border-theme focus:ring-2 focus:ring-[var(--accent)]'
                    } ${className}`}
            />
        </div>
    );
}

export function Textarea({ icon: Icon, error, ...props }: { icon?: LucideIcon; error?: string;[k: string]: unknown }) {
    return (
        <div className="relative">
            {Icon && (
                <div className="absolute left-3.5 top-3.5 text-theme2 pointer-events-none">
                    <Icon size={15} />
                </div>
            )}
            <textarea
                rows={3}
                {...props}
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-auth-input border rounded-xl
          outline-none transition-all text-theme placeholder:text-theme3 resize-none text-sm
          ${error
                        ? 'border-red-400 focus:ring-2 focus:ring-red-300'
                        : 'border-theme focus:ring-2 focus:ring-[var(--accent)]'
                    }`}
            />
        </div>
    );
}

// ─── Multi-select pill chip group ─────────────────────────────────────────────
export function PillSelect<T extends string>({
    options,
    selected,
    onChange,
    error,
}: {
    options: readonly T[];
    selected: T[];
    onChange: (next: T[]) => void;
    error?: string;
}) {
    function toggle(value: T) {
        onChange(
            selected.includes(value)
                ? selected.filter((v) => v !== value)
                : [...selected, value],
        );
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                    const active = selected.includes(opt);
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => toggle(opt)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all select-none
                ${active
                                    ? 'text-white border-transparent'
                                    : 'text-theme2 border-theme hover:border-[var(--accent)] hover:text-theme'
                                }`}
                            style={active ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
            {error && <p className="text-red-500 text-xs mt-1.5">⚠ {error}</p>}
        </div>
    );
}

// ─── Success screen ────────────────────────────────────────────────────────────
export function SuccessScreen({ url, onGoToConsole }: { url: string; onGoToConsole: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-8 px-4">
            <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'var(--accentlt)' }}
            >
                <Sparkles size={36} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="font-syne font-bold text-3xl text-theme mb-2">You&apos;re all set! 🎉</h2>
            <p className="text-theme2 text-sm mb-8 max-w-sm">
                Your restaurant profile has been created. Your menu is live at:
            </p>

            <div
                className="w-full max-w-md rounded-2xl border p-5 mb-6 text-left"
                style={{ borderColor: 'var(--accent)', background: 'var(--accentlt)' }}
            >
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
                    Your menu URL
                </p>
                <div className="flex items-center justify-between gap-3">
                    <code className="text-sm font-bold text-theme break-all">{url}</code>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition hover:opacity-80"
                        style={{ background: 'var(--accent)' }}
                    >
                        Open <ExternalLink size={12} />
                    </a>
                </div>
                <p className="text-xs text-theme2 mt-2">
                    Share this link or generate a QR code from your console.
                </p>
            </div>

            <button
                onClick={onGoToConsole}
                className="w-full max-w-md py-3.5 rounded-xl text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                style={{ background: 'var(--accent)' }}
            >
                Go to Console <ChevronRight size={17} />
            </button>
        </div>
    );
}

// ─── Profile step form ─────────────────────────────────────────────────────────
export function ProfileStep({
    data,
    errors,
    onChange,
}: {
    data: ProfileStepData;
    errors: Partial<Record<keyof ProfileStepData, string>>;
    onChange: (field: keyof ProfileStepData, value: string) => void;
}) {
    return (
        <div className="space-y-5">
            <Field label="Your Full Name *" error={errors.fullName}>
                <Input
                    icon={User}
                    placeholder="e.g. Rahul Sharma"
                    value={data.fullName}
                    onChange={(e) => onChange('fullName', e.target.value)}
                    error={errors.fullName}
                />
            </Field>
            <Field label="Admin Phone *" error={errors.phone}>
                <Input
                    icon={Phone}
                    placeholder="+91 98765 43210"
                    value={data.phone}
                    onChange={(e) => onChange('phone', e.target.value)}
                    error={errors.phone}
                    inputMode="tel"
                />
            </Field>
        </div>
    );
}


export function RestaurantStep({
    data,
    errors,
    onChange,
    onArrayChange,
    subStep,
}: {
    data: RestaurantStepData;
    errors: Partial<Record<keyof RestaurantStepData | 'general', string>>;
    onChange: (field: keyof RestaurantStepData, value: string) => void;
    onArrayChange: <K extends 'restaurantType' | 'cuisineType' | 'serviceType'>(field: K, value: RestaurantStepData[K]) => void;
    subStep: RestaurantSubStep;
}) {
    if (subStep === 1) {
        return (
            <div className="space-y-5">
                <Field label="Restaurant / Hotel Name *" error={errors.restaurantName}>
                    <Input
                        icon={Building2}
                        placeholder="e.g. Grand Palace Hotel"
                        value={data.restaurantName}
                        onChange={(e) => onChange('restaurantName', e.target.value)}
                        error={errors.restaurantName}
                    />
                </Field>
                <Field label="Description *" error={errors.description}>
                    <Textarea
                        icon={FileText}
                        placeholder="Briefly describe your restaurant — cuisine, vibe, specialties…"
                        value={data.description}
                        onChange={(e) => onChange('description', (e as React.ChangeEvent<HTMLTextAreaElement>).target.value)}
                        error={errors.description}
                    />
                </Field>
                <Field label="Logo URL (optional)">
                    <Input
                        icon={ImageIcon}
                        placeholder="https://your-logo.com/logo.png"
                        value={data.logoUrl}
                        onChange={(e) => onChange('logoUrl', e.target.value)}
                    />
                </Field>
            </div>
        );
    }

    if (subStep === 2) {
        return (
            <div className="space-y-5">
                <Field label="Street Address *" error={errors.address}>
                    <Textarea
                        icon={MapPin}
                        placeholder="e.g. 42, MG Road, Near Central Mall"
                        value={data.address}
                        onChange={(e) => onChange('address', (e as React.ChangeEvent<HTMLTextAreaElement>).target.value)}
                        error={errors.address}
                    />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="City *" error={errors.city}>
                        <Input
                            placeholder="e.g. Mysuru"
                            value={data.city}
                            onChange={(e) => onChange('city', e.target.value)}
                            error={errors.city}
                        />
                    </Field>
                    <Field label="Pincode *" error={errors.pincode}>
                        <Input
                            icon={Hash}
                            placeholder="570001"
                            value={data.pincode}
                            onChange={(e) => onChange('pincode', e.target.value)}
                            error={errors.pincode}
                            maxLength={10}
                            inputMode="numeric"
                        />
                    </Field>
                </div>
                <Field label="Website (optional)">
                    <Input
                        icon={Globe}
                        placeholder="https://yourrestaurant.com"
                        value={data.website}
                        onChange={(e) => onChange('website', e.target.value)}
                    />
                </Field>
            </div>
        );
    }

    // subStep === 3
    return (
        <div className="space-y-6">
            <Field label="Restaurant Type *" error={errors.restaurantType}>
                <PillSelect<RestaurantType>
                    options={RESTAURANT_TYPES}
                    selected={data.restaurantType}
                    onChange={(v) => onArrayChange('restaurantType', v)}
                    error={errors.restaurantType}
                />
            </Field>
            <Field label="Cuisine Type *" error={errors.cuisineType}>
                <PillSelect<CuisineType>
                    options={CUISINE_TYPES}
                    selected={data.cuisineType}
                    onChange={(v) => onArrayChange('cuisineType', v)}
                    error={errors.cuisineType}
                />
            </Field>
            <Field label="Service Type *" error={errors.serviceType}>
                <PillSelect<ServiceType>
                    options={SERVICE_TYPES}
                    selected={data.serviceType}
                    onChange={(v) => onArrayChange('serviceType', v)}
                    error={errors.serviceType}
                />
            </Field>
        </div>
    );
}
