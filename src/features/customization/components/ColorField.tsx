// features/customization/components/ColorField.tsx
// Labelled color picker that shows hex value inline.

'use client';

import React, { useRef } from 'react';

interface Props {
    label: string;
    value: string;
    onChange: (val: string) => void;
}

export function ColorField({ label, value, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex items-center justify-between gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm text-theme2 flex-shrink-0">{label}</span>
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition hover:border-[var(--accent)]"
                style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}
            >
                <span
                    className="w-5 h-5 rounded-md border flex-shrink-0"
                    style={{ background: value, borderColor: 'var(--border2)' }}
                />
                <span className="text-xs font-mono text-theme">{value.toUpperCase()}</span>
                <input
                    ref={inputRef}
                    type="color"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="sr-only"
                    aria-label={label}
                />
            </button>
        </div>
    );
}
