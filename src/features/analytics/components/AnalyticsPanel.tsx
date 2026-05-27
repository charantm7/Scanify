'use client';

import { useState } from 'react';
import {
  QrCode, ShoppingBag, TrendingUp,
  ArrowRight, Users, Clock, Calendar
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
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import AnalyticsSkeletonBlock from './SkeletonBlock';
import { buildBasicStats } from '../utils/build-basic-stats';
import PageHeader from './AnalyticsHeader';
import type { AnalyticsPeriod, AnalyticsLevel } from '../constants';
import { isAdvancedStats } from '../services/analytics.service';

import {
  useAnalytics,
} from '../hooks/useAnalytics';

import { useApp } from '../../../context/AppContext';
import ScanTrenchChart from './ScanTrenchChart';
import { AnalyticsLockedNotice } from '../../../components/ui/Consolenotices';



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


// Main panel

export default function AnalyticsPanel({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { canUseOrdering } = useApp();
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');
  const [level, setLevel] = useState<AnalyticsLevel>('basic');

  const { stats, loading, error, canViewBasicAnalytics, refetch } =
    useAnalytics(period);

  if (!canViewBasicAnalytics || !stats) {
    return (
      <div className="space-y-5">
        <PageHeader period={period} onPeriodChange={setPeriod} onRefetch={refetch} level={level} onLevelChange={setLevel} />
        <AnalyticsLockedNotice level={'basic'} onNavigate={onNavigate} />
      </div>
    )

  }

  const advanced = isAdvancedStats(stats) ? stats : null;
  const comparison = advanced?.comparison;

  const cards = buildBasicStats(stats, comparison);

  if (loading) {
    return <AnalyticsSkeletonBlock />
  }

  if (error) {
    return (
      <div className="space-y-5">
        <PageHeader period={period} onPeriodChange={setPeriod} onRefetch={refetch} level={level} onLevelChange={setLevel} />
        <ErrorBanner variant={'error'} title={'Failed to load Analytics'} message={error} onRetry={refetch} />
      </div>
    );
  }


  return (
    <div className="space-y-5">

      <PageHeader period={period} onPeriodChange={setPeriod} onRefetch={refetch} level={level} onLevelChange={setLevel} />


      {level === 'basic' ? (
        <>

          <StatCardsGrid cards={cards} />

          <ScanTrenchChart stats={stats} period={period} />

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
                <BarChart data={advanced.peakDays} />
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

