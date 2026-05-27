'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import type { MenuScanRow, OrderRow, OrderItemsRow } from '../../../types/supabase';
import { getMenuScans, getPrevMenuScan } from '../queries/analytics.query';
import { getOrderItems, getOrders } from '../../../lib/queries/orders';
import { AnalyticsPeriod } from '../constants';

import {
    AnalyticsStats,
    AdvancedAnalyticsStats,
    BasicAnalyticsStats,
} from '../types';

import {
    periodToDays,
    sinceDate,
    buildComparison,
    buildDayStats,
    buildFunnel,
    buildOrderStats,
    buildPeakDays,
    buildPeakHours,
    buildQrBreakdown,
    buildTopItems,
    isAdvancedStats
} from '../services/analytics.service';
import { buildBasicStats } from '../utils/build-basic-stats';



// Hook
export function useAnalytics(period: AnalyticsPeriod = '7d') {
    const {
        hotel,
        supabase,
        canViewBasicAnalytics,
        canViewAdvancedAnalytics,
        canUseOrdering,
    } = useApp();

    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const fetchAll = useCallback(async () => {
        if (!hotel?.id || !canViewBasicAnalytics) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const days = periodToDays(period);
        const since = sinceDate(days);

        // double the period selected
        const prevSince = sinceDate(days * 2);

        try {

            // current scans
            const scans = await getMenuScans(supabase, hotel.id, since);

            const currentScans: MenuScanRow[] = scans ?? [];

            // Basic plan analytics
            const basicStats: BasicAnalyticsStats = {
                totalScans: currentScans.filter(s => s.event_type === 'qr_scan').length,
                totalMenuViews: currentScans.filter(s => s.event_type === 'menu_view').length,
                totalItemViews: currentScans.filter(s => s.event_type === 'item_view').length,
                uniqueDays: new Set(currentScans.map(s => s.scanned_at.slice(0, 10))).size,
                scansByDay: buildDayStats(currentScans, days),
                topItems: buildTopItems(currentScans),
            };


            if (!canViewAdvancedAnalytics) {
                setStats(basicStats);
                return;
            }

            // Advance prevMenu scan and ordering in parallel
            const [prevRes, ordersRes] = await Promise.all([

                getPrevMenuScan(supabase, hotel.id, prevSince, since),

                canUseOrdering
                    ? getOrders(supabase, hotel.id, since)
                    : Promise.resolve({ data: [], error: null }),
            ]);

            const previousScans: MenuScanRow[] = prevRes as MenuScanRow[];
            const orders: OrderRow[] = ordersRes as OrderRow[];

            // fetch order items
            let orderItems: OrderItemsRow[] = [];
            if (canUseOrdering && orders.length > 0) {
                const oi = await getOrderItems(supabase, orders);
                orderItems = (oi ?? []) as OrderItemsRow[];
            }

            // Repeat-day: days with ≥ 2 qr_scan events (proxy for return traffic)
            const scansByDate = new Map<string, number>();
            for (const s of currentScans) {
                if (s.event_type !== 'qr_scan') continue;
                const k = s.scanned_at.slice(0, 10);
                scansByDate.set(k, (scansByDate.get(k) ?? 0) + 1);
            }
            const repeatDays = [...scansByDate.values()].filter(v => v >= 2).length;

            // Avg session depth: item_views per qr_scan
            const qrCount = basicStats.totalScans || 1;
            const avgSessionDepth = Math.round((basicStats.totalItemViews / qrCount) * 10) / 10;

            const advancedStats: AdvancedAnalyticsStats = {
                ...basicStats,
                topItems: buildTopItems(currentScans, orderItems), // enriched with order data
                peakHours: buildPeakHours(currentScans),
                peakDays: buildPeakDays(currentScans),
                qrBreakdown: buildQrBreakdown(currentScans),
                funnel: buildFunnel(currentScans),
                orders: canUseOrdering ? buildOrderStats(orders, days) : null,
                comparison: buildComparison(currentScans, previousScans),
                repeatDays,
                avgSessionDepth,
            };

            setStats(advancedStats);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [hotel?.id, period, canViewBasicAnalytics, canViewAdvancedAnalytics, canUseOrdering]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);


    return {
        stats,
        loading,
        error,
        canViewBasicAnalytics,
        canViewAdvancedAnalytics,
        refetch: fetchAll,
    };
}