// src/features/menu/types/index.ts

/** Veg / non-veg / egg indicator — standard on Indian restaurant menus */
export type DietaryType = 'veg' | 'non_veg' | 'egg';

/** Merchandising tags shown as small badges on a menu item */
export type ItemTag = 'bestseller' | 'new' | 'chefs_special' | 'spicy' | 'recommended';

/** A single price point for an item, e.g. "Half" / "Full", "Regular" / "Large" */
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
}

export interface Category {
  id: string;
  hotel_id?: string;
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
}

export interface ItemFormErrors {
  name?: string;
  price?: string;
  variants?: string;
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

export type MenuAction =
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
