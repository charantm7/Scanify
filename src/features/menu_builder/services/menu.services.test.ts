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
    it('nests items under their category by category_id', async () => {
        q.fetchCategoriesQuery.mockResolvedValue([
            { id: 'c1', name: 'Starters', sort_order: 1 },
            { id: 'c2', name: 'Mains', sort_order: 2 },
        ] as any)
        q.fetchItemsQuery.mockResolvedValue([
            { id: 'i1', category_id: 'c1', name: 'Samosa' },
            { id: 'i2', category_id: 'c2', name: 'Biryani' },
            { id: 'i3', category_id: 'c1', name: 'Pakora' },
        ] as any)

        const result = await loadMenuData({} as any, 'hotel-1')

        expect(result.find((c) => c.id === 'c1')?.items).toHaveLength(2)
        expect(result.find((c) => c.id === 'c2')?.items).toHaveLength(1)
    })

    it('short-circuits without fetching items when there are no categories', async () => {
        q.fetchCategoriesQuery.mockResolvedValue([])

        const result = await loadMenuData({} as any, 'hotel-1')

        expect(result).toEqual([])
        expect(q.fetchItemsQuery).not.toHaveBeenCalled()
    })

    it('defaults a null icon to null rather than leaving it undefined', async () => {
        q.fetchCategoriesQuery.mockResolvedValue([{ id: 'c1', name: 'Starters', sort_order: 1 } as any])
        q.fetchItemsQuery.mockResolvedValue([])

        const [category] = await loadMenuData({} as any, 'hotel-1')
        expect(category.icon).toBeNull()
    })
})

describe('createCategory', () => {
    it('assigns sort_order = max(existing) + 1', async () => {
        const toast = createMockToast()
        q.insertCategoryQuery.mockResolvedValue({ id: 'c3', name: 'Desserts', sort_order: 99 } as any)

        await createCategory(
            {} as any, 'hotel-1', 'Desserts', null,
            [{ sort_order: 3 } as any, { sort_order: 7 } as any],
            toast
        )

        expect(q.insertCategoryQuery).toHaveBeenCalledWith({} as any, expect.objectContaining({ sort_order: 8 }))
    })

    it('defaults sort_order to 1 for the first category', async () => {
        const toast = createMockToast()
        q.insertCategoryQuery.mockResolvedValue({ id: 'c1' } as any)

        await createCategory({} as any, 'hotel-1', 'Starters', null, [], toast)

        expect(q.insertCategoryQuery).toHaveBeenCalledWith({} as any, expect.objectContaining({ sort_order: 1 }))
    })

    it('returns the new category with an empty items array, and toasts success', async () => {
        const toast = createMockToast()
        q.insertCategoryQuery.mockResolvedValue({ id: 'c1', name: 'Starters', sort_order: 1 } as any)

        const result = await createCategory({} as any, 'hotel-1', 'Starters', null, [], toast)

        expect(result.items).toEqual([])
        expect(toast.success).toHaveBeenCalledWith('Category "Starters" added')
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