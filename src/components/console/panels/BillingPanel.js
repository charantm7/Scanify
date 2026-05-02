'use client';

import { Check, Zap, Crown, Building2, Clock, ArrowRight, Star } from 'lucide-react';
import { useApp, PLANS } from '../../../context/AppContext';

const PLAN_CARDS = [
  {
    key: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    desc: 'Basic access, no time limit',
    features: [
      '5 menu items',
      '1 QR code',
      'Basic menu page',
      'Public menu link',
    ],
    cta: 'Current Plan',
    disabled: true,
    icon: Clock,
  },
  {
    key: 'starter',
    name: 'Starter',
    price: '₹499',
    period: '/month',
    desc: 'Everything you need to grow',
    features: [
      '50 menu items',
      '10 QR codes',
      'Full analytics dashboard',
      'Custom categories',
      'Item availability toggle',
    ],
    cta: 'Upgrade to Starter',
    icon: Zap,
    featured: true,  // highlight this — it's what the trial gave them
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '₹999',
    period: '/month',
    desc: 'For growing restaurants',
    features: [
      'Up to 3 restaurants',
      '200 menu items',
      'Unlimited QR codes',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
    ],
    cta: 'Upgrade to Pro',
    icon: Crown,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For hotel chains & franchises',
    features: [
      'Unlimited restaurants',
      'Unlimited items',
      'White-label QR',
      'Dedicated support',
      'API access',
    ],
    cta: 'Contact Us',
    icon: Building2,
  },
];

export default function BillingPanel() {
  const { plan, dbPlan, isOnTrial, isFreeTier, trialHoursLeft, trialDaysLeft } = useApp();

  // Subtitle logic
  let subtitle;
  if (isOnTrial) {
    subtitle = `Free Trial — ${trialHoursLeft}h remaining (${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''})`;
  } else if (isFreeTier) {
    subtitle = 'Free trial ended. Choose a plan to unlock more features.';
  } else {
    subtitle = `You're on the ${PLANS[dbPlan]?.label ?? dbPlan} plan`;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-syne font-bold text-2xl text-theme">Plans & Billing</h1>
        <p className="text-sm text-theme2">{subtitle}</p>
      </div>

      {/* Trial active banner */}
      {isOnTrial && (
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: 'var(--accentlt)', border: '1px solid var(--accent)' }}
        >
          <Star size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-sm font-bold text-theme mb-0.5">You&apos;re on a free trial of Starter</p>
            <p className="text-xs text-theme2">
              You have full Starter access for <strong>{trialHoursLeft} more hours</strong>.
              After that you&apos;ll drop to 5 items & 1 QR code. Upgrade now to keep everything.
            </p>
          </div>
        </div>
      )}

      {/* Trial expired banner */}
      {isFreeTier && (
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'var(--accentlt)', border: '1px solid var(--accent)' }}
        >
          <Zap size={18} style={{ color: 'var(--accent)' }} />
          <p className="text-sm font-semibold text-theme">
            Your free trial has ended. Upgrade to continue where you left off.
          </p>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLAN_CARDS.map((p) => {
          // During trial, effective plan is "trial" (not "starter") so match on dbPlan for "active" badge
          const isCurrentPlan = p.key === dbPlan;
          const isTrialPlan = p.key === 'starter' && isOnTrial; // trial mirrors starter
          const Icon = p.icon;

          return (
            <div
              key={p.key}
              className={`rounded-2xl border flex flex-col overflow-hidden transition-all ${p.featured ? 'ring-2 ring-[var(--accent)]' : ''}`}
              style={{
                borderColor: (isCurrentPlan || isTrialPlan) ? 'var(--accent)' : 'var(--border)',
                background: 'var(--card)',
              }}
            >
              {p.featured && (
                <div className="text-center py-1.5 text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>
                  {isOnTrial ? 'YOUR TRIAL PLAN' : 'MOST POPULAR'}
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                {/* Plan name + active badge */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accentlt)' }}>
                    <Icon size={15} style={{ color: 'var(--accent)' }} />
                  </div>
                  <span className="font-bold text-theme text-sm">{p.name}</span>
                  {isCurrentPlan && !isOnTrial && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full text-white font-semibold" style={{ background: 'var(--accent)' }}>
                      Active
                    </span>
                  )}
                  {isTrialPlan && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full text-white font-semibold" style={{ background: 'var(--accent)' }}>
                      Trial
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-1">
                  <span className="font-syne font-bold text-2xl text-theme">{p.price}</span>
                  <span className="text-xs text-theme2">{p.period}</span>
                </div>
                <p className="text-xs text-theme2 mb-4">{p.desc}</p>

                {/* Features */}
                <ul className="space-y-1.5 flex-1 mb-5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-theme">
                      <Check size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  disabled={isCurrentPlan || p.disabled}
                  onClick={() => {
                    if (p.key === 'enterprise') window.open('mailto:hello@scanify.co.in', '_blank');
                    else alert('Payment integration coming soon! Contact support to upgrade.');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    isCurrentPlan || p.disabled
                      ? { border: '1px solid var(--border)', color: 'var(--text2)' }
                      : { background: 'var(--accent)', color: 'white' }
                  }
                >
                  {isCurrentPlan ? 'Current Plan' : <>{p.cta} <ArrowRight size={13} /></>}
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
    </div>
  );
}
