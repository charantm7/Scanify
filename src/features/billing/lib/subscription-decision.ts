// lib/subscription-decision.ts
//
// Single source of truth for "given the account's current subscription row
// and a requested plan+cycle, what should happen?" Used by BOTH the
// /api/payments/preview route (read-only breakdown shown on the checkout
// screen) and /api/payments/create-order (which performs the actual DB
// writes + Razorpay order). Keeping this logic in one place guarantees the
// number shown to the user in the checkout preview is always exactly the
// number they get charged — no drift between the two routes.
import { SubscriptionRow } from '../../../types/supabase';
import {
  PlanKey,
  BillingCycle,
  comparePlanChange,
  calculateCreditBasedProration,
} from './plans';

export type DecisionType =
  | 'trial_start' // No subscription row exists at all (defensive fallback only)
  | 'trial_blocked' // A subscription row already exists — never grant a 2nd trial
  | 'fresh_purchase' // No live paid sub to prorate against — full price, fresh period
  | 'upgrade' // Plan tier goes up — charge now, prorated, period usually preserved
  | 'cycle_change' // Same tier, cycle differs — charge now, prorated, period reset
  | 'downgrade' // Plan tier goes down — deferred to period end, no charge now
  | 'same'; // Already exactly on this plan + cycle and active

export interface SubscriptionDecision {
  type: DecisionType;
  /** Final amount to charge via Razorpay, in paise. Present for upgrade/cycle_change/fresh_purchase. */
  amountPaise?: number;
  /** Sticker price of the destination plan+cycle before credit, in paise. */
  originalPricePaise?: number;
  /** Unused value credited from the current subscription, in paise. */
  creditPaise?: number;
  /** Whole days remaining in the current billing period, if prorating. */
  daysRemaining?: number;
  /** ISO timestamp the current period ends / the downgrade will take effect. */
  currentPeriodEnd?: string | null;
  /**
   * Whether current_period_start/end must be reset to a fresh full period
   * for the new cycle upon fulfilment (true for cycle_change, and for any
   * fresh_purchase — false for a same-cycle plan-only upgrade).
   */
  resetPeriod?: boolean;
}

// Statuses from which a paid plan/cycle CHANGE (upgrade/downgrade/cycle
// change) is meaningful. A subscription that is 'expiring' is still a live,
// paid, in-period subscription (just flagged for an upcoming renewal
// reminder) so it must be treated the same as 'active' here.
const ACTIVE_LIKE_STATUSES: ReadonlySet<string> = new Set(['active', 'expiring']);

export function buildSubscriptionDecision(
  existingSub: SubscriptionRow | null,
  newPlan: PlanKey,
  newCycle: BillingCycle,
  wantsTrial: boolean,
  now: Date = new Date()
): SubscriptionDecision {
  // ---- Trial requests are special-cased and never fall through to paid logic ----
  if (wantsTrial) {
    if (!existingSub) {
      // Defensive fallback only. In the normal flow, onboarding ALWAYS
      // creates the subscription row up front with status='trialing', so
      // this branch should not be reachable in practice — but if that
      // invariant is ever broken (e.g. a hotel created outside onboarding),
      // this keeps the account from being permanently stuck instead of
      // silently failing.
      return { type: 'trial_start' };
    }
    // A subscription row already exists — it was created during onboarding.
    // Never grant a second trial from this endpoint, regardless of
    // trial_used/status, so the client's "startTrial" flag can never be
    // used to re-roll a free trial.
    return { type: 'trial_blocked' };
  }

  const isPaidActive = Boolean(existingSub && ACTIVE_LIKE_STATUSES.has(existingSub.status));

  if (!isPaidActive) {
    // No live paid subscription to prorate against (trialing / expired /
    // cancelled / past_due / no row at all) — charge full sticker price
    // for a brand-new full period.
    return { type: 'fresh_purchase' };
  }

  const currentPlan = existingSub!.plan as PlanKey;
  const currentCycle = existingSub!.billing_cycle as BillingCycle;

  const changeType = comparePlanChange(currentPlan, currentCycle, newPlan, newCycle);

  if (changeType === 'same') {
    return { type: 'same' };
  }

  if (changeType === 'downgrade') {
    return {
      type: 'downgrade',
      currentPeriodEnd: existingSub!.current_period_end,
    };
  }

  // upgrade or cycle_change — both are immediate & credit-based.
  const periodEnd = existingSub!.current_period_end ? new Date(existingSub!.current_period_end) : null;

  const proration = periodEnd
    ? calculateCreditBasedProration(currentPlan, currentCycle, newPlan, newCycle, periodEnd, now)
    : null;

  if (!proration) {
    // No time left to prorate against (period already lapsed but the cron
    // hasn't caught up yet) — treat as a fresh purchase, not a ₹0 charge.
    return { type: 'fresh_purchase' };
  }

  return {
    type: changeType === 'cycle_change' ? 'cycle_change' : 'upgrade',
    amountPaise: proration.amountPaise,
    originalPricePaise: proration.originalPricePaise,
    creditPaise: proration.creditPaise,
    daysRemaining: proration.daysRemaining,
    currentPeriodEnd: existingSub!.current_period_end,
    resetPeriod: proration.cycleChanged,
  };
}
