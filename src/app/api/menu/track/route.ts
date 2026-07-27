
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import type { MenuScanEvent } from "../../../../features/menu/types";


const ALLOWED_EVENTS: MenuScanEvent["event_type"][] = [
    "page_view",
    "search",
    "category_click",
    "item_view",
    "item_modal_open",
    "qr_scan",
];

export async function POST(req: NextRequest) {
    try {

        const body = (await req.json()) as Partial<MenuScanEvent>;

        if (!body.hotel_id || !body.event_type) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        if (!ALLOWED_EVENTS.includes(body.event_type)) {
            return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
        }


        const supabase = await createClient();
        await supabase
            .from("menu_scans")
            .insert({
                hotel_id: body.hotel_id,
                qr_code_id: body.qr_code_id ?? null,
                item_id: body.item_id ?? null,
                event_type: body.event_type,
                metadata: body.metadata ?? null,
                session_id: body.session_id ?? null,
                scanned_at: new Date().toISOString(),
                user_agent: req.headers.get("user-agent"),
                referrer: req.headers.get("referer"),
            });


        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[menu/track]", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}