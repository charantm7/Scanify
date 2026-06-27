// features/customization/components/LivePreview.tsx
// Sticky mini phone preview that updates in real-time as the user edits.

'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { CustomizationDraft } from '../types';
import { FONT_STACKS } from '../../menu/constant';

interface Props {
    draft: CustomizationDraft;
    hotelSlug: string;
}

export function LivePreview({ draft, hotelSlug }: Props) {
    const fontStack = FONT_STACKS[draft.font_family] ?? 'Inter, sans-serif';

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-theme2 uppercase tracking-wide">Preview</h3>
                {hotelSlug && (
                    <a
                        href={`/menu/${hotelSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-medium hover:underline"
                        style={{ color: 'var(--accent)' }}
                    >
                        Open live <ExternalLink size={11} />
                    </a>
                )}
            </div>

            {/* Phone shell */}
            <div
                className="mx-auto w-[160px] rounded-[24px] border-[3px] overflow-hidden shadow-xl"
                style={{
                    borderColor: 'var(--text)',
                    fontFamily: fontStack,
                }}
            >
                {/* Notch */}
                <div
                    className="h-5 flex items-center justify-center"
                    style={{ background: draft.background_color }}
                >
                    <div
                        className="w-12 h-2 rounded-full"
                        style={{ background: draft.text_color, opacity: 0.15 }}
                    />
                </div>

                {/* Menu body */}
                <div style={{ background: draft.background_color, minHeight: 280 }}>
                    {/* Cover image placeholder */}
                    {draft.show_cover_image && (
                        <div
                            className="h-16 w-full"
                            style={{
                                background: `linear-gradient(135deg, ${draft.accent_color}44, ${draft.primary_color}22)`,
                            }}
                        >
                            <div className="h-full flex items-end px-3 pb-2">
                                <div>
                                    <div className="h-1.5 w-16 rounded-full mb-1" style={{ background: draft.surface_color }} />
                                    <div className="h-1 w-10 rounded-full" style={{ background: draft.surface_color, opacity: 0.7 }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    {draft.show_search && (
                        <div className="px-2 py-1.5">
                            <div
                                className="h-5 rounded-lg flex items-center px-2 gap-1"
                                style={{ background: draft.surface_color, border: `1px solid ${draft.muted_color}22` }}
                            >
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: draft.muted_color, opacity: 0.4 }} />
                                <div className="h-1 w-14 rounded-full" style={{ background: draft.muted_color, opacity: 0.25 }} />
                            </div>
                        </div>
                    )}

                    {/* Category pills */}
                    {draft.show_categories && (
                        <div className="flex gap-1.5 px-2 pb-1.5 overflow-hidden">
                            {['All', 'Starters', 'Mains'].map((cat, i) => (
                                <div
                                    key={cat}
                                    className="flex-shrink-0 text-[8px] font-medium px-2 py-0.5 rounded-full"
                                    style={
                                        i === 0
                                            ? {
                                                background: draft.accent_color,
                                                color: '#fff',
                                            }
                                            : {
                                                background: draft.surface_color,
                                                color: draft.muted_color,
                                            }
                                    }
                                >
                                    {cat}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Item cards */}
                    <div className="px-2 space-y-1.5 pb-3">
                        {[
                            { name: 'Butter Chicken', price: '₹320', veg: false },
                            { name: 'Paneer Tikka', price: '₹280', veg: true },
                        ].map((item) => (
                            <div
                                key={item.name}
                                className="overflow-hidden"
                                style={{
                                    background: draft.surface_color,
                                    borderRadius: `${Math.min(draft.border_radius, 12)}px`,
                                    boxShadow: draft.shadow_intensity === 'none'
                                        ? 'none'
                                        : '0 1px 4px rgba(0,0,0,0.08)',
                                }}
                            >
                                <div className="flex items-center p-1.5 gap-1.5">
                                    {draft.show_dietary_badge && (
                                        <div
                                            className="w-2.5 h-2.5 rounded-sm border flex-shrink-0 flex items-center justify-center"
                                            style={{ borderColor: item.veg ? '#16A34A' : '#DC2626' }}
                                        >
                                            <div
                                                className="w-1 h-1 rounded-full"
                                                style={{ background: item.veg ? '#16A34A' : '#DC2626' }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div
                                            className="text-[8px] font-semibold truncate"
                                            style={{ color: draft.text_color }}
                                        >
                                            {item.name}
                                        </div>
                                        <div
                                            className="text-[7px]"
                                            style={{ color: draft.accent_color, fontWeight: 600 }}
                                        >
                                            {item.price}
                                        </div>
                                    </div>
                                    {draft.show_item_images && (
                                        <div
                                            className="w-8 h-8 rounded flex-shrink-0"
                                            style={{
                                                background: `${draft.accent_color}22`,
                                                borderRadius: `${Math.min(draft.border_radius - 4, 6)}px`,
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <p className="text-[11px] text-center text-theme2">
                Live preview — reflects saved settings after publishing
            </p>
        </div>
    );
}
