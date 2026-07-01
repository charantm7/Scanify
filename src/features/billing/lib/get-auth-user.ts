// lib/get-auth-user.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';

/**
 * Resolves the authenticated Supabase user from the request's session
 * cookies. Returns null if not authenticated. Use this inside route
 * handlers — never trust a user_id passed in the request body, since
 * that can be spoofed by the client.
 */
export async function getAuthUser(req: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Not needed for read-only auth checks inside API routes.
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}
