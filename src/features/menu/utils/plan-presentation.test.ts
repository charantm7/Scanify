import { describe, it, expect } from 'vitest';
import { applyPlanPresentation, shouldShowScanifyBadge, UNLIMITED } from './plan-presentation';
import type { MenuCategory, MenuEntitlements, MenuItem } from '../types';

function entitlements(overrides: Partial<MenuEntitlements> = {}): MenuEntitlements {
  return {
    advanced_item_details: true,
    max_images_per_item: UNLIMITED,
    max_items_with_images: UNLIMITED,
    remove_branding: true,
    ...overrides,
  };
}

function item(id: string, overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id,
    created_at: '',
    updated_at: '',
    hotel_id: 'hotel-1',
    category_id: 'c1',
    name: `Item ${id}`,
    description: 'A dish',
    price: 100,
    image_url: 'https://example.com/primary.jpg',
    is_available: true,
    sort_order: 1,
    dietary_type: 'veg',
    spice_level: 'mild',
    tags: ['bestseller'],
    variants: ['Half', 'Full'],
    serving_size: '250g',
    preparation_time: 20,
    ingredients: ['paneer', 'cream'],
    allergens: ['dairy'],
    calories: 450,
    deleted_at: null,
    images: [],
    ...overrides,
  };
}

function category(id: string, items: MenuItem[]): MenuCategory {
  return {
    id,
    created_at: '',
    hotel_id: 'hotel-1',
    menu_id: 'menu-1',
    name: `Category ${id}`,
    description: null,
    cover_image: null,
    icon: null,
    sort_order: 1,
    is_active: true,
    deleted_at: null,
    items,
  };
}

function img(id: string) {
  return {
    id,
    item_id: 'i1',
    hotel_id: 'hotel-1',
    url: `https://example.com/${id}.jpg`,
    alt_text: null,
    sort_order: 1,
    is_primary: false,
    created_at: '',
  };
}

describe('applyPlanPresentation — advanced item details', () => {
  const cats = [category('c1', [item('i1')])];

  it('keeps every detail when the plan allows advanced details', () => {
    const [cat] = applyPlanPresentation(cats, entitlements({ advanced_item_details: true }));
    const [it] = cat!.items;

    expect(it!.ingredients).toEqual(['paneer', 'cream']);
    expect(it!.allergens).toEqual(['dairy']);
    expect(it!.calories).toBe(450);
    expect(it!.preparation_time).toBe(20);
    expect(it!.serving_size).toBe('250g');
  });

  it('withholds the gated details when the plan does not', () => {
    const [cat] = applyPlanPresentation(cats, entitlements({ advanced_item_details: false }));
    const [it] = cat!.items;

    expect(it!.ingredients).toBeNull();
    expect(it!.allergens).toBeNull();
    expect(it!.calories).toBeNull();
    expect(it!.preparation_time).toBeNull();
    expect(it!.serving_size).toBeNull();
  });

  it('never withholds price variants, which would misprice the item', () => {
    const [cat] = applyPlanPresentation(cats, entitlements({ advanced_item_details: false }));
    expect(cat!.items[0]!.variants).toEqual(['Half', 'Full']);
  });

  it('never withholds the core fields a menu is useless without', () => {
    const [cat] = applyPlanPresentation(cats, entitlements({ advanced_item_details: false }));
    const [it] = cat!.items;

    expect(it!.name).toBe('Item i1');
    expect(it!.price).toBe(100);
    expect(it!.description).toBe('A dish');
    expect(it!.image_url).toBe('https://example.com/primary.jpg');
    expect(it!.dietary_type).toBe('veg');
    expect(it!.spice_level).toBe('mild');
    expect(it!.tags).toEqual(['bestseller']);
  });

  it('does not mutate the input', () => {
    const original = item('i1');
    const input = [category('c1', [original])];

    applyPlanPresentation(input, entitlements({ advanced_item_details: false }));

    expect(original.calories).toBe(450);
    expect(input[0]!.items[0]!.calories).toBe(450);
  });

  it('serves the menu unrestricted when the plan could not be resolved', () => {
    // Better to show a paying hotel's full menu than to strip it because a
    // lookup failed.
    const [cat] = applyPlanPresentation(cats, null);
    expect(cat!.items[0]!.calories).toBe(450);
  });
});

describe('applyPlanPresentation — images per item', () => {
  it('caps the gallery at the per-item limit', () => {
    const cats = [category('c1', [item('i1', { images: [img('a'), img('b'), img('c'), img('d')] })])];

    const [cat] = applyPlanPresentation(cats, entitlements({ max_images_per_item: 2 }));

    expect(cat!.items[0]!.images.map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('leaves the gallery alone when per-item images are unlimited', () => {
    const cats = [category('c1', [item('i1', { images: [img('a'), img('b'), img('c')] })])];

    const [cat] = applyPlanPresentation(cats, entitlements({ max_images_per_item: UNLIMITED }));

    expect(cat!.items[0]!.images).toHaveLength(3);
  });

  it('always allows at least one image per item', () => {
    // A misconfigured 0 must not strip every gallery image.
    const cats = [category('c1', [item('i1', { images: [img('a'), img('b')] })])];

    const [cat] = applyPlanPresentation(cats, entitlements({ max_images_per_item: 0 }));

    expect(cat!.items[0]!.images).toHaveLength(1);
  });
});

describe('applyPlanPresentation — how many items may carry images', () => {
  function threeImagedItems() {
    return [
      category('c1', [
        item('i1', { images: [img('a')] }),
        item('i2', { images: [img('b')] }),
      ]),
      category('c2', [item('i3', { images: [img('c')] })]),
    ];
  }

  it('spends the cap in menu order, so the items a diner reaches first keep images', () => {
    const result = applyPlanPresentation(
      threeImagedItems(),
      entitlements({ max_items_with_images: 2 })
    );

    expect(result[0]!.items[0]!.images).toHaveLength(1);
    expect(result[0]!.items[1]!.images).toHaveLength(1);
    // Third imaged item is past the cap.
    expect(result[1]!.items[0]!.images).toHaveLength(0);
  });

  it('does not spend the cap on items that have no gallery anyway', () => {
    const cats = [
      category('c1', [
        item('i1', { images: [] }),
        item('i2', { images: [] }),
        item('i3', { images: [img('c')] }),
      ]),
    ];

    const result = applyPlanPresentation(cats, entitlements({ max_items_with_images: 1 }));

    // The one imaged item still gets its image: the two without galleries
    // consumed nothing.
    expect(result[0]!.items[2]!.images).toHaveLength(1);
  });

  it('keeps every gallery when unlimited', () => {
    const result = applyPlanPresentation(
      threeImagedItems(),
      entitlements({ max_items_with_images: UNLIMITED })
    );

    for (const cat of result) {
      for (const it of cat.items) expect(it.images).toHaveLength(1);
    }
  });

  it('leaves the primary image_url untouched even past the cap', () => {
    // Every plan gets one image per item via image_url; the cap is about the
    // extra gallery images.
    const result = applyPlanPresentation(
      threeImagedItems(),
      entitlements({ max_items_with_images: 0 })
    );

    expect(result[1]!.items[0]!.image_url).toBe('https://example.com/primary.jpg');
    expect(result[1]!.items[0]!.images).toHaveLength(0);
  });
});

describe('shouldShowScanifyBadge', () => {
  it('honours the owner when their plan includes branding removal', () => {
    expect(shouldShowScanifyBadge(false, entitlements({ remove_branding: true }))).toBe(false);
    expect(shouldShowScanifyBadge(true, entitlements({ remove_branding: true }))).toBe(true);
  });

  it('keeps the badge on a plan without branding removal, whatever the setting', () => {
    // Otherwise unticking the box hands over a paid feature for free.
    expect(shouldShowScanifyBadge(false, entitlements({ remove_branding: false }))).toBe(true);
    expect(shouldShowScanifyBadge(true, entitlements({ remove_branding: false }))).toBe(true);
  });

  it('keeps the badge when the plan could not be resolved', () => {
    expect(shouldShowScanifyBadge(false, null)).toBe(true);
  });
});
