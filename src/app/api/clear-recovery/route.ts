import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ success: true });

    res.cookies.set('recovery_flow', '', {
        maxAge: 0,
    })

    return res;

}