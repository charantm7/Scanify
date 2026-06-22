// features/menu/components/ItemCard.tsx
"use client";

import { useState, memo } from "react";
import Image from "next/image";
import { Clock, Users } from "lucide-react";
import { DietaryIndicator, SpiceIndicator, ItemBadgeRow } from "./ItemBadges";
import type { MenuItem, MenuLayout } from "../types";

// ─── Placeholder avatar ───────────────────────────────────────────────────────
function ItemPlaceholder({ name }: { name: string }) {
    return (
        <div
            className="w-full h-full flex items-center justify-center text-2xl font-bold select-none"
            style={{ background: "var(--color-accent-lt)", color: "var(--color-accent)" }}
        >
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

// ─── Price ────────────────────────────────────────────────────────────────────
function Price({ amount, currency = "₹" }: { amount: number; currency?: string }) {
    return (
        <span
            className="font-bold text-base tabular-nums"
            style={{ color: "var(--color-accent)", fontFamily: "var(--font-family)" }}
        >
            <span className="text-xs align-top mt-0.5 inline-block">{currency}</span>
            {amount.toFixed(0)}
        </span>
    );
}

// ─── Item image block ─────────────────────────────────────────────────────────
function ItemImage({ item }: { item: MenuItem }) {
    const [imgErr, setImgErr] = useState(false);

    const src = item.image_url ??
        item.images.find((i) => i.is_primary)?.url ??
        item.images[0]?.url;

    return (
        <div
            className="w-[78px] h-[78px] rounded-xl overflow-hidden relative flex-shrink-0"
            style={{ background: "var(--color-border)" }}
        >
            {src && !imgErr ? (
                <Image
                    src={src}
                    alt={item.name}
                    fill
                    sizes="100px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() => setImgErr(true)}
                />
            ) : (
                <ItemPlaceholder name={item.name} />
            )}
            {!item.is_available && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/55">
                    <span className="text-[9px] font-extrabold text-white tracking-widest uppercase">
                        Sold Out
                    </span>
                </div>
            )}
        </div>
    );
}

// ─── Shared props interface ───────────────────────────────────────────────────
interface ItemCardProps {
    item: MenuItem;
    onClick: (id: string) => void;
    layout?: MenuLayout;
    showImage?: boolean;
    showDescription?: boolean;
    showTags?: boolean;
    showSpice?: boolean;
    showServing?: boolean;
    showDietary?: boolean;
}

// ─── Card layout ──────────────────────────────────────────────────────────────
function CardItem({
    item,
    onClick,
    showImage,
    showDescription,
    showTags,
    showSpice,
    showServing,
    showDietary,
}: ItemCardProps) {
    const unavailable = !item.is_available;

    return (
        <article
            role="button"
            tabIndex={0}
            aria-label={`${item.name}, ₹${item.price}`}
            onClick={() => onClick(item.id)}
            onKeyDown={(e) => e.key === "Enter" && onClick(item.id)}
            className={[
                "group flex items-start gap-4 p-4 rounded-2xl border cursor-pointer",
                "transition-all duration-200 outline-none focus-visible:ring-2",
                unavailable ? "opacity-55" : "hover:shadow-md hover:-translate-y-px active:scale-[0.99]",
            ].join(" ")}
            style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                borderRadius: "var(--border-radius)",
                boxShadow: "var(--shadow-sm)",
            }}
        >
            {showImage && <ItemImage item={item} />}

            <div className="flex-1 min-w-0 py-0.5 space-y-1">
                {/* Name row */}
                <div className="flex items-start gap-2">
                    {showDietary && <DietaryIndicator dietaryType={item.dietary_type} />}
                    <p
                        className="font-semibold text-sm leading-snug flex-1"
                        style={{ color: "var(--color-text)", fontFamily: "var(--font-family)" }}
                    >
                        {item.name}
                    </p>
                </div>

                {showDescription && item.description && (
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--color-muted)" }}>
                        {item.description}
                    </p>
                )}

                {showTags && <ItemBadgeRow item={item} />}

                <div className="flex items-center gap-2 flex-wrap">
                    {showSpice && <SpiceIndicator level={item.spice_level} />}
                    {showServing && item.serving_size && (
                        <span className="text-[10px] flex items-center gap-0.5" style={{ color: "var(--color-muted)" }}>
                            <Users size={9} />
                            {item.serving_size}
                        </span>
                    )}
                    {item.preparation_time && (
                        <span className="text-[10px] flex items-center gap-0.5" style={{ color: "var(--color-muted)" }}>
                            <Clock size={9} />
                            {item.preparation_time}m
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between pt-1">
                    <Price amount={Number(item.price)} />
                    {item.calories && (
                        <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>
                            {item.calories} kcal
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}

// ─── List layout ──────────────────────────────────────────────────────────────
function ListItem({ item, onClick, showImage, showDietary, showTags }: ItemCardProps) {
    return (
        <article
            role="button"
            tabIndex={0}
            aria-label={`${item.name}, ₹${item.price}`}
            onClick={() => onClick(item.id)}
            onKeyDown={(e) => e.key === "Enter" && onClick(item.id)}
            className="group flex items-center gap-3 py-3 border-b cursor-pointer transition-opacity duration-200 outline-none focus-visible:ring-2"
            style={{ borderColor: "var(--color-border)", opacity: item.is_available ? 1 : 0.55 }}
        >
            {showDietary && (
                <div className="flex-shrink-0">
                    <DietaryIndicator dietaryType={item.dietary_type} />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "var(--color-text)", fontFamily: "var(--font-family)" }}>
                    {item.name}
                </p>
                {showTags && <ItemBadgeRow item={item} />}
            </div>
            <Price amount={Number(item.price)} />
            {showImage && (
                <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden">
                    <ItemImage item={item} />
                </div>
            )}
        </article>
    );
}

// ─── Grid layout ──────────────────────────────────────────────────────────────
function GridItem({ item, onClick, showImage, showDietary, showTags }: ItemCardProps) {
    const [imgErr, setImgErr] = useState(false);
    const src = item.image_url ?? item.images.find((i) => i.is_primary)?.url;
    const unavailable = !item.is_available;

    return (
        <article
            role="button"
            tabIndex={0}
            aria-label={`${item.name}, ₹${item.price}`}
            onClick={() => onClick(item.id)}
            onKeyDown={(e) => e.key === "Enter" && onClick(item.id)}
            className="group rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 hover:shadow-md hover:-translate-y-px"
            style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                borderRadius: "var(--border-radius)",
                opacity: unavailable ? 0.6 : 1,
            }}
        >
            {showImage && (
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                    {src && !imgErr ? (
                        <Image
                            src={src}
                            alt={item.name}
                            fill
                            sizes="200px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={() => setImgErr(true)}
                        />
                    ) : (
                        <ItemPlaceholder name={item.name} />
                    )}
                    {unavailable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                            <span className="text-[9px] font-extrabold text-white tracking-widest uppercase">
                                Sold Out
                            </span>
                        </div>
                    )}
                </div>
            )}
            <div className="p-3 space-y-1">
                <div className="flex items-start gap-1.5">
                    {showDietary && <DietaryIndicator dietaryType={item.dietary_type} />}
                    <p className="font-semibold text-sm line-clamp-1" style={{ color: "var(--color-text)", fontFamily: "var(--font-family)" }}>
                        {item.name}
                    </p>
                </div>
                {showTags && <ItemBadgeRow item={item} />}
                <Price amount={Number(item.price)} />
            </div>
        </article>
    );
}

// ─── Public export ────────────────────────────────────────────────────────────
export const ItemCard = memo(function ItemCard({
    item,
    onClick,
    layout = "card",
    showImage = true,
    showDescription = true,
    showTags = true,
    showSpice = true,
    showServing = true,
    showDietary = true,
}: ItemCardProps) {
    if (layout === "list") {
        return <ListItem item={item} onClick={onClick} showImage={showImage} showDietary={showDietary} showTags={showTags} />;
    }
    if (layout === "grid") {
        return <GridItem item={item} onClick={onClick} showImage={showImage} showDietary={showDietary} showTags={showTags} />;
    }
    return (
        <CardItem
            item={item}
            onClick={onClick}
            showImage={showImage}
            showDescription={showDescription}
            showTags={showTags}
            showSpice={showSpice}
            showServing={showServing}
            showDietary={showDietary}
        />
    );
});