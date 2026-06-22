// features/menu/utils/search.ts
// Client-side search over menu items — aligned with real DB schema.

import type { MenuItem, MenuCategory, SearchResult } from "../types";

function normalize(s: string): string {
    return s.toLowerCase().trim();
}

function scoreItem(item: MenuItem, q: string): number {
    const name = normalize(item.name);
    const desc = normalize(item.description ?? "");
    const tags = (item.tags ?? []).join(" ").toLowerCase();
    const dietary = (item.dietary_type ?? "").toLowerCase();

    if (name === q) return 100;
    if (name.startsWith(q)) return 85;
    if (name.includes(q)) return 70;
    if (desc.includes(q)) return 40;
    if (tags.includes(q)) return 30;
    if (dietary.includes(q)) return 20;
    return 0;
}

export function searchMenu(
    categories: MenuCategory[],
    rawQuery: string
): SearchResult[] {
    const q = normalize(rawQuery);
    if (!q) return [];

    const results: SearchResult[] = [];

    for (const cat of categories) {
        for (const item of cat.items) {
            const score = scoreItem(item, q);
            if (score > 0) {
                results.push({ item, categoryName: cat.name, matchScore: score });
            }
        }
    }

    return results.sort((a, b) => {
        const availDiff = (b.item.is_available ? 1 : 0) - (a.item.is_available ? 1 : 0);
        if (availDiff !== 0) return availDiff;
        return b.matchScore - a.matchScore;
    });
}