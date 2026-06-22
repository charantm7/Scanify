// features/menu/services/menu.service.ts
// All Supabase reads for the public menu page.
// Aligned with the actual database schema.

import { createClient } from "../../../lib/supabase/server";
import type { Json } from "../../../types/database.types";
import { DEFAULT_CUSTOMIZATION } from "../constant";
import type {
    MenuPageData,
    DBHotel,
    DBCategory,
    DBMenuItem,
    DBMenuItemImage,
    DBMenuCustomization,
    MenuCategory,
    MenuItem,
    MenuScanEvent,
} from "../types";

function notFound(slug: string): never {
    throw new Error(`Hotel not found: ${slug}`);
}

export async function fetchMenuPage(slug: string): Promise<MenuPageData> {
    const supabase = await createClient();

    // 1. Hotel — is_active check; no deleted_at on hotels in real DB filter needed
    const { data: hotel, error: hotelErr } = await supabase
        .from("hotels")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single<DBHotel>();

    if (hotelErr || !hotel) notFound(slug);

    // 2. Customization — falls back to defaults if not configured yet
    const { data: customizationRow } = await supabase
        .from("menu_customizations")
        .select("*")
        .eq("hotel_id", hotel.id)
        .maybeSingle<DBMenuCustomization>();

    const customization: DBMenuCustomization = customizationRow ?? {
        id: "",
        hotel_id: hotel.id,
        created_at: "",
        updated_at: "",
        ...DEFAULT_CUSTOMIZATION,
    };

    // 3. Categories — is_active exists on categories; deleted_at also exists
    const { data: rawCats, error: catsErr } = await supabase
        .from("categories")
        .select("*")
        .eq("hotel_id", hotel.id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

    if (catsErr) throw catsErr;
    const cats = (rawCats ?? []) as DBCategory[];

    if (cats.length === 0) {
        return { hotel, categories: [], customization };
    }

    const catIds = cats.map((c) => c.id);

    // 4. Menu items — deleted_at exists on menu_items
    const { data: rawItems, error: itemsErr } = await supabase
        .from("menu_items")
        .select("*")
        .in("category_id", catIds)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

    if (itemsErr) throw itemsErr;
    const items = (rawItems ?? []) as DBMenuItem[];

    const itemIds = items.map((i) => i.id);

    // 5. Item images
    const { data: rawImages } = itemIds.length
        ? await supabase
            .from("menu_item_images")
            .select("*")
            .in("item_id", itemIds)
            .order("sort_order", { ascending: true })
        : { data: [] };

    const images = (rawImages ?? []) as DBMenuItemImage[];

    // 6. Build lookup maps
    const imagesByItem = images.reduce<Record<string, DBMenuItemImage[]>>(
        (acc, img) => {
            (acc[img.item_id] ??= []).push(img);
            return acc;
        },
        {}
    );

    const itemsByCategory = items.reduce<Record<string, DBMenuItem[]>>(
        (acc, item) => {
            (acc[item.category_id] ??= []).push(item);
            return acc;
        },
        {}
    );

    // 7. Assemble
    const categories: MenuCategory[] = cats.map((cat) => {
        const catItems = itemsByCategory[cat.id] ?? [];

        const enrichedItems: MenuItem[] = catItems.map((item) => ({
            ...item,
            images: imagesByItem[item.id] ?? [],
        }));

        // available first
        const sorted = [
            ...enrichedItems.filter((i) => i.is_available),
            ...enrichedItems.filter((i) => !i.is_available),
        ];

        return { ...cat, items: sorted };
    });

    const nonEmptyCats = categories.filter((c) => c.items.length > 0);

    return { hotel, categories: nonEmptyCats, customization };
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export async function trackMenuEvent(event: MenuScanEvent): Promise<void> {
    const supabase = await createClient();
    await supabase.from("menu_scans").insert({
        hotel_id: event.hotel_id,
        qr_code_id: event.qr_code_id ?? null,
        item_id: event.item_id ?? null,
        event_type: event.event_type,
        metadata: (event.metadata ?? null) as Json | null,
        scanned_at: new Date().toISOString(),
        session_id: event.session_id ?? null,
    });
}