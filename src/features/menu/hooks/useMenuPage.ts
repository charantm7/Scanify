// features/menu/hooks/useMenuPage.ts
// ─────────────────────────────────────────────────────────────────────────────
// Client-side React Query hooks.
// The page is server-rendered; these hooks are used for:
//   - Hydrating the React Query cache from SSR data
//   - Staleness refresh (in case menu changes while customer is viewing)
//   - Providing typed selectors to child components
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { QUERY_KEYS } from "../constant";
import type { MenuPageData, MenuCategory, MenuItem, DBMenuCustomization } from "../types";

// ── Typed fetcher (client-side) ───────────────────────────────────────────────
async function fetchMenuClient(slug: string, menuSlug?: string): Promise<MenuPageData> {
    const query = menuSlug ? `?menu=${encodeURIComponent(menuSlug)}` : "";
    const res = await fetch(`/api/menu/${slug}${query}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Failed to fetch menu: ${res.statusText}`);
    return res.json() as Promise<MenuPageData>;
}

// ── Main hook ─────────────────────────────────────────────────────────────────
// `menuSlug` is part of the query key, so two menus of the same hotel never
// share a cache entry — without it, switching menus would serve the previous
// menu's categories from cache.
export function useMenuPage(
    slug: string,
    menuSlug?: string,
    initialData?: MenuPageData
): UseQueryResult<MenuPageData> {
    return useQuery<MenuPageData>({
        queryKey: QUERY_KEYS.menuPage(slug, menuSlug),
        queryFn: () => fetchMenuClient(slug, menuSlug),
        initialData,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });
}

// ── Derived selectors ─────────────────────────────────────────────────────────

export function useMenuCategories(slug: string, menuSlug?: string): MenuCategory[] {
    const { data } = useMenuPage(slug, menuSlug);
    return data?.categories ?? [];
}

export function useMenuCustomization(slug: string, menuSlug?: string): DBMenuCustomization | undefined {
    const { data } = useMenuPage(slug, menuSlug);
    return data?.customization;
}

export function useMenuItem(slug: string, itemId: string, menuSlug?: string): MenuItem | undefined {
    const { data } = useMenuPage(slug, menuSlug);
    if (!data) return undefined;
    for (const cat of data.categories) {
        const found = cat.items.find((i) => i.id === itemId);
        if (found) return found;
    }
    return undefined;
}