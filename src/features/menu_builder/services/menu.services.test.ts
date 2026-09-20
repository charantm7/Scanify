import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockToast } from '../../../../tests/mocks/supabase'
import {
    loadMenuData,
    createCategory,
    createItem,
    updateItemService,
    persistCategoryOrder,
    persistItemOrder,
} from './menu.services'
import * as queries from '../queries/menu.queries'

vi.mock('../queries/menu.queries')

const q = vi.mocked(queries)

beforeEach(() => vi.clearAllMocks())

describe('loadMenuData', () => {
    // Categories and their items now arrive together as one embedded read
    // rather than a categories query followed by an items query keyed on the
    // ids it returned — one round trip instead of two sequential ones.
    it('keeps each category\'s items nested under it', async () => {
        q.fetchMenuTreeQuery.mockResolvedValue([
            {
                id: 'c1', name: 'Starters', sort_order: 1,
                items: [
                    { id: 'i1', category_id: 'c1', name: 'Samosa' },
                    { id: 'i3', category_id: 'c1', name: 'Pakora' },
                ],
            },
            {
                id: 'c2', name: 'Mains', sort_order: 2,
                items: [{ id: 'i2', category_id: 'c2', name: 'Biryani' }],
            },
        ] as any)

        const result = await loadMenuData({} as any, 'menu-1')

        expect(result.find((c) => c.id === 'c1')?.items).toHaveLength(2)
        expect(result.find((c) => c.id === 'c2')?.items).toHaveLength(1)
        // Scoped to the one menu, not the whole hotel.
        expect(q.fetchMenuTreeQuery).toHaveBeenCalledWith({} as any, 'menu-1')
    })

    it('reads the menu in a single query', async () => {
        q.fetchMenuTreeQuery.mockResolvedValue([])

        const result = await loadMenuData({} as any, 'menu-1')

        expect(result).toEqual([])
        expect(q.fetchMenuTreeQuery).toHaveBeenCalledTimes(1)
    })

    it('normalises a category with no items to an empty array', async () => {
        // PostgREST returns null, not [], for a category with no children.
        q.fetchMenuTreeQuery.mockResolvedValue([
            { id: 'c1', name: 'Starters', sort_order: 1, items: null } as any,
        ])

        const [category] = await loadMenuData({} as any, 'menu-1')
        expect(category.items).toEqual([])
    })

    it('defaults a null icon to null rather than leaving it undefined', async () => {
        q.fetchMenuTreeQuery.mockResolvedValue([
            { id: 'c1', name: 'Starters', sort_order: 1, items: [] } as any,
        ])

        const [category] = await loadMenuData({} as any, 'menu-1')
        expect(category.icon).toBeNull()
    })
})

describe('createCategory', () => {
    it('assigns sort_order = max(existing) + 1', async () => {
        const toast = createMockToast()
        q.insertCategoryQuery.mockResolvedValue({ id: 'c3', name: 'Desserts', sort_order: 99 } as any)

        await createCategory(
            {} as any, 'hotel-1', 'menu-1', 'Desserts', null,
            [{ sort_order: 3 } as any, { sort_order: 7 } as any],
            toast
        )

        expect(q.insertCategoryQuery).toHaveBeenCalledWith({} as any, expect.objectContaining({ sort_order: 8 }))
    })

    it('defaults sort_order to 1 for the first category', async () => {
        const toast = createMockToast()
        q.insertCategoryQuery.mockResolvedValue({ id: 'c1' } as any)

        await createCategory({} as any, 'hotel-1', 'menu-1', 'Starters', null, [], toast)

        expect(q.insertCategoryQuery).toHaveBeenCalledWith({} as any, expect.objectContaining({ sort_order: 1 }))
    })

    it('returns the new category with an empty items array, and toasts success', async () => {
        const toast = createMockToast()
        q.insertCategoryQuery.mockResolvedValue({ id: 'c1', name: 'Starters', sort_order: 1 } as any)

        const result = await createCategory({} as any, 'hotel-1', 'menu-1', 'Starters', null, [], toast)

        expect(result.items).toEqual([])
        expect(toast.success).toHaveBeenCalledWith('Category "Starters" added')
        expect(q.insertCategoryQuery).toHaveBeenCalledWith(
            {} as any,
            expect.objectContaining({ menu_id: 'menu-1' })
        )
    })
})

describe('createItem — payload shaping', () => {
    it('trims name/description, rounds price to 2dp, and nulls out empty optionals', async () => {
        const toast = createMockToast()
        q.insertItemQuery.mockResolvedValue({ id: 'i1' } as any)

        await createItem({} as any, 'hotel-1', 'c1', {
            name: '  Paneer Tikka  ',
            description: '   ',
            price: '199.999',
            variants: [],
            image_url: '',
            is_available: true,
            dietary_type: '',
            tags: [],
            spice_level: '',
        } as any, [], toast)

        expect(q.insertItemQuery).toHaveBeenCalledWith({} as any, expect.objectContaining({
            name: 'Paneer Tikka',
            description: null,
            price: 200,
            image_url: null,
            dietary_type: null,
            tags: null,
            spice_level: null,
            hotel_id: 'hotel-1',
            category_id: 'c1',
        }))
    })

    it('parses the extended detail fields and nulls the unfilled ones', async () => {
        const toast = createMockToast()
        q.insertItemQuery.mockResolvedValue({ id: 'i1' } as any)

        await createItem({} as any, 'hotel-1', 'c1', {
            name: 'Paneer Tikka', description: '', price: '199', variants: [],
            image_url: '', is_available: true, dietary_type: '', tags: [], spice_level: '',
            serving_size: '  250g  ',
            preparation_time: '20',
            calories: '450',
            ingredients: ['  paneer  ', '', 'cream'],
            allergens: [],
        } as any, [], toast)

        expect(q.insertItemQuery).toHaveBeenCalledWith({} as any, expect.objectContaining({
            serving_size: '250g',
            preparation_time: 20,
            calories: 450,
            ingredients: ['paneer', 'cream'],
            // Empty list stores as null, not [], so "not specified" is one value.
            allergens: null,
        }))
    })

    it('stores an unfilled optional number as null rather than 0', async () => {
        const toast = createMockToast()
        q.insertItemQuery.mockResolvedValue({ id: 'i1' } as any)

        await createItem({} as any, 'hotel-1', 'c1', {
            name: 'Chai', description: '', price: '20', variants: [],
            image_url: '', is_available: true, dietary_type: '', tags: [], spice_level: '',
            serving_size: '', preparation_time: '', calories: '',
            ingredients: [], allergens: [],
        } as any, [], toast)

        const payload = q.insertItemQuery.mock.calls[0][1]
        // A 0 would render as "0 kcal" and "0 min" on the public menu.
        expect(payload.preparation_time).toBeNull()
        expect(payload.calories).toBeNull()
        expect(payload.serving_size).toBeNull()
    })

    it('writes extended details even on a plan that cannot display them', async () => {
        // The plan decides what the public menu SHOWS; the owner's content is
        // always preserved so an upgrade brings it straight back.
        const toast = createMockToast()
        q.insertItemQuery.mockResolvedValue({ id: 'i1' } as any)

        await createItem({} as any, 'hotel-1', 'c1', {
            name: 'Biryani', description: '', price: '300', variants: [],
            image_url: '', is_available: true, dietary_type: '', tags: [], spice_level: '',
            serving_size: 'Serves 2', preparation_time: '35', calories: '800',
            ingredients: ['rice'], allergens: ['dairy'],
        } as any, [], toast)

        const payload = q.insertItemQuery.mock.calls[0][1]
        expect(payload.ingredients).toEqual(['rice'])
        expect(payload.allergens).toEqual(['dairy'])
    })

    it('does not crash when a form is missing the extended fields entirely', async () => {
        // A stale cached form shape must not be able to break saving.
        const toast = createMockToast()
        q.insertItemQuery.mockResolvedValue({ id: 'i1' } as any)

        await createItem({} as any, 'hotel-1', 'c1', {
            name: 'Lassi', description: '', price: '80', variants: [],
            image_url: '', is_available: true, dietary_type: '', tags: [], spice_level: '',
        } as any, [], toast)

        const payload = q.insertItemQuery.mock.calls[0][1]
        expect(payload.serving_size).toBeNull()
        expect(payload.ingredients).toBeNull()
    })

    it('drops incomplete price variants (empty label or non-numeric price)', async () => {
        const toast = createMockToast()
        q.insertItemQuery.mockResolvedValue({ id: 'i1' } as any)

        await createItem({} as any, 'hotel-1', 'c1', {
            name: 'Thali', description: '', price: '250', image_url: '', is_available: true,
            dietary_type: '', tags: [], spice_level: '',
            variants: [
                { id: 'v1', label: 'Small', price: 150 },
                { id: 'v2', label: '  ', price: 200 },       // no label — dropped
                { id: 'v3', label: 'Large', price: NaN },     // bad price — dropped
            ],
        } as any, [], toast)

        const payload = q.insertItemQuery.mock.calls[0][1]
        expect(payload.variants).toEqual([{ id: 'v1', label: 'Small', price: 150 }])
    })

    it('stores variants as null (not []) when every variant is incomplete', async () => {
        const toast = createMockToast()
        q.insertItemQuery.mockResolvedValue({ id: 'i1' } as any)

        await createItem({} as any, 'hotel-1', 'c1', {
            name: 'Thali', description: '', price: '250', image_url: '', is_available: true,
            dietary_type: '', tags: [], spice_level: '',
            variants: [{ id: 'v1', label: '', price: 150 }],
        } as any, [], toast)

        const payload = q.insertItemQuery.mock.calls[0][1]
        expect(payload.variants).toBeNull()
    })

    it('toasts success on creation', async () => {
        const toast = createMockToast()
        q.insertItemQuery.mockResolvedValue({ id: 'i1' } as any)
        await createItem({} as any, 'hotel-1', 'c1', {
            name: 'Thali', description: '', price: '250', image_url: '', is_available: true,
            dietary_type: '', tags: [], spice_level: '', variants: [],
        } as any, [], toast)
        expect(toast.success).toHaveBeenCalledWith('Item added')
    })
})

describe('updateItemService', () => {
    it('returns the shaped payload so the caller can patch local state without a refetch', async () => {
        const toast = createMockToast()
        q.updateItemQuery.mockResolvedValue(undefined as any)

        const payload = await updateItemService({} as any, 'i1', {
            name: 'Updated Name', description: '', price: '99', image_url: '', is_available: false,
            dietary_type: '', tags: [], spice_level: '', variants: [],
        } as any, toast)

        expect(payload.name).toBe('Updated Name')
        expect(payload.is_available).toBe(false)
        expect(q.updateItemQuery).toHaveBeenCalledWith({} as any, 'i1', payload)
    })
})

describe('persistCategoryOrder / persistItemOrder', () => {
    it('maps array position (1-indexed) to sort_order, ignoring any prior sort_order', async () => {
        q.reorderCategoriesQuery.mockResolvedValue(undefined as any)

        await persistCategoryOrder({} as any, [
            { id: 'c2', sort_order: 99 } as any,
            { id: 'c1', sort_order: 1 } as any,
        ])

        expect(q.reorderCategoriesQuery).toHaveBeenCalledWith({} as any, [
            { id: 'c2', sort_order: 1 },
            { id: 'c1', sort_order: 2 },
        ])
    })

    it('same 1-indexed remap applies to items', async () => {
        q.reorderItemsQuery.mockResolvedValue(undefined as any)

        await persistItemOrder({} as any, [{ id: 'i1' } as any, { id: 'i2' } as any])

        expect(q.reorderItemsQuery).toHaveBeenCalledWith({} as any, [
            { id: 'i1', sort_order: 1 },
            { id: 'i2', sort_order: 2 },
        ])
    })
})