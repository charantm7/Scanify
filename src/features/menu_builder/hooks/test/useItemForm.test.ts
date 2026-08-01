import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useItemForm } from '../useItemForm'
import { EMPTY_ITEM_FORM, MAX_VARIANTS_PER_ITEM } from '../../constants'
import type { MenuItem } from '../../types'

describe('useItemForm — initialization', () => {
    it('defaults to EMPTY_ITEM_FORM with no initial item', () => {
        const { result } = renderHook(() => useItemForm())
        expect(result.current.form).toEqual(EMPTY_ITEM_FORM)
    })

    it('maps an existing item into form values, defaulting nullable fields', () => {
        const item: Partial<MenuItem> = {
            id: 'i1', name: 'Butter Chicken', price: 350, is_available: true,
            description: null, image_url: null, dietary_type: null, tags: null,
            spice_level: null, variants: null,
        }
        const { result } = renderHook(() => useItemForm(item as MenuItem))

        expect(result.current.form.name).toBe('Butter Chicken')
        expect(result.current.form.price).toBe('350')
        expect(result.current.form.description).toBe('')
        expect(result.current.form.variants).toEqual([])
    })

    it('parses variants stored as JSON strings', () => {
        const item: Partial<MenuItem> = {
            id: 'i1', name: 'Pizza', price: 300, is_available: true,
            variants: [JSON.stringify({ id: 'v1', label: 'Medium', price: 300 })] as any,
        }
        const { result } = renderHook(() => useItemForm(item as MenuItem))
        expect(result.current.form.variants).toEqual([{ id: 'v1', label: 'Medium', price: 300 }])
    })

    it('silently drops a variant that fails to parse instead of crashing', () => {
        const item: Partial<MenuItem> = {
            id: 'i1', name: 'Pizza', price: 300, is_available: true,
            variants: ['{not valid json'] as any,
        }
        const { result } = renderHook(() => useItemForm(item as MenuItem))
        expect(result.current.form.variants).toEqual([])
    })
})

describe('useItemForm — field editing', () => {
    it('setField updates the field and clears its error', () => {
        const { result } = renderHook(() => useItemForm())

        act(() => { result.current.validate() }) // populate a name error
        expect(result.current.errors.name).toBeTruthy()

        act(() => { result.current.setField('name', 'Dosa') })

        expect(result.current.form.name).toBe('Dosa')
        expect(result.current.errors.name).toBeUndefined()
    })

    it('toggleTag adds a tag not present, and removes one that is', () => {
        const { result } = renderHook(() => useItemForm())

        act(() => { result.current.toggleTag('bestseller' as any) })
        expect(result.current.form.tags).toContain('bestseller')

        act(() => { result.current.toggleTag('bestseller' as any) })
        expect(result.current.form.tags).not.toContain('bestseller')
    })
})

describe('useItemForm — variants', () => {
    it('addVariant appends a blank variant with a generated id', () => {
        const { result } = renderHook(() => useItemForm())
        act(() => { result.current.addVariant() })
        expect(result.current.form.variants).toHaveLength(1)
        expect(result.current.form.variants[0].id).toBeTruthy()
    })

    it('addVariant is a no-op once MAX_VARIANTS_PER_ITEM is reached', () => {
        const { result } = renderHook(() => useItemForm())
        act(() => {
            for (let i = 0; i < MAX_VARIANTS_PER_ITEM + 2; i++) result.current.addVariant()
        })
        expect(result.current.form.variants).toHaveLength(MAX_VARIANTS_PER_ITEM)
    })

    it('updateVariant patches only the matching variant by id', () => {
        const { result } = renderHook(() => useItemForm())
        act(() => { result.current.addVariant(); result.current.addVariant() })
        const [first, second] = result.current.form.variants

        act(() => { result.current.updateVariant(first.id, { label: 'Small' }) })

        expect(result.current.form.variants.find((v) => v.id === first.id)?.label).toBe('Small')
        expect(result.current.form.variants.find((v) => v.id === second.id)?.label).toBe('')
    })

    it('removeVariant drops the matching variant', () => {
        const { result } = renderHook(() => useItemForm())
        act(() => { result.current.addVariant() })
        const id = result.current.form.variants[0].id

        act(() => { result.current.removeVariant(id) })

        expect(result.current.form.variants).toHaveLength(0)
    })
})

describe('useItemForm — validate', () => {
    it('requires a non-empty name', () => {
        const { result } = renderHook(() => useItemForm())
        act(() => { result.current.setField('price', '100') })
        let valid: boolean
        act(() => { valid = result.current.validate() })
        expect(valid!).toBe(false)
        expect(result.current.errors.name).toBeTruthy()
    })

    it('rejects a negative or non-numeric price', () => {
        const { result } = renderHook(() => useItemForm())
        act(() => { result.current.setField('name', 'Dosa'); result.current.setField('price', '-5') })
        let valid: boolean
        act(() => { valid = result.current.validate() })
        expect(valid!).toBe(false)
        expect(result.current.errors.price).toBeTruthy()
    })

    it('rejects an incomplete price variant even if the base fields are valid', () => {
        const { result } = renderHook(() => useItemForm())
        act(() => {
            result.current.setField('name', 'Dosa')
            result.current.setField('price', '100')
            result.current.addVariant() // label '' — incomplete
        })
        let valid: boolean
        act(() => { valid = result.current.validate() })
        expect(valid!).toBe(false)
        expect(result.current.errors.variants).toBeTruthy()
    })

    it('passes with a valid name, price, and no incomplete variants', () => {
        const { result } = renderHook(() => useItemForm())
        act(() => { result.current.setField('name', 'Dosa'); result.current.setField('price', '100') })
        let valid: boolean
        act(() => { valid = result.current.validate() })
        expect(valid!).toBe(true)
        expect(result.current.errors).toEqual({})
    })
})

describe('useItemForm — reset', () => {
    it('clears the form back to EMPTY_ITEM_FORM and wipes errors', () => {
        const { result } = renderHook(() => useItemForm())
        act(() => { result.current.setField('name', 'Dosa'); result.current.validate() })

        act(() => { result.current.reset() })

        expect(result.current.form).toEqual(EMPTY_ITEM_FORM)
        expect(result.current.errors).toEqual({})
    })
})