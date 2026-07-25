'use client'

import { useState } from "react";
import { HourStat } from "../../types";
import { BarChart2 } from "lucide-react";

export default function HeatmapHours({ data }: { data: HourStat[] }) {
    const max = Math.max(...data.map(d => d.value), 1);
    const [hovered, setHovered] = useState<number | null>(null);
    const [event, setEvent] = useState<number | null>(null)
    console.log(hovered)
    // Group into rows of 6 for a 4×6 grid
    const rows = [
        data.slice(0, 6),
        data.slice(6, 12),
        data.slice(12, 18),
        data.slice(18, 24),
    ];
    const maxValue = Math.max(...data.map((d) => d.value));
    const pct = event != null && maxValue > 0
        ? Math.round((data[event].value / maxValue) * 100)
        : 0;
    const avgValue = data.reduce((s, d) => s + d.value, 0) / data.length;
    const vsAvg = event != null ? Math.round(((data[event].value - avgValue) / avgValue) * 100) : 0;
    const isPeak = event != null && data[event].value === maxValue;

    return (
        <>
            <div className="space-y-2">
                {rows.map((row, ri) => (
                    <div key={ri} className="flex gap-2">
                        {row.map((cell, ci) => {

                            const idx = ri * 6 + ci;

                            const intensity = cell.value === 0 ? 0 : 0.15 + (cell.value / max) * 0.85;
                            return (
                                <div
                                    key={cell.hour}
                                    className="flex-1 cursor-pointer rounded-md flex items-center justify-center  transition-transform hover:scale-110"
                                    style={{
                                        height: 38,
                                        background: `color-mix(in srgb, var(--accent) ${Math.round(intensity * 100)}%, var(--card))`,
                                        border: '1px solid var(--border)',
                                        opacity: hovered === idx ? 1 : 0.9,
                                    }}
                                    onClick={() => setEvent(idx)}

                                    title={`${cell.label}: ${cell.value} events`}
                                >
                                    <span
                                        className="text-[11px] font-bold leading-none"
                                        style={{ color: intensity > 0.5 ? '#fff' : 'var(--text)' }}
                                    >
                                        {cell.label.replace(' ', '')}
                                    </span>

                                </div>
                            );
                        })}
                    </div>
                ))}

            </div>

            <div className="rounded-xl border border-theme bg-card p-5" style={{ boxShadow: "var(--shadow)" }}>
                {event != null ? (
                    <div className="space-y-4">

                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-theme3">
                                    Selected hour
                                </p>
                                <h3 className="text-[17px] font-medium text-theme">
                                    {data[event].label}
                                </h3>
                            </div>

                            {isPeak && (
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                                    style={{ background: "var(--accentlt)", color: "var(--accent)", border: "1px solid var(--accent)" }}
                                >
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                                    Peak
                                </span>
                            )}
                        </div>

                        <div className="h-px" style={{ background: "var(--border2)" }} />

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg px-3.5 py-3" style={{ background: "var(--bg3)" }}>
                                <p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-theme3">
                                    Events
                                </p>
                                <p className="text-2xl font-medium leading-none text-theme">
                                    {data[event].value}
                                </p>
                            </div>

                            <div className="rounded-lg px-3.5 py-3" style={{ background: "var(--bg3)" }}>
                                <p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-theme3">
                                    vs avg
                                </p>
                                <p
                                    className="text-2xl font-medium leading-none"
                                    style={{ color: vsAvg >= 0 ? "#5A8A3A" : "#C0392B" }}
                                >
                                    {vsAvg >= 0 ? "+" : ""}{vsAvg}%
                                </p>
                            </div>
                        </div>

                        <div className="h-px" style={{ background: "var(--border2)" }} />

                        {/* Progress */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-theme2">Activity</span>
                                <span className="text-xs font-medium text-theme2">{pct}%</span>
                            </div>

                            <div
                                className="h-2 overflow-hidden rounded-full"
                                style={{ background: "var(--bg3)" }}
                            >
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${pct}%`,
                                        background: "var(--accent)",
                                        transition: "width 0.4s ease-out",
                                    }}
                                />
                            </div>

                            <p className="text-[11px] text-theme3">
                                Relative to peak hour across all time slots
                            </p>
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-9 text-center">
                        <div
                            className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ background: "var(--bg3)", border: "1px solid var(--border2)" }}
                        >
                            <BarChart2 size={18} style={{ color: "var(--text3)" }} aria-hidden />
                        </div>

                        <p className="text-[13px] font-medium text-theme">No hour selected</p>
                        <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-theme3">
                            Hover over a bar in the chart to see detailed stats for that hour.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}