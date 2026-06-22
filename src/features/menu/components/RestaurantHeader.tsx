// features/menu/components/RestaurantHeader.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { MapPin, Star, Phone, ExternalLink, Clock, Search, X } from "lucide-react";
import type { DBHotel, DBMenuCustomization } from "../types";

// ── Rating stars ──────────────────────────────────────────────────────────────
function RatingStars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={11}
                    fill={star <= Math.round(rating) ? "var(--color-accent)" : "transparent"}
                    style={{ color: "var(--color-accent)" }}
                />
            ))}
        </div>
    );
}

// ── Open/Closed pill ──────────────────────────────────────────────────────────
// is_open is boolean | null in the real DB
function OpenStatus({ isOpen }: { isOpen: boolean | null }) {
    // null means unknown — show nothing
    if (isOpen === null) return null;
    return (
        <span
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{
                background: isOpen ? "#DCFCE7" : "#FEE2E2",
                color: isOpen ? "#166534" : "#991B1B",
            }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: isOpen ? "#16a34a" : "#dc2626" }}
            />
            {isOpen ? "Open now" : "Closed"}
        </span>
    );
}

// ── Hotel logo ────────────────────────────────────────────────────────────────
function HotelLogo({ hotel }: { hotel: DBHotel }) {
    const [imgErr, setImgErr] = useState(false);
    return (
        <div
            className="flex-shrink-0 w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-2xl overflow-hidden border-2 flex items-center justify-center"
            style={{
                background: "var(--color-accent-lt)",
                borderColor: "var(--color-surface)",
                boxShadow: "var(--shadow-md)",
            }}
        >
            {hotel.logo_url && !imgErr ? (
                <Image
                    src={hotel.logo_url}
                    alt={hotel.name}
                    width={72}
                    height={72}
                    className="w-full h-full object-cover"
                    onError={() => setImgErr(true)}
                />
            ) : (
                <span
                    className="font-bold text-2xl"
                    style={{ color: "var(--color-accent)", fontFamily: "var(--font-family)" }}
                >
                    {hotel.name.charAt(0).toUpperCase()}
                </span>
            )}
        </div>
    );
}

// ── Cover image ───────────────────────────────────────────────────────────────
function CoverImage({ url, name }: { url: string; name: string }) {
    return (
        <div className="relative w-full h-44 sm:h-52 overflow-hidden">
            <Image
                src={url}
                alt={`${name} cover`}
                fill
                sizes="100vw"
                className="object-cover"
                priority
            />
            <div
                className="absolute inset-x-0 bottom-0 h-20"
                style={{ background: "linear-gradient(to bottom, transparent, var(--color-bg))" }}
            />
        </div>
    );
}

// ── Search bar ────────────────────────────────────────────────────────────────
interface SearchBarProps {
    value: string;
    onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="relative">
            <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--color-muted)" }}
                aria-hidden="true"
            />
            <input
                ref={inputRef}
                type="text"
                inputMode="search"
                role="searchbox"
                aria-label="Search dishes"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search dishes, drinks…"
                className="w-full text-sm outline-none transition-all duration-200 border rounded-2xl"
                style={{
                    padding: "11px 44px 11px 40px",
                    color: "var(--color-text)",
                    background: "var(--color-surface)",
                    fontFamily: "var(--font-family)",
                    borderColor: "var(--color-border)",
                    boxShadow: "var(--shadow-sm)",
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-accent)";
                    e.target.style.boxShadow = "0 0 0 3px var(--color-accent-lt), var(--shadow-sm)";
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = "var(--color-border)";
                    e.target.style.boxShadow = "var(--shadow-sm)";
                }}
            />
            {value && (
                <button
                    onClick={() => { onChange(""); inputRef.current?.focus(); }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                    style={{ color: "var(--color-muted)", background: "var(--color-accent-lt)" }}
                    aria-label="Clear search"
                >
                    <X size={12} />
                </button>
            )}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
interface RestaurantHeaderProps {
    hotel: DBHotel;
    customization: DBMenuCustomization;
    searchQuery: string;
    onSearchChange: (v: string) => void;
}

export function RestaurantHeader({
    hotel,
    customization,
    searchQuery,
    onSearchChange,
}: RestaurantHeaderProps) {
    const hasCover = customization.show_cover_image && !!hotel.cover_image_url;

    // rating and review_count are nullable in the real DB
    const rating = hotel.rating ?? 0;
    const reviewCount = hotel.review_count ?? 0;

    return (
        <header className="border-b" style={{ borderColor: "var(--color-border)" }}>
            {hasCover && <CoverImage url={hotel.cover_image_url!} name={hotel.name} />}

            <div
                className="relative max-w-[680px] mx-auto px-5 pb-6"
                style={{ paddingTop: hasCover ? "0" : "24px" }}
            >
                {/* Warm ambient glow */}
                <div
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                    aria-hidden="true"
                    style={{
                        background:
                            "radial-gradient(ellipse at 20% 70%, color-mix(in srgb, var(--color-accent) 8%, transparent) 0%, transparent 55%)",
                    }}
                />

                {/* Identity row */}
                <div className={`relative flex items-end gap-4 ${hasCover ? "-mt-8 mb-4" : "mb-5"}`}>
                    {customization.show_logo && <HotelLogo hotel={hotel} />}
                    <div className="flex-1 min-w-0 pb-0.5">
                        <div className="mb-1.5">
                            <OpenStatus isOpen={hotel.is_open} />
                        </div>
                        <h1
                            className="font-bold leading-tight tracking-tight"
                            style={{
                                color: "var(--color-text)",
                                fontFamily: "var(--font-family)",
                                fontSize: "clamp(18px, 5vw, 24px)",
                            }}
                        >
                            {hotel.name}
                        </h1>
                    </div>
                </div>

                <div className="relative space-y-3">
                    {hotel.description && (
                        <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)", maxWidth: 460 }}>
                            {hotel.description}
                        </p>
                    )}

                    {/* Rating — only show if customization.show_ratings AND rating > 0 */}
                    {customization.show_ratings && rating > 0 && (
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <RatingStars rating={rating} />
                                <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                                    {rating.toFixed(1)}
                                </span>
                                {reviewCount > 0 && (
                                    <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                                        ({reviewCount.toLocaleString()} reviews)
                                    </span>
                                )}
                            </div>
                            {hotel.open_time && hotel.close_time && (
                                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-muted)" }}>
                                    <Clock size={10} />
                                    {hotel.open_time} – {hotel.close_time}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Cuisine tags */}
                    {hotel.cuisine_type && hotel.cuisine_type.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {hotel.cuisine_type.map((cuisine) => (
                                <span
                                    key={cuisine}
                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                                    style={{
                                        color: "var(--color-accent)",
                                        borderColor: "var(--color-accent-lt)",
                                        background: "var(--color-accent-lt)",
                                    }}
                                >
                                    {cuisine}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Address + links */}
                    {customization.show_address && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                            {hotel.address && (
                                <a
                                    href={hotel.google_maps_url ?? `https://maps.google.com/?q=${encodeURIComponent(hotel.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
                                    style={{ color: "var(--color-muted)" }}
                                >
                                    <MapPin size={10} className="flex-shrink-0" />
                                    {hotel.address}
                                </a>
                            )}
                            {hotel.phone && (
                                <a
                                    href={`tel:${hotel.phone}`}
                                    className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
                                    style={{ color: "var(--color-muted)" }}
                                >
                                    <Phone size={10} />
                                    {hotel.phone}
                                </a>
                            )}
                            {hotel.website && (
                                <a
                                    href={hotel.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
                                    style={{ color: "var(--color-muted)" }}
                                >
                                    <ExternalLink size={10} />
                                    Website
                                </a>
                            )}
                        </div>
                    )}

                    {customization.show_search && (
                        <SearchBar value={searchQuery} onChange={onSearchChange} />
                    )}
                </div>
            </div>
        </header>
    );
}