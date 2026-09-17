-- Plan limits for menu items, and reconciliation when a plan changes.
--
-- Three pieces:
--
--  1. enforce_menu_item_limit  — a boundary, like the menus trigger. Covers
--     both creating an item and un-hiding one, since either increases the
--     number of items a plan has to cover.
--
--  2. reconcile_hotel_to_plan  — brings a hotel back within its allowance
--     after the plan changes, in EITHER direction: a downgrade parks the
--     overflow, an upgrade brings it back.
--
--  3. a trigger on users.plan   — plans change in three different places
--     (the fulfilment RPC, the expiry cron, and by hand in the SQL editor),
--     so reconciliation hangs off the column itself rather than being called
--     from each of them and forgotten in the fourth.
--
-- Ordering rule: what stays is decided by sort_order — the order the owner
-- arranged and the order a diner sees. Menus rank primary-first then by
-- sort_order; items rank by their menu, then category, then their own
-- sort_order. Ties break on created_at then id so the outcome is stable
-- across runs rather than depending on row order.

-- ---------------------------------------------------------------------------
-- Helper: the effective plan for a hotel
-- ---------------------------------------------------------------------------

-- users.plan is what every plan-limit lookup in the app reads, and fulfilment
-- writes it in the same transaction as subscriptions.plan.
CREATE OR REPLACE FUNCTION public.hotel_plan(p_hotel_id uuid)
RETURNS plan_type AS $$
  SELECT u.plan
  FROM public.hotels h
  JOIN public.users u ON u.id = h.owner_id
  WHERE h.id = p_hotel_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- 1. Item allowance boundary
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enforce_menu_item_limit()
RETURNS trigger AS $$
DECLARE
  v_plan           plan_type;
  v_max            integer;
  v_count          integer;
  v_in_live_menu   boolean;
BEGIN
  -- On UPDATE, only a transition from hidden to visible can breach the cap.
  -- Every other update (renaming, re-pricing, hiding) is always allowed.
  IF TG_OP = 'UPDATE' AND NOT (OLD.hidden_by_plan AND NOT NEW.hidden_by_plan) THEN
    RETURN NEW;
  END IF;

  -- An item created already hidden costs nothing against the allowance.
  IF TG_OP = 'INSERT' AND NEW.hidden_by_plan THEN
    RETURN NEW;
  END IF;

  v_plan := public.hotel_plan(NEW.hotel_id);
  IF v_plan IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT pl.max_menu_items INTO v_max
  FROM public.plan_limits pl
  WHERE pl.plan = v_plan;

  IF v_max IS NULL OR v_max = -1 THEN
    RETURN NEW;
  END IF;

  -- An item inside a menu that a downgrade parked is already invisible to
  -- diners, so it occupies no slot and adding or un-hiding it costs nothing.
  SELECT NOT m.hidden_by_plan
    INTO v_in_live_menu
  FROM public.categories c
  JOIN public.menus m ON m.id = c.menu_id
  WHERE c.id = NEW.category_id
    AND m.deleted_at IS NULL;

  IF NOT COALESCE(v_in_live_menu, false) THEN
    RETURN NEW;
  END IF;

  -- Count the items that already occupy a slot, excluding this row so an
  -- UPDATE doesn't count itself.
  --
  -- This MUST use the same definition of "occupies a slot" as
  -- reconcile_hotel_to_plan below — items reachable through a live menu, not
  -- every unhidden row the hotel owns. When the two disagreed, a hotel with
  -- parked menus counted those menus' items against the cap, so freeing a slot
  -- by hiding one item never actually let another be un-hidden: the owner
  -- could see 20 of 42 items live and still be told they were at their limit.
  SELECT count(*) INTO v_count
  FROM public.menu_items mi
  JOIN public.categories c ON c.id = mi.category_id
  JOIN public.menus m      ON m.id = c.menu_id
  WHERE mi.hotel_id = NEW.hotel_id
    AND mi.id <> NEW.id
    AND mi.deleted_at IS NULL
    AND NOT mi.hidden_by_plan
    AND c.deleted_at IS NULL
    AND m.deleted_at IS NULL
    AND NOT m.hidden_by_plan;

  IF v_count >= v_max THEN
    RAISE EXCEPTION 'item_limit_reached: the % plan allows % menu item(s)', v_plan, v_max
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS menu_items_enforce_limit ON public.menu_items;

CREATE TRIGGER menu_items_enforce_limit
  BEFORE INSERT OR UPDATE OF hidden_by_plan ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_menu_item_limit();

-- ---------------------------------------------------------------------------
-- Menus: extend the existing boundary to cover un-hiding
-- ---------------------------------------------------------------------------

-- The Stage 2 trigger was INSERT-only, which left a hole: an owner whose
-- downgrade parked two menus could simply flip hidden_by_plan back to false
-- and exceed the allowance without creating anything.
CREATE OR REPLACE FUNCTION public.enforce_menu_limit()
RETURNS trigger AS $$
DECLARE
  v_plan  plan_type;
  v_max   integer;
  v_count integer;
BEGIN
  IF TG_OP = 'UPDATE' AND NOT (OLD.hidden_by_plan AND NOT NEW.hidden_by_plan) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' AND NEW.hidden_by_plan THEN
    RETURN NEW;
  END IF;

  v_plan := public.hotel_plan(NEW.hotel_id);
  IF v_plan IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT pl.max_menus INTO v_max
  FROM public.plan_limits pl
  WHERE pl.plan = v_plan;

  IF v_max IS NULL OR v_max = -1 THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO v_count
  FROM public.menus m
  WHERE m.hotel_id = NEW.hotel_id
    AND m.id <> NEW.id
    AND m.deleted_at IS NULL
    AND NOT m.hidden_by_plan;

  IF v_count >= v_max THEN
    RAISE EXCEPTION 'menu_limit_reached: the % plan allows % menu(s)', v_plan, v_max
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS menus_enforce_limit ON public.menus;

CREATE TRIGGER menus_enforce_limit
  BEFORE INSERT OR UPDATE OF hidden_by_plan ON public.menus
  FOR EACH ROW EXECUTE FUNCTION public.enforce_menu_limit();

-- ---------------------------------------------------------------------------
-- 2. Reconciliation
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.reconcile_hotel_to_plan(p_hotel_id uuid)
RETURNS void AS $$
DECLARE
  v_plan       plan_type;
  v_max_menus  integer;
  v_max_items  integer;
BEGIN
  v_plan := public.hotel_plan(p_hotel_id);
  IF v_plan IS NULL THEN
    RETURN;
  END IF;

  SELECT pl.max_menus, pl.max_menu_items
    INTO v_max_menus, v_max_items
  FROM public.plan_limits pl
  WHERE pl.plan = v_plan;

  IF v_max_menus IS NULL THEN
    RETURN;
  END IF;

  -- ── Menus ────────────────────────────────────────────────────────────────
  -- One statement handles both directions: rank every menu and park the ones
  -- past the allowance, un-parking anything now inside it. The primary menu
  -- always ranks first, so the URL every printed QR code encodes can never be
  -- the one that gets parked.
  --
  -- The enforce triggers above still fire on these updates, and deliberately
  -- let them through: parking a menu only ever reduces the count, and
  -- un-parking during an upgrade can never pass the new, larger allowance
  -- because reconciliation only un-parks rows that rank inside it.
  IF v_max_menus <> -1 THEN
    WITH ranked AS (
      SELECT m.id,
             row_number() OVER (
               ORDER BY m.is_primary DESC, m.sort_order, m.created_at, m.id
             ) AS rn
      FROM public.menus m
      WHERE m.hotel_id = p_hotel_id
        AND m.deleted_at IS NULL
    )
    UPDATE public.menus m
    SET hidden_by_plan = (r.rn > v_max_menus),
        updated_at = now()
    FROM ranked r
    WHERE m.id = r.id
      AND m.hidden_by_plan <> (r.rn > v_max_menus);
  ELSE
    UPDATE public.menus m
    SET hidden_by_plan = false, updated_at = now()
    WHERE m.hotel_id = p_hotel_id
      AND m.deleted_at IS NULL
      AND m.hidden_by_plan;
  END IF;

  -- ── Items ────────────────────────────────────────────────────────────────
  -- Only items reachable through a live menu compete for the allowance:
  -- items sitting in a parked menu are already invisible to diners, and
  -- counting them would burn slots for content nobody can see.
  IF v_max_items <> -1 THEN
    WITH ranked AS (
      SELECT mi.id,
             row_number() OVER (
               ORDER BY m.is_primary DESC, m.sort_order, m.created_at,
                        c.sort_order, c.created_at,
                        mi.sort_order, mi.created_at, mi.id
             ) AS rn
      FROM public.menu_items mi
      JOIN public.categories c ON c.id = mi.category_id
      JOIN public.menus m      ON m.id = c.menu_id
      WHERE mi.hotel_id = p_hotel_id
        AND mi.deleted_at IS NULL
        AND c.deleted_at IS NULL
        AND m.deleted_at IS NULL
        AND NOT m.hidden_by_plan
    )
    UPDATE public.menu_items mi
    SET hidden_by_plan = (r.rn > v_max_items),
        updated_at = now()
    FROM ranked r
    WHERE mi.id = r.id
      AND mi.hidden_by_plan <> (r.rn > v_max_items);
  ELSE
    UPDATE public.menu_items mi
    SET hidden_by_plan = false, updated_at = now()
    WHERE mi.hotel_id = p_hotel_id
      AND mi.deleted_at IS NULL
      AND mi.hidden_by_plan;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Reconciliation is driven by plan changes, never called by a client.
REVOKE ALL ON FUNCTION public.reconcile_hotel_to_plan(uuid) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Run it whenever a plan changes
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.reconcile_on_plan_change()
RETURNS trigger AS $$
DECLARE
  v_hotel uuid;
BEGIN
  -- An owner has one hotel today, but the column allows more, so loop.
  FOR v_hotel IN
    SELECT h.id FROM public.hotels h WHERE h.owner_id = NEW.id AND h.deleted_at IS NULL
  LOOP
    PERFORM public.reconcile_hotel_to_plan(v_hotel);
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS users_reconcile_on_plan_change ON public.users;

-- AFTER, so the new plan is already committed to the row when
-- hotel_plan() reads it. WHEN filters to real changes, so ordinary profile
-- updates don't trigger a reconciliation pass.
CREATE TRIGGER users_reconcile_on_plan_change
  AFTER UPDATE OF plan ON public.users
  FOR EACH ROW
  WHEN (OLD.plan IS DISTINCT FROM NEW.plan)
  EXECUTE FUNCTION public.reconcile_on_plan_change();

-- ---------------------------------------------------------------------------
-- 4. Presentation entitlements for the public menu
-- ---------------------------------------------------------------------------
--
-- The public menu is rendered anonymously, and `users` is readable only by its
-- owner, so an anonymous request cannot resolve a hotel's plan to decide which
-- item details it may show. This exposes ONLY the presentation flags needed
-- for that decision — no plan name, no status, no billing dates — so the menu
-- can be rendered correctly without widening access to `users`.
CREATE OR REPLACE FUNCTION public.hotel_menu_entitlements(p_hotel_id uuid)
RETURNS TABLE (
  advanced_item_details boolean,
  max_images_per_item   integer,
  max_items_with_images integer,
  remove_branding       boolean
) AS $$
  SELECT
    pl.advanced_item_details,
    pl.max_images_per_item,
    pl.max_items_with_images,
    pl.remove_branding
  FROM public.hotels h
  JOIN public.users u       ON u.id = h.owner_id
  JOIN public.plan_limits pl ON pl.plan = u.plan
  WHERE h.id = p_hotel_id
    AND h.is_active = true
    AND h.deleted_at IS NULL;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.hotel_menu_entitlements(uuid) TO anon, authenticated;
