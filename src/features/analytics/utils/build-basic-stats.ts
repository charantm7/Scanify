import { AnalyticsStatCard, AnalyticsStats, PeriodComparison } from "../types";

import {
    QrCode,
    Eye,
    TrendingUp,
    Calendar,
} from "lucide-react";

export function buildBasicStats(
    stats: AnalyticsStats,
    comparison?: PeriodComparison
): AnalyticsStatCard[] {
    return [
        {
            id: "qr-scans",
            icon: QrCode,
            label: "QR Scans",
            value: stats.totalScans.toLocaleString(),
            sub: "All QR scan events",
            change: comparison?.scans.changePct,
        },

        {
            id: "menu-views",
            icon: Eye,
            label: "Menu Views",
            value: stats.totalMenuViews.toLocaleString(),
            sub: "Menu opened events",
            change: comparison?.menuViews.changePct,
        },

        {
            id: "item-views",
            icon: TrendingUp,
            label: "Item Views",
            value: stats.totalItemViews.toLocaleString(),
            sub: "Individual item taps",
            change: comparison?.itemViews.changePct,
        },

        {
            id: "active-days",
            icon: Calendar,
            label: "Active Days",
            value: stats.uniqueDays,
            sub: "Days with ≥1 scan",
        },
    ];
}