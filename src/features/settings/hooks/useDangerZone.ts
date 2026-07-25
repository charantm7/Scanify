import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { settingsService } from '../services/settings.service';
import { useToast } from '../../../hooks/useToast';

export function useDangerZone() {
    const { hotel, refreshHotel, supabase } = useApp();
    const toast = useToast();
    const [processing, setProcessing] = useState(false);

    async function deactivate() {
        setProcessing(true);
        try {
            await settingsService.deactivateRestaurant(supabase, hotel.id);
            await refreshHotel();
            toast.success('Restaurant deactivated');
        } catch (e: any) {
            toast.error(e.message || 'Failed to deactivate');
        } finally {
            setProcessing(false);
        }
    }


    async function reactivate() {
        setProcessing(true);
        try {
            await settingsService.reactivateRestaurant(supabase, hotel.id);
            await refreshHotel();
            toast.success('Restaurant reactivated');
        } catch (e: any) {
            toast.error(e.message || 'Failed to Reactivate');
        } finally {
            setProcessing(false);
        }
    }

    async function softDelete() {
        setProcessing(true);
        try {
            await settingsService.softDeleteRestaurant(supabase, hotel.id);
            toast.success('Restaurant deleted');
        } catch (e: any) {
            toast.error(e.message || 'Failed to delete');
        } finally {
            setProcessing(false);
        }
    }

    return { isActive: hotel?.is_active, processing, deactivate, softDelete, reactivate };
}