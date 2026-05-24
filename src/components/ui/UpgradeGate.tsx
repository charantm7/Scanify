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
        <div className="flex flex-col items-center text-center rounded-2xl border border-border bg-card px-7 py-8">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-violet-100 dark:bg-violet-900/30">
                <Lock size={18} className="text-violet-600 dark:text-violet-400" aria-hidden />
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
                       bg-muted border border-border text-muted-foreground"
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
                   bg-violet-600 hover:bg-violet-500 active:scale-[0.97]
                   transition-all duration-150"
            >
                <Zap size={14} aria-hidden />
                Upgrade to Pro
            </button>
        </div>
    );
}