
export type DietaryType = 'veg' | 'non_veg' | 'egg' | 'vegan' | 'gluten_free' | 'dairy' | 'jain';

export type ItemTag =
  | 'bestseller'
  | 'popular'
  | 'new'
  | 'chefs_special'
  | 'signature'
  | 'recommended'
  | 'combo'
  | 'family_pack'
  | 'limited_time';

export type SpiceLevel =
  | 'none'
  | 'mild'
  | 'medium'
  | 'hot'
  | 'extra_hot';

export interface PriceVariant {
  id: string;
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  hotel_id?: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  variants: PriceVariant[] | null;
  image_url: string | null;
  is_available: boolean;
  dietary_type: DietaryType | null;
  tags: ItemTag[] | null;
  sort_order: number;
  spice_level: SpiceLevel | null;
  /** Set when a plan downgrade took this item out of service. */
  hidden_by_plan?: boolean;

  // ── Extended details, gated by plan_limits.advanced_item_details ──────────
  serving_size: string | null;
  preparation_time: number | null;
  calories: number | null;
  ingredients: string[] | null;
  allergens: string[] | null;
}

/**
 * A menu groups categories. A hotel has one primary menu (served at
 * menu.<domain>/<hotel-slug>) and, from the Growth plan up, additional ones
 * reached at menu.<domain>/<hotel-slug>/<menu-slug>.
 */
export interface Menu {
  id: string;
  hotel_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_primary: boolean;
  is_active: boolean;
  /** Set when a plan downgrade parked this menu; not the owner's own choice. */
  hidden_by_plan: boolean;
  sort_order: number;
}

export interface Category {
  id: string;
  hotel_id?: string;
  menu_id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  items: MenuItem[];
}

export interface ItemFormValues {
  id?: string;
  name: string;
  description: string;
  price: string;
  variants: PriceVariant[];
  image_url: string;
  is_available: boolean;
  dietary_type: DietaryType | '';
  tags: ItemTag[];
  spice_level: SpiceLevel | '';

  // ── Extended details ─────────────────────────────────────────────────────
  // Held as strings because they come straight from text inputs; the service
  // layer parses and nulls them on the way to the database.
  serving_size: string;
  preparation_time: string;
  calories: string;
  ingredients: string[];
  allergens: string[];
}

export interface ItemFormErrors {
  name?: string;
  price?: string;
  variants?: string;
  preparation_time?: string;
  calories?: string;
}

export interface ItemModalState {
  open: boolean;
  item: MenuItem | null;
  categoryId: string | null;
}

export type MenuViewMode = 'list' | 'grid';

export interface MenuState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export interface MenusState {
  menus: Menu[];
  loading: boolean;
  error: string | null;
}

export type MenuAction =
  | { type: 'LOADING' }
  /** Settled with nothing to load — no hotel, or no menu selectable yet. */
  | { type: 'EMPTY' }
  | { type: 'LOADED'; payload: Category[] }
  | { type: 'ERROR'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Partial<Category> & { id: string } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'REORDER_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_ITEM'; payload: Partial<MenuItem> & { id: string } }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'REORDER_ITEMS'; payload: { categoryId: string; items: MenuItem[] } };
