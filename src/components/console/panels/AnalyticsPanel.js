'use client';


import { useCallback, useEffect, useState } from 'react';
import { BarChart2, Eye, TrendingUp, Clock, Zap, Lock, Loader2, Calendar } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { StatCard, Card, Alert, Badge, Skeleton } from '../../shared/ui';
import { useApp } from '@/context/AppContext';

function BarChart({ data, label }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <p className="text-xs font-semibold text-theme2 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex items-end gap-1 h-24">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md transition-all duration-700"
              style={{
                height: `${Math.max(4, (d.value / max) * 88)}px`,
                background: 'var(--accent)',
                opacity: d.value === 0 ? 0.2 : 0.85,
              }}
            />
            <span className="text-[9px] text-theme2 truncate w-full text-center">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpgradeGate({ children }) {
  return (
    <div className="relative rounded-2xl overflow-hidden py-5">
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        {children}
      </div>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
        style={{ background: 'rgba(var(--card-rgb, 255,255,255),0.85)', backdropFilter: 'blur(2px)' }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--accentlt)' }}>
          <Lock size={22} style={{ color: 'var(--accent)' }} />
        </div>
        <p className="font-syne font-bold text-theme text-base mb-1">Analytics on Growth+</p>
        <p className="text-xs text-theme2 text-center max-w-xs mb-4">
          Upgrade to see scan trends, top items, peak hours, and more.
        </p>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition"
          style={{ background: 'var(--accent)' }}
        >
          <Zap size={14} /> Upgrade to Growth
        </button>
      </div>
    </div>
  );
}

function TopItemsList({ items }) {
  if (!items.length) return <p className="text-sm text-theme2 py-6 text-center">No scan data yet.</p>;
  const max = Math.max(...items.map((i) => i.scans), 1);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={item.id} className="flex items-center gap-3">
          <span className="text-xs font-bold text-theme2 w-5 flex-shrink-0">{idx + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-theme truncate">{item.name}</p>
              <span className="text-xs font-bold text-theme ml-2">{item.scans}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(item.scans / max) * 100}%`, background: 'var(--accent)' }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPanel() {
  const { hotel, isOnTrial, isTrailEnded, limits, isAnalyticActionBlock, isTrialExpired } = useApp();
  const canViewAnalytics = !isAnalyticActionBlock

  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScans: 0,
    todayScans: 0,
    weekScans: 0,
    topItems: [],
    dailyTrend: [],
    hourlyData: [],
  });

  const loadAnalytics = useCallback(async () => {
    if (!hotel?.id) { setLoading(false); return; }

    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [totalRes, todayRes, weekRes] = await Promise.all([
        supabase.from('menu_scans').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id),
        supabase.from('menu_scans').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id).gte('scanned_at', todayStart),
        supabase.from('menu_scans').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id).gte('scanned_at', weekStart),
      ]);

      // Build 7-day trend
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        return {
          label: d.toLocaleDateString('en', { weekday: 'short' }),
          date: d.toISOString().split('T')[0],
          value: 0,
        };
      });

      // Top items (only for paid plans — but fetch structure for teaser)
      let topItems = [];
      if (canViewAnalytics) {
        const { data: scanData } = await supabase
          .from('menu_scans')
          .select('item_id, menu_items(name)')
          .eq('hotel_id', hotel.id)
          .not('item_id', 'is', null)
          .limit(200);

        if (scanData) {
          const counts = {};
          scanData.forEach((s) => {
            if (!s.item_id) return;
            counts[s.item_id] = counts[s.item_id] || { scans: 0, name: s.menu_items?.name || 'Unknown' };
            counts[s.item_id].scans++;
          });
          topItems = Object.entries(counts)
            .map(([id, v]) => ({ id, ...v }))
            .sort((a, b) => b.scans - a.scans)
            .slice(0, 5);
        }
      }

      setStats({
        totalScans: totalRes.count ?? 0,
        todayScans: todayRes.count ?? 0,
        weekScans: weekRes.count ?? 0,
        topItems,
        dailyTrend: days,
        hourlyData: Array.from({ length: 12 }, (_, i) => ({
          label: `${i * 2}h`,
          value: Math.floor(Math.random() * 10), // placeholder until real data
        })),
      });
    } catch (err) {
      console.error('[AnalyticsPanel]', err);
    } finally {
      setLoading(false);
    }
  }, [hotel?.id, supabase, canViewAnalytics]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      </div>
    );
  }

  const statCards = (
    <div className="grid sm:grid-cols-3 gap-4">
      <StatCard icon={Eye} label="Total Scans" value={stats.totalScans} sub="All time" />
      <StatCard icon={TrendingUp} label="This Week" value={stats.weekScans} sub="Last 7 days" />
      <StatCard icon={Calendar} label="Today" value={stats.todayScans} sub="Since midnight" />
    </div>
  );

  const charts = (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card>
        <BarChart data={stats.dailyTrend} label="Scans — last 7 days" />
      </Card>
      <Card>
        <p className="text-xs font-semibold text-theme2 uppercase tracking-widest mb-3">Top 5 Items</p>
        <TopItemsList items={stats.topItems} />
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-bold text-2xl text-theme">Analytics</h1>
          <p className="text-sm text-theme2 mt-0.5">How your menu performs</p>
        </div>
      </div>

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

      {canViewAnalytics && (
        statCards
      )}


      {!canViewAnalytics ? (
        <UpgradeGate>
          {charts}
        </UpgradeGate>
      ) : (
        charts
      )}

      {!canViewAnalytics && (
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--accentlt)' }}>
              <BarChart2 size={22} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-syne font-bold text-theme mb-0.5">Unlock Full Analytics</p>
              <p className="text-xs text-theme2">
                See scan trends by day & hour, top performing items, QR code performance, and more.
              </p>
            </div>
            <button
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition whitespace-nowrap"
              style={{ background: 'var(--accent)' }}
            >
              <Zap size={14} /> Upgrade Now
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}