import { currency } from "../utils/analytics.helpers";
import { ORDER_STATUS_CONFIG } from "../constants";
import BarChart from "./charts/BarChart";
import { OrderStat } from "../types";

export default function OrderStats({ data }: { data: OrderStat }) {
    const statusEntries = Object.entries(data.byStatus) as [keyof typeof data.byStatus, number][];
    const totalOrders = data.totalOrders || 1;

    return (
        <div className="space-y-5">
            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Orders', value: data.totalOrders.toLocaleString() },
                    { label: 'Total Revenue', value: currency(data.totalRevenue) },
                    { label: 'Avg Order Value', value: currency(data.avgOrderValue) },
                    { label: 'Orders / Day', value: String(data.ordersPerDay) },
                ].map(kpi => (
                    <div
                        key={kpi.label}
                        className="rounded-xl p-3"
                        style={{ background: 'var(--accentlt)', border: '1px solid var(--border)' }}
                    >
                        <p
                            className="text-base font-bold tabular-nums"
                            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-syne, sans-serif)' }}
                        >
                            {kpi.value}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                            {kpi.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Status distribution */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>
                    Order status
                </p>
                <div className="space-y-2">
                    {statusEntries
                        .filter(([, count]) => count > 0)
                        .sort((a, b) => b[1] - a[1])
                        .map(([status, count]) => {
                            const cfg = ORDER_STATUS_CONFIG[status];
                            return (
                                <div key={status} className="flex items-center gap-3">
                                    <span
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ background: cfg.color }}
                                    />
                                    <span className="text-sm flex-1" style={{ color: 'var(--foreground)' }}>
                                        {cfg.label}
                                    </span>
                                    <div
                                        className="h-1.5 rounded-full overflow-hidden"
                                        style={{ background: 'var(--border)', width: 80 }}
                                    >
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(count / totalOrders) * 100}%`,
                                                background: cfg.color,
                                            }}
                                        />
                                    </div>
                                    <span
                                        className="text-xs font-semibold tabular-nums w-8 text-right"
                                        style={{ color: 'var(--foreground)' }}
                                    >
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* Revenue by day */}
            {data.revenueByDay.some(d => d.value > 0) && (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>
                        Revenue by day
                    </p>
                    <BarChart
                        data={data.revenueByDay}
                        height={72}
                        formatValue={v => currency(v)}
                        showEveryNth={Math.ceil(data.revenueByDay.length / 10)}
                    />
                </div>
            )}
        </div>
    );
}