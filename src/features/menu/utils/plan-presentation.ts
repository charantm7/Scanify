// features/menu/utils/plan-presentation.ts
//
// Applies the hotel's plan to what the public menu is allowed to SHOW.
//
// This runs on the server, inside fetchMenuPage, rather than as a render-time
// check in the components. Two reasons:
//
//   - The same data is served by /api/menu/[slug] for client revalidation.
//     Filtering in the components would leave the gated fields sitting in that
//     JSON response, so a downgraded hotel's ingredient lists and calorie
//     counts would still be one fetch away.
//   - A downgrade takes effect the moment the plan changes, with no migration
//     of item rows. The content is preserved untouched in the database and
//     simply stops being served, so upgrading brings it straight back.
//
// Item counts and whole menus are handled separately, in the database
// (reconcile_hotel_to_plan), because those need to persist a choice the owner
// can then override. What a field is *allowed* to display needs no stored
// state — it follows from the plan.

import type { MenuCategory, MenuEntitlements, MenuItem } from '../types';

/** Every limit in plan_limits uses -1 for "no limit". */
export const UNLIMITED = -1;

/**
 * Withholds the fields that `advanced_item_details` gates: ingredients,
 * allergens, calories, preparation_time and serving_size.
 *
 * Price variants are deliberately NOT withheld. Half/full portion pricing is
 * table stakes for a restaurant menu rather than a premium detail, and
 * withholding it would silently misprice items — showing a base price for a
 * dish whose real prices live in its variants.
 */
function stripAdvancedDetails(item: MenuItem): MenuItem {
  // Nulled rather than deleted: each field keeps the shape the components
  // already handle for "not set", so nothing has to special-case a missing
  // key. Spelled out per field rather than looped so TypeScript checks that
  // every one of them is actually nullable on MenuItem.
  return {
    ...item,
    ingredients: null,
    allergens: null,
    calories: null,
    preparation_time: null,
    serving_size: null,
  };
}

/**
 * Applies every presentation limit in one pass over the categories, which are
 * already in the order a diner sees them.
 *
 * `max_items_with_images` is a cap across the whole menu, so it is spent in
 * that same order — the items a diner reaches first keep their images. This
 * matches how reconcile_hotel_to_plan decides which items survive a downgrade,
 * so the two never disagree about what "first" means.
 */
export function applyPlanPresentation(
  categories: MenuCategory[],
  entitlements: MenuEntitlements | null
): MenuCategory[] {
  // No resolvable plan: serve the menu as-is rather than stripping a paying
  // hotel's content because a lookup failed.
  if (!entitlements) return categories;

  const {
    advanced_item_details: advanced,
    max_images_per_item: maxPerItem,
    max_items_with_images: maxImagedItems,
  } = entitlements;

  const imagesUnlimited = maxImagedItems === UNLIMITED;
  let imagedItemsUsed = 0;

  return categories.map((category) => ({
    ...category,
    items: category.items.map((item) => {
      let next = advanced ? item : stripAdvancedDetails(item);

      // `image_url` is the item's single primary image and is never capped —
      // every plan gets one image per item. The cap applies to the extra
      // images in `menu_item_images`.
      let images = next.images;

      if (images.length > 0) {
        const withinItemCap =
          maxPerItem === UNLIMITED ? images : images.slice(0, Math.max(maxPerItem, 1));

        if (imagesUnlimited || imagedItemsUsed < maxImagedItems) {
          images = withinItemCap;
          imagedItemsUsed += 1;
        } else {
          // This hotel has more imaged items than the plan covers; the ones
          // past the cap fall back to no gallery.
          images = [];
        }
      }

      if (images !== next.images) next = { ...next, images };

      return next;
    }),
  }));
}

/**
 * Whether to render the Scanify badge.
 *
 * `menu_customizations.show_scanify_badge` is the owner's preference and
 * `plan_limits.remove_branding` is whether their plan lets them act on it —
 * so turning the badge off only takes effect on a plan that includes branding
 * removal. Previously the owner's setting was honoured on every plan, which
 * gave away a paid feature to anyone who unticked the box.
 *
 * @param showBadgeSetting the owner's `show_scanify_badge` value
 */
export function shouldShowScanifyBadge(
  showBadgeSetting: boolean,
  entitlements: MenuEntitlements | null
): boolean {
  // Unknown plan, or a plan without branding removal: the badge stays.
  if (!entitlements?.remove_branding) return true;
  return showBadgeSetting;
}
