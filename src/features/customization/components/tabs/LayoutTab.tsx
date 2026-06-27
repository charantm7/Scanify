// features/customization/components/tabs/LayoutTab.tsx
// Menu layout, category style, border radius, shadow.

'use client';

import React from 'react';
import { OptionPicker } from '../OptionPicker';
import type { CustomizationDraft } from '../../types';
import { LAYOUT_OPTIONS, CATEGORY_STYLE_OPTIONS, SHADOW_OPTIONS } from '../../constants';
import { Card } from '../../../../components/shared/ui';

interface Props {
    draft: CustomizationDraft;
    onPatch: <K extends keyof CustomizationDraft>(key: K, value: CustomizationDraft[K]) => void;
}

export function LayoutTab({ draft, onPatch }: Props) {
    return (
        <div className="space-y-6">
            <Card>
                <div className="px-4 py-4 space-y-5">
                    <OptionPicker
                        label="Menu layout"
                        options={LAYOUT_OPTIONS}
                        value={draft.menu_layout}
                        onChange={v => onPatch('menu_layout', v as CustomizationDraft['menu_layout'])}
                    />
                    <OptionPicker
                        label="Category style"
                        options={CATEGORY_STYLE_OPTIONS}
                        value={draft.category_style}
                        onChange={v => onPatch('category_style', v as CustomizationDraft['category_style'])}
                    />
                    <OptionPicker
                        label="Shadow intensity"
                        options={SHADOW_OPTIONS}
                        value={draft.shadow_intensity}
                        onChange={v => onPatch('shadow_intensity', v as CustomizationDraft['shadow_intensity'])}
                    />
                </div>
            </Card>

            {/* Border radius slider */}
            <Card>
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-theme2 uppercase tracking-wide">
                            Corner roundness
                        </span>
                        <span className="text-sm font-mono text-theme">{draft.border_radius}px</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={24}
                        step={2}
                        value={draft.border_radius}
                        onChange={e => onPatch('border_radius', Number(e.target.value))}
                        className="w-full accent-[var(--accent)]"
                    />
                    <div className="flex justify-between text-[11px] text-theme2 mt-1">
                        <span>Sharp</span>
                        <span>Rounded</span>
                        <span>Pill</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
