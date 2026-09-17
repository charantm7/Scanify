-- Reconciles the fulfilment path with what the application code actually calls.
--
-- Three problems this fixes:
--
--  1. `fulfill_subscription_payment` was declared WITHOUT `p_razorpay_payment_id`,
--     but lib/fulfill-subscription.ts has always passed it. PostgREST resolves
--     RPCs by argument name, so every call resolved to nothing (PGRST202) — and
--     because that error code is not 23505, the TS layer treated it as a hard
--     failure and threw AFTER Razorpay had already captured the money.
--
--  2. `processed_fulfilments` and `failed_fulfilments` were referenced by the
--     application (and exist in the live database) but were never checked into a
--     migration, so the repo could not reproduce a working environment.
--
--  3. The function performed no idempotency check at all, despite the calling
--     code documenting that idempotency was "enforced inside that RPC". If both
--     the verify route and the webhook reached it for the same payment, the
--     subscription was updated twice.
--
-- Also adds payments.carry_over_days, used when a billing-cycle change carries
-- unused value from the old period forward as extra days on the new one.

-- ---------------------------------------------------------------------------
-- Idempotency + incident tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.processed_fulfilments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_payment_id text NOT NULL UNIQUE,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- "Customer paid, our write failed" incidents. Deliberately has no foreign
-- keys: it must always accept a row, even if the referenced hotel/user is in a
-- strange state, because losing this record means losing the only trace that
-- someone was charged without being served.
CREATE TABLE IF NOT EXISTS public.failed_fulfilments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id            uuid NOT NULL,
  user_id             uuid NOT NULL,
  razorpay_payment_id text NOT NULL,
  payload             jsonb NOT NULL,
  error_message       text NOT NULL,
  status              text NOT NULL DEFAULT 'pending_retry',
  created_at          timestamptz NOT NULL DEFAULT now(),
  resolved_at         timestamptz
);

CREATE INDEX IF NOT EXISTS failed_fulfilments_status_idx
  ON public.failed_fulfilments (status)
  WHERE status = 'pending_retry';

ALTER TABLE public.processed_fulfilments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_fulfilments    ENABLE ROW LEVEL SECURITY;

-- No policies on purpose: both tables are written only by the service role
-- (which bypasses RLS). Enabling RLS without policies denies all client access.

-- ---------------------------------------------------------------------------
-- Carry-over days on payments
-- ---------------------------------------------------------------------------

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS carry_over_days integer NOT NULL DEFAULT 0
    CHECK (carry_over_days >= 0);

COMMENT ON COLUMN public.payments.carry_over_days IS
  'Extra days appended to the new billing period, funded by unused value from '
  'the previous period that exceeded the new plan''s full sticker price. Only '
  'ever non-zero on a billing-cycle change.';

-- ---------------------------------------------------------------------------
-- Fulfilment function
-- ---------------------------------------------------------------------------

-- Drop every existing overload by name. `CREATE OR REPLACE` would not replace
-- the old definition (the argument list differs, so it would create a second
-- overload and make the call ambiguous).
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT oid::regprocedure AS sig
    FROM pg_proc
    WHERE proname = 'fulfill_subscription_payment'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('DROP FUNCTION %s', fn.sig);
  END LOOP;
END $$;

CREATE FUNCTION public.fulfill_subscription_payment(
  p_hotel_id                 uuid,
  p_user_id                  uuid,
  p_razorpay_payment_id      text,
  p_plan                     text,
  p_billing_cycle            text,
  p_status                   text,
  p_current_period_start     timestamptz,
  p_current_period_end       timestamptz,
  p_needs_fresh_period       boolean,
  p_last_payment_id          text,
  p_provider_subscription_id text,
  p_now                      timestamptz
) RETURNS void AS $$
BEGIN
  -- Idempotency gate, FIRST. The unique constraint raises 23505 if this
  -- payment was already fulfilled by the other path (verify vs webhook), which
  -- aborts the whole function before either UPDATE runs. The caller treats
  -- 23505 as "already processed" rather than as a failure.
  INSERT INTO public.processed_fulfilments (razorpay_payment_id)
  VALUES (p_razorpay_payment_id);

  IF p_needs_fresh_period THEN
    UPDATE public.subscriptions SET
      plan                     = p_plan::plan_type,
      billing_cycle            = p_billing_cycle::billing_cycle_type,
      status                   = p_status::subscription_status,
      current_period_start     = p_current_period_start,
      current_period_end       = p_current_period_end,
      pending_plan             = NULL,
      pending_billing_cycle    = NULL,
      last_payment_id          = p_last_payment_id,
      provider_subscription_id = p_provider_subscription_id,
      cancel_at_period_end     = false,
      updated_at               = p_now
    WHERE hotel_id = p_hotel_id;
  ELSE
    -- Same-cycle, mid-period tier change: swap the plan but leave
    -- current_period_end alone — the proration charge only covered the days
    -- already remaining in this period.
    UPDATE public.subscriptions SET
      plan                     = p_plan::plan_type,
      billing_cycle            = p_billing_cycle::billing_cycle_type,
      status                   = p_status::subscription_status,
      pending_plan             = NULL,
      pending_billing_cycle    = NULL,
      last_payment_id          = p_last_payment_id,
      provider_subscription_id = p_provider_subscription_id,
      updated_at               = p_now
    WHERE hotel_id = p_hotel_id;
  END IF;

  -- Keep the denormalized users.plan column (which every plan-limit lookup
  -- reads) in the same transaction as the subscriptions write, so the two can
  -- never disagree.
  UPDATE public.users SET plan = p_plan::plan_type, updated_at = p_now
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.fulfill_subscription_payment(
  uuid, uuid, text, text, text, text, timestamptz, timestamptz,
  boolean, text, text, timestamptz
) FROM PUBLIC, anon, authenticated;
