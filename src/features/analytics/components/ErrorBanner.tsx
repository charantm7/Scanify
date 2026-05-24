import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div
            className="flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: 'color-mix(in srgb, #ef4444 10%, transparent)', border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)' }}
        >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: '#dc2626' }}>
                    Failed to load analytics
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {message}
                </p>
            </div>
            <button
                onClick={onRetry}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
                style={{ background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
            >
                <RefreshCw size={11} /> Retry
            </button>
        </div>
    );
}