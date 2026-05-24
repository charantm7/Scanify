'use client';

import toast, { type Toast } from 'react-hot-toast';
import {
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,
    Loader2,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Custom toast renderer
// Matches your existing design system: var(--card), var(--border),
// var(--accent), font-syne, rounded-2xl
// ─────────────────────────────────────────────────────────────────────────────

interface ToastConfig {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    borderColor: string;
}

const CONFIGS: Record<string, ToastConfig> = {
    success: {
        icon: CheckCircle2,
        iconColor: '#16a34a',
        iconBg: '#dcfce7',
        borderColor: '#16a34a33',
    },
    error: {
        icon: XCircle,
        iconColor: '#dc2626',
        iconBg: '#fef2f2',
        borderColor: '#dc262633',
    },
    warning: {
        icon: AlertTriangle,
        iconColor: '#d97706',
        iconBg: '#fefce8',
        borderColor: '#d9770633',
    },
    info: {
        icon: Info,
        iconColor: 'var(--accent)',
        iconBg: 'var(--accentlt)',
        borderColor: 'var(--accent)33',
    },
    loading: {
        icon: Loader2,
        iconColor: 'var(--accent)',
        iconBg: 'var(--accentlt)',
        borderColor: 'var(--accent)33',
    },
};

function ToastContent({
    t,
    message,
    description,
    type,
}: {
    t: Toast;
    message: string;
    description?: string;
    type: string;
}) {
    const cfg = CONFIGS[type] ?? CONFIGS.info;
    const Icon = cfg.icon;

    return (
        <div
            className={`flex items-start gap-3 w-full transition-all duration-300 ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                }`}
        >
            <div
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
                style={{ background: cfg.iconBg }}
            >
                <Icon
                    size={15}
                    className={type === 'loading' ? 'animate-spin' : ''}
                    style={{ color: cfg.iconColor }}
                />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-theme leading-snug">{message}</p>
                {description && (
                    <p className="text-xs text-theme2 mt-0.5 leading-relaxed">{description}</p>
                )}
            </div>

            <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-shrink-0 text-theme2 hover:text-theme transition-colors mt-0.5"
            >
                <XCircle size={14} />
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Base renderer — used by all variants
// ─────────────────────────────────────────────────────────────────────────────

interface ShowToastOptions {
    message: string;
    description?: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'loading';
    duration?: number;
    id?: string;
}

function showToast({ message, description, type, duration, id }: ShowToastOptions): string {
    const cfg = CONFIGS[type];

    return toast.custom(
        (t) => (
            <div
                className="w-full max-w-sm rounded-2xl border shadow-lg px-4 py-3 pointer-events-auto"
                style={{
                    background: 'var(--card)',
                    borderColor: cfg.borderColor,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }}
            >
                <ToastContent t={t} message={message} description={description} type={type} />
            </div>
        ),
        {
            duration: duration ?? (type === 'loading' ? Infinity : type === 'error' ? 5000 : 3500),
            id,
        },
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// useToast hook — this is what components import
// ─────────────────────────────────────────────────────────────────────────────

export function useToast() {
    return {
        /** Green checkmark. Default 3.5s. */
        success(message: string, description?: string) {
            return showToast({ message, description, type: 'success' });
        },

        /** Red X. Default 5s — errors need more reading time. */
        error(message: string, description?: string) {
            return showToast({ message, description, type: 'error' });
        },

        /** Amber warning. Default 3.5s. */
        warning(message: string, description?: string) {
            return showToast({ message, description, type: 'warning' });
        },

        /** Accent info. Default 3.5s. */
        info(message: string, description?: string) {
            return showToast({ message, description, type: 'info' });
        },

        loading(message: string, id?: string) {
            return showToast({ message, type: 'loading', id });
        },

        /** Manually dismiss by ID. */
        dismiss: toast.dismiss,

        /**
         * Wraps a promise. Shows loading → success/error automatically.
         *
         * example
         * await toast.promise(
         *   deleteMenuItem(id),
         *   { loading: 'Deleting...', success: 'Item deleted', error: 'Failed to delete' }
         * );
         */
        async promise<T>(
            fn: Promise<T>,
            messages: { loading: string; success: string; error: string },
        ): Promise<T> {
            const id = showToast({ message: messages.loading, type: 'loading' });
            try {
                const result = await fn;
                toast.dismiss(id);
                showToast({ message: messages.success, type: 'success' });
                return result;
            } catch (err) {
                toast.dismiss(id);
                const msg = err instanceof Error ? err.message : messages.error;
                showToast({ message: msg, type: 'error' });
                throw err;
            }
        },
    };
}