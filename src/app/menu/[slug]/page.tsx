// app/[slug]/page.js
// Public-facing menu page — no auth required.

import { createClient } from "../../../lib/supabase/server";
import { notFound } from "next/navigation";
import MenuPageClient from "../../../components/menu/MenuPageClient";

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

export default async function MenuPage({ params, searchParams, }) {
    const { slug, } = await params;
    const resolvedSearchParams = await searchParams;

    const qrId = resolvedSearchParams?.qr;
    const supabase = await createClient();

    // Fetch hotel
    const { data: hotel } = await supabase
        .from("hotels")
        .select("id, name, description, owner_id, logo_url, address, slug")
        .eq("slug", slug)
        .maybeSingle();

    if (!hotel) return notFound();

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('trial_ends_at, status')
        .eq('user_id', hotel.owner_id)
        .maybeSingle();

    if (!subscription) return notFound();

    const now = new Date();

    const accessible =
        (subscription.status === 'active' || subscription.status === 'trialing') &&
        (
            !subscription.trial_ends_at ||
            new Date(subscription.trial_ends_at) > now
        );

    if (!accessible) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 bg-white">
                <div className="text-center max-w-md">
                    <h2 className="text-sm font-semibold tracking-wider uppercase text-orange-500">
                        Scanify
                    </h2>

                    <h1 className="mt-3 text-2xl font-bold text-gray-900">
                        Menu Temporarily Unavailable
                    </h1>

                    <p className="mt-3 text-gray-500">
                        This restaurant's digital menu is currently unavailable.
                        Please contact the restaurant staff.
                    </p>

                    <p className="mt-8 text-xs text-gray-400">
                        Powered by <span className="font-medium text-orange-500">Scanify</span>
                    </p>
                </div>
            </div>
        );
    }


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

    const { data: qrcode } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', qrId)
        .maybeSingle()
    // Log scan (fire-and-forget — don't block render)
    if (qrId) {
        supabase
            .from("menu_scans")
            .insert({
                hotel_id: hotel.id,
                qr_code_id: qrId || null,
                metadata: { 'label': qrcode.label, 'scan_count': qrcode.scan_count }
            })
            .then(() => { });
    } else {
        supabase
            .from("menu_scans")
            .insert({
                hotel_id: hotel.id,
                qr_code_id: qrId || null,
                event_type: 'menu_view',
            })
            .then(() => { });
    }


    // Group items by category
    const menuData = (categories ?? []).map((cat) => ({
        ...cat,
        items: (items ?? []).filter((item) => item.category_id === cat.id),
    })).filter((cat) => cat.items.length > 0);

    return <MenuPageClient hotel={hotel} menuData={menuData} />;
}