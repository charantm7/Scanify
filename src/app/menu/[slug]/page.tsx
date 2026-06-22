// app/menu/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Server Component: runs at request time, fetches all data from Supabase,
// injects theme CSS variables server-side (no FOUC), passes typed props to
// the client component.
// ─────────────────────────────────────────────────────────────────────────────

import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";

import { fetchMenuPage } from "../../../features/menu/services/menu.service";
import { buildThemeTokens, buildThemeStyleTag } from "../../../features/menu/utils/theme";
import MenuPageClient from "../../../features/menu/pages/MenuPageClient";
import { MenuPageSkeleton } from "../../../features/menu/components/MenuSkeleton";

// ── Static generation ─────────────────────────────────────────────────────────
// Pages are ISR: revalidate every 60 s so menu changes propagate quickly.
export const revalidate = 60;

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ qr?: string }>;
}

// ── Dynamic metadata ──────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;

    try {
        const { hotel } = await fetchMenuPage(slug);
        return {
            title: `${hotel.name} Menu`,
            description: hotel.description ?? `Browse the menu at ${hotel.name}`,
            openGraph: {
                title: `${hotel.name} — Digital Menu`,
                description: hotel.description ?? undefined,
                images: hotel.cover_image_url ? [hotel.cover_image_url] : hotel.logo_url ? [hotel.logo_url] : [],
            },
        };
    } catch {
        return { title: "Menu" };
    }
}

// ── Page component ────────────────────────────────────────────────────────────
export default async function MenuPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { qr } = await searchParams;

    let data;
    try {
        data = await fetchMenuPage(slug);
    } catch {
        notFound();
    }

    // Build theme tokens on the server so variables are available immediately —
    // prevents the flash of unstyled content that would occur if the client
    // had to wait for JS hydration before applying colours.
    const themeTokens = buildThemeTokens(data.customization);
    const themeStyle = buildThemeStyleTag(themeTokens);

    return (
        <>
            {/* Server-injected theme tokens */}
            {/* eslint-disable-next-line react/no-danger */}
            <div dangerouslySetInnerHTML={{ __html: themeStyle }} />

            <Suspense fallback={<MenuPageSkeleton />}>
                <MenuPageClient data={data} slug={slug} qrCodeId={qr} />
            </Suspense>
        </>
    );
}