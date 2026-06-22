// app/api/menu/[slug]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Client-side data refresh endpoint used by React Query for stale revalidation.
// Returns the same MenuPageData shape as the SSR loader.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { fetchMenuPage } from "../../../../features/menu/services/menu.service";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        const data = await fetchMenuPage(slug);
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
            },
        });
    } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}
