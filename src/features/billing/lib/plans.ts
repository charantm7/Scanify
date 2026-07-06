// lib/plans.ts
// Server-side source of truth for plan pricing & duration.
// MUST match the seed values in sql/001_payments_migration.sql (plan_pricing table).
// We hardcode here too (rather than only trusting the DB) so that a
// compromised/misconfigured DB row can never silently undercharge a user —
// the API route cross-checks DB price against this constant and rejects
// on mismatch. If you change pricing, update BOTH this file and the SQL seed.

export type PlanKey = 'basic' | 'starter' | 'growth' | 'pro';
export type BillingCycle = 'monthly' | 'annual';

export const TRIAL_DAYS = 4;

interface PlanPricing {
  amountPaise: number;
  durationDays: number;
}

export const PLAN_PRICING: Record<PlanKey, Record<BillingCycle, PlanPricing>> = {
  basic: {
    monthly: { amountPaise: 29_900, durationDays: 30 },
    annual: { amountPaise: 299_900, durationDays: 365 },
  },
  starter: {
    monthly: { amountPaise: 79_900, durationDays: 30 },
    annual: { amountPaise: 799_900, durationDays: 365 },
  },
  growth: {
    monthly: { amountPaise: 129_900, durationDays: 30 },
    annual: { amountPaise: 1_299_900, durationDays: 365 },
  },
  pro: {
    monthly: { amountPaise: 199_900, durationDays: 30 },
    annual: { amountPaise: 1_999_900, durationDays: 365 },
  },
};

export const VALID_PLANS: PlanKey[] = ['basic', 'starter', 'growth', 'pro'];
export const VALID_CYCLES: BillingCycle[] = ['monthly', 'annual'];

export function isValidPlan(plan: unknown): plan is PlanKey {
  return typeof plan === 'string' && VALID_PLANS.includes(plan as PlanKey);
}

export function isValidCycle(cycle: unknown): cycle is BillingCycle {
  return typeof cycle === 'string' && VALID_CYCLES.includes(cycle as BillingCycle);
}

export function getPlanPricing(plan: PlanKey, cycle: BillingCycle): PlanPricing {
  return PLAN_PRICING[plan][cycle];
}

// Ordinal ranking used to decide upgrade vs downgrade. Index = "weight".
export const PLAN_RANK: Record<PlanKey, number> = {
  basic: 0,
  starter: 1,
  growth: 2,
  pro: 3,
};


export type SubscriptionAction =
  | "same"
  | "upgrade"
  | "downgrade";


export function compareSubscription(
  currentPlan: PlanKey,
  currentCycle: BillingCycle,
  selectedPlan: PlanKey,
  selectedCycle: BillingCycle
): SubscriptionAction {
  const currentRank = PLAN_RANK[currentPlan];
  const selectedRank = PLAN_RANK[selectedPlan];

  // Higher tier
  if (selectedRank > currentRank && !(currentCycle === 'annual' && selectedCycle === 'monthly')) {
    return "upgrade";
  }

  // Lower tier
  if (selectedRank < currentRank) {
    return "downgrade";
  }

  // Same tier, same cycle
  if (currentCycle === selectedCycle) {
    return "same";
  }

  // Same tier, billing cycle changed
  if (
    currentCycle === "monthly" &&
    selectedCycle === "annual"
  ) {
    return "upgrade";
  }

  return "downgrade";
}

export function comparePlans(a: PlanKey, b: PlanKey): 'upgrade' | 'downgrade' | 'same' {
  if (PLAN_RANK[a] === PLAN_RANK[b]) return 'same';
  return PLAN_RANK[a] > PLAN_RANK[b] ? 'downgrade' /* a is below b */ : 'upgrade';
}

/**
 * Prorated upgrade charge: the difference between the new plan's daily
 * rate and the old plan's daily rate, multiplied by days remaining in
 * the CURRENT billing cycle. period_end does not change.
 *
 * Daily rate is derived from each plan's price for the cycle the user
 * is currently on (billing_cycle doesn't change on an upgrade — you
 * upgrade within the same cycle type, e.g. monthly->monthly).
 *
 * Returns null if there's no time left to prorate (cycle already over)
 * or if days remaining is non-positive — caller should treat that as
 * "just charge the next full cycle normally" rather than prorate.
 */

export interface ProrationResult {
  originalPricePaise: number;
  creditPaise: number;
  payablePaise: number;
  daysRemaining: number;
  currentDailyRate: number;
  newDailyRate: number;
}

export function calculateProratedUpgrade(
  oldPlan: PlanKey,
  newPlan: PlanKey,
  currentBillingCycle: BillingCycle,
  newBillingCycle: BillingCycle,
  currentPeriodEnd: Date,
  now: Date = new Date()
): ProrationResult | null {
  const msRemaining = currentPeriodEnd.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));

  if (daysRemaining <= 0) return null;

  const { amountPaise: oldPrice, durationDays: oldDuration } = getPlanPricing(oldPlan, currentBillingCycle);
  const { amountPaise: newPrice, durationDays: newDuration } = getPlanPricing(newPlan, newBillingCycle);

  const currentDailyRate = oldPrice / oldDuration;
  const newDailyRate = newPrice / newDuration;

  const creditPaise = Math.round(currentDailyRate * daysRemaining);

  const payablePaise = Math.max(newPrice - creditPaise, 1000);

  return {
    originalPricePaise: newPrice,
    creditPaise,
    payablePaise,
    daysRemaining,
    currentDailyRate,
    newDailyRate
  };
}
