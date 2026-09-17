-- Server-side enforcement of plan_limits.max_menus.
--
-- The dashboard writes to Supabase directly from the browser under RLS, so
-- there is no Node layer that every menu insert must pass through. A UI check
-- alone (AppContext's `canAddMenu`) is advisory: anyone can open devtools and
-- POST to /rest/v1/menus. This trigger is the actual boundary.
--
-- Deliberately INSERT-only. Flipping hidden_by_plan back off during downgrade
-- reconciliation is an UPDATE, and that path is allowed to exceed nothing —
-- it is the code that decides which menus fit the new allowance.

CREATE OR REPLACE FUNCTION public.enforce_menu_limit()
RETURNS trigger AS $$
DECLARE
  v_plan  plan_type;
  v_max   integer;
  v_count integer;
BEGIN
  -- users.plan is the column every plan-limit lookup in the app reads, and
  -- fulfilment keeps it in the same transaction as subscriptions.plan, so it
  -- is the right source here too.
  SELECT u.plan INTO v_plan
  FROM public.hotels h
  JOIN public.users u ON u.id = h.owner_id
  WHERE h.id = NEW.hotel_id;

  -- No resolvable plan (a hotel mid-onboarding, say) — don't block the write,
  -- there is nothing to enforce against yet.
  IF v_plan IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT pl.max_menus INTO v_max
  FROM public.plan_limits pl
  WHERE pl.plan = v_plan;

  -- -1 is unlimited.
  IF v_max IS NULL OR v_max = -1 THEN
    RETURN NEW;
  END IF;

  -- Only menus the owner actually holds count. Menus a downgrade parked are
  -- excluded, otherwise an account that downgraded could never create a menu
  -- again even after getting back under its limit.
  SELECT count(*) INTO v_count
  FROM public.menus m
  WHERE m.hotel_id = NEW.hotel_id
    AND m.deleted_at IS NULL
    AND NOT m.hidden_by_plan;

  IF v_count >= v_max THEN
    -- The `menu_limit_reached:` prefix is what the service layer matches on to
    -- show an upgrade prompt instead of a raw database error.
    RAISE EXCEPTION 'menu_limit_reached: the % plan allows % menu(s)', v_plan, v_max
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS menus_enforce_limit ON public.menus;

CREATE TRIGGER menus_enforce_limit
  BEFORE INSERT ON public.menus
  FOR EACH ROW EXECUTE FUNCTION public.enforce_menu_limit();
