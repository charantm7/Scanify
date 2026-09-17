import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockToast } from '../../../../tests/mocks/supabase';
import {
  buildUniqueMenuSlug,
  isMenuLimitError,
  createMenu,
  renameMenuService,
  setMenuActiveService,
  setPrimaryMenuService,
  removeMenu,
} from './menus.services';
import * as queries from '../queries/menus.queries';
import type { Menu } from '../types';

vi.mock('../queries/menus.queries');

const q = vi.mocked(queries);

beforeEach(() => vi.clearAllMocks());

function menu(overrides: Partial<Menu> = {}): Menu {
  return {
    id: 'm1',
    hotel_id: 'hotel-1',
    name: 'Main Menu',
    slug: 'main',
    description: null,
    is_primary: true,
    is_active: true,
    hidden_by_plan: false,
    sort_order: 1,
    ...overrides,
  };
}

describe('buildUniqueMenuSlug', () => {
  it('slugifies a plain name', () => {
    expect(buildUniqueMenuSlug('Drinks', [])).toBe('drinks');
    expect(buildUniqueMenuSlug('Late Night Bites', [])).toBe('late-night-bites');
  });

  it('strips accents and punctuation the slug constraint would reject', () => {
    expect(buildUniqueMenuSlug('Café & Bar', [])).toBe('cafe-bar');
    expect(buildUniqueMenuSlug("Chef's Specials!", [])).toBe('chef-s-specials');
  });

  it('never produces leading, trailing or doubled hyphens', () => {
    for (const name of ['  Drinks  ', '--Drinks--', 'A  &&  B', '...Wine...']) {
      const slug = buildUniqueMenuSlug(name, []);
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('falls back to a usable stem when the name slugifies to nothing', () => {
    // An empty slug violates menus_slug_check, so the insert would fail.
    expect(buildUniqueMenuSlug('!!!', [])).toBe('menu');
    expect(buildUniqueMenuSlug('のメニュー', [])).toBe('menu');
  });

  it('de-duplicates against slugs already taken by the hotel', () => {
    expect(buildUniqueMenuSlug('Drinks', ['drinks'])).toBe('drinks-2');
    expect(buildUniqueMenuSlug('Drinks', ['drinks', 'drinks-2'])).toBe('drinks-3');
    expect(buildUniqueMenuSlug('!!!', ['menu'])).toBe('menu-2');
  });

  it('keeps the slug within the column length after de-duplication', () => {
    const slug = buildUniqueMenuSlug('a'.repeat(80), []);
    expect(slug.length).toBeLessThanOrEqual(40);
    expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

describe('isMenuLimitError', () => {
  it('recognises the database trigger message', () => {
    expect(
      isMenuLimitError(new Error('menu_limit_reached: the starter plan allows 1 menu(s)'))
    ).toBe(true);
  });

  it('does not mistake other failures for a limit', () => {
    expect(isMenuLimitError(new Error('duplicate key value'))).toBe(false);
    expect(isMenuLimitError(null)).toBe(false);
  });
});

describe('createMenu', () => {
  it('makes the very first menu primary, so something is served at /<hotel-slug>', async () => {
    const toast = createMockToast();
    q.fetchTakenMenuSlugsQuery.mockResolvedValue([]);
    q.insertMenuQuery.mockResolvedValue(menu());

    await createMenu({} as never, 'hotel-1', 'Main Menu', [], toast);

    expect(q.insertMenuQuery).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ is_primary: true, sort_order: 1 })
    );
  });

  it('leaves later menus secondary', async () => {
    const toast = createMockToast();
    q.fetchTakenMenuSlugsQuery.mockResolvedValue(['main']);
    q.insertMenuQuery.mockResolvedValue(menu({ id: 'm2', slug: 'drinks', is_primary: false }));

    await createMenu({} as never, 'hotel-1', 'Drinks', [menu({ sort_order: 4 })], toast);

    expect(q.insertMenuQuery).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ is_primary: false, slug: 'drinks', sort_order: 5 })
    );
  });

  it('rejects a blank name before touching the database', async () => {
    const toast = createMockToast();
    await expect(createMenu({} as never, 'hotel-1', '   ', [], toast)).rejects.toThrow(
      /name/i
    );
    expect(q.insertMenuQuery).not.toHaveBeenCalled();
  });

  it('turns the trigger error into an upgrade prompt rather than a raw DB message', async () => {
    const toast = createMockToast();
    q.fetchTakenMenuSlugsQuery.mockResolvedValue([]);
    q.insertMenuQuery.mockRejectedValue(
      new Error('menu_limit_reached: the starter plan allows 1 menu(s)')
    );

    await expect(createMenu({} as never, 'hotel-1', 'Drinks', [], toast)).rejects.toThrow(
      /menu limit.*upgrade/i
    );
  });

  it('lets unrelated database errors through unchanged', async () => {
    const toast = createMockToast();
    q.fetchTakenMenuSlugsQuery.mockResolvedValue([]);
    q.insertMenuQuery.mockRejectedValue(new Error('connection reset'));

    await expect(createMenu({} as never, 'hotel-1', 'Drinks', [], toast)).rejects.toThrow(
      'connection reset'
    );
  });
});

describe('renameMenuService', () => {
  it('renames without regenerating the slug, which is baked into printed QR codes', async () => {
    const toast = createMockToast();
    await renameMenuService({} as never, 'm1', 'Evening Menu', toast);

    expect(q.updateMenuQuery).toHaveBeenCalledWith({}, 'm1', { name: 'Evening Menu' });
    const patch = q.updateMenuQuery.mock.calls[0]![2];
    expect(patch).not.toHaveProperty('slug');
  });
});

describe('setMenuActiveService', () => {
  it('refuses to hide the primary menu, which would break every existing QR code', async () => {
    const toast = createMockToast();
    await expect(
      setMenuActiveService({} as never, menu({ is_primary: true }), false, toast)
    ).rejects.toThrow(/primary/i);
    expect(q.updateMenuQuery).not.toHaveBeenCalled();
  });

  it('allows hiding a secondary menu', async () => {
    const toast = createMockToast();
    await setMenuActiveService({} as never, menu({ id: 'm2', is_primary: false }), false, toast);
    expect(q.updateMenuQuery).toHaveBeenCalledWith({}, 'm2', { is_active: false });
  });

  it('allows re-showing the primary menu', async () => {
    const toast = createMockToast();
    await setMenuActiveService(
      {} as never,
      menu({ is_primary: true, is_active: false }),
      true,
      toast
    );
    expect(q.updateMenuQuery).toHaveBeenCalledWith({}, 'm1', { is_active: true });
  });
});

describe('setPrimaryMenuService', () => {
  it('refuses to promote a hidden menu', async () => {
    const toast = createMockToast();
    await expect(
      setPrimaryMenuService({} as never, 'hotel-1', menu({ is_active: false }), toast)
    ).rejects.toThrow(/live/i);
    expect(q.setPrimaryMenuQuery).not.toHaveBeenCalled();
  });

  it('refuses to promote a menu a downgrade parked', async () => {
    const toast = createMockToast();
    await expect(
      setPrimaryMenuService({} as never, 'hotel-1', menu({ hidden_by_plan: true }), toast)
    ).rejects.toThrow(/live/i);
  });

  it('promotes a live menu', async () => {
    const toast = createMockToast();
    await setPrimaryMenuService({} as never, 'hotel-1', menu({ id: 'm2', is_primary: false }), toast);
    expect(q.setPrimaryMenuQuery).toHaveBeenCalledWith({}, 'hotel-1', 'm2');
  });
});

describe('removeMenu', () => {
  it('refuses to delete the last menu', async () => {
    const toast = createMockToast();
    const only = menu();

    await expect(removeMenu({} as never, only, [only], toast)).rejects.toThrow(/at least one/i);
    expect(q.softDeleteMenuQuery).not.toHaveBeenCalled();
  });

  it('counts only menus the owner still holds when checking "the last menu"', async () => {
    const toast = createMockToast();
    const live = menu();
    // A parked menu cannot stand in as the survivor — diners can't see it.
    const parked = menu({ id: 'm2', slug: 'drinks', is_primary: false, hidden_by_plan: true });

    await expect(removeMenu({} as never, live, [live, parked], toast)).rejects.toThrow(
      /at least one/i
    );
  });

  it('soft deletes rather than cascading the categories and items away', async () => {
    const toast = createMockToast();
    const primary = menu();
    const other = menu({ id: 'm2', slug: 'drinks', is_primary: false });

    await removeMenu({} as never, other, [primary, other], toast);

    expect(q.softDeleteMenuQuery).toHaveBeenCalledWith({}, 'm2');
  });

  it('promotes a replacement when the deleted menu was primary', async () => {
    const toast = createMockToast();
    const primary = menu();
    const other = menu({ id: 'm2', slug: 'drinks', is_primary: false });

    const result = await removeMenu({} as never, primary, [primary, other], toast);

    expect(q.setPrimaryMenuQuery).toHaveBeenCalledWith({}, 'hotel-1', 'm2');
    expect(result.newPrimaryId).toBe('m2');
  });

  it('prefers an ACTIVE menu when promoting a replacement', async () => {
    const toast = createMockToast();
    const primary = menu();
    const hidden = menu({ id: 'm2', slug: 'a', is_primary: false, is_active: false });
    const live = menu({ id: 'm3', slug: 'b', is_primary: false, is_active: true });

    const result = await removeMenu({} as never, primary, [primary, hidden, live], toast);

    expect(result.newPrimaryId).toBe('m3');
  });

  it('does not touch the primary flag when deleting a secondary menu', async () => {
    const toast = createMockToast();
    const primary = menu();
    const other = menu({ id: 'm2', slug: 'drinks', is_primary: false });

    const result = await removeMenu({} as never, other, [primary, other], toast);

    expect(q.setPrimaryMenuQuery).not.toHaveBeenCalled();
    expect(result.newPrimaryId).toBeNull();
  });
});
