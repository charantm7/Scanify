// features/customization/hooks/useCustomization.ts
// All editor state in one place — load, draft, save, preview, preset apply.

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { loadCustomization, saveCustomization, applyPreset } from '../services/customization.service';
import { DEFAULT_CUSTOMIZATION } from '../../menu/constant';
import type { CustomizationDraft, PresetTheme, SaveStatus } from '../types';

export function useCustomization() {
    const { supabase, hotel } = useApp();

    const [draft, setDraft] = useState<CustomizationDraft>({ ...DEFAULT_CUSTOMIZATION });
    const [savedDraft, setSavedDraft] = useState<CustomizationDraft>({ ...DEFAULT_CUSTOMIZATION });
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load on mount
    useEffect(() => {
        if (!hotel?.id) return;

        let mounted = true;
        (async () => {
            try {
                const data = await loadCustomization(supabase, hotel.id);
                if (mounted) {
                    setDraft(data);
                    setSavedDraft(data);
                }
            } catch (err) {
                console.error('[useCustomization] load error:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [supabase, hotel?.id]);

    // Patch a single field
    const patch = useCallback(<K extends keyof CustomizationDraft>(
        key: K,
        value: CustomizationDraft[K],
    ) => {
        setDraft(prev => ({ ...prev, [key]: value }));
        setSaveStatus('idle');
    }, []);

    // Apply a preset theme
    const applyThemePreset = useCallback((preset: PresetTheme) => {
        setDraft(prev => applyPreset(prev, preset));
        setSaveStatus('idle');
    }, []);

    // Reset to last saved
    const resetDraft = useCallback(() => {
        setDraft({ ...savedDraft });
        setSaveStatus('idle');
    }, [savedDraft]);

    // Save to DB
    const save = useCallback(async () => {
        if (!hotel?.id) return;
        setSaveStatus('saving');

        try {
            await saveCustomization(supabase, hotel.id, draft);
            setSavedDraft({ ...draft });
            setSaveStatus('saved');

            // Auto-clear "saved" feedback after 2.5 s
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => setSaveStatus('idle'), 2500);
        } catch (err) {
            console.error('[useCustomization] save error:', err);
            setSaveStatus('error');
        }
    }, [supabase, hotel?.id, draft]);

    const isDirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);

    return {
        draft,
        loading,
        saveStatus,
        isDirty,
        patch,
        applyThemePreset,
        resetDraft,
        save,
        hotelSlug: hotel?.slug ?? '',
    };
}
