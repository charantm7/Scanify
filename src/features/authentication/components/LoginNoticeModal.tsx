'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

interface LoginNoticeModalProps {
    reason: string;
    title: string;
    body: string;
    tone: 'error' | 'warning' | 'info';
}

const TONE_STYLES = {
    error: {
        icon: AlertTriangle,
        iconColor: '#dc2626',
        badge: '#fef2f2',
        border: '#fca5a5',
    },
    warning: {
        icon: AlertTriangle,
        iconColor: '#d97706',
        badge: '#fffbeb',
        border: '#fcd34d',
    },
    info: {
        icon: Info,
        iconColor: '#2563eb',
        badge: '#eff6ff',
        border: '#93c5fd',
    },
} as const;

export function LoginNoticeModal({ reason, title, body, tone }: LoginNoticeModalProps) {
    const [dismissed, setDismissed] = useState(false);
    const { icon: Icon, iconColor, badge, border } = TONE_STYLES[tone];

    useEffect(() => {
        setDismissed(false);
    }, [reason]);


    if (dismissed) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl relative">
                <button
                    onClick={() => setDismissed(true)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    aria-label="Dismiss"
                >
                    <X size={18} />
                </button>

                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{ background: badge }}
                >
                    <Icon size={22} color={iconColor} />
                </div>

                <h3 className="font-semibold text-gray-900 text-base mb-1.5">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>

                <button
                    onClick={() => setDismissed(true)}
                    className="w-full mt-5 py-2.5 rounded-xl text-sm font-medium text-white"
                    style={{ background: iconColor }}
                >
                    Got it
                </button>
            </div>
        </div>
    );
}