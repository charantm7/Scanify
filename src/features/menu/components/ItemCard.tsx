// features/menu/components/ItemCard.tsx
"use client";

import { useState, memo } from "react";
import Image from "next/image";
import { Clock, Users } from "lucide-react";
import { DietaryIndicator, SpiceIndicator, ItemBadgeRow } from "./ItemBadges";
import type { MenuItem, MenuLayout } from "../types";
import { normalizeImageUrl } from "../../../components/shared/ImageUrlNormalization";

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
            <span className="align-top  inline-block">{currency}</span>
            {amount.toFixed(0)}
        </span>
    );
}

// ─── Item image block ─────────────────────────────────────────────────────────
type ItemImageVariant = 'card' | 'list';

function ItemImage({ item, variant = 'list' }: { item: MenuItem; variant?: ItemImageVariant }) {
    const [imgErr, setImgErr] = useState(false);

    const src =
        item.image_url ??
        item.images.find((i) => i.is_primary)?.url ??
        item.images[0]?.url;

    const sizeClasses =
        variant === 'card'
            ? 'w-full aspect-[4/3]'      // fills card width, consistent 4:3 top image
            : 'w-20 h-20 sm:w-24 sm:h-24'; // fixed square thumbnail for list rows

    return (
        <div
            className={`relative flex-shrink-0 rounded-md overflow-hidden ${sizeClasses}`}
            style={{ background: "var(--color-border)" }}
        >
            {src && !imgErr ? (
                <Image
                    src={normalizeImageUrl(src)}
                    alt={item.name}
                    fill
                    quality={90}
                    sizes={variant === 'card' ? '(max-width: 640px) 100vw, 33vw' : '(max-width: 640px) 80px, 96px'}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() => setImgErr(true)}
                />
            ) : (
                <ItemPlaceholder name={item.name} />
            )}
            {!item.is_available && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                    <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">
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
            aria-label={`${item.name}, ₹${item.price}${unavailable ? ", currently unavailable" : ""}`}
            aria-disabled={unavailable}
            onClick={() => !unavailable && onClick(item.id)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!unavailable) onClick(item.id);
                }
            }}
            className={[
                "relative flex flex-col gap-3 p-2 rounded-2xl border outline-none",
                "transition-all duration-200 focus-visible:ring-2",
                unavailable
                    ? "opacity-55 cursor-not-allowed"
                    : "cursor-pointer hover:shadow-md hover:-translate-y-px active:scale-[0.99]",
            ].join(" ")}
            style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                borderRadius: "var(--border-radius)",
                boxShadow: "var(--shadow-sm)",
            }}
        >
            {showImage && <ItemImage item={item} variant="card" />}

            {unavailable && (
                <span
                    className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                        background: "var(--color-surface)",
                        color: "var(--color-muted)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    Unavailable
                </span>
            )}

            <div className="flex-1 min-w-0 py-0.5 space-y-2">
                {/* Name row */}
                <div className="flex items-center gap-2">
                    {showDietary && <DietaryIndicator dietaryType={item.dietary_type} />}
                    <p
                        className="font-semibold text-sm leading-snug flex-1 truncate"
                        style={{ color: "var(--color-text)", fontFamily: "var(--font-family)" }}
                    >
                        {item.name}
                    </p>
                </div>

                {/* Description */}
                {showDescription && item.description && (
                    <p
                        className="text-xs leading-relaxed line-clamp-1"
                        style={{ color: "var(--color-muted)" }}
                    >
                        {item.description}
                    </p>
                )}

                {/* Tags / spice */}
                {(showTags || showSpice) && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {showTags && <ItemBadgeRow item={item} />}
                        {showSpice && <SpiceIndicator level={item.spice_level} />}
                    </div>
                )}

                {/* Meta row: serving size / prep time */}
                {(showServing && item.serving_size) || item.preparation_time ? (
                    <div className="flex items-center gap-3 flex-wrap">
                        {showServing && item.serving_size && (
                            <span
                                className="text-[10px] flex items-center gap-1"
                                style={{ color: "var(--color-muted)" }}
                            >
                                <Users size={9} />
                                {item.serving_size}
                            </span>
                        )}
                        {item.preparation_time && (
                            <span
                                className="text-[10px] flex items-center gap-1"
                                style={{ color: "var(--color-muted)" }}
                            >
                                <Clock size={9} />
                                {item.preparation_time}m
                            </span>
                        )}
                    </div>
                ) : null}

                {/* Price / calories */}
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
            {showImage && (
                <div className="flex-shrink-0 w-20 h-20  overflow-hidden">
                    <ItemImage item={item} variant={'list'} />
                </div>
            )}

            <div className="flex flex-1 flex-col gap-2 min-w-0">
                {showDietary && (
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <DietaryIndicator dietaryType={item.dietary_type} />
                        <p className="font-semibold text-sm" style={{ color: "var(--color-text)", fontFamily: "var(--font-family)" }}>
                            {item.name}
                        </p>
                    </div>
                )}

                {showTags && <ItemBadgeRow item={item} />}
            </div>
            <Price amount={Number(item.price)} />

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
            <div className="flex justify-between items-center">
                <div className="p-3 space-y-2">

                    <div className="flex items-center gap-2">
                        {showDietary && <DietaryIndicator dietaryType={item.dietary_type} />}
                        <p className="font-semibold text-sm line-clamp-1" style={{ color: "var(--color-text)", fontFamily: "var(--font-family)" }}>
                            {item.name}
                        </p>
                    </div>
                    {showTags && <ItemBadgeRow item={item} />}

                </div>
                <div className="text-start w-14 max-w-24">
                    <Price amount={Number(item.price)} />
                </div>
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
    if (layout === "compact") {
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