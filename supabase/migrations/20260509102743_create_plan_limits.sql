CREATE TYPE analytics_level_type AS ENUM ('none', 'basic', 'advanced');

CREATE TABLE public.plan_limits (
  plan                      plan_type PRIMARY KEY,

  max_menu_items            integer NOT NULL CHECK (max_menu_items = -1 OR max_menu_items > 0),
  max_items_with_images     integer NOT NULL CHECK (max_items_with_images = -1 OR max_items_with_images > 0),

  max_orders_per_month      integer NOT NULL CHECK (max_orders_per_month = -1 OR max_orders_per_month >= 0),
  ordering_enabled          boolean NOT NULL,
  realtime_kitchen          boolean NOT NULL,

  remove_branding           boolean NOT NULL,  
  custom_branding           boolean NOT NULL,  
  advanced_customization    boolean NOT NULL, 
  custom_subdomain          boolean NOT NULL,

  analytics_level           analytics_level_type NOT NULL,

  ratings_enabled                 boolean NOT NULL,
  google_reviews_integration      boolean NOT NULL,
  item_availability_toggle        boolean NOT NULL,
  advanced_category_management    boolean NOT NULL,

  multi_branch_enabled      boolean NOT NULL,
  max_branches              integer NOT NULL CHECK (max_branches = -1 OR max_branches > 0),
  staff_accounts_enabled    boolean NOT NULL,
  max_staff_accounts        integer NOT NULL CHECK (max_staff_accounts = -1 OR max_staff_accounts >= 0),

  priority_support          boolean NOT NULL,

  trial_days                integer NOT NULL DEFAULT 7 CHECK (trial_days >= 0),

  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);



CREATE TRIGGER plan_limits_updated_at BEFORE UPDATE ON public.plan_limits
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO public.plan_limits VALUES

('basic', 20, 10, 0, false, false, false, false, false, false, 'none', false, false, false, false, false, 1, false, 0, false, 7),

('starter', 50, 30, 2000, true, true, true, true, false, false, 'none', false, false, false, false, false, 1,false, 0, false, 7),

('growth', -1, -1, -1, true, true, true, true, false, false, 'basic', true, true, true, true, false, 1, false,   0, false, 7),

('pro', -1, -1, -1, true, true, true, true, true, true, 'advanced', true, true, true, true, true, -1, true, -1, true, 0);
