import { AlertCircle, AlertTriangle, Info, RefreshCw, X } from "lucide-react";

type BannerVariant = "error" | "warning" | "info";

type ErrorBannerProps = {
    variant?: BannerVariant;
    title: string;
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
    onDismiss?: () => void;
    className?: string;
};

const VARIANTS = {
    error: {
        icon: AlertCircle,
        container: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900",
        iconWrap: "bg-red-100 dark:bg-red-900/50",
        iconColor: "text-red-700 dark:text-red-400",
        title: "text-red-900 dark:text-red-200",
        message: "text-red-700 dark:text-red-400",
        btn: "text-red-900 border-red-300 hover:bg-red-100 dark:text-red-200 dark:border-red-800 dark:hover:bg-red-900/40",
        dismiss: "text-red-700 dark:text-red-400",
    },
    warning: {
        icon: AlertTriangle,
        container: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900",
        iconWrap: "bg-amber-100 dark:bg-amber-900/50",
        iconColor: "text-amber-700 dark:text-amber-400",
        title: "text-amber-900 dark:text-amber-200",
        message: "text-amber-700 dark:text-amber-400",
        btn: "text-amber-900 border-amber-300 hover:bg-amber-100 dark:text-amber-200 dark:border-amber-800 dark:hover:bg-amber-900/40",
        dismiss: "text-amber-700 dark:text-amber-400",
    },
    info: {
        icon: Info,
        container: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900",
        iconWrap: "bg-blue-100 dark:bg-blue-900/50",
        iconColor: "text-blue-700 dark:text-blue-400",
        title: "text-blue-900 dark:text-blue-200",
        message: "text-blue-700 dark:text-blue-400",
        btn: "text-blue-900 border-blue-300 hover:bg-blue-100 dark:text-blue-200 dark:border-blue-800 dark:hover:bg-blue-900/40",
        dismiss: "text-blue-700 dark:text-blue-400",
    },
} satisfies Record<BannerVariant, object>;

export function ErrorBanner({
    variant = "error",
    title,
    message,
    onRetry,
    retryLabel = "Try again",
    onDismiss,
    className = "",
}: ErrorBannerProps) {
    const v = VARIANTS[variant];
    const Icon = v.icon;

    return (
        <div
            role="alert"
            className={`flex items-start gap-3 p-3.5 rounded-xl border ${v.container} ${className}`}
        >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${v.iconWrap}`}>
                <Icon size={16} className={v.iconColor} aria-hidden />
            </div>

            <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-medium mb-0.5 ${v.title}`}>{title}</p>
                {message && (
                    <p className={`text-xs leading-relaxed ${v.message}`}>{message}</p>
                )}
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className={`inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-md
                        text-xs font-medium border bg-transparent
                        transition-opacity hover:opacity-75 ${v.btn}`}
                    >
                        <RefreshCw size={12} aria-hidden />
                        {retryLabel}
                    </button>
                )}
            </div>

            {onDismiss && (
                <button
                    onClick={onDismiss}
                    aria-label="Dismiss"
                    className={`flex-shrink-0 p-0.5 opacity-50 hover:opacity-100
                      transition-opacity ${v.dismiss}`}
                >
                    <X size={15} />
                </button>
            )}
        </div>
    );
}