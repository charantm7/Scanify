'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LogOut, Loader2, Zap } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabase/client';
import { Badge } from '../../components/ui/UiComponents';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import { NAV_GROUPS, isActivePath } from './navigation';

function Logo() {
  return (
    <span className="kaushan-script-regular tracking-wide ml-4 font-bold text-theme text-2xl">Scanify</span>
  );
}

function PlanBadge({ plan }) {
  if (plan === 'pro') return <Badge variant="success">Pro</Badge>;
  if (plan === 'growth') return <Badge variant="success">Growth</Badge>;
  if (plan === 'starter') return <Badge>Starter</Badge>;
  if (plan === 'basic') return <Badge>Basic</Badge>;

  return <Badge variant="warning">Trial</Badge>;
}

function UpgradeNudge({ title }: { title: string }) {
  return (
    <div className="px-3 mb-2">
      <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: 'var(--accentlt)' }}>
        <Zap size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
        <div>
          <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--accent)' }}>
            {title}
          </p>
          <p className="text-xs text-theme2 leading-snug">
            Upgrade to Starter or Growth to unlock featured items.
          </p>
          <Link
            href="/billing"
            className="mt-2 inline-block text-xs font-bold underline"
            style={{ color: 'var(--accent)' }}
          >
            See plans →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ open, setOpen }) {
  const [signingOut, setSigningOut] = useState(false);
  const { user, plan, profile, isTrialing, isTrialExpired } = useApp();
  const pathname = usePathname();
  const supabase = getSupabaseClient();

  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error('Logout failed');
      setSigningOut(false);
    } else {
      toast.success('Logged out');
      window.location.href = '/login';
    }
  }

  const displayName = profile?.name || user?.email?.split('@')[0] || 'User';
  const avatarLetter = displayName[0].toUpperCase();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <div
          className="px-5 h-16 flex items-center justify-between border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <Logo />
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-theme2 hover:text-theme transition"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-theme3">
                {group.title}
              </p>

              <div>
                {group.items.map(({ href, label, icon: Icon }) => {
                  // No href means the feature isn't built yet — render it
                  // disabled rather than linking to a route that would 404.
                  if (!href) {
                    return (
                      <span
                        key={label}
                        aria-disabled="true"
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-theme2 opacity-40 cursor-not-allowed"
                      >
                        <span className="flex items-center gap-3">
                          <Icon size={16} />
                          {label}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full border"
                          style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}
                        >
                          Soon
                        </span>
                      </span>
                    );
                  }

                  const active = isActivePath(pathname, href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'text-white' : 'text-theme2 hover:bg-theme3 hover:text-theme'
                        }`}
                      style={active ? { background: 'var(--accent)' } : {}}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={16} />
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {isTrialing && !isTrialExpired && <UpgradeNudge title="You're on Trial" />}
        {isTrialExpired && <UpgradeNudge title="Your Trial Ended" />}

        {/* User footer */}
        <div className="px-4 py-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'var(--accent)' }}
            >
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-theme truncate">{displayName}</p>
                <PlanBadge plan={plan} />
              </div>
              <p className="text-xs text-theme2 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-60"
            style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}
          >
            {signingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
