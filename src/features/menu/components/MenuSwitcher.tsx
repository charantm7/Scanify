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
    setCurrentMenu: (id: string) => void;
    currentMenu: string | null;
}

export function MenuSwitcher({ menus, setCurrentMenu, currentMenu }: MenuSwitcherProps) {
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
                        const active = menu.id === currentMenu;

                        return (
                            <li key={menu.id} className="flex-shrink-0">
                                <button
                                    onClick={() => setCurrentMenu(menu.id)}
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
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}
