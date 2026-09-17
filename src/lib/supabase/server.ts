import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "../../types/database.types";
import { COOKIE_DOMAIN } from "../domains";

// creates session based client to request the database before rendering the page

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            // Must match the browser client, or a session written server-side
            // would be invisible on the other subdomains.
            ...(COOKIE_DOMAIN ? { cookieOptions: { domain: COOKIE_DOMAIN } } : {}),
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        try {
                            cookieStore.set(name, value, options);
                        } catch (e) {
                            // ignore if not allowed (like during SSR streaming)
                        }
                    });
                },
            },
        }
    );
}