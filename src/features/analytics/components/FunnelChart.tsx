import { FunnelStep } from "../types";

export default function Funnel({ steps }: { steps: FunnelStep[] }) {
    const max = steps[0]?.value || 1;

    return (
        <div className="space-y-8">
            {steps.map((step, i) => (
                <div key={step.label}>
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                style={{ background: 'var(--accent)', color: '#fff' }}
                            >
                                {i + 1}
                            </span>
                            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                {step.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {step.dropPct > 0 && (
                                <span className="text-xs" style={{ color: '#ef4444' }}>
                                    −{step.dropPct}% drop
                                </span>
                            )}
                            <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                                {step.value.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: 'var(--border)' }}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${Math.max(2, (step.value / max) * 100)}%`,
                                background: `color-mix(in srgb, var(--accent) ${100 - i * 20}%, #a855f7)`,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}