import { CalendarDays } from 'lucide-react';

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
        <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
                <p
                    className="text-sm font-medium mb-1"
                    style={{ color: 'var(--accent)' }}
                >
                    Overview
                </p>

                <h1 className=" font-bold text-theme text-2xl sm:text-3xl tracking-tight">
                    Good evening, {name || 'there'} 👋
                </h1>

                <p className="text-sm text-theme2 mt-1">
                    Here&apos;s a quick overview of your restaurant.
                </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-right text-xs text-theme2 flex-shrink-0">
                <CalendarDays size={14} />

                <span>{today}</span>
            </div>
        </div>
    );
}