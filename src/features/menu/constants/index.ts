// src/features/menu/constants/index.ts

import type { DietaryType, ItemTag, ItemFormValues } from '../types';

export const DIETARY_META: Record<DietaryType, { label: string; dot: string; ring: string }> = {
  veg: { label: 'Veg', dot: '#2e7d32', ring: '#2e7d32' },
  non_veg: { label: 'Non-Veg', dot: '#c62828', ring: '#c62828' },
  egg: { label: 'Contains Egg', dot: '#b8860b', ring: '#b8860b' },
};

export const TAG_META: Record<ItemTag, { label: string; emoji: string }> = {
  bestseller: { label: 'Bestseller', emoji: '⭐' },
  new: { label: 'New', emoji: '✨' },
  chefs_special: { label: "Chef's Special", emoji: '👨‍🍳' },
  spicy: { label: 'Spicy', emoji: '🌶️' },
  recommended: { label: 'Recommended', emoji: '👍' },
};

export const CATEGORY_ICON_PRESETS = [
  '🍽️', '🥗', '🍕', '🍔', '🌮', '🍜', '🍣', '🍰', '🥤', '🍷', '🍳', '🍛', '🥘', '🍞', '🍦',
];

export const MAX_VARIANTS_PER_ITEM = 4;

export const EMPTY_ITEM_FORM: ItemFormValues = {
  name: '',
  description: '',
  price: '',
  variants: [],
  image_url: '',
  is_available: true,
  dietary_type: '',
  tags: [],
};
