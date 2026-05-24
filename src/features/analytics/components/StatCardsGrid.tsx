import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { pctLabel } from "../utils/analytics.helpers";
import { AnalyticsStatCard } from "../types";

export function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    change,
}: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    sub?: string;
    change?: number;
}) {
    const positive = change !== undefined && change > 0;
    const negative = change !== undefined && change < 0;

    return (
        <div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
            <div className="flex items-center justify-between">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--accentlt)' }}
                >
                    <Icon size={16} style={{ color: 'var(--accent)' }} />
                </div>
                {change !== undefined && (
                    <span
                        className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                            background: positive
                                ? 'color-mix(in srgb, #22c55e 15%, transparent)'
                                : negative
                                    ? 'color-mix(in srgb, #ef4444 15%, transparent)'
                                    : 'var(--accentlt)',
                            color: positive ? '#16a34a' : negative ? '#dc2626' : 'var(--muted-foreground)',
                        }}
                    >
                        {positive ? <TrendingUp size={10} /> : negative ? <TrendingDown size={10} /> : <Minus size={10} />}
                        {pctLabel(change)}
                    </span>
                )}
            </div>
            <div>
                <p
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: 'var(--foreground)', fontFamily: 'var(--font-syne, sans-serif)' }}
                >
                    {value}
                </p>
                <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {label}
                </p>
                {sub && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>
                        {sub}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function StatCardsGrid({ cards }: { cards: AnalyticsStatCard[]; }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cards.map(card => (
                <StatCard
                    key={card.id}
                    icon={card.icon}
                    label={card.label}
                    value={card.value}
                    sub={card.sub}
                    change={card.change}
                />
            ))}
        </div>
    )
}
