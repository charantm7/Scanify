import { lightenHex } from "../services/cutomization.services";
import { PresetTheme } from "../types";
import { Lock, ChevronDown, Check } from "lucide-react";


export function Toggle({ checked, onChange, label, sublabel, disabled, locked }: {
    checked: boolean; onChange: (v: boolean) => void; label: string; sublabel?: string; disabled?: boolean; locked?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-3 px-4 rounded-xl transition hover:bg-theme3 cursor-pointer"
        >
            <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-theme">{label}</span>
                    {locked && <Lock size={11} style={{ color: 'var(--text3)' }} />}
                </div>
                {sublabel && <p className="text-xs text-theme2 mt-0.5">{sublabel}</p>}
            </div>

            <div
                onClick={() => !disabled && !locked && onChange(!checked)}
                className={`relative cursor-pointer rounded-full transition-colors duration-200 ${disabled || locked ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                style={{
                    width: 40,
                    height: 22,
                    backgroundColor: checked ? "var(--accent)" : "var(--bg3)",
                }}
            >
                <span
                    className="absolute rounded-full bg-white shadow transition-transform duration-200"
                    style={{
                        width: 18,
                        height: 18,
                        top: 2,
                        left: 2,
                        transform: checked ? "translateX(18px)" : "translateX(0)",
                    }}
                />
            </div>
        </div>
    );
}

export function SelectPicker({ label, value, onChange, options, disabled }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-theme2">{label}</span>
            <div className="relative">
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    disabled={disabled}
                    className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border text-sm text-theme bg-card outline-none focus:ring-2 transition"
                    style={{ borderColor: 'var(--border)', '--tw-ring-color': 'var(--accent)' } as any}
                >
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text3)' }} />
            </div>
        </div>
    );
}

export function RangeSlider({ label, value, min, max, step = 1, unit = '', onChange, disabled }: {
    label: string; value: number; min: number; max: number; step?: number;
    unit?: string; onChange: (v: number) => void; disabled?: boolean;
}) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-theme2">{label}</span>
                <span className="text-xs font-bold text-theme bg-theme3 px-2 py-0.5 rounded-md">
                    {value}{unit}
                </span>
            </div>
            <input
                type="range"
                min={min} max={max} step={step}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                disabled={disabled}
                className="w-full accent-[var(--accent)]"
                style={{ accentColor: 'var(--accent)' }}
            />
        </div>
    );
}

export function ThemeCard({ theme, isActive, onApply }: { theme: PresetTheme; isActive: boolean; onApply: () => void }) {
    return (
        <button
            onClick={onApply}
            className="group relative flex-shrink-0 text-left transition-all duration-200 hover:-translate-y-0.5"
            style={{ width: '100%' }}
        >
            <div className="rounded-2xl border-2 overflow-hidden transition-all duration-200"
                style={{
                    borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                    background: theme.palette.surface_color,
                    boxShadow: isActive ? '0 0 0 4px var(--accentlt)' : 'none',
                }}>
                {/* Palette strip */}
                <div className="flex h-8">
                    {[theme.palette.background_color, theme.palette.accent_color, theme.palette.text_color, theme.palette.muted_color].map((c, i) => (
                        <div key={i} className="flex-1" style={{ background: c }} />
                    ))}
                </div>

                {/* Mini item preview */}
                <div className="p-2.5" style={{ background: theme.palette.background_color }}>
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px]"
                            style={{ background: lightenHex(theme.palette.accent_color, 0.88) }}>
                            {theme.emoji}
                        </div>
                        <div className="flex-1">
                            <div className="h-1.5 rounded-full mb-1" style={{ background: theme.palette.text_color, width: '60%' }} />
                            <div className="h-1 rounded-full" style={{ background: theme.palette.muted_color, width: '40%', opacity: 0.6 }} />
                        </div>
                        <div className="text-[9px] font-bold" style={{ color: theme.palette.accent_color }}>₹220</div>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: theme.palette.accent_color, width: '30%' }} />
                </div>
            </div>

            {/* Label */}
            <div className="mt-1.5 px-0.5 flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold text-theme leading-tight">{theme.name}</p>
                    <p className="text-[10px] text-theme2 leading-tight mt-0.5">{theme.description}</p>
                </div>
                {isActive && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'var(--accent)' }}>
                        <Check size={9} color="white" />
                    </div>
                )}
            </div>
        </button>
    );
}
