import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PeriodComparison } from "../types";
import { pctLabel } from "../utils/analytics.helpers";

export default function ComparisonRow({ data }: { data: PeriodComparison }) {
    const items = [
        { label: 'QR Scans', ...data.scans },
        { label: 'Menu Views', ...data.menuViews },
        { label: 'Item Views', ...data.itemViews },
    ];

    return (
        <div className="flex justify-between items-center gap-3">
            {items.map(item => {
                const up = item.changePct > 0;
                const down = item.changePct < 0;
                return (
                    <div
                        key={item.label}
                        className="rounded-xl p-3 text-center w-full"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                    >
                        <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                            {item.label}
                        </p>
                        <p
                            className="text-lg font-bold tabular-nums"
                            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-syne, sans-serif)' }}
                        >
                            {item.current.toLocaleString()}
                        </p>
                        <span
                            className="inline-flex items-center gap-0.5 text-xs font-semibold mt-1"
                            style={{
                                color: up ? '#16a34a' : down ? '#dc2626' : 'var(--muted-foreground)',
                            }}
                        >
                            {up ? <TrendingUp size={10} /> : down ? <TrendingDown size={10} /> : <Minus size={10} />}
                            {pctLabel(item.changePct)} vs prev
                        </span>
                    </div>
                );
            })}
        </div>
    );
}