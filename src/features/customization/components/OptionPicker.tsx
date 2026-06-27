// features/customization/components/OptionPicker.tsx
// Segmented option picker (layout, category style, shadow).

'use client';

import React from 'react';

interface Option {
    value: string;
    label: string;
    description?: string;
    icon?: string;
}

interface Props {
    label: string;
    options: readonly Option[];
    value: string;
    onChange: (val: string) => void;
}

export function OptionPicker({ label, options, value, onChange }: Props) {
    return (
        <div className="space-y-1.5">
            <span className="text-xs font-semibold text-theme2 uppercase tracking-wide">{label}</span>
            <div className="flex flex-wrap gap-2">
                {options.map(opt => {
                    const active = opt.value === value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChange(opt.value)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all"
                            style={{
                                background: active ? 'var(--accent)' : 'var(--card)',
                                borderColor: active ? 'var(--accent)' : 'var(--border)',
                                color: active ? '#fff' : 'var(--text)',
                            }}
                        >
                            {opt.icon && <span className="text-base leading-none">{opt.icon}</span>}
                            <span className="font-medium">{opt.label}</span>
                            {opt.description && (
                                <span
                                    className="hidden sm:inline text-xs"
                                    style={{ color: active ? 'rgba(255,255,255,0.75)' : 'var(--text2)' }}
                                >
                                    — {opt.description}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
