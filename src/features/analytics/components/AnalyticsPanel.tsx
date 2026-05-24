'use client';

import { useState } from 'react';
import {
  BarChart2, Eye, QrCode, ShoppingBag, TrendingUp, TrendingDown,
  Minus, Lock, Zap, Loader2, RefreshCw, ArrowRight, Users,
  Clock, Calendar, CreditCard, AlertCircle, ChevronDown,
} from 'lucide-react';

import BarChart from './charts/BarChart';
import HeatmapHours from './charts/Heatmap';
import StatCardsGrid from './StatCardsGrid';
import Funnel from './FunnelChart';
import TopItemsTable from './TopItemsTable';
import QrBreakdown from './QrBreakdown';
import OrderStats from './OrderStats';
import ComparisonRow from './ComparisonRow';
import { StatCard } from './StatCardsGrid';
import ErrorBanner from './ErrorBanner';
import AnalyticsSkeletonBlock from './SkeletonBlock';
import { buildBasicStats } from '../utils/build-basic-stats';
import PageHeader from './AnalyticsHeader';

import {
  useAnalytics,
  isAdvancedStats,
  type AnalyticsPeriod,
  AnalyticsLevel,
} from '../../../hooks/useAnalytics';
import { useApp } from '../../../context/AppContext';
import ScanTrenchChart from './ScanTrenchChart';
import { AnalyticsLockedNotice } from '../../../components/ui/Consolenotices';

// ─────────────────────────────────────────────────────────────────────────────
// AnalyticsPanel
//
// Consumes useAnalytics() exclusively — no Supabase calls here.
// Layout:
//   • Period selector
//   • Stat cards row  (basic)
//   • UpgradeGate wraps advanced sections for non-pro plans
//   • Scan funnel
//   • Scans-by-day bar chart
//   • Peak hours heatmap (24-slot)
//   • Day-of-week bar chart
//   • Top items table  (with conversion rate on pro)
//   • QR code breakdown
//   • Order stats section (if ordering enabled)
//   • Period comparison row
// ─────────────────────────────────────────────────────────────────────────────


// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accentlt)' }}
            >
              <Icon size={15} style={{ color: 'var(--accent)' }} />
            </div>
          )}
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
              {title}
            </p>
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}






// ── Main panel ────────────────────────────────────────────────────────────────

export default function AnalyticsPanel({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { isTrialExpired, canUseOrdering } = useApp();
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');
  const [level, setLevel] = useState<AnalyticsLevel>('basic');


  const { stats, loading, error, canViewBasicAnalytics, canViewAdvancedAnalytics, refetch } =
    useAnalytics(period);

  // ── No access ───────────────────────────────────────────────────────────────
  if (!canViewBasicAnalytics || !stats) {
    return <AnalyticsLockedNotice level={'basic'} onNavigate={onNavigate} />

  }

  const advanced = isAdvancedStats(stats) ? stats : null;
  const comparison = advanced?.comparison;

  const cards = buildBasicStats(stats, comparison);
  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return <AnalyticsSkeletonBlock />
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-5">
        <PageHeader period={period} onPeriodChange={setPeriod} onRefetch={refetch} level={level} onLevelChange={setLevel} />
        <ErrorBanner message={error} onRetry={refetch} />
      </div>
    );
  }





  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader period={period} onPeriodChange={setPeriod} onRefetch={refetch} level={level} onLevelChange={setLevel} />

      {/* Trial expired banner */}
      {isTrialExpired && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{
            background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          }}
        >
          <AlertCircle size={16} style={{ color: 'var(--accent)' }} />
          <p className="text-sm flex-1" style={{ color: 'var(--foreground)' }}>
            Your trial has ended — upgrade to continue.
          </p>
          <button
            onClick={() => onNavigate?.('billing')}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <Zap size={11} /> Upgrade
          </button>
        </div>
      )}

      {level === 'basic' ? (
        <>

          <StatCardsGrid cards={cards} />

          {/* ── Scans by day ─────────────────────────────────────────────────────── */}
          <ScanTrenchChart stats={stats} period={period} />

          {/* ── Top items ────────────────────────────────────────────────────────── */}
          <Section
            title="Top items"
            subtitle={advanced ? 'Views + order conversion' : 'Most viewed menu items'}
            icon={TrendingUp}
          >
            <TopItemsTable items={stats.topItems} showConversion={!!advanced} />
          </Section>
        </>
      ) : (
        <>
          <AnalyticsLockedNotice level={'advance'} onNavigate={onNavigate} />
          {advanced && (
            <>

              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={Users}
                  label="Avg Session Depth"
                  value={advanced.avgSessionDepth}
                  sub="Item views per QR scan"
                />
                <StatCard
                  icon={Clock}
                  label="Repeat Days"
                  value={advanced.repeatDays}
                  sub="Days with ≥2 sessions"
                />
              </div>


              <Section title="Engagement funnel" subtitle="Scan → browse → explore" icon={ArrowRight}>
                <Funnel steps={advanced.funnel} />
              </Section>


              <Section title="Peak hours" subtitle="All events by hour of day" icon={Clock}>
                <HeatmapHours data={advanced.peakHours} />
              </Section>


              <Section title="Busiest days" subtitle="Scan activity by day of week" icon={Calendar}>
                <BarChart data={advanced.peakDays} height={72} />
              </Section>


              <Section title="QR code performance" subtitle="Scans per QR code" icon={QrCode}>
                <QrBreakdown data={advanced.qrBreakdown} />
              </Section>


              {
                canUseOrdering && advanced.orders ? (
                  <Section title="Order analytics" subtitle="Revenue & order breakdown" icon={ShoppingBag}>
                    <OrderStats data={advanced.orders} />
                  </Section>
                ) : (
                  !canUseOrdering && (
                    <Section title="Order analytics" icon={ShoppingBag}>
                      <div
                        className="flex flex-col items-center justify-center py-6 gap-2 text-center"
                      >
                        <ShoppingBag size={28} style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          Ordering is not enabled on your plan.
                        </p>
                      </div>
                    </Section>
                  )
                )
              }


              {comparison && (
                <Section
                  title="Period comparison"
                  subtitle={`This ${period} vs previous ${period}`}
                  icon={TrendingUp}
                >
                  <ComparisonRow data={comparison} />
                </Section>
              )}
            </>
          )}

        </>
      )}

    </div>
  );
}

