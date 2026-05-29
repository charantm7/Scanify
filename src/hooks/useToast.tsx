'use client';

import toast, { type Toast } from 'react-hot-toast';
import { CheckCircle2, AlertTriangle, XCircle, Info, Loader2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

interface ToastConfig {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    accentLine: string; // left border color — the main visual anchor
}

const CONFIGS: Record<string, ToastConfig> = {
    success: { icon: CheckCircle2, iconColor: '#16a34a', iconBg: '#dcfce7', accentLine: '#16a34a' },
    error: { icon: XCircle, iconColor: '#dc2626', iconBg: '#fee2e2', accentLine: '#dc2626' },
    warning: { icon: AlertTriangle, iconColor: '#d97706', iconBg: '#fef3c7', accentLine: '#d97706' },
    info: { icon: Info, iconColor: 'var(--accent)', iconBg: 'var(--accentlt)', accentLine: 'var(--accent)' },
    loading: { icon: Loader2, iconColor: 'var(--accent)', iconBg: 'var(--accentlt)', accentLine: 'var(--accent)' },
};

// ─────────────────────────────────────────────────────────────────────────────
// ToastContent
// ─────────────────────────────────────────────────────────────────────────────

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
            className={`
        flex items-start gap-3.5 w-full
        
      `}
        >
            {/* Icon — 36px, rounded-[10px], solid background */}
            <div
                className="flex-shrink-0 flex items-center justify-center rounded-[10px]"
                style={{ width: 36, height: 36, background: cfg.iconBg }}
            >
                <Icon
                    size={16}
                    className={type === 'loading' ? 'animate-spin' : ''}
                    style={{ color: cfg.iconColor }}
                />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0 py-0.5">
                <p className="text-[13.5px] font-semibold text-theme leading-snug">{message}</p>
                {description && (
                    <p className="text-[12px] text-theme2 mt-1 leading-relaxed">{description}</p>
                )}
            </div>

            {/* Dismiss — subtle, top-aligned */}
            <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-shrink-0 text-theme3 hover:text-theme2 transition-colors mt-0.5"
                aria-label="Dismiss"
            >
                <XCircle size={15} />
            </button>
        </div>
    );
}


export interface ShowToastOptions {
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
            <div className={`transition-all duration-300 ease-out
        ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                style={{
                    background: 'var(--card)',
                    borderLeft: `3px solid ${cfg.accentLine}`,   // ← the fix: visible accent anchor
                    borderTop: '0.5px solid var(--border)',
                    borderRight: '0.5px solid var(--border)',
                    borderBottom: '0.5px solid var(--border)',
                    borderRadius: '14px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                    padding: '14px 16px',
                    width: '100%',
                    maxWidth: '400px',
                    pointerEvents: 'auto',
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

export type ToastMethods = ReturnType<typeof useToast>;

export function useToast() {
    return {
        success(message: string, description?: string) {
            return showToast({ message, description, type: 'success' });
        },

        error(message: string, description?: string) {
            return showToast({ message, description, type: 'error' });
        },

        warning(message: string, description?: string) {
            return showToast({ message, description, type: 'warning' });
        },

        info(message: string, description?: string) {
            return showToast({ message, description, type: 'info' });
        },

        /**
         * Spinner toast — infinite until dismissed.
         * Returns the toast ID — pass to success() or error() to replace it.
         *
         * const id = toast.loading('Saving...');
         * toast.success('Saved!', undefined, id);
         */
        loading(message: string, id?: string) {
            return showToast({ message, type: 'loading', id });
        },


        dismiss: toast.dismiss,

        /**
         * Wraps a promise — loading → success/error automatically.
         *
         * await toast.promise(saveItem(payload), {
         *   loading: 'Saving item...',
         *   success: 'Item saved!',
         *   error:   'Failed to save',
         * });
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
                showToast({
                    message: err instanceof Error ? err.message : messages.error,
                    type: 'error',
                });
                throw err;
            }
        },
    };
}