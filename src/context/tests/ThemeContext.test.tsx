import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeContext'
import { mockMatchMedia } from '../../../tests/mocks/supabase'

function renderTheme() {
    return renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    })
}

beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
})

afterEach(() => vi.unstubAllGlobals())

describe('ThemeProvider — initial theme resolution', () => {
    it('uses the saved localStorage theme over system preference when both exist', async () => {
        localStorage.setItem('theme', 'dark')
        mockMatchMedia(false) // system prefers light — saved value should still win

        const { result } = renderTheme()

        await waitFor(() => expect(result.current?.theme).toBe('dark'))
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('falls back to system preference (dark) when nothing is saved', async () => {
        mockMatchMedia(true)

        const { result } = renderTheme()

        await waitFor(() => expect(result.current?.theme).toBe('dark'))
        expect(localStorage.getItem('theme')).toBe('dark') // preference gets persisted
    })

    it('falls back to light when nothing is saved and system does not prefer dark', async () => {
        mockMatchMedia(false)

        const { result } = renderTheme()

        await waitFor(() => expect(result.current?.theme).toBe('light'))
    })
})

describe('ThemeProvider — toggleTheme', () => {
    it('flips light to dark, updates the DOM attribute, and persists to localStorage', async () => {
        mockMatchMedia(false)
        const { result } = renderTheme()
        await waitFor(() => expect(result.current?.theme).toBe('light'))

        act(() => result.current!.toggleTheme())

        expect(result.current?.theme).toBe('dark')
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
        expect(localStorage.getItem('theme')).toBe('dark')
    })

    it('flips dark back to light on a second toggle', async () => {
        localStorage.setItem('theme', 'dark')
        mockMatchMedia(false)
        const { result } = renderTheme()
        await waitFor(() => expect(result.current?.theme).toBe('dark'))

        act(() => result.current!.toggleTheme())

        expect(result.current?.theme).toBe('light')
    })
})

describe('useTheme — usage outside provider', () => {
    it('returns null rather than throwing (unlike useApp)', () => {
        const { result } = renderHook(() => useTheme())
        expect(result.current).toBeNull()
    })
})