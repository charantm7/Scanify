'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard, MenuIcon, QrCode, BarChart2,
  Settings, X, LogOut, Loader2, Zap, ChefHat,
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Badge } from '../shared/ui';
import toast from 'react-hot-toast';

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--accent)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3m0 4h4v-4m-4 0h-3v4" />
        </svg>
      </div>
      <span className="font-syne font-bold text-theme text-lg">Scanify</span>
    </div>
  );
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'menu', label: 'Menu Builder', icon: ChefHat },
  { id: 'qr-codes', label: 'QR Codes', icon: QrCode },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const COMING_SOON = new Set(['orders']);

function PlanBadge({ plan }) {
  if (plan === 'pro') return <Badge variant="success">Pro</Badge>;
  if (plan === 'starter') return <Badge>Starter</Badge>;
  return <Badge variant="warning">Free</Badge>;
}

export default function Sidebar({ activeTab, setActiveTab, open, setOpen, user, plan, profile }) {
  const [signingOut, setSigningOut] = useState(false);
  const supabase = getSupabaseClient();

  async function handleSignOut() {
    setLoading(true)
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Logout failed");
      setLoading(false);
    } else {
      toast.success("Logged out");
      window.location.href = "/login";
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
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            const comingSoon = COMING_SOON.has(id);

            return (
              <button
                key={id}
                onClick={() => {
                  if (comingSoon) return;
                  setActiveTab(id);
                  setOpen(false);
                }}
                disabled={comingSoon}
                aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'text-white' : comingSoon ? 'text-theme2 opacity-40 cursor-not-allowed' : 'text-theme2 hover:bg-theme3 hover:text-theme'}`}
                style={active ? { background: 'var(--accent)' } : {}}
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} />
                  {label}
                </span>
                {comingSoon && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}
                  >
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Upgrade nudge for free users */}
        {plan === 'free' && (
          <div className="px-3 mb-2">
            <div
              className="rounded-xl p-3 flex items-start gap-2.5"
              style={{ background: 'var(--accentlt)' }}
            >
              <Zap size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--accent)' }}>
                  You're on Free
                </p>
                <p className="text-xs text-theme2 leading-snug">
                  Upgrade to add more items & unlock analytics.
                </p>
                <button
                  className="mt-2 text-xs font-bold underline"
                  style={{ color: 'var(--accent)' }}
                >
                  See plans →
                </button>
              </div>
            </div>
          </div>
        )}

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