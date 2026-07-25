import { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../hooks/useToast';
import { settingsService } from '../services/settings.service';
import { EMPTY_RESTAURANT_FORM } from '../constants';
import type { RestaurantFormData } from '../types';

function toForm(hotel: any): RestaurantFormData {
    return {
        name: hotel?.name || '',
        description: hotel?.description || '',
        logo_url: hotel?.logo_url || '',
        address: hotel?.address || '',
        phone: hotel?.phone || '',
        website: hotel?.website || '',
        google_maps_url: hotel?.google_maps_url || '',
        cuisine_type: hotel?.cuisine_type || [],
        service_type: hotel?.service_type || [],
        restaurant_type: hotel?.restaurant_type || [],
    };
}

export function useRestaurantSettings() {
    const { hotel, refreshHotel, supabase } = useApp();
    const toast = useToast();
    const [form, setForm] = useState<RestaurantFormData>(() => toForm(hotel));
    const [saving, setSaving] = useState(false);

    const isDirty = useMemo(
        () => JSON.stringify(form) !== JSON.stringify(toForm(hotel)),
        [form, hotel]
    );

    function setField<K extends keyof RestaurantFormData>(field: K, value: RestaurantFormData[K]) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    function toggleListValue(field: 'cuisine_type' | 'service_type' | 'restaurant_type', value: string) {
        setForm((f) => {
            const list = f[field];
            const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
            return { ...f, [field]: next };
        });
    }

    function reset() {
        setForm(toForm(hotel));
    }

    async function save() {
        if (!form.name.trim()) return toast.error('Restaurant name required');
        setSaving(true);
        try {
            await settingsService.updateRestaurant(supabase, hotel.id, form);
            await refreshHotel();
            toast.success('Restaurant profile updated');
        } catch (e: any) {
            toast.error(e.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    }

    return { form, setField, toggleListValue, isDirty, saving, save, reset };
}