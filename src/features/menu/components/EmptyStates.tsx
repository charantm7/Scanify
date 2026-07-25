// features/menu/components/EmptyStates.tsx
"use client";

import { UtensilsCrossed, SearchX, WifiOff, RefreshCw } from "lucide-react";

interface EmptyMenuProps {
    hotelName: string;
}

export function EmptyMenu({ hotelName }: EmptyMenuProps) {
    return (
        <div
            className="flex flex-col items-center justify-center py-24 text-center px-8"
            role="status"
        >
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "var(--color-accent-lt)" }}
            >
                <UtensilsCrossed size={26} style={{ color: "var(--color-accent)" }} />
            </div>
            <p
                className="font-bold text-lg mb-1"
                style={{ color: "var(--color-text)", fontFamily: "var(--font-family)" }}
            >
                Menu coming soon
            </p>
            <p className="text-sm max-w-xs" style={{ color: "var(--color-muted)" }}>
                {hotelName} is still setting up their digital menu. Check back shortly.
            </p>
        </div>
    );
}

interface SearchEmptyProps {
    query: string;
}

export function SearchEmpty({ query }: SearchEmptyProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-8" role="status">
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "var(--color-accent-lt)" }}
            >
                <SearchX size={22} style={{ color: "var(--color-accent)" }} />
            </div>
            <p
                className="font-bold text-base mb-1"
                style={{ color: "var(--color-text)", fontFamily: "var(--font-family)" }}
            >
                No dishes match &ldquo;{query}&rdquo;
            </p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                Try a different word, or browse the categories above.
            </p>
        </div>
    );
}

interface MenuErrorProps {
    onRetry?: () => void;
}

export function MenuError({ onRetry }: MenuErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-8">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "#FEE2E2" }}
            >
                <WifiOff size={26} style={{ color: "#DC2626" }} />
            </div>
            <p
                className="font-bold text-lg mb-1"
                style={{ color: "var(--color-text)", fontFamily: "var(--font-family)" }}
            >
                Couldn&apos;t load the menu
            </p>
            <p className="text-sm mb-6 max-w-xs" style={{ color: "var(--color-muted)" }}>
                There was a network issue. Please check your connection and try again.
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-80 active:scale-95"
                    style={{
                        background: "var(--color-accent)",
                        color: "#fff",
                        fontFamily: "var(--font-family)",
                    }}
                >
                    <RefreshCw size={14} />
                    Try again
                </button>
            )}
        </div>
    );
}

interface MenuNotFoundProps {
    slug: string;
}

export function MenuNotFound({ slug }: MenuNotFoundProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-8">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "var(--color-accent-lt)" }}
            >
                <UtensilsCrossed size={26} style={{ color: "var(--color-accent)" }} />
            </div>
            <p className="font-bold text-2xl mb-1" style={{ color: "var(--color-text)" }}>
                404
            </p>
            <p className="font-bold text-lg mb-1" style={{ color: "var(--color-text)" }}>
                Menu not found
            </p>
            <p className="text-sm max-w-xs" style={{ color: "var(--color-muted)" }}>
                We couldn&apos;t find a restaurant at&nbsp;
                <code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--color-accent-lt)", color: "var(--color-accent)" }}>
                    /menu/{slug}
                </code>
                . The link may be outdated or the restaurant may have moved.
            </p>
        </div>
    );
}