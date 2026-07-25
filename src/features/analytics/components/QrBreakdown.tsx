import { QrStat } from "../types";

export default function QrBreakdown({ data }: { data: QrStat[] }) {
    if (!data.length) {
        return (
            <p className="text-sm text-center py-6" style={{ color: 'var(--muted-foreground)' }}>
                No QR scan data yet.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {data.map(qr => (
                <div key={qr.qr_id}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                            {qr.label}
                        </span>
                        <span className="text-xs tabular-nums font-semibold ml-2 flex-shrink-0" style={{ color: 'var(--foreground)' }}>
                            {qr.scans} · {qr.pct}%
                        </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${qr.pct}%`, background: 'var(--accent)' }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}