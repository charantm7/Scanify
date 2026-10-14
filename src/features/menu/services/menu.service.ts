
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
    MenuEntitlements,
    MenuScanEvent,
} from "../types";
import { applyPlanPresentation } from "../utils/plan-presentation";

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

import type { SupabaseClient } from "@supabase/supabase-js";



export function createMenuFetcher(
    supabase: SupabaseClient,
    slug: string
) {
    return {

        fetchHotel: () =>
            supabase
                .from("hotels")
                .select("*")
                .eq("slug", slug)
                .eq("is_active", true)
                .is("deleted_at", null)
                .maybeSingle<DBHotel>(),


        fetchEntitlements: (hotelId: string) =>
            supabase
                .from("hotel_entitlements")
                .select('*')
                .eq("hotel_id", hotelId)
                .maybeSingle(),


        fetchCustomization: (hotelId: string) =>
            supabase
                .from("menu_customizations")
                .select("*")
                .eq("hotel_id", hotelId)
                .maybeSingle<DBMenuCustomization>(),


        fetchMenus: (hotelId: string) =>
            supabase
                .from("menus")
                .select("*")
                .eq("hotel_id", hotelId)
                .eq("is_active", true)
                .eq("hidden_by_plan", false)
                .is("deleted_at", null)
                .order("sort_order", {
                    ascending: true,
                }),


        fetchCategories: (menuIds: string[]) =>
            supabase
                .from("categories")
                .select("*")
                .in("menu_id", menuIds)
                .eq("is_active", true)
                .is("deleted_at", null)
                .order("sort_order", {
                    ascending: true,
                }),

        fetchItems: (categoryIds: string[]) => {
            if (categoryIds.length === 0) {
                return Promise.resolve({
                    data: [] as DBMenuItem[],
                    error: null,
                });
            }

            return supabase
                .from("menu_items")
                .select("*")
                .in("category_id", categoryIds)
                .eq("hidden_by_plan", false)
                .is("deleted_at", null)
                .order("sort_order", {
                    ascending: true,
                })
        },


        fetchItemImages: (itemIds: string[]) => {
            if (itemIds.length === 0) {
                return Promise.resolve({
                    data: [] as DBMenuItemImage[],
                    error: null,
                });
            }

            return supabase
                .from("menu_item_images")
                .select("*")
                .in("item_id", itemIds)
                .order("sort_order", {
                    ascending: true,
                })
        },
    };
}

export async function fetchHotelMetadata(slug: string, menuSlug: string) {
    const supabase = await createClient();

    const fetcher = createMenuFetcher(supabase, slug);

    const { data: hotel, error: hotelErr } = await fetcher.fetchHotel();

    if (hotelErr || !hotel) notFound(`Hotel not found: ${slug}`);

    const { data: menus, error: menusErr } = await fetcher.fetchMenus(hotel?.id);
    if (menusErr) throw menusErr;
    if (menus.length === 0) notFound(`No published menu for hotel: ${slug}`);

    const activeMenuRow = menuSlug
        ? menus.find((m) => m.slug === menuSlug)
        : (menus.find((m) => m.is_primary) ?? menus[0]);

    const activeMenu = toSummary(activeMenuRow);
    const summaries = menus.map(toSummary)

    return {
        hotel,
        menus: summaries,
        activeMenu
    }
}

export async function fetchMenuPage(
    slug: string,
    menuSlug?: string
): Promise<MenuPageData> {
    const supabase = await createClient();

    const fetcher = createMenuFetcher(supabase, slug);

    const { data: hotel, error: hotelErr } = await fetcher.fetchHotel();

    if (hotelErr || !hotel) notFound(`Hotel not found: ${slug}`);

    const [
        { data: entitlementRows, error: entitlementErr },
        { data: customizationRow, error: customizationErr },
        { data: rawMenus, error: menusErr },
    ] = await Promise.all([
        fetcher.fetchEntitlements(hotel.id),
        fetcher.fetchCustomization(hotel.id),
        fetcher.fetchMenus(hotel.id),
    ]);

    if (entitlementErr) {
        console.error(
            "[fetchMenuPage] entitlement lookup failed:",
            entitlementErr
        );
    }

    if (customizationErr) {
        console.error(
            "[fetchMenuPage] customization lookup failed:",
            customizationErr
        );
    }

    if (menusErr) {
        throw menusErr;
    }

    const entitlements: MenuEntitlements | null =
        (Array.isArray(entitlementRows) ? entitlementRows[0] : entitlementRows) ?? null;

    const customization: DBMenuCustomization = customizationRow ?? {
        id: "",
        hotel_id: hotel.id,
        created_at: "",
        updated_at: "",
        ...DEFAULT_CUSTOMIZATION,
    };

    const menus = (rawMenus ?? []) as DBMenu[];

    if (menus.length === 0) {
        notFound(`No published menu for hotel: ${slug}`);
    }
    const activeMenuRow = menuSlug
        ? menus.find((m) => m.slug === menuSlug)
        : (menus.find((m) => m.is_primary) ?? menus[0]);


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
        entitlements,
    };

    const menuIds = menus.map((i) => i.id)
    const { data: rawCats, error: catsErr } = await fetcher.fetchCategories(menuIds);

    if (catsErr) throw catsErr;
    const cats = (rawCats ?? []) as DBCategory[];

    if (cats.length === 0) return emptyResult;

    const catIds = cats.map((c) => c.id);

    const { data: rawItems, error: itemsErr } = await fetcher.fetchItems(catIds);

    if (itemsErr) throw itemsErr;
    const items = (rawItems ?? []) as DBMenuItem[];

    const itemIds = items.map((i) => i.id);

    const { data: rawImages } = itemIds.length
        ? await fetcher.fetchItemImages(itemIds)
        : { data: [] };

    const images = (rawImages ?? []) as DBMenuItemImage[];

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

    const presented = applyPlanPresentation(nonEmptyCats, entitlements);

    console.log(presented)

    return {
        hotel,
        categories: presented,
        customization,
        menus: summaries,
        activeMenu,
        entitlements,
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
