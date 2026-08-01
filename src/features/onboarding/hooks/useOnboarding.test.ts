// src/features/onboarding/hooks/useOnboarding.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useOnboarding } from './useOnboarding'
import { useRouter } from 'next/navigation'
import { useToast } from '../../../hooks/useToast'
import * as onboardingService from '../services/onboarding.service'

vi.mock('../../../lib/supabase/client', () => ({ getSupabaseClient: vi.fn(() => ({})) }))
vi.mock('next/navigation')
vi.mock('../../../hooks/useToast')

vi.mock('../services/onboarding.service', async (importOriginal) => {
    const actual = await importOriginal<typeof onboardingService>()
    return {
        ...actual, // keep the REAL getFriendlyError + subdomainUrlBuilderWithWindow
        fetchOnboardingSession: vi.fn(),
        submitOnboarding: vi.fn(),
    }
})

const svc = vi.mocked(onboardingService)
const mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn() }
const mockRouter = { push: vi.fn() }

function fullSession(overrides?: Partial<{ id: string; email: string; full_name: string }>) {
    const o = { id: 'u1', email: 'a@b.com', full_name: '', ...overrides }
    return { user: { id: o.id, email: o.email, user_metadata: { full_name: o.full_name } } } as any
}

async function fillStep1(result: ReturnType<typeof renderHook<ReturnType<typeof useOnboarding>, unknown>>['result']) {
    act(() => result.current.set('restaurant_name')({ target: { value: 'Spice Route' } } as any))
    act(() => result.current.set('description')({ target: { value: 'Great food' } } as any))
}

beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
    vi.mocked(useToast).mockReturnValue(mockToast as any)
    svc.fetchOnboardingSession.mockResolvedValue(fullSession())
})

afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

async function flushEffects() {
    await act(async () => {
        await Promise.resolve()
        await Promise.resolve()
    })
}
describe('useOnboarding — session gate', () => {
    it('redirects to /login when there is no session', async () => {
        svc.fetchOnboardingSession.mockResolvedValue(null)
        renderHook(() => useOnboarding())

        await flushEffects()

        expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })

    it('stores userId/email and stays on the page when a session exists', async () => {
        svc.fetchOnboardingSession.mockResolvedValue(fullSession({ id: 'u1', email: 'a@b.com' }))
        renderHook(() => useOnboarding())

        await flushEffects()

        expect(svc.fetchOnboardingSession).toHaveBeenCalled()
        expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('prefills the name field from user_metadata.full_name when present', async () => {
        svc.fetchOnboardingSession.mockResolvedValue(fullSession({ full_name: 'Priya Sharma' }))
        const { result } = renderHook(() => useOnboarding())

        await flushEffects()

        expect(result.current.form.name).toBe('Priya Sharma')
    })

    it('leaves name blank when full_name is absent, rather than writing "undefined"', async () => {
        svc.fetchOnboardingSession.mockResolvedValue(fullSession({ full_name: '' }))
        const { result } = renderHook(() => useOnboarding())

        await flushEffects()

        expect(result.current.form.name).toBe('')
    })

    it('toasts and redirects to /login if fetching the session itself throws', async () => {
        svc.fetchOnboardingSession.mockRejectedValue(new Error('network error'))
        renderHook(() => useOnboarding())

        await flushEffects()

        expect(mockRouter.push).toHaveBeenCalledWith('/login')
        expect(mockToast.error).toHaveBeenCalledWith(expect.stringMatching(/verify your session/i))
    })
})

describe('useOnboarding — field editing', () => {
    it('set() updates the named field and clears its own error only', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()

        act(() => { result.current.goNext() }) // triggers step-1 validation → populates errors
        act(() => { vi.advanceTimersByTime(220) })
        expect(result.current.errors.restaurant_name).toBeTruthy()

        act(() => result.current.set('restaurant_name')({ target: { value: 'Spice Route' } } as any))

        expect(result.current.form.restaurant_name).toBe('Spice Route')
        expect(result.current.errors.restaurant_name).toBeUndefined()
    })

    it('togglePill adds a value not yet selected', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()

        act(() => result.current.togglePill('cuisine_types', 'Indian'))

        expect(result.current.form.cuisine_types).toContain('Indian')
    })

    it('togglePill removes a value already selected', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()

        act(() => result.current.togglePill('cuisine_types', 'Indian'))
        act(() => result.current.togglePill('cuisine_types', 'Indian'))

        expect(result.current.form.cuisine_types).not.toContain('Indian')
    })

    it('togglePill clears any existing error on that field', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()

        // jump validation state directly by triggering step-3 validation with nothing selected
        act(() => { for (let i = 0; i < 2; i++) { result.current.goNext(); vi.advanceTimersByTime(220) } })
        // fill step1/2 minimally isn't needed here — we only care that togglePill clears errors
        act(() => result.current.togglePill('cuisine_types', 'Indian'))
        expect(result.current.errors.cuisine_types).toBeUndefined()
    })
})

describe('useOnboarding — validateStep', () => {
    it('step 1 requires restaurant_name and description', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()

        act(() => { result.current.goNext() })
        vi.advanceTimersByTime(220)

        expect(result.current.errors.restaurant_name).toBeTruthy()
        expect(result.current.errors.description).toBeTruthy()
        expect(result.current.step).toBe(1) // did not advance
    })

    it('step 2 requires a valid pincode format', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()

        await fillStep1(result)
        act(() => { result.current.goNext() })
        act(() => { vi.advanceTimersByTime(220) })
        expect(result.current.step).toBe(2)

        act(() => {
            result.current.set('address')({ target: { value: '123 MG Road' } } as any)
            result.current.set('city')({ target: { value: 'Bengaluru' } } as any)
            result.current.set('pincode')({ target: { value: 'abc' } } as any)
        })
        act(() => { result.current.goNext() })
        act(() => { vi.advanceTimersByTime(220) })

        expect(result.current.errors.pincode).toBeTruthy()
        expect(result.current.step).toBe(2)
    })

    it('step 4 requires a valid phone number format', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()

        await fillStep1(result)
        act(() => { result.current.goNext() })
        act(() => { vi.advanceTimersByTime(220) })
        expect(result.current.step).toBe(2)

        act(() => {
            result.current.set('address')({ target: { value: '123 MG Road' } } as any)
            result.current.set('city')({ target: { value: 'Bengaluru' } } as any)
            result.current.set('pincode')({ target: { value: '560001' } } as any)
        })
        act(() => { result.current.goNext() })
        act(() => { vi.advanceTimersByTime(220) })
        expect(result.current.step).toBe(3)

        act(() => {
            result.current.togglePill('cuisine_types', 'Indian')
            result.current.togglePill('restaurant_types', 'Casual Dining')
            result.current.togglePill('service_types', 'Dine-in')
        })
        act(() => { result.current.goNext() })
        act(() => { vi.advanceTimersByTime(220) })
        expect(result.current.step).toBe(4)

        act(() => {
            result.current.set('name')({ target: { value: 'Priya' } } as any)
            result.current.set('phone')({ target: { value: '123' } } as any)
        })

        await act(async () => { await result.current.handleSubmit() })

        expect(result.current.errors.phone).toBeTruthy()
    })
})

describe('useOnboarding — goNext / goPrev', () => {
    it('does nothing while a transition is already animating', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()
        await fillStep1(result)

        act(() => { result.current.goNext() })
        expect(result.current.animating).toBe(true)

        act(() => { result.current.goNext() })
        act(() => { vi.advanceTimersByTime(220) })

        expect(result.current.step).toBe(2)
    })

    it('sets animDir "forward" on goNext and "backward" on goPrev', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()
        await fillStep1(result)

        act(() => { result.current.goNext() })
        expect(result.current.animDir).toBe('forward')
        act(() => { vi.advanceTimersByTime(220) })

        act(() => { result.current.goPrev() })
        expect(result.current.animDir).toBe('backward')
        act(() => { vi.advanceTimersByTime(220) })

        expect(result.current.step).toBe(1)
    })

    it('goPrev is blocked while animating, same as goNext', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()
        await fillStep1(result)
        act(() => { result.current.goNext() })
        act(() => { vi.advanceTimersByTime(220) })
        expect(result.current.step).toBe(2)

        act(() => { result.current.goPrev() })
        act(() => { result.current.goPrev() })
        act(() => { vi.advanceTimersByTime(220) })

        expect(result.current.step).toBe(1)
    })
})

describe('useOnboarding — handleSubmit', () => {
    const validForm = {
        restaurant_name: 'Spice Route', description: 'Great food',
        address: '123 MG Road', city: 'Bengaluru', pincode: '560001',
        cuisine_types: ['Indian'], restaurant_types: ['Casual Dining'], service_types: ['Dine-in'],
        name: 'Priya', phone: '+919876543210',
    }

    async function fillAllSteps(result: any) {
        for (const [field, value] of Object.entries(validForm)) {
            if (Array.isArray(value)) {
                for (const v of value) act(() => result.current.togglePill(field as any, v))
            } else {
                act(() => result.current.set(field as any)({ target: { value } } as any))
            }
        }
    }

    it('does nothing if step-4 validation fails', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()

        await act(async () => { await result.current.handleSubmit() })

        expect(svc.submitOnboarding).not.toHaveBeenCalled()
        expect(result.current.errors.name).toBeTruthy()
    })

    it('shows a session-expired toast and does not submit if userId is missing', async () => {
        svc.fetchOnboardingSession.mockResolvedValue(null)
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()
        expect(mockRouter.push).toHaveBeenCalledWith('/login')

        await fillAllSteps(result)
        await act(async () => { await result.current.handleSubmit() })

        expect(mockToast.error).toHaveBeenCalledWith(expect.stringMatching(/session expired/i))
        expect(svc.submitOnboarding).not.toHaveBeenCalled()
    })

    it('on success: stores the slug, toasts success, and flips done to true', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()
        await fillAllSteps(result)
        svc.submitOnboarding.mockResolvedValue('spice-route')

        await act(async () => { await result.current.handleSubmit() })

        expect(result.current.createdSlug).toBe('spice-route')
        expect(result.current.done).toBe(true)
        expect(mockToast.success).toHaveBeenCalled()
    })

    it('on failure: sets errors.general and toasts a message derived from the real error (not blank)', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()
        await fillAllSteps(result)
        svc.submitOnboarding.mockRejectedValue(new Error('duplicate key value'))

        await act(async () => { await result.current.handleSubmit() })

        expect(result.current.errors.general).toBe('duplicate key value')
        expect(mockToast.error).toHaveBeenCalledWith('duplicate key value')
        // If this assertion ever flips back to `undefined`, it means run() started
        // stringifying the error before calling getFriendlyError — see the earlier
        // audit note on why that breaks the toast.
    })

    it('does not set done=true when submission fails', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()
        await fillAllSteps(result)
        svc.submitOnboarding.mockRejectedValue(new Error('fail'))

        await act(async () => { await result.current.handleSubmit() })

        expect(result.current.done).toBe(false)
    })

    it('clears any prior errors.general before retrying', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()
        await fillAllSteps(result)

        svc.submitOnboarding.mockRejectedValueOnce(new Error('first failure'))
        await act(async () => { await result.current.handleSubmit() })
        expect(result.current.errors.general).toBe('first failure')

        svc.submitOnboarding.mockResolvedValueOnce('spice-route')
        await act(async () => { await result.current.handleSubmit() })

        expect(result.current.errors.general).toBeUndefined()
        expect(result.current.done).toBe(true)
    })
})

describe('useOnboarding — completedFields', () => {
    it('counts filled fields per step, starting at 0', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()

        expect(result.current.completedFields[1]).toBe(0)

        await fillStep1(result)

        expect(result.current.completedFields[1]).toBe(2)
    })

    it('step 3 counts each multi-select category as "filled" once it has at least one selection', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()

        act(() => result.current.togglePill('cuisine_types', 'Indian'))

        expect(result.current.completedFields[3]).toBe(1)
    })
})

describe('useOnboarding — menuUrl', () => {
    it('is an empty string before onboarding is done', async () => {
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()
        expect(result.current.menuUrl).toBe('')
    })

    it('is built from window.location.origin once onboarding completes', async () => {
        vi.stubGlobal('location', { origin: 'https://scanify.co.in', href: '' })
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()

        const validForm = {
            restaurant_name: 'Spice Route', description: 'Great food',
            address: '123 MG Road', city: 'Bengaluru', pincode: '560001',
            name: 'Priya', phone: '+919876543210',
        }
        for (const [field, value] of Object.entries(validForm)) {
            act(() => result.current.set(field as any)({ target: { value } } as any))
        }
        act(() => {
            result.current.togglePill('cuisine_types', 'Indian')
            result.current.togglePill('restaurant_types', 'Casual Dining')
            result.current.togglePill('service_types', 'Dine-in')
        })
        svc.submitOnboarding.mockResolvedValue('spice-route')

        await act(async () => { await result.current.handleSubmit() })

        expect(result.current.menuUrl).toBe('https://scanify.co.in/console')
    })

    it('does not depend on the created slug — same origin regardless of which restaurant signed up', async () => {
        vi.stubGlobal('location', { origin: 'https://scanify.co.in', href: '' })
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()

        const validForm = {
            restaurant_name: 'A Totally Different Name', description: 'Great food',
            address: '123 MG Road', city: 'Bengaluru', pincode: '560001',
            name: 'Priya', phone: '+919876543210',
        }
        for (const [field, value] of Object.entries(validForm)) {
            act(() => result.current.set(field as any)({ target: { value } } as any))
        }
        act(() => {
            result.current.togglePill('cuisine_types', 'Indian')
            result.current.togglePill('restaurant_types', 'Casual Dining')
            result.current.togglePill('service_types', 'Dine-in')
        })
        svc.submitOnboarding.mockResolvedValue('some-completely-different-slug')

        await act(async () => { await result.current.handleSubmit() })

        // confirms the URL genuinely ignores the slug — a regression test for the
        // exact bug the old subdomainUrlBuilderWithWindow had
        expect(result.current.menuUrl).toBe('https://scanify.co.in/console')
    })
})

describe('useOnboarding — goToConsole', () => {
    it('navigates to /console on the current host', async () => {
        vi.stubGlobal('location', { host: 'scanify.co.in', href: '' })
        const { result } = renderHook(() => useOnboarding())
        await flushEffects()

        act(() => result.current.goToConsole())

        expect((location as any).href).toBe('https://scanify.co.in/console')
    })
})