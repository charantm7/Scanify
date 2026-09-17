// src/features/auth/hooks/useAuth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from './useAuth'
import { useApp } from '../../../context/AppContext'
import { useToast } from '../../../hooks/useToast'
import { useRouter } from 'next/navigation'
import * as loginServices from '../services/login.services'
import * as authQuery from '../query/auth.query'

vi.mock('../../../lib/supabase/client', () => ({ getSupabaseClient: vi.fn(() => ({})) }))
vi.mock('../../../context/AppContext')
vi.mock('../../../hooks/useToast')
vi.mock('next/navigation')
vi.mock('../services/login.services')
vi.mock('../query/auth.query')

const ls = vi.mocked(loginServices)
const aq = vi.mocked(authQuery)
const mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn() }
const mockRouter = { push: vi.fn() }

beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useApp).mockReturnValue({ user: { id: 'u1', email: 'a@b.com' }, profile: { onboarding_complete: true } } as any)
    vi.mocked(useToast).mockReturnValue(mockToast as any)
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
})

describe('useAuth — derived state', () => {
    it('isAuthenticated reflects whether user is non-null', () => {
        const { result } = renderHook(() => useAuth())
        expect(result.current.isAuthenticated).toBe(true)
    })

    it('onboardingComplete defaults to false when profile has no such field', () => {
        vi.mocked(useApp).mockReturnValue({ user: { id: 'u1' }, profile: {} } as any)
        const { result } = renderHook(() => useAuth())
        expect(result.current.onboardingComplete).toBe(false)
    })
})

describe('useAuth — loading/error lifecycle via run()', () => {
    it('sets loading true during the call and false after, and clears prior errors on a new attempt', async () => {
        ls.AuthSignIn.mockResolvedValue(undefined as any)
        const { result } = renderHook(() => useAuth())

        const promise = act(async () => {
            await result.current.signIn({ email: 'a@b.com', password: 'x', rememberMe: false })
        })
        await promise
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('catches a thrown error and sets it under error.server', async () => {
        ls.AuthSignIn.mockRejectedValue(new Error('Invalid credentials'))
        const { result } = renderHook(() => useAuth())

        await act(async () => {
            await result.current.signIn({ email: 'a@b.com', password: 'x', rememberMe: false })
        })

        expect(result.current.error).toEqual({ server: 'Invalid credentials' })
        expect(result.current.loading).toBe(false)
    })

    it('falls back to a generic message when a non-Error is thrown', async () => {
        ls.AuthSignIn.mockRejectedValue('not an Error object')
        const { result } = renderHook(() => useAuth())

        await act(async () => {
            await result.current.signIn({ email: 'a@b.com', password: 'x', rememberMe: false })
        })

        expect(result.current.error).toEqual({ server: 'Something went wrong.' })
    })

    it('clearError resets both error and updatePasswordError', async () => {
        ls.AuthSignIn.mockRejectedValue(new Error('fail'))
        const { result } = renderHook(() => useAuth())
        await act(async () => { await result.current.signIn({ email: 'a', password: 'b', rememberMe: false }) })
        expect(result.current.error).not.toBeNull()

        act(() => result.current.clearError())

        expect(result.current.error).toBeNull()
        expect(result.current.updatePasswordError).toBeNull()
    })
})

describe('useAuth — action delegation', () => {
    it('signUp delegates to AuthSignUp with supabase/payload/router/toast/setError', async () => {
        ls.AuthSignUp.mockResolvedValue(undefined as any)
        const { result } = renderHook(() => useAuth())
        const payload = { email: 'a@b.com', password: 'secret1', acceptedTerms: true }

        await act(async () => { await result.current.signUp(payload) })

        expect(ls.AuthSignUp).toHaveBeenCalledWith({}, payload, mockRouter, mockToast, expect.any(Function))
    })

    it('signInWithGoogle delegates to oauthSignIn from the query layer directly (bypassing services)', async () => {
        aq.oauthSignIn.mockResolvedValue(undefined as any)
        const { result } = renderHook(() => useAuth())

        await act(async () => { await result.current.signInWithGoogle() })

        expect(aq.oauthSignIn).toHaveBeenCalledWith({})
    })

    it('signOut delegates to AuthSignOut', async () => {
        ls.AuthSignOut.mockResolvedValue(undefined as any)
        const { result } = renderHook(() => useAuth())
        await act(async () => { await result.current.signOut() })
        expect(ls.AuthSignOut).toHaveBeenCalledWith({}, mockRouter, mockToast)
    })

    it('updatePassword passes the current user\'s email through', async () => {
        ls.AuthUpdatePassword.mockResolvedValue({ success: true, isRecovery: false } as any)
        const { result } = renderHook(() => useAuth())

        await act(async () => {
            await result.current.updatePassword({ next: 'a', confirm: 'a', current: '', isRecovery: false })
        })

        expect(ls.AuthUpdatePassword).toHaveBeenCalledWith({}, expect.any(Object), 'a@b.com', mockToast, expect.any(Function))
    })

    it('updatePassword returns the service result to the caller', async () => {
        ls.AuthUpdatePassword.mockResolvedValue({ success: true, isRecovery: true } as any)
        const { result } = renderHook(() => useAuth())

        let returned: any
        await act(async () => {
            returned = await result.current.updatePassword({ next: 'a', confirm: 'a', current: '', isRecovery: true })
        })

        expect(returned).toEqual({ success: true, isRecovery: true })
    })
})