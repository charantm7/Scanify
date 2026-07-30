// hooks/useRazorpayCheckout.ts
'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../hooks/useToast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PlanKey = 'basic' | 'starter' | 'growth' | 'pro';
type BillingCycle = 'monthly' | 'annual';

export type CheckoutPreviewType =
  | 'same'
  | 'trial_blocked'
  | 'trial_start'
  | 'downgrade'
  | 'fresh_purchase'
  | 'upgrade'
  | 'cycle_change';

export interface CheckoutPreview {
  type: CheckoutPreviewType;
  payable: boolean;
  plan: PlanKey;
  billingCycle: BillingCycle;
  currentPlan: PlanKey | null;
  currentBillingCycle: BillingCycle | null;
  originalPricePaise?: number;
  creditPaise?: number;
  subtotalPaise?: number;
  taxPaise: number;
  taxNote: string;
  amountPaise?: number;
  daysRemaining?: number;
  periodWillReset?: boolean;
  effectiveAt?: string | null;
  message?: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpayCheckout() {
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  /**
   * Fetches the read-only checkout breakdown for a plan+cycle WITHOUT
   * creating a Razorpay order or writing to the DB. Used by the checkout
   * modal to show the user exactly what they'll be charged before they
   * confirm.
   */
  const getPreview = useCallback(
    async (
      plan: PlanKey,
      billingCycle: BillingCycle,
      startTrial = false
    ): Promise<CheckoutPreview | null> => {
      setPreviewLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/payments/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, billingCycle, startTrial }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Could not load checkout preview');
        }
        return data as CheckoutPreview;
      } catch (err: any) {
        setError(err.message || 'Could not load checkout preview');
        return null;
      } finally {
        setPreviewLoading(false);
      }
    },
    []
  );

  /**
   * Confirms the plan+cycle change: calls create-order (which performs the
   * actual DB writes), then either redirects (for a scheduled downgrade or
   * a started trial — no payment needed) or opens Razorpay Checkout for a
   * payable change. Should only be called AFTER the user has reviewed the
   * checkout preview and explicitly confirmed.
   */
  const startCheckout = useCallback(
    async (plan: PlanKey, billingCycle: BillingCycle, startTrial = false) => {
      setError(null);
      setLoading(plan);

      try {
        const orderRes = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, billingCycle, startTrial }),
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok) {
          throw new Error(orderData.error || 'Could not start checkout');
        }

        // Trial path: no payment required, subscription is already active.
        if (orderData.trialStarted) {
          toast.success(
            'Trial Started',
            `Your free trial is active until ${new Date(orderData.trialEndsAt).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}`
          );
          router.push('/console?trialStarted=true');
          return;
        }

        // Downgrade path: scheduled for next renewal, nothing to pay now.
        if (orderData.downgradeScheduled) {
          const effectiveDate = new Date(orderData.effectiveAt);

          toast.success(
            'Downgrade Scheduled',
            `New Plan: ${orderData.newPlan},
              Effective From: ${effectiveDate.toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}`
          );
          router.push(
            `/console?downgradeScheduled=true&newPlan=${orderData.newPlan}&effectiveAt=${encodeURIComponent(
              orderData.effectiveAt
            )}`
          );
          return;
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Could not load Razorpay checkout. Check your connection.');
        }

        const razorpayOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          order_id: orderData.orderId,
          name: 'Scanify',
          description: orderData.isProration
            ? `${plan[0].toUpperCase()}${plan.slice(1)} (${billingCycle}) — prorated for ${orderData.daysRemaining} remaining day${orderData.daysRemaining === 1 ? '' : 's'}`
            : `${plan[0].toUpperCase()}${plan.slice(1)} — ${billingCycle} plan`,
          theme: { color: '#C8622A' },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response),
              });
              const verifyData = await verifyRes.json();

              if (!verifyRes.ok || !verifyData.success) {
                setError(
                  'Payment succeeded but activation failed. Contact support with your payment ID: ' +
                  response.razorpay_payment_id
                );
                return;
              }

              router.push('/console?upgraded=true');
            } catch {
              setError(
                'Payment succeeded but we could not confirm activation. Contact support with payment ID: ' +
                response.razorpay_payment_id
              );
            }
          },
          modal: {
            ondismiss: async () => {
              setLoading(null);

              await fetch("/api/payments/cancel-order", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId: orderData.orderId,
                }),
              });
            },
          },
        };

        const rzp = new window.Razorpay(razorpayOptions);

        rzp.on('payment.failed', (resp: any) => {
          setError(resp.error?.description || 'Payment failed. Please try again.');
          setLoading(null);
        });

        rzp.open();
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(null);
      }
    },
    [router, toast]
  );

  return { startCheckout, getPreview, loading, previewLoading, error, setError };
}
