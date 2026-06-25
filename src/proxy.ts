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
    path: string
): NextResponse => NextResponse.redirect(new URL(path, request.url))

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
            return redirect(request, '/login')
        }
        return response;
    }


    const isProtected = matchesRoute(pathname, PROTECTED_ROUTES);
    const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES);

    if (isProtected && !user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Authenticated user on auth pages → bounce to console
    if (user && isAuthRoute) {
        return redirect(request, '/console');
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)',
    ],
};