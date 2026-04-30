'use client';

/**
 * components/shared/ui.js
 * Reusable, design-consistent primitives for the Scanify console.
 * Import from here instead of recreating in every panel.
 */

import { Loader2, AlertTriangle, CheckCircle2, Info, X, ArrowUpRight } from 'lucide-react';

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', padding = 'p-6', ...props }) {
    return (
        <div
            className={`rounded-2xl border bg-card ${padding} ${className}`}
            style={{ borderColor: 'var(--border)' }}
            {...props}
        >
            {children}
        </div>
    );
}

// ─── Section with header ──────────────────────────────────────────────────────
export function Section({ title, description, action, children }) {
    return (
        <div className="rounded-2xl border overflow-hidden bg-card" style={{ borderColor: 'var(--border)' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div>
                    <h2 className="font-syne font-bold text-base text-theme">{title}</h2>
                    {description && <p className="text-xs text-theme2 mt-0.5">{description}</p>}
                </div>
                {action}
            </div>
            <div>{children}</div>
        </div>
    );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    className = '',
    ...props
}) {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed';
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-sm' };
    const variants = {
        primary: 'text-white hover:opacity-90',
        secondary: 'border text-theme hover:bg-theme3',
        ghost: 'text-theme2 hover:bg-theme3 hover:text-theme',
        danger: 'border border-red-300 text-red-600 hover:bg-red-50',
    };

    return (
        <button
            disabled={disabled || loading}
            className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
            style={variant === 'primary' ? { background: 'var(--accent)' } : variant === 'secondary' ? { borderColor: 'var(--border)' } : {}}
            {...props}
        >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {children}
        </button>
    );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ icon: Icon, error, className = '', label, hint, ...props }) {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-semibold text-theme mb-1.5">{label}</label>}
            <div className="relative">
                {Icon && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme2 pointer-events-none">
                        <Icon size={15} />
                    </span>
                )}
                <input
                    className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border bg-card text-theme text-sm placeholder:text-theme2 outline-none transition-all focus:ring-2 ${error ? 'border-red-400 focus:ring-red-200' : 'focus:ring-[var(--accent)]/30'} ${className}`}
                    style={{ borderColor: error ? undefined : 'var(--border)' }}
                    {...props}
                />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">⚠ {error}</p>}
            {hint && !error && <p className="text-theme2 text-xs mt-1">{hint}</p>}
        </div>
    );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ icon: Icon, error, label, hint, className = '', ...props }) {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-semibold text-theme mb-1.5">{label}</label>}
            <div className="relative">
                {Icon && (
                    <span className="absolute left-3.5 top-3.5 text-theme2 pointer-events-none">
                        <Icon size={15} />
                    </span>
                )}
                <textarea
                    rows={3}
                    className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border bg-card text-theme text-sm placeholder:text-theme2 outline-none transition-all resize-none focus:ring-2 ${error ? 'border-red-400 focus:ring-red-200' : 'focus:ring-[var(--accent)]/30'} ${className}`}
                    style={{ borderColor: error ? undefined : 'var(--border)' }}
                    {...props}
                />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">⚠ {error}</p>}
            {hint && !error && <p className="text-theme2 text-xs mt-1">{hint}</p>}
        </div>
    );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, error, options = [], className = '', ...props }) {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-semibold text-theme mb-1.5">{label}</label>}
            <select
                className={`w-full px-4 py-2.5 rounded-xl border bg-card text-theme text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]/30 appearance-none ${className}`}
                style={{ borderColor: 'var(--border)' }}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && <p className="text-red-500 text-xs mt-1">⚠ {error}</p>}
        </div>
    );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <div
                onClick={() => onChange(!checked)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? '' : 'bg-gray-200 dark:bg-gray-700'}`}
                style={checked ? { background: 'var(--accent)' } : {}}
            >
                <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
                />
            </div>
            {label && <span className="text-sm text-theme">{label}</span>}
        </label>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            {Icon && (
                <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center" style={{ background: 'var(--accentlt)' }}>
                    <Icon size={26} style={{ color: 'var(--accent)' }} />
                </div>
            )}
            <h3 className="font-syne font-bold text-lg text-theme mb-2">{title}</h3>
            {description && <p className="text-sm text-theme2 max-w-xs mb-5">{description}</p>}
            {action}
        </div>
    );
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────
export function Alert({ type = 'info', title, message, action, onDismiss }) {
    const configs = {
        info: { icon: Info, bg: 'var(--accentlt)', color: 'var(--accent)', border: 'var(--accent)' },
        success: { icon: CheckCircle2, bg: '#dcfce7', color: '#16a34a', border: '#16a34a' },
        warning: { icon: AlertTriangle, bg: '#fefce8', color: '#ca8a04', border: '#ca8a04' },
        error: { icon: AlertTriangle, bg: '#fef2f2', color: '#dc2626', border: '#dc2626' },
    };
    const cfg = configs[type];
    const Icon = cfg.icon;

    return (
        <div
            className="flex items-start gap-3 rounded-xl px-4 py-3 border text-sm"
            style={{ background: cfg.bg, borderColor: cfg.border + '40', color: cfg.color }}
        >
            <Icon size={16} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                {title && <p className="font-semibold mb-0.5">{title}</p>}
                {message && <p className="opacity-80 text-xs">{message}</p>}
            </div>
            {action}
            {onDismiss && (
                <button onClick={onDismiss} className="flex-shrink-0 opacity-60 hover:opacity-100 transition">
                    <X size={14} />
                </button>
            )}
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, sub, accent = false }) {
    return (
        <Card>
            <div className="flex items-center gap-3 mb-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: accent ? 'var(--accent)' : 'var(--accentlt)' }}
                >
                    <Icon size={17} style={{ color: accent ? 'white' : 'var(--accent)' }} />
                </div>
                <span className="text-sm font-medium text-theme2">{label}</span>
            </div>
            <p className="text-2xl font-syne font-bold text-theme">{value}</p>
            {sub && <p className="text-xs text-theme2 mt-1">{sub}</p>}
        </Card>
    );
}

// ─── Upgrade Nudge Banner ─────────────────────────────────────────────────────
export function UpgradeNudge({ message, compact = false }) {
    if (compact) {
        return (
            <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer hover:opacity-90 transition"
                style={{ background: 'var(--accent)', color: 'white' }}
            >
                <ArrowUpRight size={13} />
                <span>{message || 'Upgrade for more'}</span>
            </div>
        );
    }
    return (
        <div
            className="rounded-2xl p-5 border-2 border-dashed text-center"
            style={{ borderColor: 'var(--accent)', background: 'var(--accentlt)' }}
        >
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                🚀 {message || 'Unlock more with a paid plan'}
            </p>
            <p className="text-xs text-theme2">Get more menu items, advanced analytics & unlimited QR codes.</p>
            <button
                className="mt-3 px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition"
                style={{ background: 'var(--accent)' }}
            >
                View Plans
            </button>
        </div>
    );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-gradient-to-r ${className}`}
            style={{ background: 'var(--border)' }}
        />
    );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
    const variants = {
        default: { background: 'var(--accentlt)', color: 'var(--accent)' },
        success: { background: '#dcfce7', color: '#16a34a' },
        warning: { background: '#fefce8', color: '#ca8a04' },
        error: { background: '#fef2f2', color: '#dc2626' },
        neutral: { background: 'var(--border)', color: 'var(--text2)' },
    };
    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
            style={variants[variant]}
        >
            {children}
        </span>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div
                className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="font-syne font-bold text-theme text-lg">{title}</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-theme2 hover:bg-theme3 transition">
                        <X size={16} />
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
                {footer && (
                    <div className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ borderColor: 'var(--border)' }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}