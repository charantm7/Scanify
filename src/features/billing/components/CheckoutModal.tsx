'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { useRazorpayCheckout, type CheckoutPreview } from '../hooks/useRazorpayCheckout';
import type { PlanKey, BillingCycle } from '../lib/plans';

const PLAN_LABELS: Record<PlanKey, string> = {
  basic: 'Basic',
  starter: 'Starter',
  growth: 'Growth',
  pro: 'Pro',
};

function formatRupees(paise: number | undefined | null): string {
  if (paise === undefined || paise === null) return '—';
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

interface CheckoutModalProps {
  open: boolean;
  plan: PlanKey;
  billingCycle: BillingCycle;
  startTrial?: boolean;
  onClose: () => void;
  /** Called once the confirm action has fully resolved (paid, scheduled, or trial-started). */
  onConfirmed?: () => void;
}

/**
 * Checkout confirmation screen shown BEFORE Razorpay ever opens. Fetches a
 * read-only pricing breakdown from /api/payments/preview, lets the user
 * review it, and only calls startCheckout() (which hits create-order and
 * then opens Razorpay, or applies the scheduled downgrade / trial) once
 * they explicitly confirm.
 */
export default function CheckoutModal({
  open,
  plan,
  billingCycle,
  startTrial = false,
  onClose,
  onConfirmed,
}: CheckoutModalProps) {
  const { getPreview, startCheckout, loading, previewLoading, error, setError } = useRazorpayCheckout();
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleClose = () => {
    setPreview(null);
    setError(null);
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const data = await getPreview(plan, billingCycle, startTrial);
      if (!cancelled) setPreview(data);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, plan, billingCycle, startTrial]);

  if (!open) return null;

  const isBlocked = preview?.type === 'same' || preview?.type === 'trial_blocked';
  const isDowngrade = preview?.type === 'downgrade';
  const isTrial = preview?.type === 'trial_start';
  const isPayable = Boolean(preview?.payable);

  const handleConfirm = async () => {
    setConfirming(true);
    await startCheckout(plan, billingCycle, startTrial);
    setConfirming(false);
    onConfirmed?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(15, 15, 15, 0.45)' }}
      onClick={handleClose}
    >
      <div
        className="
          w-[95vw]
          max-w-[900px]
          sm:w-[90vw]
          md:w-[80vw]
          lg:w-[70vw]
          xl:w-[60vw]
          rounded-2xl
          overflow-hidden
          max-h-[90vh]
          overflow-y-auto
        "
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2 className="font-syne font-bold text-lg text-theme">Checkout</h2>
            <p className="text-xs text-theme2">
              {PLAN_LABELS[plan]} · {billingCycle === 'monthly' ? 'Monthly' : 'Annual'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition"
            style={{ background: 'var(--accentlt)' }}
            aria-label="Close checkout"
          >
            <X size={16} style={{ color: 'var(--text2)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {previewLoading && !preview && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-theme2">
              <Loader2 size={16} className="animate-spin" />
              Loading checkout details…
            </div>
          )}

          {error && (
            <div
              className="rounded-xl p-3 text-sm"
              style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C' }}
            >
              {error}
            </div>
          )}

          {preview && isBlocked && (
            <div
              className="rounded-xl p-4 text-sm flex items-start gap-2.5"
              style={{ background: 'var(--accentlt)', color: 'var(--text2)' }}
            >
              <Info size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent)' }} />
              <span>{preview.message}</span>
            </div>
          )}

          {preview && isDowngrade && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-theme2">Plan</span>
                <span className="font-semibold text-theme">{PLAN_LABELS[plan]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-theme2">Billing Cycle</span>
                <span className="font-semibold text-theme capitalize">{billingCycle}</span>
              </div>
              <div
                className="rounded-xl p-4 text-sm flex items-start gap-2.5"
                style={{ background: 'var(--accentlt)', color: 'var(--text2)' }}
              >
                <Info size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent)' }} />
                <span>
                  You will not be charged today. This plan takes effect automatically on{' '}
                  <strong className="text-theme">{formatDate(preview.effectiveAt)}</strong>, when your
                  current billing period ends.
                </span>
              </div>
            </>
          )}

          {preview && isTrial && (
            <div
              className="rounded-xl p-4 text-sm flex items-start gap-2.5"
              style={{ background: 'var(--accentlt)', color: 'var(--text2)' }}
            >
              <Info size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent)' }} />
              <span>{preview.message}</span>
            </div>
          )}

          {preview && isPayable && !isTrial && (
            <div className="space-y-4">
              <Row label="Plan" value={PLAN_LABELS[plan]} />
              <Row label="Billing Cycle" value={billingCycle === 'monthly' ? 'Monthly' : 'Annual'} />
              <Row label="Original Price" value={formatRupees(preview.originalPricePaise)} />
              {!!preview.creditPaise && (
                <Row
                  label={`Credit (${preview.daysRemaining ?? 0} day${preview.daysRemaining === 1 ? '' : 's'} remaining)`}
                  value={`− ${formatRupees(preview.creditPaise)}`}
                  valueColor="var(--accent)"
                />
              )}
              <Row label="Taxes (GST)" value={preview.taxPaise ? formatRupees(preview.taxPaise) : 'Not applicable'} />
              <div style={{ borderTop: '1px dashed var(--border)' }} className="pt-2.5 flex justify-between items-center">
                <span className="text-sm font-semibold text-theme">Total Payable</span>
                <span className="font-syne font-bold text-xl text-theme">{formatRupees(preview.amountPaise)}</span>
              </div>

              {preview.periodWillReset && (
                <p className="text-[11px] text-theme2 leading-relaxed">
                  Switching billing cycle starts a fresh {billingCycle} period from today.
                </p>
              )}
              <p className="text-[11px] text-theme2">{preview.taxNote}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <ShieldCheck size={15} style={{ color: 'var(--text2)' }} className="hidden sm:block" />
          <button
            onClick={handleClose}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-semibold transition"
            style={{ border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            Cancel
          </button>
          <button
            disabled={isBlocked || previewLoading || confirming || loading === plan}
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)' }}
          >
            {confirming || loading === plan ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processing…
              </>
            ) : isDowngrade ? (
              <>
                Schedule Downgrade
                <ArrowRight size={14} />
              </>
            ) : isTrial ? (
              <>
                Start Free Trial
                <ArrowRight size={14} />
              </>
            ) : (
              <>
                Pay {formatRupees(preview?.amountPaise)}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-theme2">{label}</span>
      <span className="font-medium text-theme" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </span>
    </div>
  );
}
