import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuRouteView, buildMenuMetadata, loadMenuRoute } from "./menu-route";

export const revalidate = 60;

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ qr?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    return buildMenuMetadata(slug);
}

/** The hotel's primary menu — what every existing QR code points at. */
export default async function MenuPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { qr } = await searchParams;

    // Awaited here, not in a child component, so a 404 is a real 404.
    const data = await loadMenuRoute(slug);
    if (!data) notFound();

    return <MenuRouteView data={data} slug={slug} qr={qr} />;
}
