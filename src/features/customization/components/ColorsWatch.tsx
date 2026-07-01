export function ColorSwatch({ label, value, onChange, disabled }: {
    label: string; value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-theme2">{label}</span>
            <div className="flex items-center gap-2">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden border-2 flex-shrink-0 cursor-pointer transition hover:scale-105"
                    style={{ borderColor: 'var(--border2)' }}>
                    <input
                        type="color"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        disabled={disabled}
                        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                    />
                    <div className="w-full h-full" style={{ background: value }} />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onChange(e.target.value); }}
                    disabled={disabled}
                    maxLength={7}
                    className="flex-1 px-3 py-1.5 rounded-xl border text-xs font-mono text-theme bg-card outline-none focus:ring-2"
                    style={{ borderColor: 'var(--border)', '--tw-ring-color': 'var(--accent)' } as any}
                />
            </div>
        </div>
    );
}