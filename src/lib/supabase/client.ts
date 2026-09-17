'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../../types/database.types';
import { COOKIE_DOMAIN } from '../domains';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Create browser client (singleton)
// Used to query the database after page render
export function getSupabaseClient() {

    if (!client) {
        client = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            // Scoped to `.scanify.co.in` so the session survives the hop
            // between the landing site and dashboard./menu. subdomains. Left
            // undefined locally, where cookies stay host-only on localhost.
            COOKIE_DOMAIN ? { cookieOptions: { domain: COOKIE_DOMAIN } } : undefined
        );
    }
    return client;
}
