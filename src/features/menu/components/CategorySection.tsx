// features/menu/components/CategorySection.tsx
"use client";

import { memo } from "react";
import { ItemCard } from "./ItemCard";
import type { MenuCategory, DBMenuCustomization } from "../types";

interface CategorySectionProps {
    category: MenuCategory;
    sectionRef: React.RefCallback<HTMLElement>;
    onItemClick: (id: string) => void;
    customization: DBMenuCustomization;
}

export const CategorySection = memo(function CategorySection({
    category,
    sectionRef,
    onItemClick,
    customization,
}: CategorySectionProps) {
    const available = category.items.filter((i) => i.is_available);
    const unavailable = category.items.filter((i) => !i.is_available);
    const ordered = [...available, ...unavailable];

    const gridClass =
        customization.menu_layout === "grid"
            ? "grid grid-cols-2 gap-3"
            : customization.menu_layout === "list"
                ? "flex flex-col"
                : "grid gap-3 sm:grid-cols-2";

    return (
        <section
            ref={sectionRef}
            data-category-id={category.id}
            id={`cat-${category.id}`}
            aria-label={category.name}
        >
            {/* Category header */}
            <div className="flex items-center gap-3 mb-4">
                {category.icon && (
                    <span className="text-base" aria-hidden="true">{category.icon}</span>
                )}
                <h2
                    className="font-bold text-base tracking-wide"
                    style={{
                        color: "var(--color-text)",
                        fontFamily: "var(--font-family)",
                    }}
                >
                    {category.name}
                </h2>
                <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                        background: "var(--color-accent-lt)",
                        color: "var(--color-accent)",
                    }}
                >
                    {available.length}
                    {unavailable.length > 0 ? `/${category.items.length}` : ""}
                </span>
                <div
                    className="flex-1 h-px"
                    style={{ background: "var(--color-border)" }}
                />
            </div>

            {/* Category description */}
            {category.description && (
                <p
                    className="text-sm mb-4 leading-relaxed"
                    style={{ color: "var(--color-muted)" }}
                >
                    {category.description}
                </p>
            )}

            {/* Items */}
            <div className={gridClass}>
                {ordered.map((item) => (
                    <ItemCard
                        key={item.id}
                        item={item}
                        onClick={onItemClick}
                        layout={customization.menu_layout}
                        showImage={customization.show_item_images}
                        showDescription={customization.show_descriptions}
                        showTags={customization.show_tags}
                        showSpice={customization.show_spice_level}
                        showServing={customization.show_serving_size}
                        showDietary={customization.show_dietary_badge}
                    />
                ))}
            </div>
        </section>
    );
});