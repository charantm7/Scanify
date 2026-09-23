import { CalendarDays, Sparkles } from 'lucide-react';

function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';

    return 'Good evening';
}

export function WelcomeBanner({
    name,
}: {
    name?: string;
    hotelName?: string;
}) {
    const today = new Intl.DateTimeFormat('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <div
            className="relative overflow-hidden rounded-2xl border px-5 py-5 sm:px-7 sm:py-6"
            style={{
                borderColor: 'var(--border)',
                background:
                    'linear-gradient(135deg, var(--accentlt) 0%, var(--card) 65%)',
            }}
        >
            {/* ambient accent glow */}
            <div
                className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-40 blur-3xl"
                style={{ background: 'var(--accent)' }}
            />

            <div className="relative flex items-end justify-between gap-4">
                <div className="min-w-0">
                    <div
                        className="inline-flex items-center gap-1.5 text-xs font-semibold mb-2 px-2.5 py-1 rounded-full"
                        style={{ color: 'var(--accent)', background: 'var(--card)' }}
                    >
                        <Sparkles size={12} />
                        Overview
                    </div>

                    <h3 className=" text-theme text-2xl sm:text-3xl tracking-tight">
                        {getGreeting()},
                    </h3>

                    <h2 className="font-bold text-theme text-2xl sm:text-3xl tracking-tight">
                        {name || 'there'} 👋
                    </h2>

                    <p className="text-sm text-theme2 mt-1.5">
                        Here&apos;s a quick overview of your restaurant.
                    </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-right text-xs text-theme2 flex-shrink-0">
                    <CalendarDays size={14} />

                    <span>{today}</span>
                </div>
            </div>
        </div>
    );
}
