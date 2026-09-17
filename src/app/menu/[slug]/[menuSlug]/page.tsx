import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuRouteView, buildMenuMetadata, loadMenuRoute } from "../menu-route";

export const revalidate = 60;

interface PageProps {
    params: Promise<{ slug: string; menuSlug: string }>;
    searchParams: Promise<{ qr?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, menuSlug } = await params;
    return buildMenuMetadata(slug, menuSlug);
}

/** One named menu, e.g. menu.<domain>/spice-route/drinks */
export default async function HotelMenuPage({ params, searchParams }: PageProps) {
    const { slug, menuSlug } = await params;
    const { qr } = await searchParams;

    const data = await loadMenuRoute(slug, menuSlug);
    if (!data) notFound();

    return <MenuRouteView data={data} slug={slug} menuSlug={menuSlug} qr={qr} />;
}
