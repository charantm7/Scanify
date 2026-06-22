// features/menu/hooks/useMenuUI.ts
// ─────────────────────────────────────────────────────────────────────────────
// Manages: search, active category tracking via IntersectionObserver,
// smooth scroll-to-category, and dish detail modal state.
// Fully separated from data fetching concerns.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import {
    useState,
    useRef,
    useEffect,
    useCallback,
    type RefCallback,
} from "react";
import { IO_ROOT_MARGIN, SCROLL_OFFSET_PX } from "../constant";
import type { MenuCategory } from "../types";

interface UseMenuUIReturn {
    // Search
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    isSearching: boolean;

    // Category navigation
    activeCategory: string | null;
    scrollToCategory: (id: string) => void;
    getSectionRef: (id: string) => RefCallback<HTMLElement>;

    // Nav ref (for auto-scrolling the active pill into view)
    navRef: React.RefObject<HTMLDivElement | null>;

    // Modal
    selectedItemId: string | null;
    openItemModal: (id: string) => void;
    closeItemModal: () => void;
}

export function useMenuUI(categories: MenuCategory[]): UseMenuUIReturn {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(
        categories[0]?.id ?? null
    );
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
    const navRef = useRef<HTMLDivElement | null>(null);
    const isManualScrolling = useRef(false);

    const isSearching = searchQuery.trim().length > 0;

    // ── IntersectionObserver: track which category is in view ─────────────────
    useEffect(() => {
        if (isSearching) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (isManualScrolling.current) return;
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute("data-category-id");
                        if (!id) continue;
                        setActiveCategory(id);

                        // Scroll the nav pill into view
                        const pill = navRef.current?.querySelector<HTMLElement>(
                            `[data-nav-id="${id}"]`
                        );
                        pill?.scrollIntoView({
                            behavior: "smooth",
                            inline: "center",
                            block: "nearest",
                        });
                    }
                }
            },
            { rootMargin: IO_ROOT_MARGIN, threshold: 0 }
        );

        Object.values(sectionRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [categories, isSearching]);

    // ── Smooth scroll to a category ───────────────────────────────────────────
    const scrollToCategory = useCallback((id: string) => {
        setActiveCategory(id);
        isManualScrolling.current = true;

        const el = sectionRefs.current[id];
        if (el) {
            const navHeight = navRef.current?.offsetHeight ?? 60;
            const top =
                el.getBoundingClientRect().top +
                window.scrollY -
                navHeight -
                SCROLL_OFFSET_PX;
            window.scrollTo({ top, behavior: "smooth" });
        }

        setTimeout(() => {
            isManualScrolling.current = false;
        }, 900);
    }, []);

    // ── Stable ref callback per category ─────────────────────────────────────
    const getSectionRef = useCallback(
        (id: string): RefCallback<HTMLElement> =>
            (el) => {
                sectionRefs.current[id] = el;
            },
        []
    );

    // ── Modal ─────────────────────────────────────────────────────────────────
    const openItemModal = useCallback((id: string) => {
        setSelectedItemId(id);
        document.body.style.overflow = "hidden";
    }, []);

    const closeItemModal = useCallback(() => {
        setSelectedItemId(null);
        document.body.style.overflow = "";
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    return {
        searchQuery,
        setSearchQuery,
        isSearching,
        activeCategory,
        scrollToCategory,
        getSectionRef,
        navRef,
        selectedItemId,
        openItemModal,
        closeItemModal,
    };
}