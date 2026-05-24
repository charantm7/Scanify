import { Lock, Zap } from "lucide-react";

function UpgradeGate({
    onUpgrade,
}: {
    onUpgrade?: () => void;
}) {
    return (
        <div
            className="relative overflow-hidden rounded-3xl border p-1"
            style={{
                borderColor: 'var(--border)',
                background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent), transparent)',
            }}
        >
            <div
                className="flex flex-col gap-6 rounded-[22px] p-6 md:flex-row md:items-center md:justify-between"
                style={{
                    background:
                        'color-mix(in srgb, var(--card) 94%, transparent)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                {/* Left Section */}
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-sm"
                        style={{
                            background:
                                'linear-gradient(135deg, var(--accentlt), color-mix(in srgb, var(--accent) 14%, white))',
                        }}
                    >
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{
                                background:
                                    'color-mix(in srgb, var(--accent) 12%, transparent)',
                            }}
                        >
                            <Lock
                                width={18}
                                height={18}
                                style={{ color: 'var(--accent)' }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col">
                        {/* Badge */}
                        <div
                            className="mb-2 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                            style={{
                                background:
                                    'color-mix(in srgb, var(--accent) 10%, transparent)',
                                color: 'var(--accent)',
                                border:
                                    '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                            }}
                        >
                            <Zap size={10} />
                            Pro Analytics
                        </div>

                        {/* Heading */}
                        <h3
                            className="text-lg font-bold leading-tight"
                            style={{
                                color: 'var(--foreground)',
                                fontFamily: 'var(--font-syne, sans-serif)',
                            }}
                        >
                            Unlock Advanced Analytics
                        </h3>

                        {/* Description */}
                        <p
                            className="mt-1 max-w-xl text-sm leading-6"
                            style={{ color: 'var(--muted-foreground)' }}
                        >
                            Track QR performance, peak hours, revenue trends,
                            customer funnels, scan comparisons, and detailed
                            engagement analytics with the Pro plan.
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={onUpgrade}
                    className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-[0.98]"
                    style={{
                        background:
                            'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 72%, black))',
                    }}
                >
                    <Zap
                        size={15}
                        className="transition-transform duration-200 group-hover:rotate-12"
                    />
                    Upgrade to Pro
                </button>
            </div>
        </div>
    );
}