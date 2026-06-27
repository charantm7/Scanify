// features/customization/pages/CustomizationPanel.tsx
// Console panel for menu page customization.
// Two-column layout on desktop: editor left, live preview right (sticky).

'use client';

import React, { useState } from 'react';
import { Check, Loader2, AlertCircle, RotateCcw, ExternalLink } from 'lucide-react';
import { useCustomization } from '../hooks/useCustomization';
import { ThemeTab } from '../components/tabs/ThemeTab';
import { LayoutTab } from '../components/tabs/LayoutTab';
import { TypographyTab } from '../components/tabs/TypographyTab';
import { VisibilityTab } from '../components/tabs/VisibilityTab';
import { LivePreview } from '../components/LivePreview';
import { TABS } from '../constants';
import type { CustomizationTab } from '../types';

function SaveButton({
    saving,
    saved,
    error,
    isDirty,
    onSave,
}: {
    saving: boolean;
    saved: boolean;
    error: boolean;
    isDirty: boolean;
    onSave: () => void;
}) {
    const label = saving ? 'Saving…' : saved ? 'Saved' : error ? 'Save failed — retry' : 'Publish changes';
    const icon = saving
        ? <Loader2 size={14} className="animate-spin" />
        : saved
            ? <Check size={14} />
            : error
                ? <AlertCircle size={14} />
                : null;

    return (
        <button
            type="button"
            onClick={onSave}
            disabled={saving || (!isDirty && !error)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{
                background: error ? '#DC2626' : 'var(--accent)',
            }}
        >
            {icon}
            {label}
        </button>
    );
}

export default function CustomizationPanel() {
    const [tab, setTab] = useState<CustomizationTab>('theme');
    const {
        draft,
        loading,
        saveStatus,
        isDirty,
        patch,
        applyThemePreset,
        resetDraft,
        save,
        hotelSlug,
    } = useCustomization();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="font-syne font-bold text-xl text-theme">Menu Customization</h1>
                    <p className="text-sm text-theme2 mt-0.5">
                        Design how customers see your digital menu
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {isDirty && (
                        <button
                            type="button"
                            onClick={resetDraft}
                            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm text-theme2 hover:text-theme transition"
                            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                        >
                            <RotateCcw size={13} />
                            Reset
                        </button>
                    )}
                    {hotelSlug && (
                        <a
                            href={`/menu/${hotelSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm text-theme2 hover:text-theme transition"
                            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                        >
                            <ExternalLink size={13} />
                            Preview
                        </a>
                    )}
                    <SaveButton
                        saving={saveStatus === 'saving'}
                        saved={saveStatus === 'saved'}
                        error={saveStatus === 'error'}
                        isDirty={isDirty}
                        onSave={save}
                    />
                </div>
            </div>

            {/* Unsaved change banner */}
            {isDirty && saveStatus === 'idle' && (
                <div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                    style={{
                        background: 'var(--accentlt)',
                        color: 'var(--accent)',
                    }}
                >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                    You have unsaved changes — hit "Publish changes" to go live.
                </div>
            )}

            {/* Two-column layout */}
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Editor column */}
                <div className="flex-1 min-w-0 space-y-4">
                    {/* Tab bar */}
                    <div
                        className="flex gap-1 p-1 rounded-xl"
                        style={{ background: 'var(--bg3)' }}
                    >
                        {TABS.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTab(t.id)}
                                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    background: tab === t.id ? 'var(--card)' : 'transparent',
                                    color: tab === t.id ? 'var(--text)' : 'var(--text2)',
                                    boxShadow: tab === t.id ? 'var(--shadow)' : 'none',
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    {tab === 'theme' && (
                        <ThemeTab
                            draft={draft}
                            onPatch={patch}
                            onApplyPreset={applyThemePreset}
                        />
                    )}
                    {tab === 'layout' && (
                        <LayoutTab draft={draft} onPatch={patch} />
                    )}
                    {tab === 'typography' && (
                        <TypographyTab draft={draft} onPatch={patch} />
                    )}
                    {tab === 'visibility' && (
                        <VisibilityTab draft={draft} onPatch={patch} />
                    )}
                </div>

                {/* Live preview — sticky on desktop */}
                <div className="xl:w-52 xl:flex-shrink-0">
                    <div className="xl:sticky xl:top-24">
                        <div
                            className="p-4 rounded-2xl border"
                            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                        >
                            <LivePreview draft={draft} hotelSlug={hotelSlug} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
