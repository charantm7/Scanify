import { AnalyticsLevel, LEVELS } from "../../constants"

export default function LevelSelector({
    value,
    onChange
}: {
    value: AnalyticsLevel,
    onChange: (p: AnalyticsLevel) => void
}) {
    return (
        <div
            className="inline-flex w-fit items-center rounded-xl p-1 gap-1"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
            {LEVELS.map(p => (
                <button
                    key={p.value}
                    onClick={() => onChange(p.value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
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
    )
}