// features/menu/components/DishModal.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { X, Clock, Users, Leaf, AlertCircle, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DietaryIndicator, SpiceIndicator, ItemBadgeRow } from "./ItemBadges";
import { DIETARY_CONFIG } from "../constant";
import type { MenuItem } from "../types";

interface DishModalProps {
    item: MenuItem | undefined;
    isOpen: boolean;
    onClose: () => void;
    currency?: string;
}

// ── Image gallery ─────────────────────────────────────────────────────────────
function ImageGallery({ item }: { item: MenuItem }) {
    const [activeIdx, setActiveIdx] = useState(0);
    const [imgErr, setImgErr] = useState(false);

    // Combine image_url + gallery images, deduplicating
    const allImages = [
        ...(item.image_url ? [{ url: item.image_url, alt_text: item.name }] : []),
        ...item.images.filter((i) => i.url !== item.image_url).map((i) => ({
            url: i.url,
            alt_text: i.alt_text,
        })),
    ];

    const src = allImages[activeIdx]?.url ?? null;

    if (allImages.length === 0) {
        // No images: show letter avatar
        return (
            <div
                className="w-full h-52 flex items-center justify-center text-5xl font-bold rounded-2xl"
                style={{ background: "var(--color-accent-lt)", color: "var(--color-accent)" }}
            >
                {item.name.charAt(0).toUpperCase()}
            </div>
        );
    }

    return (
        <div>
            <div className="relative w-full h-56 rounded-2xl overflow-hidden">
                {src && !imgErr ? (
                    <Image
                        src={src}
                        alt={allImages[activeIdx]?.alt_text ?? item.name}
                        fill
                        sizes="(max-width: 680px) 100vw, 680px"
                        className="object-cover"
                        onError={() => setImgErr(true)}
                        priority
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center text-5xl font-bold"
                        style={{ background: "var(--color-accent-lt)", color: "var(--color-accent)" }}
                    >
                        {item.name.charAt(0).toUpperCase()}
                    </div>
                )}
                {!item.is_available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                        <span className="text-white font-bold text-sm tracking-widest uppercase px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
                            Currently Unavailable
                        </span>
                    </div>
                )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    {allImages.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => { setActiveIdx(i); setImgErr(false); }}
                            className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all"
                            style={{ borderColor: activeIdx === i ? "var(--color-accent)" : "transparent" }}
                        >
                            <Image
                                src={img.url}
                                alt={img.alt_text ?? ""}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Info chip ─────────────────────────────────────────────────────────────────
function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div
            className="flex items-center gap-2 p-2.5 rounded-xl border"
            style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}
        >
            <div style={{ color: "var(--color-accent)" }}>{icon}</div>
            <div>
                <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-muted)" }}>
                    {label}
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-muted)" }}>
                {title}
            </h3>
            {children}
        </div>
    );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export function DishModal({ item, isOpen, onClose, currency = "₹" }: DishModalProps) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleKeyDown]);

    // dietary_type is a string in the real DB ("veg", "non_veg", etc.)
    const dietaryKey = item?.dietary_type as keyof typeof DIETARY_CONFIG | undefined;
    const dietaryCfg = dietaryKey ? DIETARY_CONFIG[dietaryKey] : null;

    return (
        <AnimatePresence>
            {isOpen && item && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Bottom sheet */}
                    <motion.div
                        key="sheet"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 32, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-3xl"
                        style={{ background: "var(--color-surface)" }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={item.name}
                    >
                        {/* Drag handle */}
                        <div
                            className="sticky top-0 z-10 flex justify-center pt-3 pb-2"
                            style={{ background: "var(--color-surface)" }}
                        >
                            <div className="w-10 h-1 rounded-full" style={{ background: "var(--color-border)" }} />
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full border transition-all"
                            style={{
                                background: "var(--color-bg)",
                                borderColor: "var(--color-border)",
                                color: "var(--color-muted)",
                            }}
                            aria-label="Close"
                        >
                            <X size={14} />
                        </button>

                        <div className="px-5 pb-10 space-y-5">
                            {/* Gallery */}
                            <ImageGallery item={item} />

                            {/* Header */}
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <DietaryIndicator dietaryType={item.dietary_type} />
                                    <h2
                                        className="font-bold text-xl leading-tight flex-1"
                                        style={{ color: "var(--color-text)", fontFamily: "var(--font-family)" }}
                                    >
                                        {item.name}
                                    </h2>
                                </div>

                                {/* Tag badges (Bestseller, New etc from tags[]) */}
                                <ItemBadgeRow item={item} />

                                {item.description && (
                                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                                        {item.description}
                                    </p>
                                )}

                                {/* Price + spice */}
                                <div className="flex items-center justify-between">
                                    <span
                                        className="font-bold text-2xl"
                                        style={{ color: "var(--color-accent)", fontFamily: "var(--font-family)" }}
                                    >
                                        <span className="text-sm align-top mt-1 inline-block">{currency}</span>
                                        {Number(item.price).toFixed(0)}
                                    </span>
                                    <SpiceIndicator level={item.spice_level} />
                                </div>
                            </div>

                            {/* Info chips */}
                            {(item.preparation_time || item.serving_size || item.calories) && (
                                <div className="grid grid-cols-3 gap-2">
                                    {item.preparation_time && (
                                        <InfoChip icon={<Clock size={14} />} label="Prep time" value={`${item.preparation_time} min`} />
                                    )}
                                    {item.serving_size && (
                                        <InfoChip icon={<Users size={14} />} label="Serving" value={item.serving_size} />
                                    )}
                                    {item.calories && (
                                        <InfoChip icon={<ChefHat size={14} />} label="Calories" value={`${item.calories} kcal`} />
                                    )}
                                </div>
                            )}

                            {/* Dietary label banner */}
                            {dietaryCfg && (
                                <div
                                    className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl"
                                    style={{ background: "var(--color-accent-lt)", color: dietaryCfg.dot }}
                                >
                                    <Leaf size={13} />
                                    {dietaryCfg.label}
                                </div>
                            )}

                            {/* Ingredients */}
                            {item.ingredients && item.ingredients.length > 0 && (
                                <Section title="Ingredients">
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.ingredients.map((ing, i) => (
                                            <span
                                                key={i}
                                                className="text-xs px-2.5 py-1 rounded-full border"
                                                style={{
                                                    color: "var(--color-text)",
                                                    borderColor: "var(--color-border)",
                                                    background: "var(--color-bg)",
                                                }}
                                            >
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* Allergens */}
                            {item.allergens && item.allergens.length > 0 && (
                                <Section title="Allergens">
                                    <div
                                        className="flex items-start gap-2 p-3 rounded-xl border"
                                        style={{ background: "#FFF9F0", borderColor: "#FDE68A" }}
                                    >
                                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#D97706" }} />
                                        <p className="text-xs" style={{ color: "#92400E" }}>
                                            Contains: <strong>{item.allergens.join(", ")}</strong>
                                        </p>
                                    </div>
                                </Section>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}