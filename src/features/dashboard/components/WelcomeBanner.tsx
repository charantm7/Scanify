import { Building2, QrCode } from 'lucide-react';

export function WelcomeBanner({
    name, hotelName, planLabel,
}: { name?: string; hotelName?: string; planLabel: string }) {
    return (
        <div
            className="rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ background: 'var(--accent)' }}
        >
            <div className="min-w-0">
                <p className="text-white/70 text-sm mb-1">Welcome back,</p>
                <h1 className="font-syne font-bold text-white text-2xl sm:text-3xl truncate">
                    {name || 'There'} 👋
                </h1>
                {hotelName && (
                    <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5 truncate">
                        <Building2 size={12} className="flex-shrink-0" /> {hotelName}
                    </p>
                )}
            </div>
            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 flex-shrink-0">
                <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    {planLabel}
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <QrCode size={22} color="white" />
                </div>
            </div>
        </div>
    );
}