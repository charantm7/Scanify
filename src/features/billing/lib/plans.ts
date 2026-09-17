// lib/plans.ts
//
// Server-side (but isomorphic — no Node-only APIs) source of truth for plan
// pricing, duration, and all upgrade/downgrade/proration math. Safe to
// import from client components too (pricing cards, checkout UI) since it
// has zero server-only imports (no supabase-admin, no razorpay, no secrets).
//
// MUST match the seed values in your plan_pricing table. We hardcode here
// too (rather than only trusting the DB) so a misconfigured DB row can
// never silently undercharge a user. If you change pricing, update BOTH
// this file and the DB seed.

export type PlanKey = 'basic' | 'starter' | 'growth' | 'pro';
export type BillingCycle = 'monthly' | 'annual';

export const TRIAL_DAYS = 4;

// Minimum charge floor so we never create a ₹0 or negative Razorpay order.
export const MIN_CHARGE_PAISE = 1000; // ₹10

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

// Ordinal ranking used to decide upgrade vs downgrade BY PLAN TIER ONLY.
export const PLAN_RANK: Record<PlanKey, number> = {
  basic: 0,
  starter: 1,
  growth: 2,
  pro: 3,
};

/** Pure plan-tier comparison — does NOT consider billing cycle. */
export function comparePlans(a: PlanKey, b: PlanKey): 'upgrade' | 'downgrade' | 'same' {
  if (PLAN_RANK[a] === PLAN_RANK[b]) return 'same';
  // a -> b: is b higher (upgrade) or lower (downgrade) than a?
  return PLAN_RANK[b] > PLAN_RANK[a] ? 'upgrade' : 'downgrade';
}

export type PlanChangeType = 'same' | 'upgrade' | 'downgrade' | 'cycle_change';

/**
 * Combined plan+cycle change classification used by the checkout flow.
 *
 * Business rules (deliberate & simple):
 *  - Same plan, same cycle             -> 'same'        (already subscribed)
 *  - Plan tier goes up (any cycle)     -> 'upgrade'      (charge now, prorated;
 *                                         unused value always follows the user
 *                                         forward — see carryOverDays below)
 *  - Plan tier goes down (any cycle)   -> 'downgrade'    (deferred to period
 *                                         end, NEVER charged immediately)
 *  - Same tier, monthly -> annual      -> 'cycle_change' (charge now, prorated,
 *                                         fresh annual period)
 *  - Same tier, annual -> monthly      -> 'downgrade'    (deferred: shortening
 *                                         the commitment is not something we
 *                                         charge for mid-period, and applying
 *                                         it immediately would strand the
 *                                         annual time already paid for)
 */
export function comparePlanChange(
  currentPlan: PlanKey,
  currentCycle: BillingCycle,
  newPlan: PlanKey,
  newCycle: BillingCycle
): PlanChangeType {
  const tierComparison = comparePlans(currentPlan, newPlan);

  if (tierComparison === 'upgrade') return 'upgrade';
  if (tierComparison === 'downgrade') return 'downgrade';

  // Same plan tier — the only remaining question is which way the billing
  // cycle moved.
  if (currentCycle === newCycle) return 'same';
  return currentCycle === 'monthly' && newCycle === 'annual' ? 'cycle_change' : 'downgrade';
}

export interface ProrationResult {
  /** Amount to actually charge via Razorpay, in paise. Always >= MIN_CHARGE_PAISE. */
  amountPaise: number;
  /** Sticker price of the destination plan+cycle, in paise, before credit. */
  originalPricePaise: number;
  /** Unused value of the current subscription applied as credit, in paise. */
  creditPaise: number;
  /** Whole days remaining in the CURRENT billing period at calculation time. */
  daysRemaining: number;
  /**
   * Whether the destination differs in BILLING CYCLE from the source. When
   * true, the caller must reset current_period_start/end to a fresh full
   * period for the NEW cycle (rather than preserving the old
   * current_period_end) — the user is paying for a new commitment length,
   * not just a mid-cycle tier change.
   */
  cycleChanged: boolean;
  /**
   * Extra days to APPEND to that fresh period, funded by credit that exceeded
   * the destination's full sticker price.
   *
   * Without this, a cross-cycle upgrade silently destroyed paid time: going
   * from growth-annual with 300 days left (~₹10,684 of unused value) to
   * pro-monthly capped the credit at pro-monthly's ₹1,999 sticker and then
   * reset the period to a bare 30 days — about ₹10.6k of already-paid time
   * simply vanished. The leftover credit is now converted into days at the
   * DESTINATION plan's daily rate, so value is preserved across the switch
   * (300 growth days become ~160 pro days) instead of being forfeited.
   *
   * Always 0 when the cycle is unchanged, since that path deliberately
   * preserves the existing current_period_end and has nothing to append to.
   */
  carryOverDays: number;
}

/**
 * Credit-based proration for ANY plan and/or billing-cycle change — the
 * single source of truth for "what do we charge right now", used for both
 * same-cycle plan upgrades (starter-monthly -> growth-monthly) AND
 * cross-cycle changes (starter-monthly -> starter-annual, growth-annual ->
 * pro-monthly, etc).
 *
 * Credit = remaining unused value of the CURRENT subscription, computed
 * from the CURRENT plan's OWN cycle daily rate (never the new cycle's
 * rate), multiplied by whole days left until current_period_end.
 *
 * Charge = destination baseline − credit, floored at MIN_CHARGE_PAISE, where
 * the baseline is:
 *   - the full sticker price, when the cycle changes (fulfilment grants a
 *     brand-new full period at the new cycle); or
 *   - the new plan's own daily rate over `daysRemaining`, when the cycle is
 *     unchanged (fulfilment preserves the existing current_period_end, so the
 *     user only gets `daysRemaining` days of the new plan, not a fresh full
 *     one). Charging full sticker price for a partial period is what caused
 *     users to be overcharged on mid-cycle tier upgrades.
 *
 * Credit never exceeds the baseline, so this function never implies a refund;
 * any excess is returned as `carryOverDays` instead.
 *
 * Returns null when there's no time left to prorate against (the period
 * has technically already lapsed but the cron hasn't caught up yet) —
 * callers should treat that as "charge the new plan's full sticker price"
 * (a fresh purchase), not a ₹0 prorate.
 */
export function calculateCreditBasedProration(
  currentPlan: PlanKey,
  currentCycle: BillingCycle,
  newPlan: PlanKey,
  newCycle: BillingCycle,
  currentPeriodEnd: Date,
  now: Date = new Date()
): ProrationResult | null {
  const msRemaining = currentPeriodEnd.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));

  if (daysRemaining <= 0) return null;

  const { amountPaise: currentPrice, durationDays: currentDurationDays } = getPlanPricing(
    currentPlan,
    currentCycle
  );

  const { amountPaise: newStickerPaise, durationDays: newDurationDays } = getPlanPricing(
    newPlan,
    newCycle
  );

  const cycleChanged = currentCycle !== newCycle;

  const newDailyRate = newStickerPaise / newDurationDays;

  const originalPricePaise = cycleChanged
    ? newStickerPaise
    : Math.round(newDailyRate * daysRemaining);

  const currentDailyRate = currentPrice / currentDurationDays;
  const rawCredit = Math.round(currentDailyRate * daysRemaining);

  // Never let credit exceed the destination price...
  const creditPaise = Math.min(rawCredit, originalPricePaise);

  // ...but don't throw the excess away either. Convert whatever the
  // destination price couldn't absorb into extra days at the destination's own
  // daily rate. Only meaningful when the period is being reset.
  const carryOverDays = cycleChanged
    ? Math.floor((rawCredit - creditPaise) / newDailyRate)
    : 0;

  const rawAmount = originalPricePaise - creditPaise;
  const amountPaise = Math.max(rawAmount, MIN_CHARGE_PAISE);

  return {
    amountPaise,
    originalPricePaise,
    creditPaise,
    daysRemaining,
    cycleChanged,
    carryOverDays,
  };
}
