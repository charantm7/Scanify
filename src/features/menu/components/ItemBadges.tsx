// features/menu/components/ItemBadges.tsx
"use client";

import { Flame } from "lucide-react";
import { DIETARY_CONFIG, SPICE_CONFIG } from "../constant";
import type { MenuItem, SpiceLevel } from "../types";

// ── Dietary indicator (Indian standard square dot) ────────────────────────────
// dietary_type is a plain string in the DB ("veg", "non_veg", etc.)
export function DietaryIndicator({ dietaryType }: { dietaryType: string | null }) {
    if (!dietaryType) return null;

    // Normalise: DB stores e.g. "veg", "non_veg", "egg", "vegan", "dairy", "jain", "gluten_free"
    const key = dietaryType as keyof typeof DIETARY_CONFIG;
    const cfg = DIETARY_CONFIG[key];
    if (!cfg) return null;

    return (
        <div
            className="w-[14px] h-[14px] rounded-[3px] border-[1.5px] flex items-center justify-center flex-shrink-0"
            style={{ borderColor: cfg.ring }}
            title={cfg.label}
            aria-label={cfg.label}
        >
            <div className="w-[6px] h-[6px] rounded-full" style={{ background: cfg.dot }} />
        </div>
    );
}

// ── Spice level indicator ──────────────────────────────────────────────────────
// spice_level is a plain string in the DB
export function SpiceIndicator({ level }: { level: string | null }) {
    if (!level) return null;
    const key = level as SpiceLevel;
    const cfg = SPICE_CONFIG[key];
    if (!cfg || cfg.peppers === 0) return null;

    return (
        <div
            className="flex items-center gap-0.5"
            title={cfg.label}
            aria-label={`Spice level: ${cfg.label}`}
        >
            {Array.from({ length: cfg.peppers }).map((_, i) => (
                <Flame key={i} size={10} style={{ color: cfg.color }} fill={cfg.color} />
            ))}
        </div>
    );
}

// ── Tag-based system badges ────────────────────────────────────────────────────
// The real DB has no is_bestseller / is_new / is_featured columns.
// Instead, tags[] contains strings like "Bestseller", "New", "Popular", "Chef Special".
const TAG_BADGE_CONFIG: Record<string, { color: string; bg: string }> = {
    "bestseller": { color: "#92400e", bg: "#FEF3C7" },
    "new": { color: "#065F46", bg: "#D1FAE5" },
    "popular": { color: "#1E40AF", bg: "#DBEAFE" },
    "chef special": { color: "#6D28D9", bg: "#EDE9FE" },
    "chef's pick": { color: "#6D28D9", bg: "#EDE9FE" },
    "must try": { color: "#9F1239", bg: "#FFE4E6" },
};

export function TagBadge({ tag }: { tag: string }) {
    const key = tag.toLowerCase();
    const cfg = TAG_BADGE_CONFIG[key] ?? { color: "#374151", bg: "#F3F4F6" };
    return (
        <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none tracking-wide uppercase"
            style={{ color: cfg.color, background: cfg.bg }}
        >
            {tag}
        </span>
    );
}

// ── All tag badges for a single item ─────────────────────────────────────────
export function ItemBadgeRow({ item }: { item: MenuItem }) {
    const tags = item.tags ?? [];
    if (tags.length === 0) return null;

    // Show special badges for known keywords; ignore generic tags like "veg"
    const skipSet = new Set(["veg", "non_veg", "non-veg", "vegan", "jain", "gluten_free", "egg", "dairy"]);
    const badgeTags = tags.filter((t) => !skipSet.has(t.toLowerCase()));

    if (badgeTags.length === 0) return null;

    return (
        <div className="flex items-center gap-1 flex-wrap">
            {badgeTags.slice(0, 3).map((tag) => (
                <TagBadge key={tag} tag={tag} />
            ))}
        </div>
    );
}