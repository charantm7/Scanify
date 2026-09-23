// src/lib/domains.ts
//
// Host-based routing for the three public surfaces. One Next app, one
// deployment; the proxy reads the Host header and decides which surface a
// request belongs to.
//
//   scanify.co.in            landing + marketing + legal
//   dashboard.scanify.co.in  the restaurant owner's app (and its auth screens)
//   menu.scanify.co.in       the public menu diners scan into
//   console.scanify.co.in    reserved for internal admin, not built yet
//
// Internally the app dir still uses ordinary paths (/dashboard, /billing,
// /menu/<slug>, …). Only the PUBLIC menu surface is rewritten, because its
// URLs drop the /menu prefix: menu.scanify.co.in/<slug> serves /menu/<slug>.
// Every other surface is enforced rather than rewritten — a dashboard path
// requested on the landing host is redirected to the dashboard host and vice
// versa, so each page has exactly one canonical URL.

export type AppSurface = 'landing' | 'overview' | 'menu' | 'console' | 'dev';

/** Bare apex domain, no protocol, no leading dot. */
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'scanify.co.in';

/**
 * Cookie domain shared across subdomains, e.g. `.scanify.co.in`.
 *
 * This has to be set in production or auth breaks outright: the session cookie
 * written when signing in on one subdomain would not be readable on another.
 * Left undefined in local dev so cookies stay host-only on localhost.
 */
export const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined;

/**
 * Whether the three subdomains are actually configured for this deployment.
 *
 * It decides how public menu links are built: on the menu host the `/menu`
 * prefix is supplied by the proxy rewrite, so links must omit it, whereas a
 * local dev server has no subdomains and serves the page at its real
 * /menu/<slug> path. Keyed off the cookie domain because that is the one
 * setting that must be present for the subdomain split to work at all.
 */
export const SUBDOMAINS_ENABLED = Boolean(COOKIE_DOMAIN);

const SUBDOMAIN_SURFACES: Record<string, AppSurface> = {
  overview: 'overview',
  menu: 'menu',
  console: 'console',
};

/** Strips the port and lowercases, so `Menu.Scanify.co.in:3000` still matches. */
function normalizeHost(host: string): string {
  return host.split(':')[0]!.trim().toLowerCase();
}

/**
 * Local development and preview deployments have no meaningful subdomain, so
 * they resolve to 'dev' and the proxy lets every path through. Without this,
 * localhost:3000 would be treated as the landing surface and every dashboard
 * route would redirect away to a domain that doesn't resolve.
 */
function isDevHost(host: string): boolean {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.vercel.app')
  );
}

export function resolveSurface(hostHeader: string | null): AppSurface {
  if (!hostHeader) return 'dev';

  const host = normalizeHost(hostHeader);

  if (isDevHost(host)) return 'dev';
  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) return 'landing';

  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const label = host.slice(0, -(ROOT_DOMAIN.length + 1));
    // Only the first label decides the surface, so a stray `a.b.menu.…` host
    // doesn't get treated as the menu surface.
    if (!label.includes('.')) {
      const surface = SUBDOMAIN_SURFACES[label];
      if (surface) return surface;
    }
  }

  // An unrecognised host (a custom domain someone pointed at us, say) gets the
  // safest surface: the public marketing site, never the owner's dashboard.
  return 'landing';
}

export function surfaceOrigin(surface: Exclude<AppSurface, 'dev'>): string {
  switch (surface) {
    case 'overview':
      return `https://dashboard.${ROOT_DOMAIN}`;
    case 'menu':
      return `https://menu.${ROOT_DOMAIN}`;
    case 'console':
      return `https://console.${ROOT_DOMAIN}`;
    case 'landing':
      return `https://${ROOT_DOMAIN}`;
  }
}

// ── Path ownership ───────────────────────────────────────────────────────────

/** One route per former console tab. Order drives the sidebar. */
export const DASHBOARD_ROUTES = [
  '/overview',
  '/menu-builder',
  '/customization',
  '/qr-codes',
  '/analytics',
  '/billing',
  '/transactions',
  '/settings',
] as const;

/** Auth and onboarding live on the dashboard host, alongside the app itself. */
export const DASHBOARD_AUTH_ROUTES = [
  '/login',
  '/forget-password',
  '/reset-password',
  '/check-mail',
  '/onboarding',
  '/auth-callback',
  '/confirm',
] as const;

export const LANDING_ROUTES = [
  '/about-us',
  '/blog',
  '/careers',
  '/contact',
  '/help',
  '/privacy-policy',
  '/cookie-policy',
  '/refund-policy',
  '/terms-&-conditions',
] as const;

/** Internal prefix the public menu surface is rewritten onto. */
export const MENU_PATH_PREFIX = '/menu';

function matchesPrefix(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isDashboardPath(pathname: string): boolean {
  return (
    matchesPrefix(pathname, DASHBOARD_ROUTES) ||
    matchesPrefix(pathname, DASHBOARD_AUTH_ROUTES)
  );
}

export function isLandingPath(pathname: string): boolean {
  return pathname === '/' || matchesPrefix(pathname, LANDING_ROUTES);
}

/**
 * Paths the proxy must never rewrite or redirect on any surface: framework
 * internals, API routes, and static files. API routes in particular are shared
 * by all surfaces (the public menu page calls /api/menu/... from the menu
 * host), so moving them between hosts would break same-origin requests.
 */
export function isInfrastructurePath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  );
}

// ── Public menu URLs ─────────────────────────────────────────────────────────

/**
 * The URL a diner lands on, which is what QR codes encode and what the
 * dashboard's "view live menu" links point at.
 *
 * In production this is always absolute on the menu host, because the menu
 * surface is a different origin from the dashboard that renders the link.
 * Locally there are no subdomains, so it falls back to the internal
 * /menu/<slug> path that the same dev server serves.
 *
 * `menuSlug` is omitted for a hotel's primary menu, so single-menu hotels keep
 * the short URL their existing QR codes already encode.
 */
export function publicMenuUrl(hotelSlug: string, menuSlug?: string | null): string {
  const path = menuSlug ? `/${hotelSlug}/${menuSlug}` : `/${hotelSlug}`;

  // Dev / preview: no menu subdomain exists, so stay same-origin on the real
  // path the app serves.
  if (!SUBDOMAINS_ENABLED) return `${MENU_PATH_PREFIX}${path}`;

  return `${surfaceOrigin('menu')}${path}`;
}

/**
 * Same destination as publicMenuUrl but root-relative, for links rendered by
 * the public menu page itself — the diner is already on the right host, so a
 * relative href keeps navigation client-side instead of forcing a full reload.
 */
export function publicMenuPath(hotelSlug: string, menuSlug?: string | null): string {
  const path = menuSlug ? `/${hotelSlug}/${menuSlug}` : `/${hotelSlug}`;

  // On the menu host the proxy adds the /menu prefix; everywhere else the page
  // is served at its real path and the prefix is part of the URL.
  return SUBDOMAINS_ENABLED ? path : `${MENU_PATH_PREFIX}${path}`;
}

/** Slugifies a menu name into something the menus_slug_check constraint accepts. */
export function toMenuSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
}
