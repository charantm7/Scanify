"use client";

/**
 * MenuPageClient.js
 * Public-facing interactive menu — matches Scanify's warm terracotta design system.
 * Features: sticky category nav, search, item cards with images, smooth scroll.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, MapPin, UtensilsCrossed, ChevronRight } from "lucide-react";

// ─── Scanify wordmark ──────────────────────────────────────────────────────────
function ScanifyBadge() {
    return (
        <a
            href="https://scanify.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-opacity hover:opacity-70"
            style={{
                background: "var(--accentlt)",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
                opacity: 0.85,
            }}
        >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        <div
            className="w-full h-full flex items-center justify-center text-2xl font-syne font-bold select-none"
            style={{ background: "var(--accentlt)", color: "var(--accent)" }}
        >
            {letter}
        </div>
    );
}

// ─── Individual item card ──────────────────────────────────────────────────────
function ItemCard({ item }) {
    const [imgError, setImgError] = useState(false);

    return (
        <div
            className="group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:shadow-md"
            style={{
                background: "var(--card)",
                borderColor: "var(--border)",
            }}
        >
            {/* Image */}
            <div
                className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden"
                style={{ background: "var(--bg3)" }}
            >
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
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 py-0.5">
                <p
                    className="font-syne font-bold text-[15px] leading-snug mb-1 truncate"
                    style={{ color: "var(--text)" }}
                >
                    {item.name}
                </p>
                {item.description && (
                    <p
                        className="text-xs leading-relaxed line-clamp-2 mb-2"
                        style={{ color: "var(--text2)" }}
                    >
                        {item.description}
                    </p>
                )}
                <div
                    className="inline-flex items-center gap-0.5 text-sm font-bold"
                    style={{ color: "var(--accent)" }}
                >
                    <span className="text-xs font-semibold">₹</span>
                    {Number(item.price).toFixed(0)}
                </div>
            </div>
        </div>
    );
}

// ─── Category section ──────────────────────────────────────────────────────────
function CategorySection({ category, sectionRef }) {
    return (
        <section ref={sectionRef} id={`cat-${category.id}`}>
            {/* Category header */}
            <div className="flex items-center gap-3 mb-4">
                <h2
                    className="font-syne font-bold text-lg"
                    style={{ color: "var(--text)" }}
                >
                    {category.name}
                </h2>
                <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accentlt)", color: "var(--accent)" }}
                >
                    {category.items.length}
                </span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            {/* Items grid */}
            <div className="grid gap-3 sm:grid-cols-2">
                {category.items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}

// ─── Search results ────────────────────────────────────────────────────────────
function SearchResults({ results, query }) {
    if (results.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "var(--accentlt)" }}
                >
                    <UtensilsCrossed size={24} style={{ color: "var(--accent)" }} />
                </div>
                <p className="font-syne font-bold text-base" style={{ color: "var(--text)" }}>
                    No results for &ldquo;{query}&rdquo;
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text2)" }}>
                    Try a different name or browse by category
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <p className="text-xs font-semibold" style={{ color: "var(--text2)" }}>
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
                {results.map((item) => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}

// ─── Main client component ─────────────────────────────────────────────────────
export default function MenuPageClient({ hotel, menuData }) {
    const [activeCategory, setActiveCategory] = useState(menuData[0]?.id ?? null);
    const [searchQuery, setSearchQuery] = useState("");
    const [imgError, setImgError] = useState(false);

    const sectionRefs = useRef({});
    const navRef = useRef(null);
    const isScrolling = useRef(false);

    const allItems = menuData.flatMap((cat) => cat.items);
    const isSearching = searchQuery.trim().length > 0;
    const searchResults = isSearching
        ? allItems.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    // Scroll-spy: highlight active category as user scrolls
    useEffect(() => {
        if (isSearching) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (isScrolling.current) return;
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id.replace("cat-", "");
                        setActiveCategory(id);
                        // Scroll the nav pill into view
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

    // Click a category pill → scroll to section
    const scrollToCategory = useCallback((catId) => {
        setActiveCategory(catId);
        isScrolling.current = true;
        const el = document.getElementById(`cat-${catId}`);
        if (el) {
            const offset = navRef.current ? navRef.current.offsetHeight + 80 : 120;
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: "smooth" });
        }
        setTimeout(() => { isScrolling.current = false; }, 800);
    }, []);

    const totalItems = allItems.length;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none; }
        html::-webkit-scrollbar { display: none; }
        body {
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--text);
          -webkit-font-smoothing: antialiased;
        }

        :root {
          --bg: #FAF7F2;
          --bg2: #FFFFFF;
          --bg3: #F2EDE4;
          --text: #1C1008;
          --text2: #6B5040;
          --text3: #A08870;
          --accent: #C8622A;
          --accentlt: #FDEBD9;
          --border: rgba(0, 0, 0, 0.07);
          --border2: rgba(0, 0, 0, 0.13);
          --card: #FFFFFF;
          --shadow: 0 2px 24px rgba(0,0,0,0.07);
          --shadow2: 0 8px 40px rgba(0,0,0,0.11);
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #120C08;
            --bg2: #1C1410;
            --bg3: #241A14;
            --text: #F5EDE5;
            --text2: #A89080;
            --text3: #6B5A50;
            --accent: #E07844;
            --accentlt: #2D160A;
            --border: rgba(255,255,255,0.07);
            --border2: rgba(255,255,255,0.12);
            --card: #1C1410;
            --shadow: 0 2px 24px rgba(0,0,0,0.45);
            --shadow2: 0 8px 40px rgba(0,0,0,0.55);
          }
        }

        .font-syne { font-family: 'Syne', sans-serif; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .nav-pill-active {
          background: var(--accent) !important;
          color: white !important;
        }

        .hero-gradient {
          background:
            radial-gradient(circle at 20% 50%, rgba(200, 98, 42, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(200, 98, 42, 0.08) 0%, transparent 40%),
            var(--bg);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.5s 0.05s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.12s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.20s ease both; }
        .fade-up-4 { animation: fadeUp 0.5s 0.28s ease both; }
      `}</style>

            <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

                {/* ── Hero header ─────────────────────────────────────────────────────── */}
                <header className="hero-gradient pt-10 pb-8 px-5" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div style={{ maxWidth: 680, margin: "0 auto" }}>

                        <div className="flex items-start gap-4 fade-up">
                            {/* Logo */}
                            <div
                                className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
                                style={{ background: "var(--accentlt)", border: "1px solid var(--border2)" }}
                            >
                                {hotel.logo_url && !imgError ? (
                                    <img
                                        src={hotel.logo_url}
                                        alt={hotel.name}
                                        className="w-full h-full object-cover"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <span
                                        className="font-syne font-bold text-2xl"
                                        style={{ color: "var(--accent)" }}
                                    >
                                        {hotel.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Name + meta */}
                            <div className="flex-1 min-w-0 pt-1">
                                <h1
                                    className="font-syne font-bold leading-tight mb-1"
                                    style={{ color: "var(--text)", fontSize: "clamp(22px, 5vw, 28px)" }}
                                >
                                    {hotel.name}
                                </h1>
                                {hotel.description && (
                                    <p
                                        className="text-sm leading-relaxed mb-2 fade-up-1"
                                        style={{ color: "var(--text2)", maxWidth: 480 }}
                                    >
                                        {hotel.description}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center gap-3 fade-up-2">
                                    {hotel.address && (
                                        <span
                                            className="inline-flex items-center gap-1 text-xs"
                                            style={{ color: "var(--text3)" }}
                                        >
                                            <MapPin size={11} /> {hotel.address}
                                        </span>
                                    )}
                                    <span
                                        className="inline-flex items-center gap-1 text-xs font-medium"
                                        style={{ color: "var(--text3)" }}
                                    >
                                        <UtensilsCrossed size={11} />
                                        {totalItems} item{totalItems !== 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Search bar */}
                        <div className="mt-6 relative fade-up-3">
                            <Search
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ color: "var(--text3)" }}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search dishes, drinks…"
                                style={{
                                    width: "100%",
                                    padding: "12px 44px",
                                    borderRadius: 14,
                                    border: "1px solid var(--border2)",
                                    background: "var(--card)",
                                    color: "var(--text)",
                                    fontSize: 14,
                                    outline: "none",
                                    boxShadow: "var(--shadow)",
                                    fontFamily: "Inter, sans-serif",
                                }}
                                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(200,98,42,0.12)"; }}
                                onBlur={(e) => { e.target.style.borderColor = "var(--border2)"; e.target.style.boxShadow = "var(--shadow)"; }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                    style={{ color: "var(--text3)" }}
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── Sticky category nav ──────────────────────────────────────────────── */}
                {!isSearching && menuData.length > 1 && (
                    <div
                        ref={navRef}
                        className="sticky top-0 z-20 py-3 px-5 overflow-x-auto fade-up-4"
                        style={{
                            background: "rgba(250, 247, 242, 0.92)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            borderBottom: "1px solid var(--border)",
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                    >
                        <div
                            style={{
                                maxWidth: 680,
                                margin: "0 auto",
                                display: "flex",
                                gap: 8,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {menuData.map((cat) => (
                                <button
                                    key={cat.id}
                                    data-id={cat.id}
                                    onClick={() => scrollToCategory(cat.id)}
                                    className={activeCategory === cat.id ? "nav-pill-active" : ""}
                                    style={{
                                        padding: "6px 16px",
                                        borderRadius: 999,
                                        border: "1px solid var(--border2)",
                                        background: activeCategory === cat.id ? "var(--accent)" : "var(--card)",
                                        color: activeCategory === cat.id ? "white" : "var(--text2)",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        fontFamily: "Inter, sans-serif",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        flexShrink: 0,
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Main content ─────────────────────────────────────────────────────── */}
                <main style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px 80px" }}>

                    {menuData.length === 0 ? (
                        /* Empty state */
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "80px 0",
                                textAlign: "center",
                            }}
                        >
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 20,
                                    background: "var(--accentlt)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <UtensilsCrossed size={28} style={{ color: "var(--accent)" }} />
                            </div>
                            <p className="font-syne" style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                                Menu coming soon
                            </p>
                            <p style={{ fontSize: 14, color: "var(--text2)" }}>
                                {hotel.name} is still setting up their digital menu.
                            </p>
                        </div>
                    ) : isSearching ? (
                        <SearchResults results={searchResults} query={searchQuery.trim()} />
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
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

                {/* ── Footer ──────────────────────────────────────────────────────────── */}
                <footer
                    style={{
                        borderTop: "1px solid var(--border)",
                        padding: "20px",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <p style={{ fontSize: 12, color: "var(--text3)" }}>
                        Prices are inclusive of all taxes. Menu may vary.
                    </p>
                    <ScanifyBadge />
                </footer>

            </div>
        </>
    );
}