// features/customization/components/tabs/ThemeTab.tsx
// Colors + preset grid.

'use client';

import React from 'react';
import { PresetGrid } from '../PresetGrid';
import { ColorField } from '../ColorField';
import type { CustomizationDraft, PresetTheme } from '../../types';
import { Card } from '../../../../components/shared/ui';

interface Props {
    draft: CustomizationDraft;
    onPatch: <K extends keyof CustomizationDraft>(key: K, value: CustomizationDraft[K]) => void;
    onApplyPreset: (preset: PresetTheme) => void;
}

export function ThemeTab({ draft, onPatch, onApplyPreset }: Props) {
    return (
        <div className="space-y-6">
            <PresetGrid onApply={onApplyPreset} />

            <div>
                <h3 className="text-sm font-semibold text-theme mb-3">Custom colours</h3>
                <Card>
                    <div className="px-4 py-1">
                        <ColorField
                            label="Background"
                            value={draft.background_color}
                            onChange={v => onPatch('background_color', v)}
                        />
                        <ColorField
                            label="Surface (cards)"
                            value={draft.surface_color}
                            onChange={v => onPatch('surface_color', v)}
                        />
                        <ColorField
                            label="Primary text"
                            value={draft.text_color}
                            onChange={v => onPatch('text_color', v)}
                        />
                        <ColorField
                            label="Accent"
                            value={draft.accent_color}
                            onChange={v => onPatch('accent_color', v)}
                        />
                        <ColorField
                            label="Muted text"
                            value={draft.muted_color}
                            onChange={v => onPatch('muted_color', v)}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}
