import { createServerClient } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/console', '/onboarding'] as const;
const AUTH_ROUTES = ['/login', '/forget-password', '/check-mail'] as const;

const matchesRoute = (
    pathname: string,
    routes: readonly string[]
): boolean => routes.some(route => pathname.startsWith(route))

const redirect = (
    request: NextRequest,
    path: string,
    reason?: string
): NextResponse => {
    const redirectUrl = new URL(path, request.url);
    if (reason) redirectUrl.searchParams.set('reason', reason);
    return NextResponse.redirect(redirectUrl);
};


export async function proxy(request: NextRequest): Promise<NextResponse> {
    const url = request.nextUrl
    const pathname = url.pathname

    const isPublic = pathname.startsWith('/menu')

    if (isPublic) {
        return NextResponse.next();
    }

    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!(supabaseUrl && supabaseAnonKey)) {
        throw new Error('Missing Supabase environment variables');
    }


    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (cookiesToSet: {
                    name: string;
                    value: string;
                    options?: Record<string, unknown>;
                }[]) => {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (pathname.startsWith('/reset-password')) {
        const hasRecoveryCookie = request.cookies.get('recovery_flow')

        if (!user || !hasRecoveryCookie) {
            return redirect(request, '/login', 'reset_password_cookie_failed')
        }
        return response;
    }

    const isProtected = matchesRoute(pathname, PROTECTED_ROUTES);
    const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES);

    if (!user) {
        if (isProtected) {
            const loginUrl = request.nextUrl.clone();
            loginUrl.pathname = '/login';
            loginUrl.searchParams.set('next', pathname);
            
            return NextResponse.redirect(loginUrl);
        }
        return response;
    }

    // Authenticated user on auth pages → bounce to console
    if (isAuthRoute) {
        return redirect(request, '/console');
    }

    const { data: hotelData, error: hotelError } = await supabase
        .from('hotels')
        .select('id, is_active, deleted_at')
        .eq('owner_id', user.id)
        .maybeSingle();

    if (hotelError) {
        return redirect(request, '/login', 'hotel_lookup_failed');
    }

    if (!hotelData) {
        if (pathname.startsWith('/onboarding')) {
            return response;
        }
        return redirect(request, '/onboarding');
    }

    if (hotelData.deleted_at) {
        await supabase.auth.signOut();
        return redirect(request, '/login', 'account_deleted');
    }


    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)',
    ],
};