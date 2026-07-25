// features/menu/components/MenuFooter.tsx
"use client";

interface MenuFooterProps {
    showBadge?: boolean;
}

function ScanifyBadge() {
    return (
        <a
            href="https://scanify.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 hover:opacity-80 hover:scale-105"
            style={{
                background: "var(--color-accent-lt)",
                color: "var(--color-accent)",
                border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
            }}
            aria-label="Digital menu powered by Scanify"
        >
            {/* QR code icon */}
            <svg
                width="11" height="11" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
            >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h3v3m0 4h4v-4m-4 0h-3v4" />
            </svg>
            Powered by Scanify
        </a>
    );
}

export function MenuFooter({ showBadge = true }: MenuFooterProps) {
    return (
        <footer
            className="border-t px-5 py-4 flex flex-col items-center gap-3 text-center"
            style={{ borderColor: "var(--color-border)" }}
        >
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                Prices inclusive of all taxes · Menu subject to availability
            </p>
            {showBadge && <ScanifyBadge />}
        </footer>
    );
}