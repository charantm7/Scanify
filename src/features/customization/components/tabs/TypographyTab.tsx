// features/customization/components/tabs/TypographyTab.tsx
// Font family, base size, heading weight.

'use client';

import React from 'react';
import type { CustomizationDraft, FontFamily } from '../../types';
import { FONT_OPTIONS } from '../../constants';
import { Card } from '../../../../components/shared/ui';

interface Props {
    draft: CustomizationDraft;
    onPatch: <K extends keyof CustomizationDraft>(key: K, value: CustomizationDraft[K]) => void;
}

const FONT_STACKS: Record<FontFamily, string> = {
    inter: "'Inter', sans-serif",
    poppins: "'Poppins', sans-serif",
    syne: "'Syne', sans-serif",
    outfit: "'Outfit', sans-serif",
    playfair: "'Playfair Display', serif",
    dm_sans: "'DM Sans', sans-serif",
};

export function TypographyTab({ draft, onPatch }: Props) {
    return (
        <div className="space-y-6">
            {/* Font family */}
            <div>
                <h3 className="text-sm font-semibold text-theme mb-3">Font family</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FONT_OPTIONS.map(opt => {
                        const active = draft.font_family === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => onPatch('font_family', opt.value as FontFamily)}
                                className="p-3 rounded-xl border text-left transition-all"
                                style={{
                                    background: active ? 'var(--accentlt)' : 'var(--card)',
                                    borderColor: active ? 'var(--accent)' : 'var(--border)',
                                    fontFamily: FONT_STACKS[opt.value as FontFamily],
                                }}
                            >
                                <p
                                    className="text-lg font-bold leading-none mb-1"
                                    style={{ color: 'var(--text)' }}
                                >
                                    Aa
                                </p>
                                <p className="text-xs font-medium" style={{ color: active ? 'var(--accent)' : 'var(--text)' }}>
                                    {opt.label}
                                </p>
                                <p className="text-[10px]" style={{ color: 'var(--text2)' }}>
                                    {opt.preview}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Size + weight */}
            <Card>
                <div className="px-4 py-4 space-y-5">
                    {/* Base font size */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-theme2 uppercase tracking-wide">
                                Base font size
                            </span>
                            <span className="text-sm font-mono text-theme">{draft.base_font_size}px</span>
                        </div>
                        <input
                            type="range"
                            min={13}
                            max={20}
                            step={1}
                            value={draft.base_font_size}
                            onChange={e => onPatch('base_font_size', Number(e.target.value))}
                            className="w-full accent-[var(--accent)]"
                        />
                        <div className="flex justify-between text-[11px] text-theme2 mt-1">
                            <span>13px</span>
                            <span>16px default</span>
                            <span>20px</span>
                        </div>
                    </div>

                    {/* Heading weight */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-theme2 uppercase tracking-wide">
                                Heading weight
                            </span>
                            <span className="text-sm font-mono text-theme">{draft.heading_weight}</span>
                        </div>
                        <div className="flex gap-2">
                            {[400, 500, 600, 700, 800].map(w => (
                                <button
                                    key={w}
                                    type="button"
                                    onClick={() => onPatch('heading_weight', w)}
                                    className="flex-1 py-2 rounded-lg border text-sm transition-all"
                                    style={{
                                        fontWeight: w,
                                        background: draft.heading_weight === w ? 'var(--accent)' : 'var(--bg3)',
                                        borderColor: draft.heading_weight === w ? 'var(--accent)' : 'var(--border)',
                                        color: draft.heading_weight === w ? '#fff' : 'var(--text)',
                                    }}
                                >
                                    {w}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
