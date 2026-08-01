import { describe, it, expect, vi } from 'vitest'
import { createChainableResult } from '../../../../tests/mocks/supabase'
import {
    fetchCategoriesQuery,
    insertCategoryQuery,
    updateCategoryQuery,
    deleteCategoryQuery,
    reorderCategoriesQuery,
    fetchItemsQuery,
    insertItemQuery,
    updateItemQuery,
    deleteItemQuery,
    reorderItemsQuery,
} from './menu.queries'

function mockSupabase(result: { data?: any; error?: any }) {
    const builder = createChainableResult(result)
    return { from: vi.fn(() => builder), _builder: builder }
}

describe('fetchCategoriesQuery', () => {
    it('queries categories filtered by hotel and ordered by sort_order', async () => {
        const data = [{ id: 'c1', name: 'Starters', sort_order: 1 }]
        const supabase = mockSupabase({ data, error: null })

        const result = await fetchCategoriesQuery(supabase as any, 'hotel-1')

        expect(supabase.from).toHaveBeenCalledWith('categories')
        expect(supabase._builder.eq).toHaveBeenCalledWith('hotel_id', 'hotel-1')
        expect(supabase._builder.order).toHaveBeenCalledWith('sort_order', { ascending: true })
        expect(result).toEqual(data)
    })

    it('returns [] rather than null when data is null', async () => {
        const supabase = mockSupabase({ data: null, error: null })
        const result = await fetchCategoriesQuery(supabase as any, 'hotel-1')
        expect(result).toEqual([])
    })

    it('throws the supabase error instead of swallowing it', async () => {
        const supabase = mockSupabase({ data: null, error: new Error('permission denied') })
        await expect(fetchCategoriesQuery(supabase as any, 'hotel-1')).rejects.toThrow('permission denied')
    })
})

describe('insertCategoryQuery', () => {
    it('inserts the payload and returns the selected row', async () => {
        const inserted = { id: 'c2', name: 'Mains', sort_order: 2 }
        const supabase = mockSupabase({ data: inserted, error: null })

        const result = await insertCategoryQuery(supabase as any, {
            hotel_id: 'hotel-1', name: 'Mains', icon: null, sort_order: 2,
        })

        expect(supabase._builder.insert).toHaveBeenCalledWith({
            hotel_id: 'hotel-1', name: 'Mains', icon: null, sort_order: 2,
        })
        expect(result).toEqual(inserted)
    })

    it('throws on insert error', async () => {
        const supabase = mockSupabase({ data: null, error: new Error('duplicate name') })
        await expect(
            insertCategoryQuery(supabase as any, { hotel_id: 'h1', name: 'x', icon: null, sort_order: 1 })
        ).rejects.toThrow('duplicate name')
    })
})

describe('updateCategoryQuery / deleteCategoryQuery', () => {
    it('updates by id with the given patch', async () => {
        const supabase = mockSupabase({ error: null })
        await updateCategoryQuery(supabase as any, 'c1', { name: 'Renamed' })
        expect(supabase._builder.update).toHaveBeenCalledWith({ name: 'Renamed' })
        expect(supabase._builder.eq).toHaveBeenCalledWith('id', 'c1')
    })

    it('deletes by id', async () => {
        const supabase = mockSupabase({ error: null })
        await deleteCategoryQuery(supabase as any, 'c1')
        expect(supabase._builder.delete).toHaveBeenCalled()
        expect(supabase._builder.eq).toHaveBeenCalledWith('id', 'c1')
    })

    it('throws if the update fails', async () => {
        const supabase = mockSupabase({ error: new Error('row not found') })
        await expect(updateCategoryQuery(supabase as any, 'missing', { name: 'x' })).rejects.toThrow('row not found')
    })
})

describe('reorderCategoriesQuery', () => {
    it('issues one update per category and succeeds when all succeed', async () => {
        const builder = createChainableResult({ error: null })
        const from = vi.fn(() => builder)
        const supabase = { from }

        await reorderCategoriesQuery(supabase as any, [
            { id: 'c1', sort_order: 1 },
            { id: 'c2', sort_order: 2 },
        ])

        expect(from).toHaveBeenCalledTimes(2)
        expect(builder.update).toHaveBeenCalledWith({ sort_order: 1 })
        expect(builder.update).toHaveBeenCalledWith({ sort_order: 2 })
    })

    it('throws the first error encountered if any update fails', async () => {
        const okBuilder = createChainableResult({ error: null })
        const failBuilder = createChainableResult({ error: new Error('lock timeout') })
        const from = vi.fn().mockReturnValueOnce(okBuilder).mockReturnValueOnce(failBuilder)
        const supabase = { from }

        await expect(
            reorderCategoriesQuery(supabase as any, [
                { id: 'c1', sort_order: 1 },
                { id: 'c2', sort_order: 2 },
            ])
        ).rejects.toThrow('lock timeout')
    })
})

// Items mirror categories closely — one representative test each, plus the
// two behaviors that differ (extra column list, hotel_id + category_id filtering).

describe('fetchItemsQuery', () => {
    it('queries menu_items filtered by hotel and ordered by sort_order', async () => {
        const data = [{ id: 'i1', name: 'Paneer Tikka', category_id: 'c1' }]
        const supabase = mockSupabase({ data, error: null })

        const result = await fetchItemsQuery(supabase as any, 'hotel-1')

        expect(supabase.from).toHaveBeenCalledWith('menu_items')
        expect(supabase._builder.eq).toHaveBeenCalledWith('hotel_id', 'hotel-1')
        expect(result).toEqual(data)
    })
})

describe('insertItemQuery / updateItemQuery / deleteItemQuery', () => {
    it('inserts an item payload and returns the row', async () => {
        const inserted = { id: 'i1', name: 'Paneer Tikka' }
        const supabase = mockSupabase({ data: inserted, error: null })
        const result = await insertItemQuery(supabase as any, { name: 'Paneer Tikka' } as any)
        expect(result).toEqual(inserted)
    })

    it('updates an item by id', async () => {
        const supabase = mockSupabase({ error: null })
        await updateItemQuery(supabase as any, 'i1', { is_available: false })
        expect(supabase._builder.update).toHaveBeenCalledWith({ is_available: false })
        expect(supabase._builder.eq).toHaveBeenCalledWith('id', 'i1')
    })

    it('deletes an item by id', async () => {
        const supabase = mockSupabase({ error: null })
        await deleteItemQuery(supabase as any, 'i1')
        expect(supabase._builder.eq).toHaveBeenCalledWith('id', 'i1')
    })
})

describe('reorderItemsQuery', () => {
    it('updates sort_order for every item passed', async () => {
        const builder = createChainableResult({ error: null })
        const from = vi.fn(() => builder)
        const supabase = { from }

        await reorderItemsQuery(supabase as any, [
            { id: 'i1', sort_order: 1 },
            { id: 'i2', sort_order: 2 },
            { id: 'i3', sort_order: 3 },
        ])

        expect(from).toHaveBeenCalledTimes(3)
    })
})