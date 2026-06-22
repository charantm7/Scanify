// features/menu/components/ItemBadges.tsx
"use client";

// ── Source of truth: reuse menu_builder constants & types ────────────────────
// The tags[] column stores ItemTag values ("bestseller", "chefs_special", etc.)
// The dietary_type column stores DietaryType values ("veg", "non_veg", etc.)
// These match exactly what the menu builder writes — so we import from there.
import { DIETARY_META, TAG_META, SPICE_LEVEL_META } from "../../menu_builder/constants";
import type { DietaryType, ItemTag, SpiceLevel } from "../../menu_builder/types";
import type { MenuItem } from "../types";

// ── Dietary dot (Indian standard square indicator) ────────────────────────────
export function DietaryIndicator({ dietaryType }: { dietaryType: string | null }) {
    if (!dietaryType) return null;
    const meta = DIETARY_META[dietaryType as DietaryType];
    if (!meta) return null;

    return (
        <span
            className="inline-flex items-center justify-center rounded-sm border flex-shrink-0"
            title={meta.label}
            aria-label={meta.label}
            style={{
                width: 14,
                height: 14,
                borderColor: meta.ring,
                borderWidth: 1.5,
                padding: 2,
            }}
        >
            <span
                className="block rounded-full"
                style={{ width: "55%", height: "55%", background: meta.dot }}
            />
        </span>
    );
}

// ── Spice indicator (flame row) ───────────────────────────────────────────────
export function SpiceIndicator({ level }: { level: string | null }) {
    if (!level || level === "none") return null;
    const meta = SPICE_LEVEL_META[level as SpiceLevel];
    if (!meta) return null;

    return (
        <span
            className="text-[10px] leading-none"
            title={meta.label}
            aria-label={`Spice: ${meta.label}`}
        >
            {meta.emoji}
        </span>
    );
}

// ── Single tag badge ──────────────────────────────────────────────────────────
export function TagBadge({ tag }: { tag: string }) {
    const meta = TAG_META[tag as ItemTag];
    // If it's a known tag use the canonical label+emoji, otherwise render raw
    if (meta) {
        return (
            <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-none tracking-wide"
                style={{ background: "var(--color-accent-lt)", color: "var(--color-accent)" }}
            >
                <span style={{ fontSize: 9 }}>{meta.emoji}</span>
                {meta.label}
            </span>
        );
    }
    // Unknown/custom tag — render as plain pill
    return (
        <span
            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-none tracking-wide uppercase"
            style={{ background: "var(--color-accent-lt)", color: "var(--color-accent)" }}
        >
            {tag}
        </span>
    );
}

// ── All tag badges for one item ───────────────────────────────────────────────
// tags[] in the DB stores ItemTag values set by the menu builder.
// dietary-type strings are NOT stored in tags[] — they're in dietary_type column.
// We skip any tag that duplicates the dietary type to avoid double-rendering.
export function ItemBadgeRow({ item }: { item: MenuItem }) {
    const tags = item.tags ?? [];
    if (tags.length === 0) return null;

    return (
        <div className="flex items-center gap-1 flex-wrap">
            {tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag} tag={tag} />
            ))}
        </div>
    );
}