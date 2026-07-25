'use client';

import React, { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface FieldProps {
    label: string;
    /** Small right-aligned helper, e.g. a "3 selected" counter for pill groups */
    hint?: string;
    error?: string;
    children: ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-theme">{label}</label>
                {hint && <span className="text-xs text-theme2">{hint}</span>}
            </div>
            {children}
            {error && <p className="text-red-500 text-xs mt-1.5">⚠ {error}</p>}
        </div>
    );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
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
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-auth-input border rounded-xl outline-none transition-all text-theme placeholder:text-theme3 text-sm
          ${error ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-theme focus:ring-2 focus:ring-[var(--accent)]'} ${className}`}
            />
        </div>
    );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    icon?: LucideIcon;
    error?: string;
}

export function Textarea({ icon: Icon, error, ...props }: TextareaProps) {
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
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-auth-input border rounded-xl outline-none transition-all text-theme placeholder:text-theme3 resize-none text-sm
          ${error ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-theme focus:ring-2 focus:ring-[var(--accent)]'}`}
            />
        </div>
    );
}