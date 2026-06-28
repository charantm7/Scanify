import { Lock } from "lucide-react";


export function PlanGate({ children, locked, label = 'Pro' }: { children: React.ReactNode; locked: boolean; label?: string }) {
    if (!locked) return <>{children}</>;
    return (
        <div className="relative">
            <div className="pointer-events-none opacity-40 select-none">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl z-10"
                style={{ background: 'rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-lg"
                    style={{ background: 'var(--accent)' }}>
                    <Lock size={11} /> Unlock with {label}
                </div>
            </div>
        </div>
    );
}
