'use client';

import { Toaster } from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// ToasterConfig
// Place this once inside your root layout.tsx, inside <body>.
// Controls position, z-index, and max width of all toasts.
// ─────────────────────────────────────────────────────────────────────────────

export function ToasterConfig() {
    return (
        <Toaster
            position="top-right"
            gutter={10}
            containerStyle={{ zIndex: 9999 }}
            toastOptions={{
                duration: 3500,
                style: {
                    background: 'var(--card)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: '500',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    maxWidth: '380px',
                },
            }}
        />
    );
}