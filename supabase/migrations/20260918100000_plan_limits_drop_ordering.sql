-- Reshapes plan_limits around the product as it actually exists: a QR menu
-- platform with no ordering system.
--
-- Dropped (nothing was ever built against them, and they advertised a
-- capability the product does not have):
--   max_orders_per_month, ordering_enabled, realtime_kitchen, ratings_enabled
--
-- Added:
--   max_menus                 multiple menus per hotel (see the menus migration)
--   qr_customization_level    how much QR styling a plan unlocks
--   analytics_export_enabled  CSV/export access, split out of analytics_level
--   advanced_item_details     extended item fields (ingredients, allergens,
--                             calories, prep time) in the builder and on the
--                             public menu
--   max_images_per_item       cap on menu_item_images rows per item
--
-- Existing columns are deliberately left at their current per-plan values —
-- this migration does not silently re-price anything. The only exception is
-- trial_days, which is corrected from 7 to 4 to match TRIAL_DAYS in
-- features/billing/lib/plans.ts (the code has always granted 4).

CREATE TYPE public.qr_customization_level_type AS ENUM ('none', 'basic', 'advanced');

-- hotel_entitlements selects the columns being dropped, so it has to go first
-- and be rebuilt at the bottom of this file.
DROP VIEW IF EXISTS public.hotel_entitlements;

ALTER TABLE public.plan_limits
  DROP COLUMN IF EXISTS max_orders_per_month,
  DROP COLUMN IF EXISTS ordering_enabled,
  DROP COLUMN IF EXISTS realtime_kitchen,
  DROP COLUMN IF EXISTS ratings_enabled;

ALTER TABLE public.plan_limits
  ADD COLUMN IF NOT EXISTS max_menus integer NOT NULL DEFAULT 1
    CHECK (max_menus = -1 OR max_menus > 0),
  ADD COLUMN IF NOT EXISTS qr_customization_level public.qr_customization_level_type
    NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS analytics_export_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS advanced_item_details boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_images_per_item integer NOT NULL DEFAULT 1
    CHECK (max_images_per_item = -1 OR max_images_per_item > 0);

-- -1 means unlimited throughout this table.
COMMENT ON COLUMN public.plan_limits.max_menus IS
  'Menus the hotel may keep active at once. -1 = unlimited.';
COMMENT ON COLUMN public.plan_limits.max_images_per_item IS
  'Rows allowed in menu_item_images per item. -1 = unlimited.';

ALTER TABLE public.plan_limits ALTER COLUMN trial_days SET DEFAULT 4;
ALTER TABLE public.plan_limits ALTER COLUMN max_qr_codes SET DEFAULT 1;

-- ---------------------------------------------------------------------------
-- Per-plan values for the new columns only.
-- ---------------------------------------------------------------------------

UPDATE public.plan_limits SET
  max_menus                = 1,
  max_qr_codes             = 1,
  qr_customization_level   = 'none',
  analytics_export_enabled = false,
  advanced_item_details    = false,
  max_images_per_item      = 1,
  trial_days               = 4
WHERE plan = 'basic';

UPDATE public.plan_limits SET
  max_menus                = 1,
  max_qr_codes             = 3,
  qr_customization_level   = 'basic',
  analytics_export_enabled = false,
  advanced_item_details    = false,
  max_images_per_item      = 3,
  trial_days               = 4
WHERE plan = 'starter';

-- Growth is the first tier with multiple menus (3) and extended item detail.
UPDATE public.plan_limits SET
  max_menus                = 3,
  max_qr_codes             = 10,
  qr_customization_level   = 'advanced',
  analytics_export_enabled = true,
  advanced_item_details    = true,
  max_images_per_item      = 5,
  trial_days               = 4
WHERE plan = 'growth';

UPDATE public.plan_limits SET
  max_menus                = -1,
  max_qr_codes             = -1,
  qr_customization_level   = 'advanced',
  analytics_export_enabled = true,
  advanced_item_details    = true,
  max_images_per_item      = -1,
  trial_days               = 4
WHERE plan = 'pro';

-- ---------------------------------------------------------------------------
-- Rebuild hotel_entitlements
-- ---------------------------------------------------------------------------
--
-- Same shape as before minus the four dropped ordering columns, plus the new
-- ones.
--
-- Now created with security_invoker = on. Without it a view runs with its
-- OWNER's privileges, which bypasses row-level security entirely — and since
-- Supabase grants select on public views to anon/authenticated by default,
-- this view let any signed-in user read EVERY hotel's plan, status and period
-- dates, not just their own. With security_invoker the underlying
-- `subscriptions` RLS policy applies to the caller as it should.
CREATE VIEW public.hotel_entitlements
WITH (security_invoker = on) AS
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
  pl.max_menus,
  pl.max_qr_codes,
  pl.qr_customization_level,
  pl.remove_branding,
  pl.custom_branding,
  pl.advanced_customization,
  pl.custom_subdomain,
  pl.analytics_level,
  pl.analytics_export_enabled,
  pl.google_reviews_integration,
  pl.item_availability_toggle,
  pl.advanced_category_management,
  pl.advanced_item_details,
  pl.max_images_per_item,
  pl.multi_branch_enabled,
  pl.max_branches,
  pl.staff_accounts_enabled,
  pl.max_staff_accounts,
  pl.priority_support,
  pl.trial_days
FROM public.subscriptions s
JOIN public.plan_limits pl ON pl.plan = s.plan;
