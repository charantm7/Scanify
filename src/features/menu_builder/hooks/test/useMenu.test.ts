import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useMenu } from '../useMenu'
import * as services from '../../services/menu.services'
import { useApp } from '../../../../context/AppContext'
import { useToast } from '../../../../hooks/useToast'

vi.mock('../../services/menu.services')
vi.mock('../../../../context/AppContext')
vi.mock('../../../..//hooks/useToast')

const s = vi.mocked(services)
const mockToast = { success: vi.fn(), error: vi.fn() }

beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useApp).mockReturnValue({ supabase: {} } as any)
    vi.mocked(useToast).mockReturnValue(mockToast as any)
    s.loadMenuData.mockResolvedValue([])
})

describe('useMenu — initial load', () => {
    it('loads on mount and dispatches LOADED with the fetched categories', async () => {
        const categories = [{ id: 'c1', name: 'Starters', items: [] } as any]
        s.loadMenuData.mockResolvedValue(categories)

        const { result } = renderHook(() => useMenu('hotel-1'))

        await waitFor(() => expect(result.current.state.loading).toBe(false))
        expect(result.current.state.categories).toEqual(categories)
    })

    it('does not call loadMenuData when hotelId is undefined', () => {
        renderHook(() => useMenu(undefined))
        expect(s.loadMenuData).not.toHaveBeenCalled()
    })

    it('dispatches ERROR and toasts on load failure, leaving categories empty', async () => {
        s.loadMenuData.mockRejectedValue(new Error('network down'))

        const { result } = renderHook(() => useMenu('hotel-1'))

        await waitFor(() => expect(result.current.state.loading).toBe(false))
        expect(result.current.state.error).toBe('network down')
        expect(result.current.state.categories).toEqual([])
        expect(mockToast.error).toHaveBeenCalledWith('Failed to load menu')
    })
})

describe('useMenu — category actions', () => {
    it('addCategory appends the returned category to state', async () => {
        const { result } = renderHook(() => useMenu('hotel-1'))
        await waitFor(() => expect(result.current.state.loading).toBe(false))

        s.createCategory.mockResolvedValue({ id: 'c1', name: 'Desserts', items: [] } as any)

        await act(async () => { await result.current.actions.addCategory('Desserts', null) })

        expect(result.current.state.categories.map((c) => c.name)).toContain('Desserts')
    })

    it('addCategory toasts an error and does not modify state on failure', async () => {
        const { result } = renderHook(() => useMenu('hotel-1'))
        await waitFor(() => expect(result.current.state.loading).toBe(false))

        s.createCategory.mockRejectedValue(new Error('duplicate category'))

        await act(async () => { await result.current.actions.addCategory('Desserts', null) })

        expect(result.current.state.categories).toEqual([])
        expect(mockToast.error).toHaveBeenCalledWith('duplicate category')
    })

    it('is a no-op when hotelId is undefined', async () => {
        const { result } = renderHook(() => useMenu(undefined))
        await act(async () => { await result.current.actions.addCategory('Desserts', null) })
        expect(s.createCategory).not.toHaveBeenCalled()
    })

    it('renameCategory patches only the matching category name', async () => {
        s.loadMenuData.mockResolvedValue([
            { id: 'c1', name: 'Old', items: [] } as any,
            { id: 'c2', name: 'Other', items: [] } as any,
        ])
        const { result } = renderHook(() => useMenu('hotel-1'))
        await waitFor(() => expect(result.current.state.loading).toBe(false))

        s.renameCategoryService.mockResolvedValue(undefined as any)

        await act(async () => { await result.current.actions.renameCategory('c1', 'New') })

        expect(result.current.state.categories.find((c) => c.id === 'c1')?.name).toBe('New')
        expect(result.current.state.categories.find((c) => c.id === 'c2')?.name).toBe('Other')
    })

    it('deleteCategory removes the category from state', async () => {
        s.loadMenuData.mockResolvedValue([{ id: 'c1', name: 'Gone', items: [] } as any])
        const { result } = renderHook(() => useMenu('hotel-1'))
        await waitFor(() => expect(result.current.state.loading).toBe(false))

        s.removeCategory.mockResolvedValue(undefined as any)

        await act(async () => { await result.current.actions.deleteCategory('c1') })

        expect(result.current.state.categories).toEqual([])
    })

    it('reorderCategories updates state optimistically, before the persist call resolves', async () => {
        const initial = [{ id: 'c1', name: 'A', items: [] }, { id: 'c2', name: 'B', items: [] }] as any
        s.loadMenuData.mockResolvedValue(initial)
        const { result } = renderHook(() => useMenu('hotel-1'))
        await waitFor(() => expect(result.current.state.loading).toBe(false))

        let resolvePersist: () => void
        s.persistCategoryOrder.mockReturnValue(new Promise((r) => { resolvePersist = () => r(undefined) }))

        const reordered = [initial[1], initial[0]]
        act(() => { result.current.actions.reorderCategories(reordered) })

        // state updates immediately, without awaiting the persist call
        expect(result.current.state.categories).toEqual(reordered)

        await act(async () => { resolvePersist!() })
    })

    it('reorderCategories reverts via loadMenu (refetch) if persisting fails', async () => {
        const initial = [{ id: 'c1', name: 'A', items: [] }, { id: 'c2', name: 'B', items: [] }] as any
        s.loadMenuData.mockResolvedValueOnce(initial)
        const { result } = renderHook(() => useMenu('hotel-1'))
        await waitFor(() => expect(result.current.state.loading).toBe(false))

        s.persistCategoryOrder.mockRejectedValue(new Error('failed'))
        s.loadMenuData.mockResolvedValueOnce(initial) // the resync refetch

        await act(async () => {
            await result.current.actions.reorderCategories([initial[1], initial[0]])
        })

        expect(mockToast.error).toHaveBeenCalledWith('Failed to save new order')
        expect(s.loadMenuData).toHaveBeenCalledTimes(2) // initial mount + resync
    })
})

describe('useMenu — item actions', () => {
    it('saveItem with no `existing` creates a new item, dispatches ADD_ITEM, and fires onItemCountChange', async () => {
        s.loadMenuData.mockResolvedValue([{ id: 'c1', name: 'Starters', items: [] } as any])
        const onItemCountChange = vi.fn()
        const { result } = renderHook(() => useMenu('hotel-1', onItemCountChange))
        await waitFor(() => expect(result.current.state.loading).toBe(false))

        s.createItem.mockResolvedValue({ id: 'i1', category_id: 'c1', name: 'Samosa' } as any)

        let success: boolean | undefined
        await act(async () => {
            success = await result.current.actions.saveItem({ name: 'Samosa' } as any, null, 'c1')
        })

        expect(success).toBe(true)
        expect(result.current.state.categories[0].items).toHaveLength(1)
        expect(onItemCountChange).toHaveBeenCalled()
    })

    it('saveItem with an `existing` item updates in place and does NOT fire onItemCountChange', async () => {
        s.loadMenuData.mockResolvedValue([
            { id: 'c1', name: 'Starters', items: [{ id: 'i1', name: 'Old Name' }] } as any,
        ])
        const onItemCountChange = vi.fn()
        const { result } = renderHook(() => useMenu('hotel-1', onItemCountChange))
        await waitFor(() => expect(result.current.state.loading).toBe(false))

        s.updateItemService.mockResolvedValue({ name: 'New Name' } as any)

        await act(async () => {
            await result.current.actions.saveItem({ name: 'New Name' } as any, { id: 'i1' } as any, 'c1')
        })

        expect(result.current.state.categories[0].items[0].name).toBe('New Name')
        expect(onItemCountChange).not.toHaveBeenCalled()
    })

    it('saveItem returns false and toasts on failure, without mutating state', async () => {
        s.loadMenuData.mockResolvedValue([{ id: 'c1', name: 'Starters', items: [] } as any])
        const { result } = renderHook(() => useMenu('hotel-1'))
        await waitFor(() => expect(result.current.state.loading).toBe(false))

        s.createItem.mockRejectedValue(new Error('price required'))

        let success: boolean | undefined
        await act(async () => {
            success = await result.current.actions.saveItem({ name: 'Samosa' } as any, null, 'c1')
        })

        expect(success).toBe(false)
        expect(result.current.state.categories[0].items).toHaveLength(0)
        expect(mockToast.error).toHaveBeenCalledWith('price required')
    })

    it('saveItem is a no-op returning false when hotelId is missing', async () => {
        const { result } = renderHook(() => useMenu(undefined))
        let success: boolean;
        await act(async () => {
            success = await result.current.actions.saveItem({} as any, null, 'c1')
        })
        expect(success).toBe(false);
        expect(s.createItem).not.toHaveBeenCalled()
    })

    it('deleteItem removes the item and fires onItemCountChange', async () => {
        s.loadMenuData.mockResolvedValue([
            { id: 'c1', name: 'Starters', items: [{ id: 'i1', name: 'Samosa' }] } as any,
        ])
        const onItemCountChange = vi.fn()
        const { result } = renderHook(() => useMenu('hotel-1', onItemCountChange))
        await waitFor(() => expect(result.current.state.loading).toBe(false))

        s.removeItem.mockResolvedValue(undefined as any)

        await act(async () => { await result.current.actions.deleteItem('i1') })

        expect(result.current.state.categories[0].items).toHaveLength(0)
        expect(onItemCountChange).toHaveBeenCalled()
    })

    it('toggleItemAvailability flips state optimistically before the request resolves', async () => {
        s.loadMenuData.mockResolvedValue([
            { id: 'c1', name: 'Starters', items: [{ id: 'i1', name: 'Samosa', is_available: true }] } as any,
        ])
        const { result } = renderHook(() => useMenu('hotel-1'))
        await waitFor(() => expect(result.current.state.loading).toBe(false))

        let resolveToggle: () => void
        s.setItemAvailabilityService.mockReturnValue(new Promise((r) => { resolveToggle = () => r(undefined) }))

        act(() => { result.current.actions.toggleItemAvailability({ id: 'i1', is_available: true } as any) })

        expect(result.current.state.categories[0].items[0].is_available).toBe(false)

        await act(async () => { resolveToggle!() })
    })

    it('toggleItemAvailability reverts on failure and toasts an error', async () => {
        s.loadMenuData.mockResolvedValue([
            { id: 'c1', name: 'Starters', items: [{ id: 'i1', name: 'Samosa', is_available: true }] } as any,
        ])
        const { result } = renderHook(() => useMenu('hotel-1'))
        await waitFor(() => expect(result.current.state.loading).toBe(false))

        s.setItemAvailabilityService.mockRejectedValue(new Error('failed'))

        await act(async () => {
            await result.current.actions.toggleItemAvailability({ id: 'i1', is_available: true } as any)
        })

        expect(result.current.state.categories[0].items[0].is_available).toBe(true) // reverted
        expect(mockToast.error).toHaveBeenCalledWith('Failed to update availability')
    })

    it('reorderItems updates the matching category only, and reverts via loadMenu on failure', async () => {
        s.loadMenuData.mockResolvedValueOnce([
            { id: 'c1', name: 'Starters', items: [{ id: 'i1' }, { id: 'i2' }] } as any,
        ])
        const { result } = renderHook(() => useMenu('hotel-1'))
        await waitFor(() => expect(result.current.state.loading).toBe(false))

        s.persistItemOrder.mockRejectedValue(new Error('failed'))
        s.loadMenuData.mockResolvedValueOnce([
            { id: 'c1', name: 'Starters', items: [{ id: 'i1' }, { id: 'i2' }] } as any,
        ])

        const reversed = [{ id: 'i2' }, { id: 'i1' }] as any
        await act(async () => { await result.current.actions.reorderItems('c1', reversed) })

        expect(mockToast.error).toHaveBeenCalledWith('Failed to save new order')
        expect(s.loadMenuData).toHaveBeenCalledTimes(2)
    })
})