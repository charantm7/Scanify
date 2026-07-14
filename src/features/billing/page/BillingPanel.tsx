'use client';

import { useState, type ReactNode } from 'react';
import { Check, Zap, Crown, Building2, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { AppProvider } from '../../../context/AppContext';
import CheckoutModal from '../components/CheckoutModal';
import { comparePlanChange, type PlanKey, type BillingCycle } from '../lib/plans';

const PLAN_CARDS = [
  {
    key: 'basic',
    name: 'Basic',
    tagline: 'Ideal for cafés & small menus',
    monthlyPrice: 299,
    annualPrice: 2999,
    annualSave: '₹589',
    features: [
      'Up to 20 menu items',
      'Add images (up to 10 items)',
      'Basic customization (colors)',
      'QR Code Menu',
      'Unlimited scans',
      'Quick Setup & Go Live',
    ],
    icon: Zap,
    featured: false,
  },
  {
    key: 'starter',
    name: 'Starter',
    tagline: 'Get your digital menu live in minutes',
    monthlyPrice: 799,
    annualPrice: 7999,
    annualSave: '₹1,589',
    features: [
      'Everything in Basic +',
      'QR Ordering System',
      'Up to 50 menu items',
      'Up to 2000 orders/month',
      'Customer cart & checkout',
      'Live order dashboard',
      'Add images (up to 20 items)',
      'Remove Scanify branding',
    ],
    icon: Crown,
    featured: false,
  },
  {
    key: 'growth',
    name: 'Growth',
    tagline: 'Boost engagement & grow your sales',
    monthlyPrice: 1299,
    annualPrice: 12999,
    annualSave: '₹2,589',
    features: [
      'Everything in Starter +',
      'Unlimited orders & items',
      'Unlimited images',
      'Realtime kitchen workflow',
      'Item availability toggle',
      'Ratings & feedback',
      'Google Reviews integration',
      'Basic analytics',
    ],
    icon: Building2,
    featured: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'Scale with advanced insights',
    monthlyPrice: 1999,
    annualPrice: 19999,
    annualSave: '₹3,989',
    features: [
      'Everything in Growth +',
      'Multi-branch order management',
      'Advanced order analytics',
      'Staff accounts & permissions',
      'Custom subdomain',
      'Full customization',
      'Dedicated priority support',
    ],
    icon: Crown,
    featured: false,
  },
] as const;

export default function BillingPanel() {
  return (
    <AppProvider>
      <BillingPanelInner />
    </AppProvider>
  );
}

interface CheckoutTarget {
  plan: PlanKey;
  billingCycle: BillingCycle;
  startTrial: boolean;
}

export function BillingPanelInner() {
  const { planLabel, plan, subscription, isTrialing, isFreeTier, trialHoursLeft, trialDaysLeft, loading } = useApp();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget | null>(null);

  // The billing cycle the account is actually paying/committed to right now
  // (as opposed to the cycle toggle above, which is just what the user is
  // browsing). Falls back to null when there's no live subscription yet
  // (e.g. free tier before any purchase), so nothing can match it.
  const activeCycle: BillingCycle | null = subscription?.billing_cycle ?? null;

  let subtitle: string;
  if (isTrialing) {
    subtitle = `Free Trial — ${trialHoursLeft}h remaining (${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''})`;
  } else if (isFreeTier) {
    subtitle = 'Trial ended. Choose a plan to continue.';
  } else {
    subtitle = `You're on the ${planLabel} plan`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne font-bold text-2xl text-theme">Plans & Billing</h1>
        <p className="text-sm text-theme2">{subtitle}</p>
      </div>

      {/* Billing cycle toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl p-1" style={{ background: 'var(--accentlt)' }}>
          {(['monthly', 'annual'] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition"
              style={
                billingCycle === cycle
                  ? { background: 'var(--accent)', color: 'white' }
                  : { color: 'var(--text2)' }
              }
            >
              {cycle === 'monthly' ? 'Monthly' : 'Annual (save up to 17%)'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLAN_CARDS.map((p) => {
          // "Current Plan" only applies to the EXACT plan + billing cycle
          // combination the account is actually on — Starter Monthly and
          // Starter Annual are different commitments, so only one of them
          // can ever be "current" at a time, regardless of which cycle the
          // toggle above happens to be browsing.
          const isCurrentPlan =
            p.key === plan && billingCycle === activeCycle && !isTrialing && !isFreeTier;
          const isTrialPlan = p.key === plan && isTrialing;
          const Icon = p.icon;
          const price = billingCycle === 'monthly' ? p.monthlyPrice : p.annualPrice;

          // Correct upgrade/downgrade/cycle-change classification —
          // considers BOTH plan tier and billing cycle rather than just
          // rank, so Starter-Monthly -> Starter-Annual is a same-tier
          // "cycle change" rather than being mis-labelled by a naive
          // rank-only comparison.
          const changeType =
            plan && activeCycle && !isFreeTier && !isTrialing
              ? comparePlanChange(plan as PlanKey, activeCycle, p.key, billingCycle)
              : null;

          let buttonLabel: ReactNode;
          if (isCurrentPlan) {
            buttonLabel = 'Current Plan';
          } else if (isFreeTier && !isTrialing) {
            buttonLabel = (
              <>
                Subscribe <ArrowRight size={13} />
              </>
            );
          } else if (changeType === 'downgrade') {
            buttonLabel = (
              <>
                {`Downgrade to ${p.name}`} <ArrowRight size={13} />
              </>
            );
          } else if (changeType === 'cycle_change') {
            buttonLabel = (
              <>
                {`Switch to ${billingCycle === 'monthly' ? 'Monthly' : 'Annual'}`} <ArrowRight size={13} />
              </>
            );
          } else {
            buttonLabel = (
              <>
                {`Upgrade to ${p.name}`} <ArrowRight size={13} />
              </>
            );
          }

          return (
            <div
              key={p.key}
              className={`rounded-2xl border flex flex-col overflow-hidden transition-all ${p.featured ? 'ring-2 ring-[var(--accent)]' : ''
                }`}
              style={{
                borderColor: isCurrentPlan || isTrialPlan ? 'var(--accent)' : 'var(--border)',
                background: 'var(--card)',
              }}
            >
              {p.featured && (
                <div
                  className="text-center py-1.5 text-xs font-bold text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  MOST POPULAR
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--accentlt)' }}
                  >
                    <Icon size={15} style={{ color: 'var(--accent)' }} />
                  </div>
                  <span className="font-bold text-theme text-sm">{p.name}</span>
                  {isCurrentPlan && (
                    <span
                      className="ml-auto text-[10px] px-2 py-0.5 rounded-full text-white font-semibold"
                      style={{ background: 'var(--accent)' }}
                    >
                      Active
                    </span>
                  )}
                  {isTrialPlan && (
                    <span
                      className="ml-auto text-[10px] px-2 py-0.5 rounded-full text-white font-semibold"
                      style={{ background: 'var(--accent)' }}
                    >
                      Trial
                    </span>
                  )}
                  {!isCurrentPlan && !isTrialPlan && changeType === 'downgrade' && (
                    <span
                      className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'var(--accentlt)', color: 'var(--text2)' }}
                    >
                      Downgrade
                    </span>
                  )}
                  {!isCurrentPlan && !isTrialPlan && changeType === 'upgrade' && (
                    <span
                      className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold text-white"
                      style={{ background: 'var(--accent)' }}
                    >
                      Upgrade
                    </span>
                  )}
                </div>

                <p className="text-xs text-theme2 mb-3">{p.tagline}</p>

                <div className="mb-1">
                  <span className="font-syne font-bold text-2xl text-theme">₹{price.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-theme2">
                    {billingCycle === 'monthly' ? '/month' : '/year'}
                  </span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-xs mb-4" style={{ color: 'var(--accent)' }}>
                    Save {p.annualSave} vs monthly
                  </p>
                )}
                {billingCycle === 'monthly' && <div className="mb-4" />}

                <ul className="space-y-1.5 flex-1 mb-5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-theme">
                      <Check size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={isCurrentPlan}
                  onClick={() =>
                    setCheckoutTarget({
                      plan: p.key,
                      billingCycle,
                      startTrial: isFreeTier && !isTrialing && !plan,
                    })
                  }
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    isCurrentPlan
                      ? { border: '1px solid var(--border)', color: 'var(--text2)' }
                      : { background: 'var(--accent)', color: 'white' }
                  }
                >
                  {buttonLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-theme2 text-center">
        All prices are exclusive of GST. Need help?{' '}
        <a href="mailto:hello@scanify.co.in" className="underline" style={{ color: 'var(--accent)' }}>
          hello@scanify.co.in
        </a>
      </p>

      {checkoutTarget && (
        <CheckoutModal
          open={Boolean(checkoutTarget)}
          plan={checkoutTarget.plan}
          billingCycle={checkoutTarget.billingCycle}
          startTrial={checkoutTarget.startTrial}
          onClose={() => setCheckoutTarget(null)}
          onConfirmed={() => setCheckoutTarget(null)}
        />
      )}
    </div>
  );
}
