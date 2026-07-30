import { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { fetchDashboardStats } from '../services/dashboardService';
import type { DashboardStats } from '../types';

const EMPTY_STATS: DashboardStats = { qrCount: 0, scanCount: 0 };

export function useDashboardStats(hotelId?: string) {
    const { supabase } = useApp();
    const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
    const [error, setError] = useState<string | null>(null);

    const [loadedForId, setLoadedForId] = useState<string | undefined>(undefined);
    const [prevHotelId, setPrevHotelId] = useState(hotelId);


    if (prevHotelId !== hotelId) {
        setPrevHotelId(hotelId);
        setLoadedForId(undefined);
    }

    const loading = !!hotelId && loadedForId !== hotelId;

    useEffect(() => {
        if (!hotelId) return;
        let mounted = true;

        fetchDashboardStats(supabase, hotelId)
            .then((data) => {
                if (!mounted) return;
                setStats(data);
                setError(null);
                setLoadedForId(hotelId);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err?.message ?? 'Failed to load stats');
                setLoadedForId(hotelId);
            });

        return () => { mounted = false; };
    }, [hotelId, supabase]);

    return { stats, loading, error };
}