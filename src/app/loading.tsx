
export default function Loading() {
    return <ScanifyLoader />;
}


export function ScanifyLoader({
    fullscreen = true,
}: {
    message?: string;
    fullscreen?: boolean;
}) {
    return (
        <div
            className={`
        flex flex-col items-center justify-center gap-8
        bg-theme
        ${fullscreen ? 'fixed inset-0 z-50' : 'w-full h-full min-h-[320px]'}
      `}
        >
            {/* Animated logo mark */}
            <div className="relative flex items-center justify-center">

                {/* Outer ring — slow orbit */}
                <div
                    className="absolute rounded-full border border-theme2"
                    style={{
                        width: 88,
                        height: 88,
                        borderTopColor: 'var(--accent)',
                        borderWidth: '1.5px',
                        animation: 'spin 2.4s linear infinite',
                    }}
                />

                {/* Middle ring — counter-orbit, dashed */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 64,
                        height: 64,
                        border: '1.5px dashed var(--border2)',
                        animation: 'spin 3.6s linear infinite reverse',
                    }}
                />

                {/* Inner circle — QR icon */}
                <div
                    className="relative z-10 flex items-center justify-center rounded-full bg-accentlt"
                    style={{ width: 44, height: 44 }}
                >
                    <QrMark />
                </div>
            </div>


        </div>
    );
}

function QrMark() {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            {/* Top-left square */}
            <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="var(--accent)" strokeWidth="1.5" />
            <rect x="3.5" y="3.5" width="3" height="3" rx="0.5" fill="var(--accent)" />
            {/* Top-right square */}
            <rect x="13" y="1" width="8" height="8" rx="1.5" stroke="var(--accent)" strokeWidth="1.5" />
            <rect x="15.5" y="3.5" width="3" height="3" rx="0.5" fill="var(--accent)" />
            {/* Bottom-left square */}
            <rect x="1" y="13" width="8" height="8" rx="1.5" stroke="var(--accent)" strokeWidth="1.5" />
            <rect x="3.5" y="15.5" width="3" height="3" rx="0.5" fill="var(--accent)" />
            {/* Bottom-right dots */}
            <rect x="13" y="13" width="3" height="3" rx="0.5" fill="var(--accent)" opacity="0.5" />
            <rect x="18" y="13" width="3" height="3" rx="0.5" fill="var(--accent)" />
            <rect x="13" y="18" width="3" height="3" rx="0.5" fill="var(--accent)" />
            <rect x="18" y="18" width="3" height="3" rx="0.5" fill="var(--accent)" opacity="0.5" />
        </svg>
    );
}


export function PanelLoader({ message = 'Loading' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full py-20">
            <div className="relative flex items-center justify-center">
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 52,
                        height: 52,
                        border: '1.5px solid var(--border)',
                        borderTopColor: 'var(--accent)',
                        animation: 'panelSpin 1.2s linear infinite',
                    }}
                />
                <div
                    className="flex items-center justify-center rounded-full bg-accentlt"
                    style={{ width: 32, height: 32 }}
                >
                    <QrMark />
                </div>
            </div>
            <p className="text-sm text-theme2">{message}</p>
            <style>{`
        @keyframes panelSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}