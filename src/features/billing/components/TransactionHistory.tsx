'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Receipt,
  Copy,
  Check,
  ChevronRight,
  RefreshCcw,
  Loader2,
  ArrowUpCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Card, Badge, Modal, EmptyState, Skeleton, Alert, Button } from '../../../components/shared/UiComponents';

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'created' | 'authorized' | 'captured' | 'verified' | 'cancelled';

interface Transaction {
  id: string;
  plan: 'basic' | 'starter' | 'growth' | 'pro';
  billing_cycle: 'monthly' | 'annual';
  amount_paise: number;
  currency: string;
  status: PaymentStatus;
  is_renewal: boolean;
  is_proration: boolean;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  failure_reason: string | null;
  subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

const PLAN_LABELS: Record<Transaction['plan'], string> = {
  basic: 'Basic',
  starter: 'Starter',
  growth: 'Growth',
  pro: 'Pro',
};

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
}

function statusMeta(status: PaymentStatus): { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' } {
  switch (status) {
    case 'captured':
    case 'paid':
      return { label: 'Paid', variant: 'success' };
    case 'verified':
      return { label: 'Verified', variant: 'success' };
    case 'created':
    case 'pending':
    case 'authorized':
      return { label: 'Processing', variant: 'warning' };
    case 'failed':
      return { label: 'Failed', variant: 'error' };
    case 'cancelled':
      return { label: 'Cancelled', variant: 'error' };
    case 'refunded':
      return { label: 'Refunded', variant: 'neutral' };
    default:
      return { label: status, variant: 'neutral' };
  }
}

function indicatorMeta(tx: Transaction): { label: string; icon: typeof Sparkles } {
  if (tx.is_proration) return { label: 'Upgrade / Plan Change', icon: ArrowUpCircle };
  if (tx.is_renewal) return { label: 'Renewal', icon: RotateCcw };
  return { label: 'New Subscription', icon: Sparkles };
}

function CopyableId({ label, value }: { label: string; value: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return (
      <div className="flex justify-between text-sm py-1.5">
        <span className="text-theme2">{label}</span>
        <span className="text-theme2">—</span>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in insecure contexts — non-critical, ignore.
    }
  };

  return (
    <div className="flex items-center justify-between text-sm py-1.5 gap-3">
      <span className="text-theme2 flex-shrink-0">{label}</span>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 font-mono text-xs text-theme px-2 py-1 rounded-lg hover:bg-theme3 transition min-w-0"
        title="Click to copy"
      >
        <span className="truncate max-w-[220px]">{value}</span>
        {copied ? <Check size={12} style={{ color: 'var(--accent)' }} /> : <Copy size={12} className="flex-shrink-0" />}
      </button>
    </div>
  );
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const loadTransactions = useCallback(async (cursor: string | null) => {
    const url = new URL("/api/payments/transactions", window.location.origin);
    url.searchParams.set("limit", "20");

    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Could not load transaction history");
    }

    return data;
  }, []);

  const fetchPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      try {
        const data = await loadTransactions(cursor);

        setTransactions(prev =>
          append
            ? [...prev, ...data.transactions]
            : data.transactions
        );

        setNextCursor(data.nextCursor);
        setHasMore(Boolean(data.hasMore));
      } catch (err: any) {
        setError(err.message || "Could not load transaction history");
      } finally {
        append ? setLoadingMore(false) : setLoading(false);
      }
    },
    [loadTransactions]
  );


  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      setError(null);

      try {
        const data = await loadTransactions(null);

        if (!cancelled) {
          setTransactions(data.transactions);
          setNextCursor(data.nextCursor);
          setHasMore(Boolean(data.hasMore));
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Could not load transaction history");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, [loadTransactions]);


  return (
    <Card padding="p-0" className="overflow-hidden">
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h2 className="font-syne font-bold text-base text-theme">Transaction History</h2>
          <p className="text-xs text-theme2 mt-0.5">Every payment made towards your Scanify subscription</p>
        </div>
        <button
          onClick={() => fetchPage(null, false)}
          disabled={loading}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-50"
          style={{ background: 'var(--accentlt)' }}
          title="Refresh"
        >
          <RefreshCcw size={14} style={{ color: 'var(--accent)' }} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-4">
          <Alert type="error" message={error} />
        </div>
      )}

      {loading && (
        <div className="p-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!loading && transactions.length === 0 && !error && (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Your payment history will show up here once you upgrade, renew, or switch plans."
        />
      )}

      {!loading && transactions.length > 0 && (
        <>
          {/* Table header — desktop only */}
          <div
            className="hidden md:grid grid-cols-[1.4fr_1fr_0.9fr_1fr_1.3fr_auto] gap-3 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-theme2"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span>Plan</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Type</span>
            <span>Date &amp; Time</span>
            <span />
          </div>

          <div>
            {transactions.map((tx) => {
              const { label: statusLabel, variant: statusVariant } = statusMeta(tx.status);
              const { label: indicatorLabel, icon: IndicatorIcon } = indicatorMeta(tx);
              const { date, time } = formatDateTime(tx.created_at);

              return (
                <button
                  key={tx.id}
                  onClick={() => setSelected(tx)}
                  className="w-full text-left grid grid-cols-2 md:grid-cols-[1.4fr_1fr_0.9fr_1fr_1.3fr_auto] gap-x-3 gap-y-1 px-5 py-3.5 transition hover:bg-theme3"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm font-semibold text-theme">{PLAN_LABELS[tx.plan]}</p>
                    <p className="text-xs text-theme2 capitalize">{tx.billing_cycle}</p>
                  </div>
                  <div className="flex items-center md:block">
                    <span className="text-sm font-semibold text-theme">{formatRupees(tx.amount_paise)}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-theme2">
                    <IndicatorIcon size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    {indicatorLabel}
                  </div>
                  <div className="flex items-center text-xs text-theme2">
                    {date} · {time}
                  </div>
                  <div className="hidden md:flex items-center justify-end">
                    <ChevronRight size={16} style={{ color: 'var(--text2)' }} />
                  </div>
                </button>
              );
            })}
          </div>

          {hasMore && (
            <div className="px-5 py-4 flex justify-center" style={{ borderTop: '1px solid var(--border)' }}>
              <Button variant="secondary" size="sm" loading={loadingMore} onClick={() => fetchPage(nextCursor, true)}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}

      {selected && (
        <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Transaction Details">
          <TransactionDetail tx={selected} />
        </Modal>
      )}
    </Card>
  );
}

function TransactionDetail({ tx }: { tx: Transaction }) {
  const { label: statusLabel, variant: statusVariant } = statusMeta(tx.status);
  const { label: indicatorLabel, icon: IndicatorIcon } = indicatorMeta(tx);
  const { date, time } = formatDateTime(tx.created_at);

  return (
    <div className="space-y-5 ">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-syne font-bold text-2xl text-theme">{formatRupees(tx.amount_paise)}</p>
          <p className="text-xs text-theme2 mt-0.5">
            {PLAN_LABELS[tx.plan]} · <span className="capitalize">{tx.billing_cycle}</span>
          </p>
        </div>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      {tx.status === 'failed' && tx.failure_reason && (
        <Alert type="error" title="Payment failed" message={tx.failure_reason} />
      )}

      <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'var(--accentlt)' }}>
        <IndicatorIcon size={15} style={{ color: 'var(--accent)' }} />
        <span className="text-sm font-medium text-theme">{indicatorLabel}</span>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-theme2 mb-1.5">Date &amp; Time</p>
        <p className="text-sm text-theme">
          {date} at {time}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-theme2 mb-1">Identifiers</p>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          <CopyableId label="Transaction ID" value={tx.id} />
          <CopyableId label="Razorpay Order ID" value={tx.razorpay_order_id} />
          <CopyableId label="Razorpay Payment ID" value={tx.razorpay_payment_id} />
          <CopyableId label="Subscription ID" value={tx.subscription_id} />
        </div>
      </div>

      <div className="flex justify-between text-sm pt-1" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-theme2">Currency</span>
        <span className="font-medium text-theme">{tx.currency}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-theme2">Last updated</span>
        <span className="font-medium text-theme">
          {formatDateTime(tx.updated_at).date} · {formatDateTime(tx.updated_at).time}
        </span>
      </div>
    </div>
  );
}
