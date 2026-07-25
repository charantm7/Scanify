import { Lock, Zap, LucideIcon } from "lucide-react";

export type UpgradeFeature = {
    icon: LucideIcon;
    label: string;
};

type UpgradeGateProps = {
    title?: string;
    description?: string;
    features: UpgradeFeature[];
    onUpgrade?: () => void;
};

export function UpgradeGate({
    title = "Pro Feature",
    description = "These insights are available on the Pro plan. Upgrade to unlock full access.",
    features,
    onUpgrade,
}: UpgradeGateProps) {
    return (
        <div className="flex flex-col items-center text-center rounded-2xl border border-theme bg-card px-7 py-8">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-[var(--accentlt)] dark:bg-[var(--accentlt)]">
                <Lock size={18} className="text-[var(--accent)] dark:text-[var(--accent)]" aria-hidden />
            </div>

            <p className="text-[15px] font-medium text-foreground mb-1.5">{title}</p>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-5 max-w-xs">
                {description}
            </p>

            <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                {features.map(({ icon: Icon, label }) => (
                    <span
                        key={label}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs
                       bg-muted border border-theme text-muted-foreground"
                    >
                        <Icon size={12} aria-hidden />
                        {label}
                    </span>
                ))}
            </div>

            <button
                onClick={onUpgrade}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl
                   text-sm font-medium text-white
                   bg-[var(--accent)] hover:bg-[var(--accent2)] active:scale-[0.97]
                   transition-all duration-150"
            >
                <Zap size={14} aria-hidden />
                Upgrade to Pro
            </button>
        </div>
    );
}