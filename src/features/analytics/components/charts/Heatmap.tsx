import { useState } from "react";
import { HourStat } from "../../types";

export default function HeatmapHours({ data }: { data: HourStat[] }) {
    const max = Math.max(...data.map(d => d.value), 1);
    const [hovered, setHovered] = useState<number | null>(null);

    // Group into rows of 6 for a 4×6 grid
    const rows = [
        data.slice(0, 6),
        data.slice(6, 12),
        data.slice(12, 18),
        data.slice(18, 24),
    ];

    return (
        <div className="space-y-1">
            {rows.map((row, ri) => (
                <div key={ri} className="flex gap-1">
                    {row.map((cell, ci) => {
                        const idx = ri * 6 + ci;
                        const intensity = cell.value === 0 ? 0 : 0.15 + (cell.value / max) * 0.85;
                        return (
                            <div
                                key={cell.hour}
                                className="flex-1 rounded-lg flex flex-col items-center justify-center cursor-default transition-transform hover:scale-110"
                                style={{
                                    height: 36,
                                    background: `color-mix(in srgb, var(--accent) ${Math.round(intensity * 100)}%, var(--card))`,
                                    border: '1px solid var(--border)',
                                    opacity: hovered === idx ? 1 : 0.9,
                                }}
                                onMouseEnter={() => setHovered(idx)}
                                onMouseLeave={() => setHovered(null)}
                                title={`${cell.label}: ${cell.value} events`}
                            >
                                <span
                                    className="text-[8px] font-bold leading-none"
                                    style={{ color: intensity > 0.5 ? '#fff' : 'var(--muted-foreground)' }}
                                >
                                    {cell.label.replace(' ', '')}
                                </span>
                                {cell.value > 0 && (
                                    <span
                                        className="text-[8px] leading-none mt-0.5"
                                        style={{ color: intensity > 0.5 ? 'rgba(255,255,255,0.8)' : 'var(--muted-foreground)' }}
                                    >
                                        {cell.value}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}