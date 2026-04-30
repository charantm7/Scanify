'use client';
import { Check, Zap, Crown, Building2, Clock, ArrowRight } from 'lucide-react';
import { useApp, PLANS } from '../../../context/AppContext';

const PLAN_CARDS = [
  {
    key: 'free',
    name: 'Free Trial',
    price: '₹0',
    period: '/2 days',
    desc: 'Try Scanify risk-free',
    features: ['1 restaurant', 'Up to 15 menu items', 'QR code generation', 'Basic menu page'],
    cta: 'Current Plan',
    disabled: true,
    icon: Clock,
  },
  {
    key: 'starter',
    name: 'Starter',
    price: '₹499',
    period: '/month',
    desc: 'For small restaurants',
    features: ['1 restaurant', 'Up to 50 menu items', 'QR code + download', 'Analytics dashboard', 'Custom categories'],
    cta: 'Upgrade to Starter',
    icon: Zap,
    featured: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '₹999',
    period: '/month',
    desc: 'For growing restaurants',
    features: ['Up to 3 restaurants', '200 menu items', 'Advanced analytics', 'Priority support', 'Custom branding'],
    cta: 'Upgrade to Pro',
    icon: Crown,
    featured: true,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For hotel chains & franchises',
    features: ['Unlimited restaurants', 'Unlimited items', 'White-label QR', 'Dedicated support', 'API access'],
    cta: 'Contact Us',
    icon: Building2,
  },
];

export default function BillingPanel() {
  const { plan, trialDaysLeft } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne font-bold text-2xl text-theme">Plans & Billing</h1>
        <p className="text-sm text-theme2">
          {plan === 'free'
            ? trialDaysLeft > 0
              ? `Free trial — ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} remaining`
              : 'Free trial ended. Upgrade to keep using Scanify.'
            : `You're on the ${PLANS[plan]?.label} plan`}
        </p>
      </div>

      {plan === 'free' && trialDaysLeft === 0 && (
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'var(--accentlt)', border: '1px solid var(--accent)' }}>
          <Zap size={18} style={{ color: 'var(--accent)' }} />
          <p className="text-sm font-semibold text-theme">Your free trial has ended. Choose a plan to continue adding items and accessing analytics.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLAN_CARDS.map((p) => {
          const isCurrentPlan = p.key === plan;
          const Icon = p.icon;
          return (
            <div key={p.key}
              className={`rounded-2xl border flex flex-col overflow-hidden transition-all ${p.featured ? 'ring-2' : ''}`}
              style={{
                borderColor: p.featured ? 'var(--accent)' : isCurrentPlan ? 'var(--accent)' : 'var(--border)',
                background: 'var(--card)',
                ...(p.featured ? { ringColor: 'var(--accent)' } : {}),
              }}>
              {p.featured && (
                <div className="text-center py-1.5 text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>
                  MOST POPULAR
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accentlt)' }}>
                    <Icon size={15} style={{ color: 'var(--accent)' }} />
                  </div>
                  <span className="font-bold text-theme text-sm">{p.name}</span>
                  {isCurrentPlan && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full text-white font-semibold" style={{ background: 'var(--accent)' }}>
                      Active
                    </span>
                  )}
                </div>
                <div className="mb-1">
                  <span className="font-syne font-bold text-2xl text-theme">{p.price}</span>
                  <span className="text-xs text-theme2">{p.period}</span>
                </div>
                <p className="text-xs text-theme2 mb-4">{p.desc}</p>
                <ul className="space-y-1.5 flex-1 mb-5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-theme">
                      <Check size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
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
                  }>
                  {isCurrentPlan ? 'Current Plan' : <>{p.cta} <ArrowRight size={13} /></>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-theme2 text-center">
        All prices are exclusive of GST. Need help? Email{' '}
        <a href="mailto:hello@scanify.co.in" className="underline" style={{ color: 'var(--accent)' }}>hello@scanify.co.in</a>
      </p>
    </div>
  );
}
