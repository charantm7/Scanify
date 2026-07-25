import { AnalyticsPeriod, PERIODS } from "../../constants";

export default function PeriodSelector({
    value,
    onChange,
}: {
    value: AnalyticsPeriod;
    onChange: (p: AnalyticsPeriod) => void;
}) {
    return (
        <div
            className="inline-flex rounded-xl p-1 gap-1"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
            {PERIODS.map(p => (
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
    );
}