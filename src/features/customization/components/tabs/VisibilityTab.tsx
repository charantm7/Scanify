// features/customization/components/tabs/VisibilityTab.tsx
// Show/hide toggles grouped by section.

'use client';

import React from 'react';
import { VisibilityToggle } from '../VisibilityToggle';
import type { CustomizationDraft } from '../../types';
import { VISIBILITY_GROUPS } from '../../constants';
import { Card } from '../../../../components/shared/ui';
import { useApp } from '../../../../context/AppContext';

interface Props {
    draft: CustomizationDraft;
    onPatch: <K extends keyof CustomizationDraft>(key: K, value: CustomizationDraft[K]) => void;
}

// Keys that require a paid plan feature
const GATED_KEYS: Record<string, { label: string; guard: keyof ReturnType<typeof useApp> }> = {
    show_scanify_badge: { label: 'Starter+', guard: 'canRemoveBranding' },
};

export function VisibilityTab({ draft, onPatch }: Props) {
    const app = useApp();

    return (
        <div className="space-y-6">
            {VISIBILITY_GROUPS.map(group => (
                <div key={group.group}>
                    <h3 className="text-sm font-semibold text-theme mb-3">{group.group}</h3>
                    <Card>
                        <div className="px-4 py-1">
                            {group.items.map(item => {
                                const gate = GATED_KEYS[item.key];
                                const gated = gate ? !app[gate.guard] : false;

                                return (
                                    <VisibilityToggle
                                        key={item.key}
                                        label={item.label}
                                        checked={!!draft[item.key as keyof CustomizationDraft]}
                                        onChange={v =>
                                            onPatch(
                                                item.key as keyof CustomizationDraft,
                                                v as CustomizationDraft[keyof CustomizationDraft],
                                            )
                                        }
                                        gated={gated}
                                        gateLabel={gate?.label}
                                    />
                                );
                            })}
                        </div>
                    </Card>
                </div>
            ))}
        </div>
    );
}
