"use client";

// features/menu/components/MenuSwitcher.tsx
//
// Lets a diner move between a restaurant's menus (Food / Drinks / …).
//
// These are real links, not client-side state: each menu is its own URL, so a
// diner can share or bookmark "the drinks menu", and the page stays
// server-rendered per menu. A horizontally scrollable strip keeps it usable on
// a phone — which is where essentially every scan happens — without wrapping
// or truncating the restaurant's own naming.

import Link from "next/link";
import type { MenuSummary } from "../types";
import { publicMenuPath } from "../../../lib/domains";

interface MenuSwitcherProps {
    menus: MenuSummary[];
    activeMenuId: string;
    hotelSlug: string;
}

export function MenuSwitcher({ menus, activeMenuId, hotelSlug }: MenuSwitcherProps) {
    // Nothing to switch between.
    if (menus.length <= 1) return null;

    return (
        <nav
            aria-label="Menus"
            className=" top-0 z-30 border-b"
            style={{
                borderColor: "var(--color-border)",
            }}
        >
            <div className="max-w-[680px] mx-auto px-4">
                <ul
                    className="flex items-center gap-2 overflow-x-auto py-2.5"
                    style={{ scrollbarWidth: "none" }}
                >
                    {menus.map((menu) => {
                        const active = menu.id === activeMenuId;

                        // The primary menu lives at the bare hotel URL, which is
                        // what existing QR codes encode — keep linking there
                        // rather than to an equivalent /<hotel>/<slug> form.
                        const href = publicMenuPath(
                            hotelSlug,
                            menu.is_primary ? null : menu.slug
                        );

                        return (
                            <li key={menu.id} className="flex-shrink-0">
                                <Link
                                    href={href}
                                    aria-current={active ? "page" : undefined}
                                    className="block px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors"
                                    style={{
                                        borderRadius: "var(--border-radius)",
                                        background: active ? "var(--accentlt)" : "transparent",
                                        color: active ? "var(--color-primary)" : "var(--color-muted)",
                                        border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                                    }}
                                >
                                    {menu.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}
