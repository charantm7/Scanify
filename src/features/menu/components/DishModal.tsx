// features/menu/components/DishModal.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Clock, Users, AlertCircle, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DietaryIndicator, SpiceIndicator, ItemBadgeRow, VariantIndicator } from "./ItemBadges";
import { DIETARY_CONFIG } from "../constant";
import type { MenuItem, DietaryFlag } from "../types";

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


    const allImages = [
        ...(item.image_url ? [{ url: item.image_url, alt_text: item.name }] : []),
        ...(item.images ?? [])
            .filter((i) => i.url !== item.image_url)
            .map((i) => ({ url: i.url, alt_text: i.alt_text })),
    ];

    const src = allImages[activeIdx]?.url ?? null;



    if (allImages.length === 0) {
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
                        alt={item.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
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
            <h3
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--color-muted)" }}
            >
                {title}
            </h3>
            {children}
        </div>
    );
}

// ── Modal content (rendered inside portal) ────────────────────────────────────
function ModalContent({
    item,
    onClose,
    currency,
}: {
    item: MenuItem;
    onClose: () => void;
    currency: string;
}) {
    const dietaryMeta = item.dietary_type
        ? DIETARY_CONFIG[item.dietary_type as DietaryFlag]
        : null;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                aria-hidden="true"
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9998,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                }}
            />

            {/* Bottom sheet */}
            <motion.div
                key="sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 32, stiffness: 300 }}
                role="dialog"
                aria-modal="true"
                aria-label={item.name}
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    maxHeight: "92dvh",
                    overflowY: "auto",
                    borderRadius: "24px 24px 0 0",
                    background: "var(--color-surface)",
                    // Inherit CSS vars from the menu page root
                    fontFamily: "var(--font-family)",
                    color: "var(--color-text)",
                }}
            >
                {/* Drag handle */}
                <div
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: 12,
                        paddingBottom: 8,
                        background: "var(--color-surface)",
                    }}
                >
                    <div
                        style={{
                            width: 40,
                            height: 4,
                            borderRadius: 9999,
                            background: "var(--color-border)",
                        }}
                    />
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 16,
                        zIndex: 20,
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-bg)",
                        color: "var(--color-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                    }}
                >
                    <X size={14} />
                </button>

                <div className="px-5 pb-16 space-y-5">
                    <ImageGallery key={item.id} item={item} />

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <DietaryIndicator dietaryType={item.dietary_type} />
                            <h2
                                className="font-bold text-xl leading-tight flex-1"
                                style={{ color: "var(--color-text)", fontFamily: "var(--font-family)" }}
                            >
                                {item.name}
                            </h2>
                        </div>

                        <ItemBadgeRow item={item} />

                        {item.description && (
                            <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                                {item.description}
                            </p>
                        )}

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

                    {/* Dietary banner */}
                    {dietaryMeta && (
                        <div
                            className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl"
                            style={{ background: "var(--color-accent-lt)", color: dietaryMeta.dot }}
                        >
                            <DietaryIndicator dietaryType={item.dietary_type} />
                            {dietaryMeta.label}
                        </div>
                    )}

                    {item.variants && item.variants.length > 0 && (

                        <div className="flex items-center gap-2">
                            {item.variants.map((variant, i) => {
                                const item = JSON.parse(variant)


                                return (

                                    <VariantIndicator key={i} item={item} i={i} />

                                )
                            })}
                        </div>
                    )}

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
    );
}

// ── Main export: portal wrapper ───────────────────────────────────────────────
export function DishModal({ item, isOpen, onClose, currency = "₹" }: DishModalProps) {


    // Keyboard: close on Escape
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
        [onClose]
    );
    useEffect(() => {
        if (isOpen) document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleKeyDown]);

    if (typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            {isOpen && item && (
                <ModalContent item={item} onClose={onClose} currency={currency} />
            )}
        </AnimatePresence>,
        document.body
    );
}