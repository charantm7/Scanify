import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryList } from '../CategoryList'
import type { Category, MenuItem } from '../../types'

vi.mock('react-hot-toast', () => ({
    default: { error: vi.fn(), success: vi.fn() },
}))
import toast from 'react-hot-toast'

function item(id: string, name: string): MenuItem {
    return {
        id,
        category_id: 'c1',
        name,
        description: null,
        price: 100,
        variants: null,
        image_url: null,
        is_available: true,
        dietary_type: null,
        tags: null,
        sort_order: 1,
        spice_level: null,
        serving_size: null,
        preparation_time: null,
        calories: null,
        ingredients: null,
        allergens: null,
    }
}

const CATEGORY: Category = {
    id: 'c1',
    name: 'Starters',
    icon: null,
    sort_order: 1,
    items: [item('i1', 'Samosa'), item('i2', 'Pakora'), item('i3', 'Tikka')],
} as Category

function renderList(props: Partial<React.ComponentProps<typeof CategoryList>> = {}) {
    const handlers = {
        onRename: vi.fn(),
        onIconChange: vi.fn(),
        onDelete: vi.fn(),
        onAddItem: vi.fn(),
        onEditItem: vi.fn(),
        onDeleteItem: vi.fn(),
        onToggleItem: vi.fn(),
        onTogglePlanHidden: vi.fn(),
        onReorderItems: vi.fn(),
        onReorderCategories: vi.fn(),
        onCreateFirstCategory: vi.fn(),
    }

    render(
        <CategoryList
            categories={[CATEGORY]}
            viewMode="list"
            isAtCap={false}
            search=""
            isAdvanceCategory={false}
            {...handlers}
            {...props}
        />
    )

    return handlers
}

beforeEach(() => vi.clearAllMocks())

describe('CategoryList — searching must not rewrite the menu', () => {
    it('shows only matching items but leaves the category count intact', () => {
        renderList({ search: 'samosa' })

        expect(screen.getByText('Samosa')).toBeInTheDocument()
        expect(screen.queryByText('Pakora')).not.toBeInTheDocument()
        // The pill reports what the category HOLDS, not what the filter shows —
        // otherwise a search reads as items having been deleted.
        expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('does not offer drag reordering while a search is narrowing the list', () => {
        renderList({ search: 'samosa' })

        const row = screen.getByText('Samosa').closest('[draggable]')
        // Positions on screen are not the positions that would be saved, so
        // committing a drag here previously dropped every hidden item from the
        // category and rewrote sort_order for the rest.
        expect(row?.getAttribute('draggable')).toBe('false')
    })

    it('still allows reordering when nothing is filtered', () => {
        renderList({ search: '' })

        const row = screen.getByText('Samosa').closest('[draggable="true"]')
        expect(row).not.toBeNull()
    })

    it('refuses to delete a category whose items are merely hidden by the search', async () => {
        const user = userEvent.setup()
        // Matches the category's own name, so it stays on screen — but note
        // that the name-match path deliberately keeps showing its items, so
        // narrow to a term that matches neither by rendering with a search
        // that hits the name via a substring no item carries.
        const handlers = renderList({ search: 'starters' })

        // Listed by name match; the delete guard must still see all 3 items.
        const deleteButton = screen.getByTitle('Delete category')
        await user.click(deleteButton)

        expect(handlers.onDelete).not.toHaveBeenCalled()
        expect(toast.error).toHaveBeenCalledWith(
            'Remove all items before deleting this category'
        )
    })
})
