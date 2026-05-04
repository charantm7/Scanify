"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, MapPin, UtensilsCrossed, ChevronRight, Star } from "lucide-react";

// ─── Scanify wordmark badge ────────────────────────────────────────────────────
function ScanifyBadge() {
    return (
        <a
            href="https://scanify.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 hover:opacity-80 hover:scale-105"
            style={{ background: "var(--accentlt)", color: "var(--accent)", border: "1px solid var(--accent)", opacity: 0.9 }}
        >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h3v3m0 4h4v-4m-4 0h-3v4" />
            </svg>
            Powered by Scanify
        </a>
    );
}

// ─── Item image placeholder ────────────────────────────────────────────────────
function ItemPlaceholder({ name }) {
    const letter = name?.charAt(0)?.toUpperCase() || "?";
    return (
        <div className="w-full h-full flex items-center justify-center text-xl font-bold select-none font-syne"
            style={{ background: "var(--accentlt)", color: "var(--accent)" }}>
            {letter}
        </div>
    );
}

// ─── Veg / Non-veg indicator ───────────────────────────────────────────────────
function FoodTypeIndicator({ tags }) {
    const isVeg = tags?.includes("veg");
    const isNonVeg = tags?.includes("non-veg");
    if (!isVeg && !isNonVeg) return null;
    return (
        <div className="w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0"
            style={{ borderColor: isVeg ? "#16a34a" : "#dc2626" }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: isVeg ? "#16a34a" : "#dc2626" }} />
        </div>
    );
}

// ─── Item Card ─────────────────────────────────────────────────────────────────
function ItemCard({ item }) {
    const [imgError, setImgError] = useState(false);
    const isUnavailable = !item.is_available;

    return (
        <div
            className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 ${isUnavailable ? "opacity-50" : "hover:shadow-md hover:-translate-y-px"}`}
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
            {/* Image */}
            <div className="flex-shrink-0 w-[78px] h-[78px] rounded-xl overflow-hidden relative"
                style={{ background: "var(--bg3)" }}>
                {item.image_url && !imgError ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <ItemPlaceholder name={item.name} />
                )}
                {isUnavailable && (
                    <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white rounded-xl"
                        style={{ background: "rgba(0,0,0,0.55)" }}>
                        SOLD OUT
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 py-0.5">
                <div className="flex items-start gap-2 mb-1">
                    <FoodTypeIndicator tags={item.tags} />
                    <p className="font-syne font-bold text-sm leading-snug" style={{ color: "var(--text)" }}>
                        {item.name}
                    </p>
                </div>
                {item.description && (
                    <p className="text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: "var(--text2)" }}>
                        {item.description}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <div className="font-syne font-bold text-base" style={{ color: "var(--accent)" }}>
                        <span className="text-xs font-semibold align-top mt-0.5 inline-block">₹</span>
                        {Number(item.price).toFixed(0)}
                    </div>
                    {item.tags && item.tags.length > 0 && item.tags[0] !== 'veg' && item.tags[0] !== 'non-veg' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: "var(--accentlt)", color: "var(--accent)" }}>
                            {item.tags[0]}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Category Section ──────────────────────────────────────────────────────────
function CategorySection({ category, sectionRef }) {
    const availableItems = category.items.filter(i => i.is_available);
    const unavailableItems = category.items.filter(i => !i.is_available);
    const ordered = [...availableItems, ...unavailableItems];

    return (
        <section ref={sectionRef} id={`cat-${category.id}`}>
            <div className="flex items-center gap-3 mb-4">
                <h2 className="font-syne font-bold text-base tracking-wide" style={{ color: "var(--text)" }}>
                    {category.name}
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accentlt)", color: "var(--accent)" }}>
                    {availableItems.length}{unavailableItems.length > 0 ? `/${category.items.length}` : ""}
                </span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {ordered.map((item) => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}

// ─── Search Results ────────────────────────────────────────────────────────────
function SearchResults({ results, query }) {
    if (results.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "var(--accentlt)" }}>
                    <UtensilsCrossed size={22} style={{ color: "var(--accent)" }} />
                </div>
                <p className="font-syne font-bold text-base mb-1" style={{ color: "var(--text)" }}>
                    No results for &ldquo;{query}&rdquo;
                </p>
                <p className="text-sm" style={{ color: "var(--text2)" }}>
                    Try a different name or browse by category
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <p className="text-xs font-semibold" style={{ color: "var(--text3)" }}>
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
                {results.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
        </div>
    );
}

// ─── Logo ──────────────────────────────────────────────────────────────────────
function HotelLogo({ hotel }) {
    const [imgError, setImgError] = useState(false);
    return (
        <div className="flex-shrink-0 w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-2xl overflow-hidden flex items-center justify-center border"
            style={{ background: "var(--accentlt)", borderColor: "var(--border2)" }}>
            {hotel.logo_url && !imgError ? (
                <img src={hotel.logo_url} alt={hotel.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)} />
            ) : (
                <span className="font-syne font-bold text-2xl" style={{ color: "var(--accent)" }}>
                    {hotel.name.charAt(0).toUpperCase()}
                </span>
            )}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function MenuPageClient({ hotel, menuData }) {
    const [activeCategory, setActiveCategory] = useState(menuData[0]?.id ?? null);
    const [searchQuery, setSearchQuery] = useState("");

    const sectionRefs = useRef({});
    const navRef = useRef(null);
    const isScrolling = useRef(false);
    const searchInputRef = useRef(null);

    const allItems = menuData.flatMap((cat) => cat.items);
    const isSearching = searchQuery.trim().length > 0;
    const searchResults = isSearching
        ? allItems.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    const totalItems = allItems.length;
    const availableCount = allItems.filter(i => i.is_available).length;

    // Scroll-spy
    useEffect(() => {
        if (isSearching) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (isScrolling.current) return;
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id.replace("cat-", "");
                        setActiveCategory(id);
                        const pill = navRef.current?.querySelector(`[data-id="${id}"]`);
                        pill?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                    }
                });
            },
            { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
        );
        Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, [menuData, isSearching]);

    const scrollToCategory = useCallback((catId) => {
        setActiveCategory(catId);
        isScrolling.current = true;
        const el = document.getElementById(`cat-${catId}`);
        if (el) {
            const offset = (navRef.current?.offsetHeight ?? 60) + 80;
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: "smooth" });
        }
        setTimeout(() => { isScrolling.current = false; }, 900);
    }, []);

    return (
        <div className="bg-theme min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Hero Header ───────────────────────────────────────────────────────── */}
            <header className="relative overflow-hidden px-5 pt-10 pb-8 border-b border-theme">
                {/* Warm radial glow */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at 15% 60%, rgba(200,98,42,0.10) 0%, transparent 55%), radial-gradient(ellipse at 85% 10%, rgba(200,98,42,0.07) 0%, transparent 50%)"
                    }} />

                <div className="relative max-w-[680px] mx-auto">

                    {/* Hotel identity row */}
                    <div className="flex items-start gap-4 mb-6">
                        <HotelLogo hotel={hotel} />
                        <div className="flex-1 min-w-0 pt-0.5">
                            <h1 className="font-syne font-bold leading-tight mb-1.5 tracking-tight"
                                style={{ color: "var(--text)", fontSize: "clamp(20px, 5vw, 26px)" }}>
                                {hotel.name}
                            </h1>
                            {hotel.description && (
                                <p className="text-sm leading-relaxed mb-2.5" style={{ color: "var(--text2)", maxWidth: 440 }}>
                                    {hotel.description}
                                </p>
                            )}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                {hotel.address && (
                                    <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text3)" }}>
                                        <MapPin size={10} className="flex-shrink-0" />
                                        {hotel.address}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--text3)" }}>
                                    <UtensilsCrossed size={10} className="flex-shrink-0" />
                                    {availableCount} available · {totalItems} total
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "var(--text3)" }} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            inputMode="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search dishes, drinks…"
                            className="w-full bg-card border border-theme2 rounded-[14px] text-sm outline-none transition-all duration-200"
                            style={{
                                padding: "11px 44px 11px 40px",
                                color: "var(--text)",
                                fontFamily: "inherit",
                                boxShadow: "var(--shadow)",
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = "var(--accent)";
                                e.target.style.boxShadow = "0 0 0 3px rgba(200,98,42,0.12), var(--shadow)";
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = "var(--border2)";
                                e.target.style.boxShadow = "var(--shadow)";
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:bg-theme3"
                                style={{ color: "var(--text3)" }}>
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Sticky Category Nav ─────────────────────────────────────────────────── */}
            {!isSearching && menuData.length > 1 && (
                <div
                    ref={navRef}
                    className="sticky top-0 z-20 py-3 px-5 border-b border-theme overflow-x-auto scrollbar-hide"
                    style={{ background: "var(--nav)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
                >
                    <div className="flex gap-2 max-w-[680px] mx-auto" style={{ whiteSpace: "nowrap" }}>
                        {menuData.map((cat) => {
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    data-id={cat.id}
                                    onClick={() => scrollToCategory(cat.id)}
                                    className="flex-shrink-0 text-[13px] font-semibold rounded-full transition-all duration-200 border"
                                    style={{
                                        padding: "5px 15px",
                                        background: isActive ? "var(--accent)" : "transparent",
                                        color: isActive ? "white" : "var(--text2)",
                                        borderColor: isActive ? "var(--accent)" : "var(--border2)",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Main Content ─────────────────────────────────────────────────────────── */}
            <main className="max-w-[680px] mx-auto px-5 pb-24 pt-7">
                {menuData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-accentlt">
                            <UtensilsCrossed size={26} style={{ color: "var(--accent)" }} />
                        </div>
                        <p className="font-syne font-bold text-lg text-theme mb-1">Menu coming soon</p>
                        <p className="text-sm text-theme2">{hotel.name} is still setting up their digital menu.</p>
                    </div>
                ) : isSearching ? (
                    <SearchResults results={searchResults} query={searchQuery.trim()} />
                ) : (
                    <div className="flex flex-col gap-10">
                        {menuData.map((cat) => (
                            <CategorySection
                                key={cat.id}
                                category={cat}
                                sectionRef={(el) => { sectionRefs.current[cat.id] = el; }}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* ── Footer ─────────────────────────────────────────────────────────────── */}
            <footer className="border-t border-theme px-5 py-6 flex flex-col items-center gap-3 text-center">
                <p className="text-xs text-theme3">Prices inclusive of all taxes · Menu subject to availability</p>
                <ScanifyBadge />
            </footer>
        </div>
    );
}