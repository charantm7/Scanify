-- Multiple menus per hotel.
--
-- Model: menus sit between hotels and categories. A category belongs to
-- exactly one menu; items stay attached to their category and are not touched,
-- so a menu's contents are reached through its categories.
--
-- Public URLs become:
--   menu.scanify.co.in/<hotel-slug>                  -> the primary menu
--   menu.scanify.co.in/<hotel-slug>/<menu-slug>      -> a specific menu
--
-- Every existing hotel gets one menu ('Main Menu', slug 'main', primary) and
-- all of its current categories are backfilled onto it, so existing links keep
-- resolving to exactly the same content.

CREATE TABLE public.menus (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id    uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,

  name        text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 60),
  slug        text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,

  -- The menu served at /<hotel-slug> with no menu segment. Exactly one per
  -- hotel, enforced by the partial unique index below.
  is_primary  boolean NOT NULL DEFAULT false,

  -- Owner's own show/hide switch.
  is_active   boolean NOT NULL DEFAULT true,

  -- Set when a plan downgrade took this menu out of service. Kept separate
  -- from is_active so that reconciling the downgrade (or upgrading again) can
  -- restore precisely the menus the plan took away, without overriding menus
  -- the owner deliberately hid themselves.
  hidden_by_plan boolean NOT NULL DEFAULT false,

  sort_order  integer NOT NULL DEFAULT 0,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,

  CONSTRAINT menus_hotel_slug_unique UNIQUE (hotel_id, slug)
);

-- At most one primary menu per hotel. Soft-deleted rows are excluded so a
-- deleted primary doesn't block promoting a replacement.
CREATE UNIQUE INDEX menus_one_primary_per_hotel
  ON public.menus (hotel_id)
  WHERE is_primary AND deleted_at IS NULL;

CREATE INDEX menus_hotel_id_idx ON public.menus (hotel_id) WHERE deleted_at IS NULL;

CREATE TRIGGER menus_updated_at BEFORE UPDATE ON public.menus
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Categories belong to a menu
-- ---------------------------------------------------------------------------

ALTER TABLE public.categories
  ADD COLUMN menu_id uuid REFERENCES public.menus(id) ON DELETE CASCADE;

-- One default menu per hotel. Soft-deleted hotels are included on purpose:
-- their categories still need a menu_id to satisfy the NOT NULL below, and
-- giving them one keeps this migration non-destructive. The alternative —
-- deleting categories that couldn't be backfilled — would cascade into
-- menu_items and permanently destroy the menu of any hotel that later got
-- restored.
INSERT INTO public.menus (hotel_id, name, slug, is_primary, sort_order)
SELECT h.id, 'Main Menu', 'main', true, 0
FROM public.hotels h;

UPDATE public.categories c
SET menu_id = m.id
FROM public.menus m
WHERE m.hotel_id = c.hotel_id
  AND m.slug = 'main'
  AND c.menu_id IS NULL;

ALTER TABLE public.categories ALTER COLUMN menu_id SET NOT NULL;

CREATE INDEX categories_menu_id_idx ON public.categories (menu_id)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- Plan-driven hiding of menu items
-- ---------------------------------------------------------------------------

-- When a downgrade drops the item allowance below what the hotel already has,
-- the overflow is hidden rather than deleted. This is deliberately NOT
-- is_available: that column is the owner's "sold out today" switch, and
-- reusing it would make an automatic plan action indistinguishable from the
-- owner's own choice (and silently un-hide items the owner had hidden).
ALTER TABLE public.menu_items
  ADD COLUMN hidden_by_plan boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.menu_items.hidden_by_plan IS
  'True when a plan downgrade took this item out of service. Owner-facing UI '
  'lets the owner swap which items carry this flag, within their allowance.';

CREATE INDEX menu_items_hidden_by_plan_idx ON public.menu_items (hotel_id)
  WHERE hidden_by_plan;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "menus: owner full access" ON public.menus
  USING (EXISTS (
    SELECT 1 FROM public.hotels h
    WHERE h.id = menus.hotel_id AND h.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.hotels h
    WHERE h.id = menus.hotel_id AND h.owner_id = auth.uid()
  ));

-- Anonymous menu visitors may only see menus that are live on every axis:
-- the owner hasn't hidden them, no downgrade has parked them, they aren't
-- soft-deleted, and their hotel is itself live.
--
-- Note the `h.deleted_at IS NULL` checks throughout this section. The existing
-- public-read policies only tested `is_active`, so everything belonging to a
-- SOFT-DELETED hotel stayed publicly readable — a closed account's menu kept
-- serving. Verified against a local replay: before this change an anonymous
-- role could read the categories and items of a hotel with deleted_at set.
CREATE POLICY "menus: public read active" ON public.menus
  FOR SELECT USING (
    is_active
    AND NOT hidden_by_plan
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.hotels h
      WHERE h.id = menus.hotel_id
        AND h.is_active = true
        AND h.deleted_at IS NULL
    )
  );

-- Close the same hole on hotels themselves: a soft-deleted hotel's name,
-- address and phone were readable by anyone.
DROP POLICY IF EXISTS "hotels: public read active hotels" ON public.hotels;

CREATE POLICY "hotels: public read active hotels" ON public.hotels
  FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Categories are now only publicly readable through a publicly readable menu,
-- and only when the category itself is live.
DROP POLICY IF EXISTS "categories: public read" ON public.categories;

CREATE POLICY "categories: public read" ON public.categories
  FOR SELECT USING (
    is_active
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.menus m
      JOIN public.hotels h ON h.id = m.hotel_id
      WHERE m.id = categories.menu_id
        AND m.is_active
        AND NOT m.hidden_by_plan
        AND m.deleted_at IS NULL
        AND h.is_active = true
        AND h.deleted_at IS NULL
    )
  );

-- Items must be unreachable publicly unless every link in the chain is public.
-- Previously this policy checked only is_available plus hotels.is_active, so
-- soft-deleted items and items under closed accounts were both readable; the
-- app filtered them in the query layer, which is not a security boundary.
DROP POLICY IF EXISTS "menu_items: public read available" ON public.menu_items;

CREATE POLICY "menu_items: public read available" ON public.menu_items
  FOR SELECT USING (
    is_available
    AND NOT hidden_by_plan
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.categories c
      JOIN public.menus m  ON m.id = c.menu_id
      JOIN public.hotels h ON h.id = m.hotel_id
      WHERE c.id = menu_items.category_id
        AND c.is_active
        AND c.deleted_at IS NULL
        AND m.is_active
        AND NOT m.hidden_by_plan
        AND m.deleted_at IS NULL
        AND h.is_active = true
        AND h.deleted_at IS NULL
    )
  );
