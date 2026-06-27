// features/customization/components/VisibilityToggle.tsx
// Toggle row for show/hide booleans.

'use client';

import React from 'react';

interface Props {
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
    gated?: boolean;
    gateLabel?: string;
}

export function VisibilityToggle({ label, checked, onChange, gated, gateLabel }: Props) {
    return (
        <div className="flex items-center justify-between gap-3 py-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-theme truncate">{label}</span>
                {gated && gateLabel && (
                    <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'var(--accentlt)', color: 'var(--accent)' }}
                    >
                        {gateLabel}
                    </span>
                )}
            </div>
            <button
                type="button"
                disabled={gated}
                role="switch"
                aria-checked={checked}
                onClick={() => !gated && onChange(!checked)}
                className={`
                    relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent
                    transition-colors duration-200 focus:outline-none
                    ${gated ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
                style={{ background: checked ? 'var(--accent)' : 'var(--bg3)' }}
            >
                <span
                    className={`
                        pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow
                        transition duration-200 ease-in-out
                        ${checked ? 'translate-x-4' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    );
}
