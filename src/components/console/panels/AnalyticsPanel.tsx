'use client';

import { useState } from 'react';
import {
  BarChart2, Eye, QrCode, ShoppingBag, TrendingUp, TrendingDown,
  Minus, Lock, Zap, Loader2, RefreshCw, ArrowRight, Users,
  Clock, Calendar, CreditCard, AlertCircle, ChevronDown,
} from 'lucide-react';

import {
  useAnalytics,
  isAdvancedStats,
  type AnalyticsPeriod,
  type DayStat,
  type HourStat,
  type DayOfWeekStat,
  type TopItem,
  type QrStat,
  type FunnelStep,
  type OrderStat,
  type PeriodComparison,
} from '../../../hooks/useAnalytics';
import { useApp } from '../../../context/AppContext';

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

// ── Tiny primitives ───────────────────────────────────────────────────────────

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

function currency(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function pctLabel(n: number) {
  if (n > 0) return `+${n}%`;
  if (n < 0) return `${n}%`;
  return '—';
}

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

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  change,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  change?: number; // changePct from comparison
}) {
  const positive = change !== undefined && change > 0;
  const negative = change !== undefined && change < 0;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--accentlt)' }}
        >
          <Icon size={16} style={{ color: 'var(--accent)' }} />
        </div>
        {change !== undefined && (
          <span
            className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: positive
                ? 'color-mix(in srgb, #22c55e 15%, transparent)'
                : negative
                  ? 'color-mix(in srgb, #ef4444 15%, transparent)'
                  : 'var(--accentlt)',
              color: positive ? '#16a34a' : negative ? '#dc2626' : 'var(--muted-foreground)',
            }}
          >
            {positive ? <TrendingUp size={10} /> : negative ? <TrendingDown size={10} /> : <Minus size={10} />}
            {pctLabel(change)}
          </span>
        )}
      </div>
      <div>
        <p
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--foreground)', fontFamily: 'var(--font-syne, sans-serif)' }}
        >
          {value}
        </p>
        <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          {label}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Period selector ───────────────────────────────────────────────────────────

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

function PeriodSelector({
  value,
  onChange,
}: {
  value: AnalyticsPeriod;
  onChange: (p: AnalyticsPeriod) => void;
}) {
  return (
    <div
      className="inline-flex rounded-xl p-1 gap-1"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {PERIODS.map(p => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={
            value === p.value
              ? { background: 'var(--accent)', color: '#fff' }
              : { color: 'var(--muted-foreground)' }
          }
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ── Bar chart (generic) ───────────────────────────────────────────────────────

function BarChart({
  data,
  height = 80,
  color = 'var(--accent)',
  formatLabel,
  formatValue,
  showEveryNth = 1,
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  formatLabel?: (l: string) => string;
  formatValue?: (v: number) => string;
  showEveryNth?: number;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative">
      {hovered !== null && data[hovered] && (
        <div
          className="absolute -top-8 text-xs font-semibold px-2 py-1 rounded-lg pointer-events-none z-10 whitespace-nowrap"
          style={{
            left: `${(hovered / data.length) * 100}%`,
            transform: 'translateX(-50%)',
            background: 'var(--foreground)',
            color: 'var(--background)',
          }}
        >
          {formatValue ? formatValue(data[hovered].value) : data[hovered].value}
        </div>
      )}
      <div className="flex items-end gap-px" style={{ height }}>
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 cursor-default"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{
                height: `${Math.max(3, (d.value / max) * (height - 16))}px`,
                background: hovered === i ? 'var(--accent)' : color,
                opacity: d.value === 0 ? 0.15 : hovered === i ? 1 : 0.75,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex mt-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            {i % showEveryNth === 0 && (
              <span
                className="text-[9px] block truncate"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {formatLabel ? formatLabel(d.label) : d.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Peak hours heatmap ────────────────────────────────────────────────────────

function HeatmapHours({ data }: { data: HourStat[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const [hovered, setHovered] = useState<number | null>(null);

  // Group into rows of 6 for a 4×6 grid
  const rows = [
    data.slice(0, 6),
    data.slice(6, 12),
    data.slice(12, 18),
    data.slice(18, 24),
  ];

  return (
    <div className="space-y-1">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1">
          {row.map((cell, ci) => {
            const idx = ri * 6 + ci;
            const intensity = cell.value === 0 ? 0 : 0.15 + (cell.value / max) * 0.85;
            return (
              <div
                key={cell.hour}
                className="flex-1 rounded-lg flex flex-col items-center justify-center cursor-default transition-transform hover:scale-110"
                style={{
                  height: 36,
                  background: `color-mix(in srgb, var(--accent) ${Math.round(intensity * 100)}%, var(--card))`,
                  border: '1px solid var(--border)',
                  opacity: hovered === idx ? 1 : 0.9,
                }}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                title={`${cell.label}: ${cell.value} events`}
              >
                <span
                  className="text-[8px] font-bold leading-none"
                  style={{ color: intensity > 0.5 ? '#fff' : 'var(--muted-foreground)' }}
                >
                  {cell.label.replace(' ', '')}
                </span>
                {cell.value > 0 && (
                  <span
                    className="text-[8px] leading-none mt-0.5"
                    style={{ color: intensity > 0.5 ? 'rgba(255,255,255,0.8)' : 'var(--muted-foreground)' }}
                  >
                    {cell.value}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Funnel ────────────────────────────────────────────────────────────────────

function Funnel({ steps }: { steps: FunnelStep[] }) {
  const max = steps[0]?.value || 1;

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={step.label}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {i + 1}
              </span>
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {step.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {step.dropPct > 0 && (
                <span className="text-xs" style={{ color: '#ef4444' }}>
                  −{step.dropPct}% drop
                </span>
              )}
              <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                {step.value.toLocaleString()}
              </span>
            </div>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--border)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(2, (step.value / max) * 100)}%`,
                background: `color-mix(in srgb, var(--accent) ${100 - i * 20}%, #a855f7)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Top items table ───────────────────────────────────────────────────────────

function TopItemsTable({
  items,
  showConversion,
}: {
  items: TopItem[];
  showConversion: boolean;
}) {
  if (!items.length) {
    return (
      <p className="text-sm text-center py-6" style={{ color: 'var(--muted-foreground)' }}>
        No item view data yet.
      </p>
    );
  }

  const maxViews = Math.max(...items.map(i => i.views), 1);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.item_id} className="flex items-center gap-3">
          <span
            className="text-xs font-bold w-5 text-right flex-shrink-0 tabular-nums"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {idx + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1 gap-2">
              <p
                className="text-sm font-medium truncate"
                style={{ color: 'var(--foreground)' }}
              >
                {item.item_name}
              </p>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className="text-xs tabular-nums font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  {item.views} views
                </span>
                {showConversion && item.orders > 0 && (
                  <span
                    className="text-xs tabular-nums px-1.5 py-0.5 rounded-md font-semibold"
                    style={{
                      background: 'color-mix(in srgb, #22c55e 15%, transparent)',
                      color: '#16a34a',
                    }}
                  >
                    {item.orders} orders · {item.convRate}%
                  </span>
                )}
              </div>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--border)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(item.views / maxViews) * 100}%`,
                  background: 'var(--accent)',
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── QR breakdown ─────────────────────────────────────────────────────────────

function QrBreakdown({ data }: { data: QrStat[] }) {
  if (!data.length) {
    return (
      <p className="text-sm text-center py-6" style={{ color: 'var(--muted-foreground)' }}>
        No QR scan data yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map(qr => (
        <div key={qr.qr_id}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
              {qr.label}
            </span>
            <span className="text-xs tabular-nums font-semibold ml-2 flex-shrink-0" style={{ color: 'var(--foreground)' }}>
              {qr.scans} · {qr.pct}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${qr.pct}%`, background: 'var(--accent)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Order stats ───────────────────────────────────────────────────────────────

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#f59e0b' },
  accepted: { label: 'Accepted', color: '#3b82f6' },
  preparing: { label: 'Preparing', color: '#8b5cf6' },
  ready: { label: 'Ready', color: '#06b6d4' },
  served: { label: 'Served', color: '#22c55e' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
};

function OrderStats({ data }: { data: OrderStat }) {
  const statusEntries = Object.entries(data.byStatus) as [keyof typeof data.byStatus, number][];
  const totalOrders = data.totalOrders || 1;

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders', value: data.totalOrders.toLocaleString() },
          { label: 'Total Revenue', value: currency(data.totalRevenue) },
          { label: 'Avg Order Value', value: currency(data.avgOrderValue) },
          { label: 'Orders / Day', value: String(data.ordersPerDay) },
        ].map(kpi => (
          <div
            key={kpi.label}
            className="rounded-xl p-3"
            style={{ background: 'var(--accentlt)', border: '1px solid var(--border)' }}
          >
            <p
              className="text-base font-bold tabular-nums"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-syne, sans-serif)' }}
            >
              {kpi.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Status distribution */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>
          Order status
        </p>
        <div className="space-y-2">
          {statusEntries
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([status, count]) => {
              const cfg = ORDER_STATUS_CONFIG[status];
              return (
                <div key={status} className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: cfg.color }}
                  />
                  <span className="text-sm flex-1" style={{ color: 'var(--foreground)' }}>
                    {cfg.label}
                  </span>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'var(--border)', width: 80 }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(count / totalOrders) * 100}%`,
                        background: cfg.color,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-semibold tabular-nums w-8 text-right"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Revenue by day */}
      {data.revenueByDay.some(d => d.value > 0) && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>
            Revenue by day
          </p>
          <BarChart
            data={data.revenueByDay}
            height={72}
            formatValue={v => currency(v)}
            showEveryNth={Math.ceil(data.revenueByDay.length / 10)}
          />
        </div>
      )}
    </div>
  );
}

// ── Comparison row ────────────────────────────────────────────────────────────

function ComparisonRow({ data }: { data: PeriodComparison }) {
  const items = [
    { label: 'QR Scans', ...data.scans },
    { label: 'Menu Views', ...data.menuViews },
    { label: 'Item Views', ...data.itemViews },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(item => {
        const up = item.changePct > 0;
        const down = item.changePct < 0;
        return (
          <div
            key={item.label}
            className="rounded-xl p-3 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
              {item.label}
            </p>
            <p
              className="text-lg font-bold tabular-nums"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-syne, sans-serif)' }}
            >
              {item.current.toLocaleString()}
            </p>
            <span
              className="inline-flex items-center gap-0.5 text-xs font-semibold mt-1"
              style={{
                color: up ? '#16a34a' : down ? '#dc2626' : 'var(--muted-foreground)',
              }}
            >
              {up ? <TrendingUp size={10} /> : down ? <TrendingDown size={10} /> : <Minus size={10} />}
              {pctLabel(item.changePct)} vs prev
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Upgrade gate ──────────────────────────────────────────────────────────────

function UpgradeGate({
  children,
  onUpgrade,
}: {
  children: React.ReactNode;
  onUpgrade?: () => void;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="blur-sm pointer-events-none select-none opacity-50" aria-hidden>
        {children}
      </div>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-6 text-center"
        style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', backdropFilter: 'blur(4px)' }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: 'var(--accentlt)' }}
        >
          <Lock size={20} style={{ color: 'var(--accent)' }} />
        </div>
        <p
          className="font-bold text-base mb-1"
          style={{ color: 'var(--foreground)', fontFamily: 'var(--font-syne, sans-serif)' }}
        >
          Pro Analytics
        </p>
        <p className="text-xs mb-4 max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
          Peak hours heatmap, funnel analysis, QR performance, order revenue, and period comparisons — all on the Pro plan.
        </p>
        <button
          onClick={onUpgrade}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          <Zap size={14} /> Upgrade to Pro
        </button>
      </div>
    </div>
  );
}

// ── Empty / loading states ────────────────────────────────────────────────────

function SkeletonBlock({ h = 'h-40' }: { h?: string }) {
  return (
    <div
      className={`${h} rounded-2xl animate-pulse`}
      style={{ background: 'var(--border)' }}
    />
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-2xl"
      style={{ background: 'color-mix(in srgb, #ef4444 10%, transparent)', border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)' }}
    >
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: '#dc2626' }}>
          Failed to load analytics
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          {message}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
        style={{ background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
      >
        <RefreshCw size={11} /> Retry
      </button>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function AnalyticsPanel({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { isTrialExpired, canUseOrdering } = useApp();
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');

  const { stats, loading, error, canViewBasicAnalytics, canViewAdvancedAnalytics, refetch } =
    useAnalytics(period);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <SkeletonBlock h="h-8" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <SkeletonBlock h="h-28" />
          <SkeletonBlock h="h-28" />
          <SkeletonBlock h="h-28" />
        </div>
        <SkeletonBlock h="h-48" />
        <SkeletonBlock h="h-64" />
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-5">
        <PageHeader period={period} onPeriodChange={setPeriod} onRefetch={refetch} />
        <ErrorBanner message={error} onRetry={refetch} />
      </div>
    );
  }

  // ── No access ───────────────────────────────────────────────────────────────
  if (!canViewBasicAnalytics || !stats) {
    return (
      <div className="space-y-5">
        <PageHeader period={period} onPeriodChange={setPeriod} onRefetch={refetch} />
        <UpgradeGate onUpgrade={() => onNavigate?.('billing')}>
          {/* placeholder blurred content */}
          <div className="space-y-4 pointer-events-none">
            <div className="grid sm:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-28 rounded-2xl" style={{ background: 'var(--border)' }} />
              ))}
            </div>
            <div className="h-48 rounded-2xl" style={{ background: 'var(--border)' }} />
          </div>
        </UpgradeGate>
      </div>
    );
  }

  const advanced = isAdvancedStats(stats) ? stats : null;
  const comparison = advanced?.comparison;

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader period={period} onPeriodChange={setPeriod} onRefetch={refetch} />

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

      {/* ── Basic stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={QrCode}
          label="QR Scans"
          value={stats.totalScans.toLocaleString()}
          sub="All QR scan events"
          change={comparison?.scans.changePct}
        />
        <StatCard
          icon={Eye}
          label="Menu Views"
          value={stats.totalMenuViews.toLocaleString()}
          sub="Menu opened events"
          change={comparison?.menuViews.changePct}
        />
        <StatCard
          icon={TrendingUp}
          label="Item Views"
          value={stats.totalItemViews.toLocaleString()}
          sub="Individual item taps"
          change={comparison?.itemViews.changePct}
        />
        <StatCard
          icon={Calendar}
          label="Active Days"
          value={stats.uniqueDays}
          sub="Days with ≥1 scan"
        />
      </div>

      {/* ── Advanced: session depth + repeat days ──────────────────────────── */}
      {advanced && (
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
      )}

      {/* ── Scans by day ─────────────────────────────────────────────────────── */}
      <Section title="Scans over time" subtitle={`QR scan events — last ${period}`} icon={BarChart2}>
        {stats.scansByDay.every(d => d.value === 0) ? (
          <p className="text-sm text-center py-6" style={{ color: 'var(--muted-foreground)' }}>
            No scan data for this period.
          </p>
        ) : (
          <BarChart
            data={stats.scansByDay}
            height={96}
            showEveryNth={Math.ceil(stats.scansByDay.length / 10)}
          />
        )}
      </Section>

      {/* ── Scan funnel — advanced ─────────────────────────────────────────── */}
      {advanced ? (
        <Section title="Engagement funnel" subtitle="Scan → browse → explore" icon={ArrowRight}>
          <Funnel steps={advanced.funnel} />
        </Section>
      ) : (
        <UpgradeGate onUpgrade={() => onNavigate?.('billing')}>
          <Section title="Engagement funnel" subtitle="Scan → browse → explore" icon={ArrowRight}>
            <div className="h-28 rounded-xl" style={{ background: 'var(--border)' }} />
          </Section>
        </UpgradeGate>
      )}

      {/* ── Peak hours — advanced ─────────────────────────────────────────── */}
      {advanced ? (
        <Section title="Peak hours" subtitle="All events by hour of day" icon={Clock}>
          <HeatmapHours data={advanced.peakHours} />
        </Section>
      ) : (
        <UpgradeGate onUpgrade={() => onNavigate?.('billing')}>
          <Section title="Peak hours" icon={Clock}>
            <div className="h-40 rounded-xl" style={{ background: 'var(--border)' }} />
          </Section>
        </UpgradeGate>
      )}

      {/* ── Day-of-week — advanced ─────────────────────────────────────────── */}
      {advanced && (
        <Section title="Busiest days" subtitle="Scan activity by day of week" icon={Calendar}>
          <BarChart data={advanced.peakDays} height={72} />
        </Section>
      )}

      {/* ── Top items ────────────────────────────────────────────────────────── */}
      <Section
        title="Top items"
        subtitle={advanced ? 'Views + order conversion' : 'Most viewed menu items'}
        icon={TrendingUp}
      >
        <TopItemsTable items={stats.topItems} showConversion={!!advanced} />
      </Section>

      {/* ── QR breakdown — advanced ───────────────────────────────────────── */}
      {advanced ? (
        <Section title="QR code performance" subtitle="Scans per QR code" icon={QrCode}>
          <QrBreakdown data={advanced.qrBreakdown} />
        </Section>
      ) : (
        <UpgradeGate onUpgrade={() => onNavigate?.('billing')}>
          <Section title="QR code performance" icon={QrCode}>
            <div className="h-24 rounded-xl" style={{ background: 'var(--border)' }} />
          </Section>
        </UpgradeGate>
      )}

      {/* ── Orders — advanced + ordering enabled ──────────────────────────── */}
      {advanced && (
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
      )}

      {/* ── Period comparison — advanced ──────────────────────────────────── */}
      {advanced && comparison && (
        <Section
          title="Period comparison"
          subtitle={`This ${period} vs previous ${period}`}
          icon={TrendingUp}
        >
          <ComparisonRow data={comparison} />
        </Section>
      )}
    </div>
  );
}

// ── Page header (extracted for reuse across loading/error states) ─────────────

function PageHeader({
  period,
  onPeriodChange,
  onRefetch,
}: {
  period: AnalyticsPeriod;
  onPeriodChange: (p: AnalyticsPeriod) => void;
  onRefetch: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h1
          className="font-bold text-2xl"
          style={{ color: 'var(--foreground)', fontFamily: 'var(--font-syne, sans-serif)' }}
        >
          Analytics
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          How your menu performs
        </p>
      </div>
      <div className="flex items-center gap-2">
        <PeriodSelector value={period} onChange={onPeriodChange} />
        <button
          onClick={onRefetch}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:opacity-80"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          title="Refresh"
        >
          <RefreshCw size={14} style={{ color: 'var(--muted-foreground)' }} />
        </button>
      </div>
    </div>
  );
}