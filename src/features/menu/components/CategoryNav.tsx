// features/menu/components/CategoryNav.tsx
"use client";

import { memo } from "react";
import type { MenuCategory, CategoryStyle } from "../types";

interface CategoryNavProps {
    categories: MenuCategory[];
    activeId: string | null;
    style: CategoryStyle;
    navRef: React.RefObject<HTMLDivElement | null>;
    onSelect: (id: string) => void;
}

export const CategoryNav = memo(function CategoryNav({
    categories,
    activeId,
    style,
    navRef,
    onSelect,
}: CategoryNavProps) {
    if (categories.length <= 1) return null;

    return (
        <nav
            ref={navRef}
            aria-label="Menu categories"
            className="sticky top-0 z-20 border-b overflow-x-auto scrollbar-hide"
            style={{
                background: "color-mix(in srgb, var(--color-surface) 92%, transparent)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderColor: "var(--color-border)",
            }}
        >
            <div
                className={[
                    "flex max-w-[680px] mx-auto px-5",
                    style === "underline" ? "gap-0" : "gap-2 py-3",
                ].join(" ")}
                style={{ whiteSpace: "nowrap" }}
            >
                {categories.map((cat) => {
                    const isActive = activeId === cat.id;
                    return (
                        <NavButton
                            key={cat.id}
                            category={cat}
                            isActive={isActive}
                            style={style}
                            onSelect={onSelect}
                        />
                    );
                })}
            </div>
        </nav>
    );
});

// ── Per-style button ──────────────────────────────────────────────────────────
interface NavButtonProps {
    category: MenuCategory;
    isActive: boolean;
    style: CategoryStyle;
    onSelect: (id: string) => void;
}

function NavButton({ category, isActive, style, onSelect }: NavButtonProps) {
    const baseClass =
        "flex-shrink-0 text-[13px] font-semibold transition-all duration-200 outline-none focus-visible:ring-2";

    if (style === "pill") {
        return (
            <button
                data-nav-id={category.id}
                onClick={() => onSelect(category.id)}
                className={`${baseClass} rounded-full border px-4 py-1.5`}
                style={{
                    background: isActive ? "var(--color-accent)" : "transparent",
                    color: isActive ? "#fff" : "var(--color-muted)",
                    borderColor: isActive ? "var(--color-accent)" : "var(--color-border)",
                }}
                aria-current={isActive ? "true" : undefined}
            >
                {category.icon ? `${category.icon} ` : ""}{category.name}
            </button>
        );
    }

    if (style === "underline") {
        return (
            <button
                data-nav-id={category.id}
                onClick={() => onSelect(category.id)}
                className={`${baseClass} px-4 py-3 border-b-2 transition-colors`}
                style={{
                    borderBottomColor: isActive ? "var(--color-accent)" : "transparent",
                    color: isActive ? "var(--color-accent)" : "var(--color-muted)",
                }}
                aria-current={isActive ? "true" : undefined}
            >
                {category.icon ? `${category.icon} ` : ""}{category.name}
            </button>
        );
    }

    // card style
    return (
        <button
            data-nav-id={category.id}
            onClick={() => onSelect(category.id)}
            className={`${baseClass} rounded-xl px-4 py-2 border`}
            style={{
                background: isActive ? "var(--color-accent-lt)" : "var(--color-surface)",
                color: isActive ? "var(--color-accent)" : "var(--color-muted)",
                borderColor: isActive ? "var(--color-accent)" : "var(--color-border)",
                boxShadow: isActive ? "var(--shadow-sm)" : "none",
            }}
            aria-current={isActive ? "true" : undefined}
        >
            {category.icon ? `${category.icon} ` : ""}{category.name}
        </button>
    );
}