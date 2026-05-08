UPDATE public.users
SET plan = 'starter'
WHERE plan::text NOT IN ('basic','starter','growth','pro');

UPDATE public.subscriptions
SET plan = 'starter'
WHERE plan::text NOT IN ('basic','starter','growth','pro');

ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_plan_check,
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

DO $$
BEGIN
    IF NOT EXISTS(
        SELECT 1
        FROM pg_type
        WHERE typname='subscription_status'
    ) THEN 
        CREATE TYPE subscription_status AS ENUM (
            'trialing',
            'active',
            'cancelled',
            'expired',
            'past_due'
        );
    END IF;
END;$$;

-- Status Type update in subscriptions

ALTER TABLE public.subscriptions
ALTER COLUMN status DROP DEFAULT;


ALTER TABLE public.subscriptions
ALTER COLUMN status TYPE public.subscription_status
USING status::public.subscription_status;

ALTER TABLE public.subscriptions
ALTER COLUMN status SET DEFAULT 'active';


-- ADD column at subscription
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;


CREATE TYPE plan_type_new AS ENUM (
    'basic',
    'starter',
    'growth',
    'pro'
);


-- user plan type update

ALTER TABLE public.users
ALTER COLUMN plan DROP DEFAULT;

ALTER TABLE public.users
ALTER COLUMN plan TYPE public.plan_type_new
USING plan::text::plan_type_new;

ALTER TABLE public.users
ALTER COLUMN plan SET DEFAULT 'starter';

-- subscription plan type update

ALTER TABLE public.subscriptions
ALTER COLUMN plan DROP DEFAULT;

ALTER TABLE public.subscriptions
ALTER COLUMN plan TYPE public.plan_type_new
USING plan::text::public.plan_type_new;

ALTER TABLE public.subscriptions
ALTER COLUMN plan SET DEFAULT 'starter';


DROP TYPE IF EXISTS public.plan_type;


ALTER TYPE public.plan_type_new 
RENAME TO plan_type;


DROP POLICY "menu_scans: public insert" ON menu_scans;
CREATE POLICY "menu_scans: public insert" ON menu_scans
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM hotels WHERE id=hotel_id AND is_active=true)
    );

ALTER TABLE hotels
    ALTER COLUMN name TYPE varchar(120),
    ALTER COLUMN description TYPE varchar(2000),
    ALTER COLUMN slug TYPE varchar(80),
    ALTER COLUMN address TYPE varchar(300);


ALTER TABLE menu_items
    ALTER COLUMN name TYPE varchar(120),
    ALTER COLUMN description TYPE varchar(2000),
    ALTER COLUMN image_url TYPE varchar(1000);

ALTER TABLE users
  ALTER COLUMN name TYPE varchar(120);

ALTER TABLE hotels DROP CONSTRAINT hotels_owner_id_key;

ALTER TABLE hotels ADD COLUMN updated_at timestamptz DEFAULT now() NOT NULL;
ALTER TABLE menu_items ADD COLUMN updated_at timestamptz DEFAULT now() NOT NULL;
ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now() NOT NULL;

CREATE OR REPLACE TRIGGER hotels_updated_at BEFORE UPDATE ON hotels
    For EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE OR REPLACE FUNCTION increment_qr_scan_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.qr_code_id IS NOT NULL THEN
        UPDATE qr_codes SET scan_count = scan_count + 1 WHERE id=new.qr_code_id;
    END IF; 
    RETURN NEW;
END;$$;

CREATE OR REPLACE TRIGGER trg_qr_scan AFTER INSERT ON menu_scans
FOR EACH ROW EXECUTE FUNCTION increment_qr_scan_count();

-- Created the trigger function to sync plan column when subs plan is updated
CREATE OR REPLACE FUNCTION sync_subscription_plan_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.plan IS NOT NULL THEN
        UPDATE public.users
        SET plan = NEW.plan
        WHERE id = NEW.user_id;
    END IF; RETURN NEW;
END;$$;

-- Tigger to the above function
CREATE OR REPLACE TRIGGER trg_sync_subscription_plan_to_user 
AFTER INSERT OR UPDATE OF plan 
ON public.subscriptions
FOR EACH ROW 
EXECUTE FUNCTION sync_subscription_plan_to_user();


CREATE INDEX idx_hotels_active_slug ON hotels(slug) WHERE is_active=true;

ALTER TABLE hotels ALTER COLUMN pincode TYPE varchar(10);
ALTER TABLE hotels ADD CONSTRAINT hotels_pincode_format
CHECK (pincode IS NULL OR pincode ~ '^\d{4,10}$');