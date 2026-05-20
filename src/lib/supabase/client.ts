'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../../types/database.types';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Create browser client (singleton)
// Used to query the database after page render
export function getSupabaseClient() {

    if (!client) {
        client = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
    }
    return client;
}