import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReorderableList } from '../useReorderableList'

function makeDragEvent(): any {
    return { preventDefault: vi.fn(), dataTransfer: {} }
}

describe('useReorderableList', () => {
    const items = ['a', 'b', 'c']

    it('moves the dragged item to the drop index and commits the new order', () => {
        const onCommit = vi.fn()
        const { result } = renderHook(() => useReorderableList(items, onCommit))

        act(() => { result.current.handleDragStart(0)(makeDragEvent()) })
        act(() => { result.current.handleDrop(2)(makeDragEvent()) })

        expect(onCommit).toHaveBeenCalledWith(['b', 'c', 'a'])
    })

    it('does nothing and does not call onCommit when dropped on its own index', () => {
        const onCommit = vi.fn()
        const { result } = renderHook(() => useReorderableList(items, onCommit))

        act(() => { result.current.handleDragStart(1)(makeDragEvent()) })
        act(() => { result.current.handleDrop(1)(makeDragEvent()) })

        expect(onCommit).not.toHaveBeenCalled()
    })

    it('does not commit if drop fires with no active drag (dragIndex null)', () => {
        const onCommit = vi.fn()
        const { result } = renderHook(() => useReorderableList(items, onCommit))

        act(() => { result.current.handleDrop(1)(makeDragEvent()) })

        expect(onCommit).not.toHaveBeenCalled()
    })

    it('resets dragIndex and overIndex after a successful drop', () => {
        const onCommit = vi.fn()
        const { result } = renderHook(() => useReorderableList(items, onCommit))

        act(() => { result.current.handleDragStart(0)(makeDragEvent()) })
        act(() => { result.current.handleDragOver(2)(makeDragEvent()) })
        expect(result.current.overIndex).toBe(2)

        act(() => { result.current.handleDrop(2)(makeDragEvent()) })

        expect(result.current.dragIndex).toBeNull()
        expect(result.current.overIndex).toBeNull()
    })

    it('handleDragEnd clears indices even without a drop (e.g. dropped outside a valid target)', () => {
        const onCommit = vi.fn()
        const { result } = renderHook(() => useReorderableList(items, onCommit))

        act(() => { result.current.handleDragStart(0)(makeDragEvent()) })
        act(() => { result.current.handleDragEnd() })

        expect(result.current.dragIndex).toBeNull()
        expect(result.current.overIndex).toBeNull()
    })

    it('calls preventDefault on dragOver and drop so the browser allows the drop', () => {
        const onCommit = vi.fn()
        const { result } = renderHook(() => useReorderableList(items, onCommit))
        const overEvent = makeDragEvent()
        const dropEvent = makeDragEvent()

        act(() => { result.current.handleDragOver(1)(overEvent) })
        act(() => { result.current.handleDrop(1)(dropEvent) })

        expect(overEvent.preventDefault).toHaveBeenCalled()
        expect(dropEvent.preventDefault).toHaveBeenCalled()
    })
})