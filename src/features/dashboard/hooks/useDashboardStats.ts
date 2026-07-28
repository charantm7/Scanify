import { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { fetchDashboardStats } from '../services/dashboardService';
import type { DashboardStats } from '../types';

const EMPTY_STATS: DashboardStats = { qrCount: 0, scanCount: 0 };

export function useDashboardStats(hotelId?: string) {
    const { supabase } = useApp();
    const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!hotelId) { setLoading(false); return; }
        let mounted = true;
        setLoading(true);

        fetchDashboardStats(supabase, hotelId)
            .then((data) => { if (mounted) setStats(data); })
            .catch((err) => { if (mounted) setError(err?.message ?? 'Failed to load stats'); })
            .finally(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, [hotelId, supabase]);

    return { stats, loading, error };
}