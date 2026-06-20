'use client';

import React from 'react';
import { Sparkles, ChevronRight, ExternalLink } from 'lucide-react';

interface SuccessScreenProps {
    url: string;
    onGoToConsole: () => void;
}

export function SuccessScreen({ url, onGoToConsole }: SuccessScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-8 px-4">
            <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'var(--accentlt)' }}
            >
                <Sparkles size={36} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="font-syne font-bold text-3xl text-theme mb-2">You&apos;re all set! 🎉</h2>
            <p className="text-theme2 text-sm mb-8 max-w-sm">
                Your restaurant profile has been created. Your menu is live at:
            </p>

            <div
                className="w-full max-w-md rounded-2xl border p-5 mb-6 text-left"
                style={{ borderColor: 'var(--accent)', background: 'var(--accentlt)' }}
            >
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
                    Your menu URL
                </p>
                <div className="flex items-center justify-between gap-3">
                    <code className="text-sm font-bold text-theme break-all">{url}</code>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition hover:opacity-80"
                        style={{ background: 'var(--accent)' }}
                    >
                        Open <ExternalLink size={12} />
                    </a>
                </div>
                <p className="text-xs text-theme2 mt-2">
                    Share this link or generate a QR code from your console.
                </p>
            </div>

            <button
                onClick={onGoToConsole}
                className="w-full max-w-md py-3.5 rounded-xl text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                style={{ background: 'var(--accent)' }}
            >
                Go to Console <ChevronRight size={17} />
            </button>
        </div>
    );
}