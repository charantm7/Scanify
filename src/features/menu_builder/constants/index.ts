
import type { DietaryType, ItemTag, ItemFormValues, SpiceLevel } from '../types';

export const DIETARY_META: Record<
  DietaryType,
  { label: string; dot: string; ring: string }
> = {
  veg: {
    label: 'Veg',
    dot: '#16A34A',
    ring: '#15803D',
  },

  non_veg: {
    label: 'Non-Veg',
    dot: '#DC2626',
    ring: '#B91C1C',
  },

  egg: {
    label: 'Contains Egg',
    dot: '#F59E0B',
    ring: '#D97706',
  },

  vegan: {
    label: 'Vegan',
    dot: '#10B981',
    ring: '#059669',
  },

  dairy: {
    label: 'Contains Dairy',
    dot: '#3B82F6',
    ring: '#2563EB',
  },

  gluten_free: {
    label: 'Gluten Free',
    dot: '#F97316',
    ring: '#EA580C',
  },

  jain: {
    label: 'Jain',
    dot: '#A855F7',
    ring: '#9333EA',
  },
};

export const TAG_META: Record<ItemTag, { label: string; emoji: string }> = {
  bestseller: { label: 'Bestseller', emoji: '⭐' },
  popular: { label: 'Popular', emoji: '🔥' },
  new: { label: 'New', emoji: '✨' },
  chefs_special: { label: "Chef's Special", emoji: '👨‍🍳' },
  signature: { label: 'Signature', emoji: '👑' },
  recommended: { label: 'Recommended', emoji: '👍' },
  combo: { label: 'Combo', emoji: '🍽️' },
  family_pack: { label: 'Family Pack', emoji: '👨‍👩‍👧‍👦' },
  limited_time: { label: 'Limited Time', emoji: '⏳' },
};

export const SPICE_LEVEL_META: Record<
  SpiceLevel,
  { label: string; emoji: string; color: string }
> = {
  none: {
    label: 'Not Spicy',
    emoji: '🫑',
    color: '#6B7280',
  },
  mild: {
    label: 'Mild',
    emoji: '🌶️',
    color: '#84CC16',
  },
  medium: {
    label: 'Medium',
    emoji: '🌶️🌶️',
    color: '#F59E0B',
  },
  hot: {
    label: 'Hot',
    emoji: '🌶️🌶️🌶️',
    color: '#F97316',
  },
  extra_hot: {
    label: 'Extra Hot',
    emoji: '🔥🌶️',
    color: '#DC2626',
  },
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
  spice_level: '',
};
