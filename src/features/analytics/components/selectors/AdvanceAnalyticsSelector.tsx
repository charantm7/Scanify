import { AdvanceAnalytics, AnaltyicsType } from "../../constants"

export default function AdvanceAnalyticsSelector({
    value,
    onChange
}: {
    value: AdvanceAnalytics,
    onChange: (p: AdvanceAnalytics) => void
}) {
    return (
        <div className="overflow-x-auto scrollbar-hide">
            <div
                className="inline-flex min-w-max items-center rounded-xl p-1 gap-1"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
                {AnaltyicsType.map(p => (
                    <button
                        key={p.value}
                        onClick={() => onChange(p.value)}
                        className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={
                            value === p.value
                                ? { background: 'var(--accent)', color: '#fff' }
                                : { color: 'var(--muted-foreground)' }
                        }
                    >
                        {p.label}
                    </button>
                ))}
            </div>
        </div>
    )
}