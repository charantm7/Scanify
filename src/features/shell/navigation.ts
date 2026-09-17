'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, QrCode, ScanQrCodeIcon, ChefHat, Receipt, BarChart3,
  Sparkles, Palette, Settings2, MessageSquare, CreditCard,
} from 'lucide-react';

/**
 * Each former console tab is now its own route, but the panels still call
 * `onNavigate('billing')` style callbacks. Rather than rewrite every panel,
 * this maps those tab ids to their routes in one place.
 *
 * Keep the keys in step with what panels actually pass; an unknown id is a
 * no-op rather than a crash, so a stale call degrades to "nothing happens"
 * instead of throwing in the middle of a render.
 */
export const TAB_ROUTES: Record<string, string> = {
  dashboard: '/dashboard',
  menu: '/menu-builder',
  'menu-builder': '/menu-builder',
  customization: '/customization',
  'qr-codes': '/qr-codes',
  analytics: '/analytics',
  billing: '/billing',
  transactions: '/transactions',
  settings: '/settings',
};

export function useTabNavigate() {
  const router = useRouter();

  return useCallback(
    (tabId: string) => {
      const href = TAB_ROUTES[tabId];
      if (href) router.push(href);
    },
    [router]
  );
}

export interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  /** Absent for items that are not built yet. */
  href?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Menu',
    items: [
      { href: '/menu-builder', label: 'Menu Builder', icon: ChefHat },
      { label: "Today's Special", icon: Sparkles },
      { href: '/customization', label: 'Customization', icon: Palette },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { href: '/qr-codes', label: 'QR Codes', icon: QrCode },
      { label: 'QR Customization', icon: ScanQrCodeIcon },
      { label: 'Reviews', icon: MessageSquare },
    ],
  },
  {
    title: 'Business',
    items: [
      { href: '/billing', label: 'Subscription', icon: CreditCard },
      { href: '/transactions', label: 'Transactions', icon: Receipt },
      { href: '/settings', label: 'Settings', icon: Settings2 },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

/**
 * Longest-prefix match so nested routes (/menu-builder/<menu-id>) still
 * highlight their parent nav item.
 */
export function labelForPath(pathname: string): string {
  let best: NavItem | undefined;

  for (const item of ALL_ITEMS) {
    if (!item.href) continue;
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      if (!best || item.href.length > best.href!.length) best = item;
    }
  }

  return best?.label ?? '';
}

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
