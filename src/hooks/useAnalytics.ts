'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { MenuScanRow, OrderRow, OrderItemsRow } from '../types/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// useAnalytics — Advanced analytics hook for Scanify
//
// Covers every signal the current schema can produce:
//
//  Basic tier  (growth+):
//    • QR scan count, menu view count, item view count
//    • Unique engagement days
//    • Scans by day (bar chart)
//    • Top 10 viewed items
//
//  Advanced tier (pro):
//    • Peak-hour heatmap (0-23 h)
//    • Peak-day-of-week distribution
//    • QR code performance breakdown
//    • Scan funnel  (scan → menu_view → item_view)
//    • Item view-to-order conversion rate
//    • Order analytics: revenue, avg order value, orders by status, revenue/day
//    • Order velocity (orders per day)
//    • Repeat-day behaviour (proxy for return visitors)
//    • Avg session depth (item_views per qr_scan)
//    • Period-over-period comparison (vs previous equal window)
//
// AnalyticsPanel receives clean, typed data — no Supabase in sight.
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared primitives ─────────────────────────────────────────────────────────

export type AnalyticsPeriod = '7d' | '30d' | '90d';

export interface DayStat {
    label: string;   // "14 Apr"
    value: number;
}

export interface HourStat {
    hour: number;    // 0-23
    label: string;   // "2 AM"
    value: number;
}

export interface DayOfWeekStat {
    label: string;     // "Mon"
    value: number;
}

export interface TopItem {
    item_id: string;
    item_name: string;
    views: number;
    orders: number;      // advanced only, else 0
    convRate: number;      // views → orders %, advanced only
}

export interface QrStat {
    qr_id: string;
    label: string;
    scans: number;
    pct: number;         // share of total scans
}

export interface FunnelStep {
    label: string;
    value: number;
    dropPct: number;         // % drop from previous step
}

export interface OrderStat {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    ordersPerDay: number;
    byStatus: {
        pending: number;
        accepted: number;
        preparing: number;
        ready: number;
        served: number;
        cancelled: number;
    };
    revenueByDay: DayStat[];
}

export interface PeriodComparison {
    scans: { current: number; previous: number; changePct: number };
    menuViews: { current: number; previous: number; changePct: number };
    itemViews: { current: number; previous: number; changePct: number };
}

// ── Stats shapes ──────────────────────────────────────────────────────────────

export interface BasicAnalyticsStats {
    totalScans: number;
    totalMenuViews: number;
    totalItemViews: number;
    uniqueDays: number;
    scansByDay: DayStat[];
    topItems: TopItem[];
}

export interface AdvancedAnalyticsStats extends BasicAnalyticsStats {
    peakHours: HourStat[];
    peakDays: DayOfWeekStat[];
    qrBreakdown: QrStat[];
    funnel: FunnelStep[];
    orders: OrderStat | null;
    comparison: PeriodComparison;
    repeatDays: number;
    avgSessionDepth: number;
}

export type AnalyticsStats = BasicAnalyticsStats | AdvancedAnalyticsStats;

// ── Type guard ────────────────────────────────────────────────────────────────

export function isAdvancedStats(s: AnalyticsStats): s is AdvancedAnalyticsStats {
    return 'peakHours' in s;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function periodToDays(period: AnalyticsPeriod): number {
    return period === '7d' ? 7 : period === '30d' ? 30 : 90;
}

function sinceDate(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
}

function dayKey(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function pctChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

function hourLabel(h: number): string {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
}

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Basic derivations ─────────────────────────────────────────────────────────

function buildDayStats(scans: MenuScanRow[], days: number): DayStat[] {
    const buckets = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        buckets.set(dayKey(d.toISOString()), 0);
    }
    for (const s of scans) {
        if (s.event_type !== 'qr_scan') continue;
        const k = dayKey(s.scanned_at);
        if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
    }
    return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }));
}

function buildTopItems(scans: MenuScanRow[], orderItems: OrderItemsRow[] = []): TopItem[] {
    const views = new Map<string, { name: string; count: number }>();
    for (const s of scans) {
        if (s.event_type !== 'item_view' || !s.item_id) continue;
        const name = (s.metadata as Record<string, string>)?.item_name ?? 'Unknown';
        const e = views.get(s.item_id);
        if (e) e.count++;
        else views.set(s.item_id, { name, count: 1 });
    }

    const ordered = new Map<string, number>();
    for (const oi of orderItems) {
        if (oi.menu_item_id) {
            ordered.set(oi.menu_item_id, (ordered.get(oi.menu_item_id) ?? 0) + oi.quantity);
        }
    }

    return Array.from(views.entries())
        .map(([item_id, { name, count }]) => {
            const orders = ordered.get(item_id) ?? 0;
            return {
                item_id,
                item_name: name,
                views: count,
                orders,
                convRate: count > 0 ? Math.round((orders / count) * 100) : 0,
            };
        })
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
}

// ── Advanced derivations ──────────────────────────────────────────────────────

function buildPeakHours(scans: MenuScanRow[]): HourStat[] {
    const buckets = Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        label: hourLabel(h),
        value: 0,
    }));
    for (const s of scans) {
        buckets[new Date(s.scanned_at).getHours()].value++;
    }
    return buckets;
}

function buildPeakDays(scans: MenuScanRow[]): DayOfWeekStat[] {
    const buckets = DOW_LABELS.map(label => ({ label, value: 0 }));
    for (const s of scans) {
        buckets[new Date(s.scanned_at).getDay()].value++;
    }
    return buckets;
}

function buildQrBreakdown(scans: MenuScanRow[]): QrStat[] {
    const counts = new Map<string, { label: string; scans: number }>();
    const qrScans = scans.filter(s => s.event_type === 'qr_scan' && s.qr_code_id);
    const total = qrScans.length || 1;

    for (const s of qrScans) {
        const id = s.qr_code_id!;
        const label = (s.metadata as Record<string, string>)?.qr_label ?? 'Unknown QR';
        const e = counts.get(id);
        if (e) e.scans++;
        else counts.set(id, { label, scans: 1 });
    }

    return Array.from(counts.entries())
        .map(([qr_id, { label, scans }]) => ({
            qr_id,
            label,
            scans,
            pct: Math.round((scans / total) * 100),
        }))
        .sort((a, b) => b.scans - a.scans);
}

function buildFunnel(scans: MenuScanRow[]): FunnelStep[] {
    const s = scans.filter(x => x.event_type === 'qr_scan').length;
    const m = scans.filter(x => x.event_type === 'menu_view').length;
    const i = scans.filter(x => x.event_type === 'item_view').length;
    const steps = [
        { label: 'QR Scanned', value: s },
        { label: 'Menu Opened', value: m },
        { label: 'Item Viewed', value: i },
    ];
    return steps.map((step, idx) => ({
        ...step,
        dropPct:
            idx === 0
                ? 0
                : steps[idx - 1].value > 0
                    ? Math.round(((steps[idx - 1].value - step.value) / steps[idx - 1].value) * 100)
                    : 0,
    }));
}

function buildOrderStats(orders: OrderRow[], days: number): OrderStat {
    const served = orders.filter(o => o.status === 'served');
    const totalRevenue = served.reduce((acc, o) => acc + Number(o.total_amount), 0);

    const byStatus = {
        pending: orders.filter(o => o.status === 'pending').length,
        accepted: orders.filter(o => o.status === 'accepted').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        served: served.length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    const revBuckets = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        revBuckets.set(dayKey(d.toISOString()), 0);
    }
    for (const o of served) {
        const k = dayKey(o.created_at);
        if (revBuckets.has(k)) {
            revBuckets.set(k, (revBuckets.get(k) ?? 0) + Number(o.total_amount));
        }
    }

    return {
        totalOrders: orders.length,
        totalRevenue,
        avgOrderValue: served.length > 0 ? Math.round(totalRevenue / served.length) : 0,
        ordersPerDay: days > 0 ? Math.round((orders.length / days) * 10) / 10 : 0,
        byStatus,
        revenueByDay: Array.from(revBuckets.entries()).map(([label, value]) => ({ label, value })),
    };
}

function buildComparison(
    current: MenuScanRow[],
    previous: MenuScanRow[],
): PeriodComparison {
    const count = (arr: MenuScanRow[], type: string) =>
        arr.filter(s => s.event_type === type).length;
    const cs = count(current, 'qr_scan'), ps = count(previous, 'qr_scan');
    const cm = count(current, 'menu_view'), pm = count(previous, 'menu_view');
    const ci = count(current, 'item_view'), pi = count(previous, 'item_view');
    return {
        scans: { current: cs, previous: ps, changePct: pctChange(cs, ps) },
        menuViews: { current: cm, previous: pm, changePct: pctChange(cm, pm) },
        itemViews: { current: ci, previous: pi, changePct: pctChange(ci, pi) },
    };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

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
        const prevSince = sinceDate(days * 2); // previous equal window for comparison

        try {
            // ── Current period scans (always) ──────────────────────────────────────
            const { data: scans, error: scanErr } = await supabase
                .from('menu_scans')
                .select('*')
                .eq('hotel_id', hotel.id)
                .gte('scanned_at', since.toISOString())
                .order('scanned_at', { ascending: false });

            if (scanErr) throw new Error(scanErr.message);
            const currentScans: MenuScanRow[] = scans ?? [];

            // ── Basic stats ────────────────────────────────────────────────────────
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

            // ── Advanced: previous period scans + orders in parallel ───────────────
            const [prevRes, ordersRes] = await Promise.all([
                supabase
                    .from('menu_scans')
                    .select('event_type, scanned_at')
                    .eq('hotel_id', hotel.id)
                    .gte('scanned_at', prevSince.toISOString())
                    .lt('scanned_at', since.toISOString()),

                canUseOrdering
                    ? supabase
                        .from('orders')
                        .select('*')
                        .eq('hotel_id', hotel.id)
                        .gte('created_at', since.toISOString())
                    : Promise.resolve({ data: [], error: null }),
            ]);

            const previousScans: MenuScanRow[] = (prevRes.data ?? []) as MenuScanRow[];
            const orders: OrderRow[] = (ordersRes.data ?? []) as OrderRow[];

            // Fetch order_items for conversion rate only when we have orders
            let orderItems: OrderItemsRow[] = [];
            if (canUseOrdering && orders.length > 0) {
                const { data: oi } = await supabase
                    .from('order_items')
                    .select('menu_item_id, quantity, order_id')
                    .in('order_id', orders.map(o => o.id));
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