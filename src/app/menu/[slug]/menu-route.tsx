// Shared implementation for the two public menu routes:
//
//   /menu/<hotel-slug>              -> the hotel's primary menu
//   /menu/<hotel-slug>/<menu-slug>  -> a specific menu
//
// which the proxy serves as menu.<domain>/<hotel-slug>[/<menu-slug>].
//
// The loader is deliberately separate from the view, and each page awaits the
// loader itself rather than rendering an async child that fetches. notFound()
// has to be reached BEFORE the response starts streaming: thrown from a nested
// async server component it arrives too late to set the status, and a missing
// menu answers 200 with 404 content — which search engines would index and
// uptime checks would treat as healthy.

import type { Metadata } from "next";
import { Suspense } from "react";

import { fetchMenuPage } from "../../../features/menu/services/menu.service";
import { buildThemeTokens, buildThemeStyleTag } from "../../../features/menu/utils/theme";
import MenuPageClient from "../../../features/menu/pages/MenuPageClient";
import { MenuPageSkeleton } from "../../../features/menu/components/MenuSkeleton";
import type { MenuPageData } from "../../../features/menu/types";

export async function buildMenuMetadata(
    slug: string,
    menuSlug?: string
): Promise<Metadata> {
    try {
        const { hotel, activeMenu, menus } = await fetchMenuPage(slug, menuSlug);

        // Only qualify the title when the hotel actually has more than one
        // menu — "Spice Route Menu" reads better than "Spice Route — Main Menu"
        // for the common single-menu case.
        const title =
            menus.length > 1
                ? `${hotel.name} — ${activeMenu.name}`
                : `${hotel.name} Menu`;

        return {
            title,
            description: hotel.description ?? `Browse the menu at ${hotel.name}`,
            openGraph: {
                title: `${title} — Digital Menu`,
                description: hotel.description ?? undefined,
                images: hotel.cover_image_url
                    ? [hotel.cover_image_url]
                    : hotel.logo_url
                        ? [hotel.logo_url]
                        : [],
            },
        };
    } catch {
        return { title: "Menu" };
    }
}

/** Returns null when the hotel or menu doesn't exist, so the page can 404. */
export async function loadMenuRoute(
    slug: string,
    menuSlug?: string
): Promise<MenuPageData | null> {
    try {
        return await fetchMenuPage(slug, menuSlug);
    } catch {
        return null;
    }
}

export function MenuRouteView({
    data,
    slug,
    menuSlug,
    qr,
}: {
    data: MenuPageData;
    slug: string;
    menuSlug?: string;
    qr?: string;
}) {
    const themeTokens = buildThemeTokens(data.customization);
    const themeStyle = buildThemeStyleTag(themeTokens);

    return (
        <>
            <div dangerouslySetInnerHTML={{ __html: themeStyle }} />

            <Suspense fallback={<MenuPageSkeleton />}>
                <MenuPageClient
                    data={data}
                    slug={slug}
                    menuSlug={menuSlug}
                    qrCodeId={qr}
                />
            </Suspense>
        </>
    );
}
