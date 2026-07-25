export interface AnalyticsStatCard {
    id: string;
    icon: React.ElementType;
    label: string;
    value: number | string;
    sub?: string;
    change?: number;
}


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
    orders: number;
    convRate: number;
}

export interface QrStat {
    qr_id: string;
    label: string;
    scans: number;
    pct: number;
}

export interface FunnelStep {
    label: string;
    value: number;
    dropPct: number;
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
