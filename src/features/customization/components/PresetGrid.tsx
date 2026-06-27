// features/customization/components/PresetGrid.tsx
// Scrollable grid of preset theme cards — swatch + name + lock badge.

'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { PRESET_THEMES } from '../constants';
import type { PresetTheme } from '../types';
import { useApp } from '../../../context/AppContext';

interface Props {
    onApply: (preset: PresetTheme) => void;
}

function planRank(plan: string): number {
    return { starter: 1, growth: 2, pro: 3 }[plan] ?? 0;
}
function userPlanRank(plan: string): number {
    return planRank(plan);
}

function Swatch({ config }: { config: PresetTheme['config'] }) {
    return (
        <div
            className="w-full h-16 rounded-lg mb-3 overflow-hidden flex gap-0.5"
            style={{ background: config.background_color }}
        >
            {/* Simulated mini menu card */}
            <div
                className="flex-1 h-full rounded-md mx-1 my-1 flex flex-col justify-between p-1.5"
                style={{ background: config.surface_color }}
            >
                <div className="flex gap-1">
                    <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: config.accent_color }}
                    />
                    <div
                        className="h-1 w-8 rounded-full mt-0.5"
                        style={{ background: config.text_color, opacity: 0.3 }}
                    />
                </div>
                <div className="space-y-0.5">
                    <div className="h-1 w-full rounded-full" style={{ background: config.text_color, opacity: 0.2 }} />
                    <div className="h-1 w-3/4 rounded-full" style={{ background: config.text_color, opacity: 0.12 }} />
                </div>
                <div
                    className="h-3 w-10 rounded"
                    style={{ background: config.accent_color }}
                />
            </div>
        </div>
    );
}

export function PresetGrid({ onApply }: Props) {
    const { plan } = useApp();

    return (
        <div>
            <h3 className="text-sm font-semibold text-theme mb-3">Quick presets</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_THEMES.map(preset => {
                    const locked = preset.plan
                        ? userPlanRank(plan) < planRank(preset.plan)
                        : false;

                    return (
                        <button
                            key={preset.id}
                            onClick={() => !locked && onApply(preset)}
                            disabled={locked}
                            title={locked ? `Requires ${preset.plan} plan` : preset.description}
                            className={`
                                group relative text-left p-3 rounded-xl border transition-all
                                ${locked
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:border-[var(--accent)] hover:shadow-md cursor-pointer'
                                }
                            `}
                            style={{
                                background: 'var(--card)',
                                borderColor: 'var(--border)',
                            }}
                        >
                            <Swatch config={preset.config} />

                            {locked && (
                                <div
                                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ background: 'var(--bg3)' }}
                                >
                                    <Lock size={10} style={{ color: 'var(--text2)' }} />
                                </div>
                            )}

                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-base leading-none">{preset.emoji}</span>
                                <span className="text-xs font-semibold text-theme truncate">
                                    {preset.name}
                                </span>
                            </div>
                            <p className="text-[11px] text-theme2 leading-snug line-clamp-2">
                                {preset.description}
                            </p>
                            {preset.plan && (
                                <span
                                    className="inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
                                    style={{
                                        background: 'var(--accentlt)',
                                        color: 'var(--accent)',
                                    }}
                                >
                                    {preset.plan}+
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
