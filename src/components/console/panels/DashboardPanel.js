'use client';


import { useEffect, useState } from 'react';
import {
  QrCode, ChefHat, BarChart2, Building2,
  ExternalLink, ArrowRight, Clock, Zap, BlocksIcon,
  Blocks
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatCard, Card, Alert } from '../../shared/ui';
import Link from 'next/link';

function QuickAction({ icon: Icon, label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between gap-3 bg-card border rounded-2xl p-4 w-full text-left cursor-pointer hover:border-[var(--accent)] transition-all group"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accentlt)' }}>
          <Icon size={16} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-theme">{label}</p>
          <p className="text-xs text-theme2">{desc}</p>
        </div>
      </div>
      <ArrowRight size={15} className="text-theme2 group-hover:text-[var(--accent)] transition-colors flex-shrink-0" />
    </button>
  );
}

export default function DashboardPanel({ onNavigate }) {
  const {
    profile, hotel, supabase,
    menuItemCount, plan, limits, isOnTrial, isInTrial,
    isTrialExpired,
    trialHoursLeft, trialDaysLeft,
  } = useApp();

  const [qrCount, setQrCount] = useState(0);
  const [scanCount, setScanCount] = useState(0);

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'scanify.co.in';
  const menuUrl = hotel?.slug ? `${appDomain}/${hotel.slug}` : null;

  useEffect(() => {
    if (!hotel?.id) return;
    let mounted = true;

    async function loadStats() {
      try {
        const [{ count: qrs }, { count: scans }] = await Promise.all([
          supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id),
          supabase.from('menu_scans').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id),
        ]);
        if (mounted) { setQrCount(qrs ?? 0); setScanCount(scans ?? 0); }
      } catch { /* non-critical */ }
    }

    loadStats();
    return () => { mounted = false; };
  }, [hotel?.id, supabase]);

  return (
    <div className="space-y-6">

      {isOnTrial && (
        <Alert
          type="info"
          title={`Free Trial · ${trialHoursLeft}h left`}
          message={`You have full Starter access for ${trialDaysLeft} more day${trialDaysLeft !== 1 ? 's' : ''}. After that, you'll drop to the free tier (5 items, 1 QR). Upgrade now to keep everything.`}
          action={
            <button
              onClick={() => onNavigate('billing')}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold"
              style={{ background: 'var(--accent)' }}
            >
              <Zap size={12} /> Upgrade
            </button>
          }
        />
      )}

      {isTrialExpired && (
        <Alert
          type="info"
          title={`Free Trial Ended`}
          message="Your trial has ended. Upgrade to continue managing your menu and unlock all features."
          action={
            <button
              onClick={() => onNavigate('billing')}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold"
              style={{ background: 'var(--accent)' }}
            >
              <Zap size={12} /> Upgrade
            </button>
          }
        />

      )}



      {/* ── Welcome banner ───────────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-7 flex items-center justify-between"
        style={{ background: 'var(--accent)' }}
      >
        <div>
          <p className="text-white/70 text-sm mb-1">Welcome back,</p>
          <h1 className="font-syne font-bold text-white text-3xl">
            {profile?.name || 'There'} 👋
          </h1>
          {hotel?.name && (
            <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5">
              <Building2 size={12} /> {hotel.name}
            </p>
          )}
        </div>
        <div className="hidden sm:flex flex-col items-center gap-1.5">
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
          >
            {limits?.label}
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <QrCode size={24} color="white" />
          </div>
        </div>
      </div>

      {/* ── Live menu URL ─────────────────────────────────────────────────── */}
      {menuUrl && (
        <Card style={{ borderColor: 'var(--accent)', background: 'var(--accentlt)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
            Your Live Menu URL
          </p>
          <div className="flex items-center justify-between gap-3">
            <code className="text-sm font-bold text-theme break-all">{menuUrl}</code>
            <Link
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition hover:opacity-80"
                style={{ background: 'var(--accent)' }} disabled={isTrialExpired}>
                {isTrialExpired ? (
                  <>
                    Disabled
                  </>
                ) : (
                  <>
                    Open <ExternalLink size={11} />
                  </>
                )}

              </button>
            </Link>
          </div>
        </Card>
      )}

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ChefHat}
          label="Menu Items"
          value={menuItemCount}
          sub={`${menuItemCount} / ${limits.maxMenuItems === Infinity ? '∞' : limits.maxMenuItems}`}
        />
        <StatCard icon={QrCode} label="QR Codes" value={qrCount} sub="Generated" />
        <StatCard icon={BarChart2} label="Total Scans" value={scanCount} sub="All time" />
        <StatCard
          icon={Clock}
          label="Account Age"
          value={profile?.created_at
            ? `${Math.floor((Date.now() - new Date(profile.created_at)) / 86_400_000)}d`
            : '—'}
          sub="Since joining"
        />
      </div>

      {/* ── Usage meter (free + trial) ────────────────────────────────────── */}
      {isOnTrial && limits.maxMenuItems !== Infinity && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-theme">Menu Item Usage</p>
            <span
              className="text-xs font-bold"
              style={{ color: menuItemCount >= limits.maxMenuItems ? '#dc2626' : 'var(--accent)' }}
            >
              {menuItemCount} / {limits.maxMenuItems}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min((menuItemCount / limits.maxMenuItems) * 100, 100)}%`,
                background: menuItemCount >= limits.maxMenuItems ? '#dc2626' : 'var(--accent)',
              }}
            />
          </div>
          <p className="text-xs text-theme2 mt-1.5">
            {limits.maxMenuItems - menuItemCount > 0
              ? `${limits.maxMenuItems - menuItemCount} slots remaining on ${plan === 'trial' ? 'trial' : 'Free'} plan`
              : 'Limit reached — upgrade to add more items'}
          </p>
        </Card>
      )}

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-bold text-theme mb-3">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <QuickAction icon={ChefHat} label="Manage Menu" desc="Add items, categories & prices" onClick={() => onNavigate('menu')} />
          <QuickAction icon={QrCode} label="Generate QR Code" desc="Create scannable QR for your menu" onClick={() => onNavigate('qr-codes')} />
          <QuickAction icon={BarChart2} label="View Analytics" desc="See scan trends and popular items" onClick={() => onNavigate('analytics')} />
          <QuickAction icon={Building2} label="Restaurant Settings" desc="Edit hotel profile and branding" onClick={() => onNavigate('settings')} />
        </div>
      </div>
    </div>
  );
}
