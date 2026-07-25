

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { loadCustomization, saveCustomization, applyPreset } from '../services/cutomization.services';
import { DEFAULT_CUSTOMIZATION } from '../../menu/constant';
import type { PresetTheme } from '../types';
import { DBMenuCustomization, CustomizationDraft } from '../types';
import { PRESET_THEMES } from '../constants';
import { useToast } from '../../../hooks/useToast';

export function useCustomization() {
    const { supabase, hotel } = useApp();
    const toast = useToast();
    const [config, setConfig] = useState<CustomizationDraft>(DEFAULT_CUSTOMIZATION);
    const [existingId, setExistingId] = useState<string | null>(null);
    const [activeThemeId, setActiveThemeId] = useState<string | null>('ember');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const hotelId = hotel?.id


    useEffect(() => {
        if (!hotelId) return;

        let mounted = true;
        (async () => {
            try {
                const data = await loadCustomization(supabase, hotelId);

                if (data && mounted) {
                    const { id: _id, hotel_id: _hid, created_at: _c, updated_at: _u, ...rest } = data;
                    setConfig(rest);
                    setExistingId(data.id);
                    // Detect if matches a preset
                    const matched = PRESET_THEMES.find(t =>
                        t.palette.accent_color === data.accent_color &&
                        t.palette.background_color === data.background_color
                    );
                    setActiveThemeId(matched?.id ?? null);
                }
            } catch (err) {
                toast.error(err)
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase, hotelId]);

    const update = useCallback(<K extends keyof CustomizationDraft>(
        key: K,
        value: CustomizationDraft[K],
    ) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        setIsDirty(true);
        if (['primary_color', 'background_color', 'surface_color', 'text_color', 'accent_color', 'muted_color'].includes(key)) {
            setActiveThemeId(null);
        }
    }, []);


    const applyTheme = useCallback((preset: PresetTheme) => {
        setConfig(prev => applyPreset(prev, preset));
        setActiveThemeId(preset.id);
        setIsDirty(true);
    }, []);

    // Reset to last saved
    const resetToDefault = useCallback(() => {
        setConfig(DEFAULT_CUSTOMIZATION);
        setActiveThemeId('ember')
        setIsDirty(true);
    }, []);

    // Save to DB
    const save = useCallback(async () => {
        if (!hotelId) return;
        setSaving(true);

        try {
            const data = await saveCustomization(supabase, hotelId, config);
            setExistingId(data.id);

            toast.success('Menu customization saved!');
            setIsDirty(false);
        } catch (err) {
            toast.error(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    }, [supabase, hotelId, config, toast]);


    return {
        config,
        loading,
        saving,
        isDirty,
        existingId,
        activeThemeId,
        update,
        applyTheme,
        resetToDefault,
        save,
        hotelSlug: hotel?.slug ?? '',
    };
}
