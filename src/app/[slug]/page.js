// app/[slug]/page.js
// Public-facing menu page — no auth required.

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import MenuPageClient from "@/components/menu/MenuPageClient";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: hotel } = await supabase
        .from("hotels")
        .select("name, description, logo_url")
        .eq("slug", slug)
        .maybeSingle();

    if (!hotel) return { title: "Menu Not Found" };

    return {
        title: `${hotel.name} — Menu`,
        description: hotel.description || `Browse the menu at ${hotel.name}`,
        openGraph: {
            title: `${hotel.name} — Menu`,
            description: hotel.description || `Browse the digital menu at ${hotel.name}`,
            images: hotel.logo_url ? [hotel.logo_url] : [],
        },
    };
}

export default async function MenuPage({ params }) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch hotel
    const { data: hotel } = await supabase
        .from("hotels")
        .select("id, name, description, logo_url, address, slug")
        .eq("slug", slug)
        .maybeSingle();

    if (!hotel) return notFound();

    // Fetch categories
    const { data: categories } = await supabase
        .from("categories")
        .select("id, name, sort_order")
        .eq("hotel_id", hotel.id)
        .order("sort_order", { ascending: true });

    // Fetch available menu items only
    const { data: items } = await supabase
        .from("menu_items")
        .select("id, name, description, price, image_url, is_available, sort_order, category_id")
        .eq("hotel_id", hotel.id)
        .eq("is_available", true)
        .order("sort_order", { ascending: true });

    // Log scan (fire-and-forget — don't block render)
    supabase
        .from("menu_scans")
        .insert({ hotel_id: hotel.id, scanned_at: new Date().toISOString() })
        .then(() => { });

    // Group items by category
    const menuData = (categories ?? []).map((cat) => ({
        ...cat,
        items: (items ?? []).filter((item) => item.category_id === cat.id),
    })).filter((cat) => cat.items.length > 0);

    return <MenuPageClient hotel={hotel} menuData={menuData} />;
}