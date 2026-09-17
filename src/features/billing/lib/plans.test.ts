import { describe, it, expect } from 'vitest';
import {
  comparePlanChange,
  calculateCreditBasedProration,
  getPlanPricing,
  MIN_CHARGE_PAISE,
} from './plans';

const DAY_MS = 24 * 60 * 60 * 1000;

const NOW = new Date('2026-09-18T00:00:00.000Z');
const inDays = (days: number) => new Date(NOW.getTime() + days * DAY_MS);

describe('comparePlanChange', () => {
  it('treats an identical plan and cycle as "same"', () => {
    expect(comparePlanChange('starter', 'monthly', 'starter', 'monthly')).toBe('same');
  });

  it('treats any tier increase as an immediate upgrade, whichever way the cycle moves', () => {
    expect(comparePlanChange('starter', 'monthly', 'growth', 'monthly')).toBe('upgrade');
    expect(comparePlanChange('starter', 'monthly', 'growth', 'annual')).toBe('upgrade');
    expect(comparePlanChange('growth', 'annual', 'pro', 'monthly')).toBe('upgrade');
  });

  it('treats any tier decrease as a deferred downgrade, whichever way the cycle moves', () => {
    expect(comparePlanChange('growth', 'monthly', 'starter', 'monthly')).toBe('downgrade');
    expect(comparePlanChange('growth', 'monthly', 'starter', 'annual')).toBe('downgrade');
    expect(comparePlanChange('pro', 'annual', 'basic', 'monthly')).toBe('downgrade');
  });

  it('charges immediately for monthly -> annual on the same tier', () => {
    expect(comparePlanChange('growth', 'monthly', 'growth', 'annual')).toBe('cycle_change');
  });

  it('defers annual -> monthly on the same tier rather than charging for a shorter commitment', () => {
    expect(comparePlanChange('growth', 'annual', 'growth', 'monthly')).toBe('downgrade');
  });
});

describe('calculateCreditBasedProration', () => {
  it('returns null once the period has already lapsed, so callers fall back to full price', () => {
    expect(
      calculateCreditBasedProration('starter', 'monthly', 'growth', 'monthly', inDays(-1), NOW)
    ).toBeNull();
    expect(
      calculateCreditBasedProration('starter', 'monthly', 'growth', 'monthly', NOW, NOW)
    ).toBeNull();
  });

  describe('same-cycle tier upgrade', () => {
    // The user keeps their existing current_period_end, so they are only
    // buying `daysRemaining` days of the new plan — never a full fresh period.
    const result = calculateCreditBasedProration(
      'starter',
      'monthly',
      'growth',
      'monthly',
      inDays(15),
      NOW
    )!;

    it('prices the destination over the remaining days, not at full sticker', () => {
      const growthMonthly = getPlanPricing('growth', 'monthly');
      const fullSticker = growthMonthly.amountPaise;
      const expected = Math.round((fullSticker / growthMonthly.durationDays) * 15);

      expect(result.originalPricePaise).toBe(expected);
      expect(result.originalPricePaise).toBeLessThan(fullSticker);
    });

    it('credits the unused days at the CURRENT plan rate', () => {
      const starterMonthly = getPlanPricing('starter', 'monthly');
      expect(result.creditPaise).toBe(
        Math.round((starterMonthly.amountPaise / starterMonthly.durationDays) * 15)
      );
    });

    it('charges only the difference, and does not reset the period', () => {
      expect(result.amountPaise).toBe(result.originalPricePaise - result.creditPaise);
      expect(result.cycleChanged).toBe(false);
      expect(result.carryOverDays).toBe(0);
    });
  });

  describe('monthly -> annual on the same tier', () => {
    const result = calculateCreditBasedProration(
      'growth',
      'monthly',
      'growth',
      'annual',
      inDays(10),
      NOW
    )!;

    it('bills the full annual sticker, since a fresh annual period is granted', () => {
      expect(result.originalPricePaise).toBe(getPlanPricing('growth', 'annual').amountPaise);
      expect(result.cycleChanged).toBe(true);
    });

    it('discounts the unused monthly days and needs no carry-over', () => {
      const growthMonthly = getPlanPricing('growth', 'monthly');
      expect(result.creditPaise).toBe(
        Math.round((growthMonthly.amountPaise / growthMonthly.durationDays) * 10)
      );
      expect(result.amountPaise).toBe(result.originalPricePaise - result.creditPaise);
      // A month of credit cannot exceed a year's price, so nothing spills over.
      expect(result.carryOverDays).toBe(0);
    });
  });

  describe('tier upgrade that also shortens the cycle (annual -> monthly)', () => {
    // The regression case: ~300 days of paid growth-annual time being
    // converted to pro-monthly. Capping the credit at the monthly sticker and
    // resetting to a bare 30-day period used to forfeit the rest outright.
    const daysLeft = 300;
    const result = calculateCreditBasedProration(
      'growth',
      'annual',
      'pro',
      'monthly',
      inDays(daysLeft),
      NOW
    )!;

    const growthAnnual = getPlanPricing('growth', 'annual');
    const proMonthly = getPlanPricing('pro', 'monthly');
    const rawCredit = Math.round(
      (growthAnnual.amountPaise / growthAnnual.durationDays) * daysLeft
    );

    it('produces credit far larger than the destination sticker price', () => {
      expect(rawCredit).toBeGreaterThan(proMonthly.amountPaise);
    });

    it('caps the applied credit at the sticker price so no refund is implied', () => {
      expect(result.creditPaise).toBe(proMonthly.amountPaise);
      expect(result.amountPaise).toBe(MIN_CHARGE_PAISE);
    });

    it('carries the excess credit forward as extra days at the new plan rate', () => {
      const excess = rawCredit - proMonthly.amountPaise;
      const proDailyRate = proMonthly.amountPaise / proMonthly.durationDays;

      expect(result.carryOverDays).toBe(Math.floor(excess / proDailyRate));
      expect(result.carryOverDays).toBeGreaterThan(0);
    });

    it('preserves the paid value across the switch instead of forfeiting it', () => {
      const proDailyRate = proMonthly.amountPaise / proMonthly.durationDays;
      const grantedDays = proMonthly.durationDays + result.carryOverDays;

      // What they end up holding, valued at the new plan's rate, should match
      // what they had left over — allowing a day of flooring/rounding slack.
      const valueGranted = grantedDays * proDailyRate;
      expect(valueGranted).toBeGreaterThanOrEqual(rawCredit - proDailyRate);
      expect(valueGranted).toBeLessThanOrEqual(rawCredit + proDailyRate);

      // And they are strictly better off than the old bare-30-day behaviour.
      expect(grantedDays).toBeGreaterThan(proMonthly.durationDays);
    });
  });

  it('never charges below the Razorpay minimum, even when credit covers everything', () => {
    const result = calculateCreditBasedProration(
      'pro',
      'annual',
      'basic',
      'monthly',
      inDays(360),
      NOW
    )!;

    expect(result.amountPaise).toBe(MIN_CHARGE_PAISE);
    expect(result.amountPaise).toBeGreaterThan(0);
  });

  it('counts a partial day as a whole remaining day', () => {
    const result = calculateCreditBasedProration(
      'starter',
      'monthly',
      'growth',
      'monthly',
      new Date(NOW.getTime() + DAY_MS / 2),
      NOW
    )!;

    expect(result.daysRemaining).toBe(1);
  });
});
