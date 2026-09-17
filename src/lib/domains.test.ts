import { describe, it, expect } from 'vitest';
import {
  resolveSurface,
  surfaceOrigin,
  isDashboardPath,
  isLandingPath,
  isInfrastructurePath,
  ROOT_DOMAIN,
} from './domains';

describe('resolveSurface', () => {
  it('maps each production subdomain to its surface', () => {
    expect(resolveSurface(ROOT_DOMAIN)).toBe('landing');
    expect(resolveSurface(`www.${ROOT_DOMAIN}`)).toBe('landing');
    expect(resolveSurface(`dashboard.${ROOT_DOMAIN}`)).toBe('dashboard');
    expect(resolveSurface(`menu.${ROOT_DOMAIN}`)).toBe('menu');
    expect(resolveSurface(`console.${ROOT_DOMAIN}`)).toBe('console');
  });

  it('ignores port and casing', () => {
    expect(resolveSurface(`Menu.${ROOT_DOMAIN.toUpperCase()}:3000`)).toBe('menu');
    expect(resolveSurface(`DASHBOARD.${ROOT_DOMAIN}:443`)).toBe('dashboard');
  });

  it('treats local and preview hosts as dev so every path is reachable', () => {
    for (const host of [
      'localhost',
      'localhost:3000',
      '127.0.0.1:3000',
      'app.localhost:3000',
      'scanify-git-branch.vercel.app',
    ]) {
      expect(resolveSurface(host)).toBe('dev');
    }
  });

  it('falls back to dev when no Host header is present', () => {
    expect(resolveSurface(null)).toBe('dev');
  });

  it('never resolves an unknown or spoofed host to the dashboard', () => {
    // A host we do not recognise must land on the marketing site, never on the
    // owner's app surface.
    expect(resolveSurface('evil.com')).toBe('landing');
    expect(resolveSurface(`dashboard.${ROOT_DOMAIN}.evil.com`)).toBe('landing');
    // Only the FIRST label decides the surface.
    expect(resolveSurface(`a.menu.${ROOT_DOMAIN}`)).toBe('landing');
    // A lookalike domain must not inherit the real one's surfaces.
    expect(resolveSurface(`menu.not${ROOT_DOMAIN}`)).toBe('landing');
  });
});

describe('surfaceOrigin', () => {
  it('builds the canonical https origin for each surface', () => {
    expect(surfaceOrigin('landing')).toBe(`https://${ROOT_DOMAIN}`);
    expect(surfaceOrigin('dashboard')).toBe(`https://dashboard.${ROOT_DOMAIN}`);
    expect(surfaceOrigin('menu')).toBe(`https://menu.${ROOT_DOMAIN}`);
    expect(surfaceOrigin('console')).toBe(`https://console.${ROOT_DOMAIN}`);
  });
});

describe('path ownership', () => {
  it('claims every dashboard tab route', () => {
    for (const path of [
      '/dashboard',
      '/menu-builder',
      '/customization',
      '/qr-codes',
      '/analytics',
      '/billing',
      '/transactions',
      '/settings',
    ]) {
      expect(isDashboardPath(path)).toBe(true);
      expect(isLandingPath(path)).toBe(false);
    }
  });

  it('claims auth and onboarding for the dashboard surface', () => {
    for (const path of ['/login', '/onboarding', '/reset-password', '/auth-callback', '/confirm']) {
      expect(isDashboardPath(path)).toBe(true);
    }
  });

  it('matches nested routes under a tab', () => {
    expect(isDashboardPath('/menu-builder/some-menu-id')).toBe(true);
    expect(isDashboardPath('/settings/profile')).toBe(true);
  });

  it('does not match a path that merely shares a prefix', () => {
    // /billing-history is a different route from /billing and must not be
    // swept up by a naive startsWith check.
    expect(isDashboardPath('/billing-history')).toBe(false);
    expect(isDashboardPath('/dashboards')).toBe(false);
    expect(isDashboardPath('/settings-export')).toBe(false);
  });

  it('claims the marketing and legal pages for the landing surface', () => {
    for (const path of ['/', '/about-us', '/contact', '/help', '/privacy-policy', '/refund-policy']) {
      expect(isLandingPath(path)).toBe(true);
      expect(isDashboardPath(path)).toBe(false);
    }
  });

  it('leaves public menu paths unclaimed by either app surface', () => {
    // The menu surface is handled by rewrite, not by path ownership, so these
    // must not be redirected anywhere.
    expect(isDashboardPath('/menu/spice-route')).toBe(false);
    expect(isLandingPath('/menu/spice-route')).toBe(false);
    expect(isDashboardPath('/spice-route')).toBe(false);
    expect(isLandingPath('/spice-route')).toBe(false);
  });

  it('does not confuse /menu-builder with the public /menu prefix', () => {
    expect(isDashboardPath('/menu-builder')).toBe(true);
    expect(isDashboardPath('/menu')).toBe(false);
  });
});

describe('isInfrastructurePath', () => {
  it('exempts framework internals, API routes and well-known files', () => {
    for (const path of [
      '/_next/static/chunk.js',
      '/api/menu/spice-route',
      '/api/payments/webhook',
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml',
    ]) {
      expect(isInfrastructurePath(path)).toBe(true);
    }
  });

  it('does not exempt ordinary pages', () => {
    for (const path of ['/', '/dashboard', '/menu/spice-route', '/apiary']) {
      expect(isInfrastructurePath(path)).toBe(false);
    }
  });
});
