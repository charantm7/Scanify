
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
    DBMenu,
    MenuSummary,
    MenuCategory,
    MenuItem,
    MenuScanEvent,
} from "../types";

/** Distinguishes "no such hotel" from "that hotel has no such menu". */
export class MenuNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MenuNotFoundError";
    }
}

function notFound(message: string): never {
    throw new MenuNotFoundError(message);
}

function toSummary(menu: DBMenu): MenuSummary {
    return {
        id: menu.id,
        name: menu.name,
        slug: menu.slug,
        is_primary: menu.is_primary,
    };
}

/**
 * Loads one menu of one hotel for the public page.
 *
 * `menuSlug` omitted means "the hotel's primary menu", which is what
 * menu.<domain>/<hotel-slug> serves and what every existing QR code encodes.
 */
export async function fetchMenuPage(
    slug: string,
    menuSlug?: string
): Promise<MenuPageData> {
    const supabase = await createClient();

    // 1. Hotel.
    //
    // `deleted_at` matters as much as `is_active` here: deleting an account
    // sets deleted_at but leaves is_active alone, so filtering only on
    // is_active kept serving the menus of closed accounts.
    const { data: hotel, error: hotelErr } = await supabase
        .from("hotels")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .is("deleted_at", null)
        .single<DBHotel>();

    if (hotelErr || !hotel) notFound(`Hotel not found: ${slug}`);

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

    // 3. Menus. The RLS policy already restricts this to menus that are
    // active, not parked by a downgrade and not soft-deleted; the filters are
    // repeated so the behaviour is legible here and correct if the policy is
    // ever relaxed.
    const { data: rawMenus, error: menusErr } = await supabase
        .from("menus")
        .select("*")
        .eq("hotel_id", hotel.id)
        .eq("is_active", true)
        .eq("hidden_by_plan", false)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

    if (menusErr) throw menusErr;
    const menus = (rawMenus ?? []) as DBMenu[];

    if (menus.length === 0) {
        notFound(`No published menu for hotel: ${slug}`);
    }

    const activeMenuRow = menuSlug
        ? menus.find((m) => m.slug === menuSlug)
        : (menus.find((m) => m.is_primary) ?? menus[0]);

    // An unknown or unpublished menu slug is a 404 rather than a silent
    // fallback to the primary menu: quietly serving different content than the
    // URL asked for would let a stale QR code point at the wrong menu without
    // anyone noticing.
    if (!activeMenuRow) {
        notFound(`Menu not found: ${slug}/${menuSlug}`);
    }

    const summaries = menus.map(toSummary);
    const activeMenu = toSummary(activeMenuRow);

    const emptyResult: MenuPageData = {
        hotel,
        categories: [],
        customization,
        menus: summaries,
        activeMenu,
    };

    // 4. Categories — scoped to the active menu
    const { data: rawCats, error: catsErr } = await supabase
        .from("categories")
        .select("*")
        .eq("menu_id", activeMenuRow.id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

    if (catsErr) throw catsErr;
    const cats = (rawCats ?? []) as DBCategory[];

    if (cats.length === 0) return emptyResult;

    const catIds = cats.map((c) => c.id);

    // 5. Menu items.
    //
    // `hidden_by_plan` items are excluded: those are the overflow a plan
    // downgrade took out of service, and they must not appear to diners even
    // though the owner can still see and re-pick them in the builder.
    const { data: rawItems, error: itemsErr } = await supabase
        .from("menu_items")
        .select("*")
        .in("category_id", catIds)
        .eq("hidden_by_plan", false)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

    if (itemsErr) throw itemsErr;
    const items = (rawItems ?? []) as DBMenuItem[];

    const itemIds = items.map((i) => i.id);

    // 6. Item images
    const { data: rawImages } = itemIds.length
        ? await supabase
            .from("menu_item_images")
            .select("*")
            .in("item_id", itemIds)
            .order("sort_order", { ascending: true })
        : { data: [] };

    const images = (rawImages ?? []) as DBMenuItemImage[];

    // 7. Build lookup maps
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

    // 8. Assemble
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

    return {
        hotel,
        categories: nonEmptyCats,
        customization,
        menus: summaries,
        activeMenu,
    };
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
