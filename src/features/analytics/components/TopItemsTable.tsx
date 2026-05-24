
import { TopItem } from "../types";

export default function TopItemsTable({
    items,
    showConversion,
}: {
    items: TopItem[];
    showConversion: boolean;
}) {
    if (!items.length) {
        return (
            <p className="text-sm text-center py-6" style={{ color: 'var(--muted-foreground)' }}>
                No item view data yet.
            </p>
        );
    }

    const maxViews = Math.max(...items.map(i => i.views), 1);

    return (
        <div className="space-y-3">
            {items.map((item, idx) => (
                <div key={item.item_id} className="flex items-center gap-3">
                    <span
                        className="text-xs font-bold w-5 text-right flex-shrink-0 tabular-nums"
                        style={{ color: 'var(--muted-foreground)' }}
                    >
                        {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                            <p
                                className="text-sm font-medium truncate"
                                style={{ color: 'var(--foreground)' }}
                            >
                                {item.item_name}
                            </p>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span
                                    className="text-xs tabular-nums font-semibold"
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    {item.views} views
                                </span>
                                {showConversion && item.orders > 0 && (
                                    <span
                                        className="text-xs tabular-nums px-1.5 py-0.5 rounded-md font-semibold"
                                        style={{
                                            background: 'color-mix(in srgb, #22c55e 15%, transparent)',
                                            color: '#16a34a',
                                        }}
                                    >
                                        {item.orders} orders · {item.convRate}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div
                            className="h-1.5 rounded-full overflow-hidden"
                            style={{ background: 'var(--border)' }}
                        >
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${(item.views / maxViews) * 100}%`,
                                    background: 'var(--accent)',
                                }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
