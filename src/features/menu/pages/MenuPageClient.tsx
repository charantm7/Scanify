"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import { RestaurantHeader } from "../components/RestaurantHeader";
import { CategoryNav } from "../components/CategoryNav";
import { CategorySection } from "../components/CategorySection";
import { DishModal } from "../components/DishModal";
import { MenuFooter } from "../components/MenuFooter";
import { EmptyMenu, SearchEmpty } from "../components/EmptyStates";
import { ItemCard } from "../components/ItemCard";

import { useMenuUI } from "../hooks/useMenuUI";
import { buildThemeTokens } from "../utils/theme";
import { searchMenu } from "../utils/search";
import { QUERY_KEYS } from "../constant";

import type { MenuPageData, MenuItem } from "../types";

interface MenuPageClientProps {
    data: MenuPageData;
    slug: string;
    qrCodeId?: string;
}

export default function MenuPageClient({
    data,
    slug,
    qrCodeId,
}: MenuPageClientProps) {

    const { categories, customization, hotel } = data;
    const [accesstype, setAccesstype] = useState("page_view")

    if (qrCodeId) setAccesstype('qr_scan');

    const qc = useQueryClient();
    useEffect(() => {
        qc.setQueryData(QUERY_KEYS.menuPage(slug), data);
    }, [qc, slug, data]);


    const themeTokens = useMemo(
        () => buildThemeTokens(customization),
        [customization]
    );

    const {
        searchQuery,
        setSearchQuery,
        isSearching,
        activeCategory,
        scrollToCategory,
        getSectionRef,
        navRef,
        selectedItemId,
        openItemModal,
        closeItemModal,
    } = useMenuUI(categories);


    const searchResults = useMemo(
        () => searchMenu(categories, searchQuery),
        [categories, searchQuery]
    );

    const selectedItem = useMemo((): MenuItem | undefined => {
        if (!selectedItemId) return undefined;
        for (const cat of categories) {
            const found = cat.items.find((i) => i.id === selectedItemId);
            if (found) return found;
        }
        return undefined;
    }, [selectedItemId, categories]);

    useEffect(() => {
        fetch("/api/menu/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                hotel_id: hotel.id,
                event_type: accesstype,
                qr_code_id: qrCodeId,
                metadata: { referrer: document.referrer, ua: navigator.userAgent },

            }),
        }).catch(() => {/* fire and forget */ });
    }, [hotel.id, qrCodeId]);

    // track Item click and save it in menuscan
    const handleItemClick = useCallback(
        (itemId: string) => {
            openItemModal(itemId);
            const sessionId = sessionStorage.getItem("scanify_session") ?? "";
            fetch("/api/menu/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hotel_id: hotel.id,
                    event_type: "item_modal_open",
                    item_id: itemId,
                    session_id: sessionId,
                }),
            }).catch(() => { });
        },
        [hotel.id, openItemModal]
    );


    return (
        <div
            className="min-h-screen"
            style={{
                ...(themeTokens as React.CSSProperties),
                background: "var(--color-bg)",
                fontFamily: "var(--font-family)",
                color: "var(--color-text)",
            }}
        >

            <RestaurantHeader
                hotel={hotel}
                customization={customization}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* ── Category Nav ──────────────────────────────────────────────────── */}
            {!isSearching && (
                <CategoryNav
                    categories={categories}
                    activeId={activeCategory}
                    style={customization.category_style}
                    navRef={navRef}
                    onSelect={scrollToCategory}
                />
            )}

            <main
                className="max-w-[680px] mx-auto px-5 pb-24 pt-9"
                id="menu-content"
                aria-label="Menu"
            >
                <AnimatePresence mode="wait">
                    {/* Empty menu */}
                    {categories.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <EmptyMenu hotelName={hotel.name} />
                        </motion.div>

                    ) : isSearching ? (
                        /* Search results */
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            {searchResults.length === 0 ? (
                                <SearchEmpty query={searchQuery.trim()} />
                            ) : (
                                <div className="space-y-3">
                                    <p
                                        className="text-xs font-semibold"
                                        style={{ color: "var(--color-muted)" }}
                                    >
                                        {searchResults.length} result
                                        {searchResults.length !== 1 ? "s" : ""} for &ldquo;
                                        {searchQuery.trim()}&rdquo;
                                    </p>
                                    <div
                                        className={
                                            customization.menu_layout === "card"
                                                ? "grid grid-cols-2 gap-3"
                                                : customization.menu_layout === "list"
                                                    ? "flex flex-col"
                                                    : "grid gap-3 sm:grid-cols-2"
                                        }
                                    >
                                        {searchResults.map(({ item }) => (
                                            <ItemCard
                                                key={item.id}
                                                item={item}
                                                onClick={handleItemClick}
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
                                </div>
                            )}
                        </motion.div>

                    ) : (
                        /* Full category list */
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col gap-8"
                        >
                            {categories.map((cat) => (
                                <CategorySection
                                    key={cat.id}
                                    category={cat}
                                    sectionRef={getSectionRef(cat.id)}
                                    onItemClick={handleItemClick}
                                    customization={customization}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <MenuFooter showBadge={customization.show_scanify_badge} />


            <DishModal
                item={selectedItem}
                isOpen={!!selectedItemId}
                onClose={closeItemModal}
                currency={hotel.currency === "INR" ? "₹" : hotel.currency}
            />
        </div>
    );
}