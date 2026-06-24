// features/menu/components/RestaurantHeader.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { MapPin, Star, Phone, ExternalLink, Clock, Search, X, ChevronRight } from "lucide-react";
import type { DBHotel, DBMenuCustomization } from "../types";

// ── Rating stars ──────────────────────────────────────────────────────────────
function RatingStars({ rating }: { rating: number }) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
        <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={12}
                    fill={s <= full ? "currentColor" : "none"}
                    strokeWidth={1.5}
                    style={{ color: "#F59E0B" }}
                />
            ))}
        </div>
    );
}

// ── Open / Closed chip ────────────────────────────────────────────────────────
function OpenChip({ isOpen }: { isOpen: boolean | null }) {
    if (isOpen === null) return null;
    return (
        <span
            className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full"
            style={{
                background: isOpen ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.10)",
                color: isOpen ? "#15803D" : "#B91C1C",
            }}
        >
            <span
                className="w-1 h-1 rounded-full"
                style={{ background: isOpen ? "#16a34a" : "#dc2626" }}
            />
            {isOpen ? "Open" : "Closed"}
        </span>
    );
}

// ── Logo ──────────────────────────────────────────────────────────────────────
function HotelLogo({ hotel }: { hotel: DBHotel }) {
    const [err, setErr] = useState(false);
    return (
        <div
            className="relative w-[68px] h-[68px] sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{
                background: "var(--color-accent-lt)",
                // White ring that "punches out" of the cover photo
                boxShadow: "0 0 0 3px var(--color-bg), var(--shadow-md)",
            }}
        >
            {hotel.logo_url && !err ? (
                <Image
                    src={hotel.logo_url}
                    alt={`${hotel.name} logo`}
                    fill
                    sizes="80px"
                    className="object-cover"
                    onError={() => setErr(true)}
                />
            ) : (
                <span
                    className="font-bold text-2xl select-none"
                    style={{ color: "var(--color-accent)", fontFamily: "var(--font-family)" }}
                >
                    {hotel.name.charAt(0).toUpperCase()}
                </span>
            )}
        </div>
    );
}

// ── Cover image with overlaid gradient ───────────────────────────────────────
function CoverImage({ url, name }: { url: string; name: string }) {
    return (
        <div className="relative w-full h-48 sm:h-56 overflow-hidden">
            <Image
                src={url}
                alt={`${name} cover`}
                fill
                sizes="100vw"
                className="object-cover"
                priority
            />
            {/* Multi-stop scrim: dark at top-edges for legibility, fades to bg colour at bottom */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        linear-gradient(
                            to bottom,
                            rgba(0,0,0,0.15) 0%,
                            rgba(0,0,0,0.02) 40%,
                            var(--color-bg) 100%
                        )
                    `,
                }}
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
    const ref = useRef<HTMLInputElement>(null);

    return (
        <div className="relative">
            <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--color-muted)" }}
                aria-hidden="true"
            />
            <input
                ref={ref}
                type="text"
                inputMode="search"
                role="searchbox"
                aria-label="Search dishes"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search dishes, drinks…"
                className="w-full text-sm outline-none border transition-all duration-200"
                style={{
                    padding: "12px 44px 12px 42px",
                    borderRadius: "var(--border-radius)",
                    color: "var(--color-text)",
                    background: "var(--color-surface)",
                    fontFamily: "var(--font-family)",
                    borderColor: "var(--color-border)",
                    boxShadow: "var(--shadow-sm)",
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-accent)";
                    e.target.style.boxShadow = "0 0 0 3px var(--color-accent-lt)";
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = "var(--color-border)";
                    e.target.style.boxShadow = "var(--shadow-sm)";
                }}
            />
            {value && (
                <button
                    onClick={() => { onChange(""); ref.current?.focus(); }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ color: "var(--color-muted)", background: "var(--color-accent-lt)" }}
                    aria-label="Clear search"
                >
                    <X size={12} />
                </button>
            )}
        </div>
    );
}

// ── Main header ───────────────────────────────────────────────────────────────
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
    const rating = hotel.rating ?? 0;
    const reviewCount = hotel.review_count ?? 0;
    const showRating = customization.show_ratings && rating > 0;

    return (
        <header
            className="border-b"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
        >
            {/* ── Cover photo ────────────────────────────────────────────── */}
            {hasCover && <CoverImage url={hotel.cover_image_url!} name={hotel.name} />}

            {/* ── Identity block ─────────────────────────────────────────── */}
            <div className="max-w-[680px] mx-auto px-5">

                {/* Logo row — overlaps cover by pulling up with -mt when cover exists */}
                <div className={`flex items-end gap-4 ${hasCover ? "-mt-9" : "pt-6"} mb-3`}>
                    {customization.show_logo && <HotelLogo hotel={hotel} />}

                    {/* Name + open status live beside the logo so they're anchored together */}
                    <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center gap-2 mb-1">
                            <OpenChip isOpen={hotel.is_open} />
                            {hotel.open_time && hotel.close_time && (
                                <span
                                    className="text-[10px] flex items-center gap-0.5"
                                    style={{ color: "var(--color-muted)" }}
                                >
                                    <Clock size={9} />
                                    {hotel.open_time}–{hotel.close_time}
                                </span>
                            )}
                        </div>
                        <h1
                            className="font-bold leading-none tracking-tight truncate"
                            style={{
                                color: "var(--color-text)",
                                fontFamily: "var(--font-family)",
                                fontSize: "clamp(20px, 5.5vw, 26px)",
                            }}
                        >
                            {hotel.name}
                        </h1>
                    </div>
                </div>

                {/* ── Meta strip ─────────────────────────────────────────── */}
                <div className="space-y-2.5 pb-5">

                    {/* Description */}
                    {hotel.description && (
                        <p
                            className="text-sm leading-relaxed"
                            style={{ color: "var(--color-muted)", maxWidth: 500 }}
                        >
                            {hotel.description}
                        </p>
                    )}

                    {/* Rating + cuisine tags on one line */}
                    {(showRating || (hotel.cuisine_type && hotel.cuisine_type.length > 0)) && (
                        <div className="flex items-center flex-wrap gap-2">
                            {showRating && (
                                <div
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                                    style={{
                                        background: "rgba(245,158,11,0.07)",
                                        borderColor: "rgba(245,158,11,0.25)",
                                    }}
                                >
                                    <RatingStars rating={rating} />
                                    <span className="text-xs font-bold tabular-nums" style={{ color: "#92400E" }}>
                                        {rating.toFixed(1)}
                                    </span>
                                    {reviewCount > 0 && (
                                        <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>
                                            ({reviewCount.toLocaleString()})
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Separator dot between rating and cuisine tags */}
                            {showRating && hotel.cuisine_type && hotel.cuisine_type.length > 0 && (
                                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "var(--color-border)" }} />
                            )}

                            {hotel.cuisine_type?.map((c) => (
                                <span
                                    key={c}
                                    className="text-[11px] font-semibold"
                                    style={{ color: "var(--color-muted)" }}
                                >
                                    {c}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Address / phone / website row */}
                    {customization.show_address && (hotel.address || hotel.phone || hotel.website) && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            {hotel.address && (
                                <a
                                    href={
                                        hotel.google_maps_url ??
                                        `https://maps.google.com/?q=${encodeURIComponent(hotel.address)}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs group"
                                    style={{ color: "var(--color-muted)" }}
                                >
                                    <MapPin size={10} className="flex-shrink-0 group-hover:text-accent transition-colors" />
                                    <span className="underline-offset-2 group-hover:underline">
                                        {hotel.address}
                                    </span>
                                    <ChevronRight size={9} className="opacity-40" />
                                </a>
                            )}
                            {hotel.phone && (
                                <a
                                    href={`tel:${hotel.phone}`}
                                    className="inline-flex items-center gap-1 text-xs"
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
                                    className="inline-flex items-center gap-1 text-xs"
                                    style={{ color: "var(--color-muted)" }}
                                >
                                    <ExternalLink size={10} />
                                    Website
                                </a>
                            )}
                        </div>
                    )}

                    {/* ── Divider before search ───────────────────────────── */}
                    {customization.show_search && (
                        <div className="pt-1">
                            <SearchBar value={searchQuery} onChange={onSearchChange} />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}