import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/console', '/onboarding'];
const AUTH_ROUTES = ['/login', '/forget-password', '/check-mail'];
const PUBLIC_ROUTES = ['/menu'];

export async function middleware(request) {
    const url = request.nextUrl
    const pathname = url.pathname

    const isPublic = pathname.startsWith('/menu')

    if (isPublic) {
        return NextResponse.next();
    }

    let response = NextResponse.next({
        request: { headers: request.headers },
    });



    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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
            return NextResponse.redirect(new URL('/login', request.url))
        }
        return NextResponse.next()
    }


    const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

    if (isProtected && !user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Authenticated user on auth pages → bounce to console
    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL('/console', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)',
    ],
};