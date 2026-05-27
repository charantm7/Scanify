import { useState } from "react";

export default function BarChart({
    data,
    height = 200,
    color = 'var(--accent)',
    formatLabel,
    formatValue,
    showEveryNth = 1,
}: {
    data: { label: string; value: number }[];
    height?: number;
    color?: string;
    formatLabel?: (l: string) => string;
    formatValue?: (v: number) => string;
    showEveryNth?: number;
}) {
    const max = Math.max(...data.map(d => d.value), 1);
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className="relative">
            {hovered !== null && data[hovered] && (
                <div
                    className="absolute -top-8 ml-5 text-xs font-semibold px-2 py-1 rounded-lg pointer-events-none z-10 whitespace-nowrap"
                    style={{
                        left: `${((hovered + 0.5) / data.length) * 100}%`,
                        transform: 'translateX(-50%)',
                        background: 'var(--foreground)',
                        color: 'var(--background)',
                    }}
                >
                    {formatValue ? formatValue(data[hovered].value) : data[hovered].value}
                </div>
            )}
            <div className="flex items-end gap-2" style={{ height }}>
                {data.map((d, i) => (
                    <div
                        key={i}
                        className="flex-1 flex flex-col justify-end items-center gap-1 cursor-default"
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <div
                            className="w-full rounded-t transition-all duration-500"
                            style={{
                                height: `${Math.max(3, (d.value / max) * (height - 16))}px`,
                                background: hovered === i ? 'var(--accent)' : color,
                                opacity: d.value === 0 ? 0.15 : hovered === i ? 1 : 0.75,
                            }}
                        />
                    </div>
                ))}
            </div>
            <div className="flex mt-1">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 text-center">
                        {i % showEveryNth === 0 && (
                            <span
                                className="text-[9px] block truncate"
                                style={{ color: 'var(--muted-foreground)' }}
                            >
                                {formatLabel ? formatLabel(d.label) : d.label}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}