
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── Enum types ───────────────────────────────────────────────
CREATE TYPE dietary_flag AS ENUM ('veg', 'non_veg', 'vegan', 'jain', 'gluten_free', 'dairy', 'egg');
CREATE TYPE spice_level   AS ENUM ('none', 'mild', 'medium', 'hot', 'extra_hot');
CREATE TYPE menu_layout   AS ENUM ('card', 'list', 'grid');
CREATE TYPE category_style AS ENUM ('pill', 'underline', 'card');
CREATE TYPE font_family   AS ENUM ('inter', 'poppins', 'syne', 'outfit', 'playfair', 'dm_sans');
CREATE TYPE shadow_intensity AS ENUM ('none', 'soft', 'medium', 'strong');


ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS cover_image_url   text,
  ADD COLUMN IF NOT EXISTS rating            numeric(2,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count      integer      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_open           boolean      DEFAULT true,
  ADD COLUMN IF NOT EXISTS open_time         time,
  ADD COLUMN IF NOT EXISTS close_time        time,
  ADD COLUMN IF NOT EXISTS phone             text,
  ADD COLUMN IF NOT EXISTS website           text,
  ADD COLUMN IF NOT EXISTS google_maps_url   text,
  ADD COLUMN IF NOT EXISTS deleted_at        timestamptz;

-- ── menu_customizations ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_customizations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id              uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,

  -- Colors (hex strings)
  primary_color         text NOT NULL DEFAULT '#C8622A',
  background_color      text NOT NULL DEFAULT '#FAFAF8',
  surface_color         text NOT NULL DEFAULT '#FFFFFF',
  text_color            text NOT NULL DEFAULT '#1A1A1A',
  accent_color          text NOT NULL DEFAULT '#C8622A',
  muted_color           text NOT NULL DEFAULT '#6B7280',

  -- Typography
  font_family           font_family NOT NULL DEFAULT 'inter',
  base_font_size        integer NOT NULL DEFAULT 16, -- px
  heading_weight        integer NOT NULL DEFAULT 700,

  -- Shape & depth
  border_radius         integer NOT NULL DEFAULT 12, -- px
  shadow_intensity      shadow_intensity NOT NULL DEFAULT 'soft',

  -- Layout
  menu_layout           menu_layout NOT NULL DEFAULT 'card',
  category_style        category_style NOT NULL DEFAULT 'pill',

  -- Visibility toggles
  show_logo             boolean NOT NULL DEFAULT true,
  show_cover_image      boolean NOT NULL DEFAULT true,
  show_ratings          boolean NOT NULL DEFAULT true,
  show_address          boolean NOT NULL DEFAULT true,
  show_search           boolean NOT NULL DEFAULT true,
  show_categories       boolean NOT NULL DEFAULT true,
  show_item_images      boolean NOT NULL DEFAULT true,
  show_descriptions     boolean NOT NULL DEFAULT true,
  show_tags             boolean NOT NULL DEFAULT true,
  show_spice_level      boolean NOT NULL DEFAULT true,
  show_serving_size     boolean NOT NULL DEFAULT true,
  show_dietary_badge    boolean NOT NULL DEFAULT true,
  show_scanify_badge    boolean NOT NULL DEFAULT true,

  -- Meta
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT menu_customizations_hotel_id_key UNIQUE (hotel_id)
);

CREATE INDEX IF NOT EXISTS idx_menu_customizations_hotel_id ON menu_customizations(hotel_id);


ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS description   text,
  ADD COLUMN IF NOT EXISTS cover_image   text,
  ADD COLUMN IF NOT EXISTS is_active     boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS deleted_at    timestamptz;

CREATE INDEX IF NOT EXISTS idx_categories_hotel_id       ON categories(hotel_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order     ON categories(hotel_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_active         ON categories(hotel_id, is_active) WHERE deleted_at IS NULL;

-- ── menu_items (extended) ────────────────────────────────────
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS dietary_flag      dietary_flag,
  ADD COLUMN IF NOT EXISTS spice_level       spice_level DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS serving_size      text,        -- e.g. "Serves 2", "250ml"
  ADD COLUMN IF NOT EXISTS preparation_time  integer,     -- minutes
  ADD COLUMN IF NOT EXISTS ingredients       text[],
  ADD COLUMN IF NOT EXISTS allergens         text[],
  ADD COLUMN IF NOT EXISTS calories          integer,
  ADD COLUMN IF NOT EXISTS deleted_at        timestamptz;

-- GIN index for fast full-text search on name + description
CREATE INDEX IF NOT EXISTS idx_menu_items_search
  ON menu_items USING gin(
    (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'')))
  );

CREATE INDEX IF NOT EXISTS idx_menu_items_hotel_id     ON menu_items(hotel_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id  ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available    ON menu_items(hotel_id, is_available) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_menu_items_sort         ON menu_items(category_id, sort_order);
-- Trigram index for ILIKE / partial search
CREATE INDEX IF NOT EXISTS idx_menu_items_name_trgm
  ON menu_items USING gin(name gin_trgm_ops);

-- ── menu_item_images ─────────────────────────────────────────
-- Multiple images per item (gallery / modal carousel)
CREATE TABLE IF NOT EXISTS menu_item_images (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  hotel_id     uuid NOT NULL REFERENCES hotels(id)     ON DELETE CASCADE,
  url          text NOT NULL,
  alt_text     text,
  sort_order   integer NOT NULL DEFAULT 0,
  is_primary   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_item_images_item_id  ON menu_item_images(item_id);
CREATE INDEX IF NOT EXISTS idx_item_images_primary  ON menu_item_images(item_id, is_primary);


-- ── menu_themes ──────────────────────────────────────────────
-- Preset themes that can be one-click applied in the dashboard
CREATE TABLE IF NOT EXISTS menu_themes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL UNIQUE,   -- "Classic", "Dark Luxe", "Minimal"
  thumbnail_url  text,
  config         jsonb NOT NULL DEFAULT '{}', -- mirrors menu_customizations columns
  is_public      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ── menu_scans (extended) ────────────────────────────────────
ALTER TABLE menu_scans
  ADD COLUMN IF NOT EXISTS user_agent    text,
  ADD COLUMN IF NOT EXISTS referrer      text,
  ADD COLUMN IF NOT EXISTS session_id    text,   -- anonymous session for funnel tracking
  ADD COLUMN IF NOT EXISTS country_code  text,
  ADD COLUMN IF NOT EXISTS city          text;

CREATE INDEX IF NOT EXISTS idx_menu_scans_hotel_id   ON menu_scans(hotel_id);
CREATE INDEX IF NOT EXISTS idx_menu_scans_scanned_at ON menu_scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_scans_event      ON menu_scans(hotel_id, event_type);

-- ── Trigger: updated_at ──────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_menu_customizations_updated_at') THEN
    CREATE TRIGGER trg_menu_customizations_updated_at
      BEFORE UPDATE ON menu_customizations
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;

-- ── Row-Level Security stubs ─────────────────────────────────
-- Enable RLS; policies should be added per-auth strategy.
ALTER TABLE menu_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_images    ENABLE ROW LEVEL SECURITY;


-- Public read policies (menu viewers are unauthenticated)
CREATE POLICY "public_read_customizations" ON menu_customizations
  FOR SELECT USING (true);

CREATE POLICY "public_read_item_images" ON menu_item_images
  FOR SELECT USING (true);


-- Owner write policies (hotel owner only via auth.uid())
CREATE POLICY "owner_write_customizations" ON menu_customizations
  FOR ALL USING (
    hotel_id IN (SELECT id FROM hotels WHERE owner_id = auth.uid())
  );