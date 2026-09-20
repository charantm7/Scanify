'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  LogOut,
  Loader2,
  Zap,
  Settings,
  HelpCircle,
} from 'lucide-react';

import { getSupabaseClient } from '../../lib/supabase/client';
import { Badge } from '../../components/ui/UiComponents';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import { NAV_GROUPS, isActivePath } from './navigation';

export function Logo() {
  return (
    <div className="flex items-center px-2">
      <span className="kaushan-script-regular font-bold text-xl tracking-wide text-theme">
        Scanify
      </span>
    </div>
  );
}

function PlanBadge({ plan }: { plan?: string }) {
  if (plan === 'pro') {
    return <Badge variant="success">Pro</Badge>;
  }

  if (plan === 'growth') {
    return <Badge variant="success">Growth</Badge>;
  }

  if (plan === 'starter') {
    return <Badge>Starter</Badge>;
  }

  if (plan === 'basic') {
    return <Badge>Basic</Badge>;
  }

  return <Badge variant="warning">Trial</Badge>;
}

function UpgradeNudge({ title }: { title: string }) {
  return (
    <div className="px-3 pb-3">
      <div
        className="rounded-xl border p-3"
        style={{
          background: 'var(--accentlt)',
          borderColor: 'color-mix(in srgb, var(--accent) 15%, var(--border))',
        }}
      >
        <div className="min-w-0 space-y-1">

          <div className='flex items-start gap-2.5'>
            <Zap
              size={15}
              style={{
                color: 'var(--accent)',
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <p
              className="text-xs font-semibold mb-0.5"
              style={{ color: 'var(--accent)' }}
            >
              {title}
            </p>
          </div>

          <p className="text-xs text-theme2 leading-relaxed">
            Upgrade your plan to unlock more features.
          </p>

          <Link
            href="/billing"
            className="mt-2 inline-block text-xs font-semibold hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            View plans →
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function Sidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [signingOut, setSigningOut] = useState(false);

  const {
    user,
    plan,
    profile,
    isTrialing,
    isTrialExpired,
  } = useApp();

  const pathname = usePathname();
  const supabase = getSupabaseClient();

  async function handleSignOut() {
    setSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error('Logout failed');
      setSigningOut(false);
      return;
    }

    toast.success('Logged out');
    window.location.href = '/login';
  }

  const displayName =
    profile?.name ||
    user?.email?.split('@')[0] ||
    'User';

  const avatarLetter = displayName[0]?.toUpperCase() || 'U';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-[240px]
          flex flex-col
          border-r
          transition-transform duration-200
          lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        {/* ───────────────── Logo ───────────────── */}
        <div
          className="h-[54px] px-5 flex items-center justify-between border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <Logo />

          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-theme2 hover:bg-theme3"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>



        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {NAV_GROUPS.map((group) => {
            const availableItems = group.items.filter((item) => item.href);

            if (!availableItems.length) return null;

            return (
              <div key={group.title} className="mb-5 last:mb-0">
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-theme3">
                  {group.title}
                </p>

                <div className="space-y-0.5">
                  {availableItems.map(({ href, label, icon: Icon }) => {
                    const active = isActivePath(pathname, href);

                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={`
                          relative
                          flex items-center gap-3
                          h-9
                          px-3
                          rounded-md
                          text-[13px]
                          font-medium
                          transition-colors
                          ${active
                            ? 'text-[var(--accent)] bg-[var(--accentlt)] border-l-2 border-[var(--accent)]'
                            : 'text-theme2 hover:text-theme hover:bg-theme3'
                          }
                        `}
                      >

                        <Icon
                          size={16}
                          strokeWidth={active ? 2 : 1.8}
                          className="flex-shrink-0"
                        />

                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* ───────────── Trial / Upgrade ───────────── */}
        {isTrialing && !isTrialExpired && (
          <UpgradeNudge title="You're on Trial" />
        )}

        {isTrialExpired && (
          <UpgradeNudge title="Your trial has ended" />
        )}



        {/* ───────────────── User ───────────────── */}
        <div
          className="px-4 py-4 mt-2 border-t flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="
                w-8 h-8
                rounded-full
                flex items-center justify-center
                text-sm font-semibold
                text-white
                flex-shrink-0
              "
              style={{
                background: 'var(--accent)',
              }}
            >
              {avatarLetter}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-theme truncate">
                  {displayName}
                </p>
              </div>

              <p className="text-[11px] text-theme2 truncate">
                {user?.email}
              </p>
            </div>


          </div>

          <div
            className="mt-3 flex-shrink-0  rounded-md hover:bg-[var(--accentlt)]"
            style={{ borderColor: 'var(--border)' }}
          >
            <Link
              href="/help"
              onClick={() => setOpen(false)}
              className="
              flex items-center
              gap-3
              px-2 py-2
              rounded-lg
              text-[13px]
              font-medium
              text-theme2
              hover:text-theme
              hover:bg-theme3
              transition
            "
            >
              <HelpCircle size={16} strokeWidth={1.8} />
              Help & Support
            </Link>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign out"
            className="
                p-2
                w-full
                rounded-md
                text-red-500
                hover:bg-red-50
                dark:hover:bg-red-300/20
                transition
                disabled:opacity-50
              "
          >
            {signingOut ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <div className='flex items-center gap-3 '>
                <LogOut size={15} />
                <span className='text-sm'>Logout</span>
              </div>
            )}
          </button>
        </div>
      </aside >
    </>
  );
}