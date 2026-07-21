'use client';

import type { MenuScanRow, OrderRow, OrderItemsRow } from '../../../types/supabase';
import { AnalyticsPeriod, DOW_LABELS } from '../constants';
import { MenuScansWithItem } from '../queries/analytics.query';

import {
    AnalyticsStats,
    AdvancedAnalyticsStats,
    DayStat,
    HourStat,
    TopItem,
    DayOfWeekStat,
    QrStat,
    FunnelStep,
    OrderStat,
    PeriodComparison

} from '../types';

// check the stats is advance

export function isAdvancedStats(
    s: AnalyticsStats | null
): s is AdvancedAnalyticsStats {
    return !!s && 'peakHours' in s;
}

// helpers

export function periodToDays(period: AnalyticsPeriod): number {
    return period === '7d' ? 7 : period === '30d' ? 30 : 90;
}

export function sinceDate(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
}

export function dayKey(iso: string): string {

    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function pctChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

export function hourLabel(h: number): string {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
}


// ── Basic derivations ─────────────────────────────────────────────────────────

export function buildDayStats(scans: MenuScansWithItem[], days: number): DayStat[] {
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


export function buildTopItems(scans: MenuScansWithItem[], orderItems: OrderItemsRow[] = []): TopItem[] {
    const views = new Map<string, { name: string; count: number }>();
    for (const s of scans) {
        console.log(s)
        if (s.event_type !== 'item_modal_open' || !s.item_id) continue;
        const name = s.item.name ?? 'Unknown';
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

export function buildPeakHours(scans: MenuScansWithItem[]): HourStat[] {
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

export function buildPeakDays(scans: MenuScansWithItem[]): DayOfWeekStat[] {
    const buckets = DOW_LABELS.map(label => ({ label, value: 0 }));
    for (const s of scans) {
        buckets[new Date(s.scanned_at).getDay()].value++;
    }
    return buckets;
}

export function buildQrBreakdown(scans: MenuScansWithItem[]): QrStat[] {
    const counts = new Map<string, { label: string; scans: number }>();
    const qrScans = scans.filter(s => s.event_type === 'qr_scan' && s.qr_code_id);
    const total = qrScans.length || 1;


    for (const s of qrScans) {
        const id = s.qr_code_id!;
        const label = s.qr.label ?? 'Unknown QR';
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

export function buildFunnel(scans: MenuScansWithItem[]): FunnelStep[] {
    const s = scans.filter(x => x.event_type === 'qr_scan').length;
    const m = scans.filter(x => x.event_type === 'page_view').length;
    const i = scans.filter(x => x.event_type === 'item_modal_open').length;
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

export function buildOrderStats(orders: OrderRow[], days: number): OrderStat {
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

export function buildComparison(
    current: MenuScansWithItem[],
    previous: MenuScansWithItem[],
): PeriodComparison {
    const count = (arr: MenuScansWithItem[], type: string) =>
        arr.filter(s => s.event_type === type).length;
    const cs = count(current, 'qr_scan'), ps = count(previous, 'qr_scan');
    const cm = count(current, 'page_view'), pm = count(previous, 'page_view');
    const ci = count(current, 'item_modal_open'), pi = count(previous, 'item_modal_open');
    return {
        scans: { current: cs, previous: ps, changePct: pctChange(cs, ps) },
        menuViews: { current: cm, previous: pm, changePct: pctChange(cm, pm) },
        itemViews: { current: ci, previous: pi, changePct: pctChange(ci, pi) },
    };
}