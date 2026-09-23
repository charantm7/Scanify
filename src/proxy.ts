import { createServerClient } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';
import {
    COOKIE_DOMAIN,
    MENU_PATH_PREFIX,
    isDashboardPath,
    isInfrastructurePath,
    isLandingPath,
    resolveSurface,
    surfaceOrigin,
    type AppSurface,
} from './lib/domains';

// Paths that require a signed-in owner.
const PROTECTED_ROUTES = [
    '/overview',
    '/menu-builder',
    '/customization',
    '/qr-codes',
    '/analytics',
    '/billing',
    '/transactions',
    '/settings',
    '/onboarding',
] as const;

const AUTH_ROUTES = ['/login', '/forget-password', '/check-mail'] as const;

/**
 * Caches the "owner has a live hotel" verdict from the database check at the
 * bottom of this file, so it costs one query per TTL rather than one per
 * navigation. Holds the user id, so it cannot be replayed by another session.
 */
const GATE_COOKIE = 'sc_gate';
const GATE_TTL_SECONDS = 300;

function setDashboardGate(response: NextResponse, userId: string): NextResponse {
    response.cookies.set(GATE_COOKIE, userId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: GATE_TTL_SECONDS,
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
    });
    return response;
}

/** Drops the cached verdict so the next request re-checks immediately. */
function clearDashboardGate(response: NextResponse): NextResponse {
    response.cookies.set(GATE_COOKIE, '', {
        path: '/',
        maxAge: 0,
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
    });
    return response;
}

const matchesRoute = (
    pathname: string,
    routes: readonly string[]
): boolean => routes.some(route => pathname === route || pathname.startsWith(`${route}/`))

const redirect = (
    request: NextRequest,
    path: string,
    reason?: string
): NextResponse => {
    const redirectUrl = new URL(path, request.url);
    if (reason) redirectUrl.searchParams.set('reason', reason);
    return NextResponse.redirect(redirectUrl);
};

/** Sends a request to the same path on a different surface's host. */
const redirectToSurface = (
    request: NextRequest,
    surface: Exclude<AppSurface, 'dev'>,
    path?: string
): NextResponse => {
    const target = new URL(path ?? request.nextUrl.pathname, surfaceOrigin(surface));
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target);
};

/**
 * menu.scanify.co.in/<hotel-slug>[/<menu-slug>] is served by the app's
 * /menu/<hotel-slug>[/<menu-slug>] routes. Rewriting (not redirecting) keeps
 * the short, QR-friendly URL in the address bar.
 */
function handleMenuSurface(request: NextRequest): NextResponse {
    const { pathname } = request.nextUrl;

    // Nothing to show at the bare menu host — send visitors to the marketing
    // site rather than a 404.
    if (pathname === '/') {
        return redirectToSurface(request, 'landing', '/');
    }

    // Already prefixed (a direct hit on /menu/... via this host): leave alone
    // so we never produce /menu/menu/...
    if (pathname === MENU_PATH_PREFIX || pathname.startsWith(`${MENU_PATH_PREFIX}/`)) {
        return NextResponse.next();
    }

    // The menu host serves only menus. Anything that looks like an app or
    // marketing path belongs on another surface.
    if (isDashboardPath(pathname) || isLandingPath(pathname)) {
        return redirectToSurface(
            request,
            isDashboardPath(pathname) ? 'overview' : 'landing'
        );
    }

    const url = request.nextUrl.clone();
    url.pathname = `${MENU_PATH_PREFIX}${pathname}`;
    return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
    const url = request.nextUrl
    const pathname = url.pathname

    // Framework internals, API routes and static files are surface-agnostic.
    if (isInfrastructurePath(pathname)) {
        return NextResponse.next();
    }

    const surface = resolveSurface(request.headers.get('host'));

    // ---- Public menu surface: no session needed, no auth cost ----
    if (surface === 'menu') {
        return handleMenuSurface(request);
    }

    // The public menu is also reachable at /menu/... on any surface (useful in
    // local dev, where there are no subdomains). Skip auth for it.
    if (pathname === MENU_PATH_PREFIX || pathname.startsWith(`${MENU_PATH_PREFIX}/`)) {
        return NextResponse.next();
    }

    // ---- Admin console: reserved, not built yet ----
    // Park it on the dashboard rather than 404ing, so the hostname can be
    // pointed at this deployment ahead of the admin app existing.
    if (surface === 'console') {
        return redirectToSurface(request, 'overview', '/overview');
    }

    // ---- Keep each path on its canonical host ----
    if (surface === 'overview') {
        // Bare dashboard host lands on the overview.
        if (pathname === '/') {
            return redirect(request, '/overview');
        }
        if (isLandingPath(pathname)) {
            return redirectToSurface(request, 'landing');
        }
    } else if (surface === 'landing') {
        if (isDashboardPath(pathname)) {
            return redirectToSurface(request, 'overview');
        }
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
            // Matches the browser and server clients so refreshed tokens stay
            // valid across dashboard./menu./apex.
            ...(COOKIE_DOMAIN ? { cookieOptions: { domain: COOKIE_DOMAIN } } : {}),
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

    // `getUser()` calls the Supabase auth server over the network on EVERY
    // request — including every client-side navigation, which fetches an RSC
    // payload through this proxy. `getClaims()` verifies the JWT locally
    // against the project's public signing key (and still refreshes an expired
    // token), so the common case costs no round trip at all.
    //
    // Projects still on the legacy symmetric secret cannot verify offline; the
    // fallback keeps them working unchanged.
    const { data: claimsData } = await supabase.auth.getClaims();
    const claims = claimsData?.claims as
        | {
            sub: string;
            email?: string;
            email_verified?: boolean;
            user_metadata?: { email_verified?: boolean };
        }
        | undefined;

    // `email_verified` is not guaranteed to be in the token (it depends on the
    // project's JWT template), and this is a security check — so when the
    // claim is missing we pay for the authoritative lookup rather than guess.
    const verifiedClaim =
        claims?.email_verified ?? claims?.user_metadata?.email_verified;

    let user: { id: string; email_confirmed_at?: string | null } | null =
        claims && verifiedClaim !== undefined
            ? { id: claims.sub, email_confirmed_at: verifiedClaim ? 'verified' : null }
            : null;

    if (!user) {
        const {
            data: { user: fetched },
        } = await supabase.auth.getUser();
        user = fetched;
    }

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

    // A session with an unconfirmed email (possible whenever "Confirm email"
    // is off in Supabase) must not reach the app. The sign-in form checks
    // this too, but only in the browser, where it can be skipped.
    if (!user.email_confirmed_at) {
        if (isProtected) {
            return redirect(request, '/check-mail', 'email_not_verified');
        }
        return response;
    }

    // Authenticated user on auth pages → bounce to the dashboard
    if (isAuthRoute) {
        return redirect(request, '/overview');
    }

    // Only app routes need the hotel/onboarding checks below. On the landing
    // surface a signed-in visitor is just reading marketing pages.
    if (!isProtected) {
        return response;
    }

    // The hotel check is a full database round trip and it ran on every single
    // protected request — including each RSC fetch behind a tab click, where
    // the answer cannot have changed since a moment ago. A short-lived cookie
    // carries the "this owner has a live hotel" verdict so the query runs once
    // every GATE_TTL_SECONDS instead of once per navigation.
    //
    // Only the passing verdict is cached, and only briefly: onboarding and
    // account deletion both clear it (see clearDashboardGate below), so a user
    // never sits behind a stale pass for more than the TTL.
    const gateCookie = request.cookies.get(GATE_COOKIE);

    if (gateCookie?.value === user.id) {
        return response;
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
            return clearDashboardGate(response);
        }
        return clearDashboardGate(redirect(request, '/onboarding'));
    }

    if (hotelData.deleted_at) {
        await supabase.auth.signOut();
        return clearDashboardGate(redirect(request, '/login', 'account_deleted'));
    }

    return setDashboardGate(response, user.id);
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)',
    ],
};
