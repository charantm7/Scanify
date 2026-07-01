
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
    CREATE TYPE plan_type AS ENUM ('basic', 'starter', 'growth', 'pro');
  ELSE
    -- Add any missing values without breaking existing data
    BEGIN
      ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'basic';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'starter';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'growth';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'pro';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_cycle_type') THEN
    CREATE TYPE billing_cycle_type AS ENUM ('monthly', 'annual');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM
      ('trialing', 'active', 'expiring', 'expired', 'cancelled', 'past_due');
  ELSE
    BEGIN ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'trialing'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'active'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'expiring'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'expired'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'cancelled'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'past_due'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM
      ('created', 'authorized', 'captured', 'failed', 'refunded');
  END IF;
END $$;


CREATE TABLE IF NOT EXISTS public.plan_pricing (
  plan            plan_type           NOT NULL,
  billing_cycle   billing_cycle_type  NOT NULL,
  amount_paise    integer             NOT NULL CHECK (amount_paise > 0), -- store in paise, Razorpay-native
  duration_days   integer             NOT NULL CHECK (duration_days > 0),
  is_active       boolean             NOT NULL DEFAULT true,
  created_at      timestamptz         NOT NULL DEFAULT now(),
  updated_at      timestamptz         NOT NULL DEFAULT now(),
  CONSTRAINT plan_pricing_pkey PRIMARY KEY (plan, billing_cycle)
);

-- Seed current pricing (amounts in paise; INR has no decimals here so *100)
INSERT INTO public.plan_pricing (plan, billing_cycle, amount_paise, duration_days) VALUES
  ('basic',   'monthly', 29900,   30),
  ('starter', 'monthly', 79900,   30),
  ('growth',  'monthly', 129900,  30),
  ('pro',     'monthly', 199900,  30),
  ('basic',   'annual',  299900,  365),
  ('starter', 'annual',  799900,  365),
  ('growth',  'annual',  1299900, 365),
  ('pro',     'annual',  1999900, 365)
ON CONFLICT (plan, billing_cycle) DO UPDATE
  SET amount_paise = EXCLUDED.amount_paise,
      duration_days = EXCLUDED.duration_days,
      updated_at = now();



ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS billing_cycle      billing_cycle_type NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS trial_used         boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pending_plan        plan_type,            -- plan user is checking out for, before payment confirms
  ADD COLUMN IF NOT EXISTS pending_billing_cycle billing_cycle_type, -- cycle for pending_plan
  ADD COLUMN IF NOT EXISTS last_payment_id    text,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false;


COMMENT ON COLUMN public.subscriptions.provider_subscription_id IS
  'Stores the most recent Razorpay order_id (this app uses one-time Orders per billing cycle, not Razorpay Subscriptions).';


CREATE TABLE IF NOT EXISTS public.payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES public.users(id),
  hotel_id            uuid NOT NULL REFERENCES public.hotels(id),
  subscription_id     uuid REFERENCES public.subscriptions(id),
  plan                plan_type NOT NULL,
  billing_cycle       billing_cycle_type NOT NULL,
  amount_paise        integer NOT NULL CHECK (amount_paise > 0),
  currency            text NOT NULL DEFAULT 'INR',
  razorpay_order_id   text NOT NULL UNIQUE,
  razorpay_payment_id text UNIQUE,
  razorpay_signature  text,
  status              payment_status NOT NULL DEFAULT 'created'::payment_status,
  failure_reason      text,
  is_renewal          boolean NOT NULL DEFAULT false, -- false = new purchase/upgrade, true = manual renewal
  raw_webhook_payload jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_hotel_id_idx ON public.payments(hotel_id);
CREATE INDEX IF NOT EXISTS payments_razorpay_order_id_idx ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);



CREATE TABLE IF NOT EXISTS public.webhook_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_event_id text NOT NULL UNIQUE,
  event_type      text NOT NULL,
  processed_at    timestamptz NOT NULL DEFAULT now(),
  payload         jsonb NOT NULL
);


ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.plan_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active pricing" ON public.plan_pricing;
CREATE POLICY "Anyone can read active pricing"
  ON public.plan_pricing FOR SELECT
  USING (is_active = true);


CREATE OR REPLACE VIEW public.hotel_entitlements AS
SELECT
  s.hotel_id,
  s.user_id,
  s.plan,
  s.billing_cycle,
  s.status,
  s.trial_ends_at,
  s.current_period_end,
  s.cancel_at_period_end,
  pl.max_menu_items,
  pl.max_items_with_images,
  pl.max_orders_per_month,
  pl.ordering_enabled,
  pl.realtime_kitchen,
  pl.remove_branding,
  pl.custom_branding,
  pl.advanced_customization,
  pl.custom_subdomain,
  pl.analytics_level,
  pl.ratings_enabled,
  pl.google_reviews_integration,
  pl.item_availability_toggle,
  pl.advanced_category_management,
  pl.multi_branch_enabled,
  pl.max_branches,
  pl.staff_accounts_enabled,
  pl.max_staff_accounts,
  pl.priority_support,
  pl.max_qr_codes
FROM public.subscriptions s
JOIN public.plan_limits pl ON pl.plan = s.plan;

-- =====================================================================
-- End of migration
-- =====================================================================
