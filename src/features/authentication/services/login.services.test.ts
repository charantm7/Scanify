// src/features/auth/services/login.services.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockToast, createMockRouter } from '../../../../tests/mocks/supabase'
import {
    validate, validateNewPassword, getPasswordStrength,
    AuthSignUp, AuthSignIn, AuthSignOut, AuthResetPassword,
    AuthUpdatePassword, AuthUpdateEmail, AuthResendEmail,
} from './login.services'
import * as authQuery from '../query/auth.query'

vi.mock('../query/auth.query')
const q = vi.mocked(authQuery)

beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('localStorage', {
        store: {} as Record<string, string>,
        getItem(k: string) { return this.store[k] ?? null },
        setItem(k: string, v: string) { this.store[k] = v },
        removeItem(k: string) { delete this.store[k] },
    })
})

describe('validate', () => {
    it('requires email and password', () => {
        expect(validate({ email: '', password: '' })).toEqual({
            email: 'Email is required', password: 'Password is required',
        })
    })
    it('rejects a malformed email', () => {
        expect(validate({ email: 'not-an-email', password: 'secret1' }).email).toBeTruthy()
    })
    it('rejects a password under 6 characters', () => {
        expect(validate({ email: 'a@b.com', password: '123' }).password).toMatch(/minimum 6/i)
    })
    it('passes with a valid email and password', () => {
        expect(validate({ email: 'a@b.com', password: 'secret1' })).toEqual({})
    })
})

describe('validateNewPassword', () => {
    it('requires both password and confirmPassword', () => {
        const e = validateNewPassword({})
        expect(e.password).toBeTruthy()
        expect(e.confirmPassword).toBeTruthy()
    })
    it('flags a mismatch between password and confirmPassword', () => {
        const e = validateNewPassword({ password: 'secret1', confirmPassword: 'secret2' })
        expect(e.confirmPassword).toMatch(/do not match/i)
    })
    it('passes when both match and meet length', () => {
        expect(validateNewPassword({ password: 'secret1', confirmPassword: 'secret1' })).toEqual({})
    })
})

describe('getPasswordStrength', () => {
    it('returns an empty result for an empty password', () => {
        expect(getPasswordStrength('')).toEqual({ level: 0, label: '', color: '' })
    })
    it('rates a short lowercase-only password as Weak', () => {
        expect(getPasswordStrength('abc').label).toBe('Weak')
    })
    it('rates length + uppercase + digit + symbol as Strong', () => {
        expect(getPasswordStrength('Abcdef1!').label).toBe('Strong')
    })
    it('rates exactly two criteria as Fair', () => {
        // length>=8 + digit, no uppercase, no symbol = 2 criteria
        expect(getPasswordStrength('abcdefg1').label).toBe('Fair')
    })
})

describe('AuthSignUp', () => {
    it('sets validation errors and does not call signUp when the form is invalid', async () => {
        const setError = vi.fn()
        await AuthSignUp({} as any, { email: '', password: '', acceptedTerms: true }, createMockRouter() as any, createMockToast() as any, setError)
        expect(setError).toHaveBeenCalledWith(expect.objectContaining({ email: expect.any(String) }))
        expect(q.signUp).not.toHaveBeenCalled()
    })

    it('rejects when terms are not accepted, merging a terms error alongside any field errors', async () => {
        const setError = vi.fn()
        await AuthSignUp({} as any, { email: 'a@b.com', password: 'secret1', acceptedTerms: false }, createMockRouter() as any, createMockToast() as any, setError)
        expect(setError).toHaveBeenCalledWith(expect.objectContaining({ terms: expect.any(String) }))
        expect(q.signUp).not.toHaveBeenCalled()
    })

    it('throws when identities is empty — supabase\'s signal for "email already registered"', async () => {
        q.signUp.mockResolvedValue({ user: { identities: [] } } as any)
        await expect(
            AuthSignUp({} as any, { email: 'a@b.com', password: 'secret1', acceptedTerms: true }, createMockRouter() as any, createMockToast() as any, vi.fn())
        ).rejects.toThrow(/already exists/i)
    })

    it('stores the signup email and redirects to /check-mail on success', async () => {
        q.signUp.mockResolvedValue({ user: { identities: [{ id: 'x' }] } } as any)
        const router = createMockRouter()
        const toast = createMockToast()

        await AuthSignUp({} as any, { email: 'a@b.com', password: 'secret1', acceptedTerms: true }, router as any, toast as any, vi.fn())

        expect(localStorage.getItem('signup_email')).toBe('a@b.com')
        expect(router.push).toHaveBeenCalledWith('/check-mail')
        expect(toast.success).toHaveBeenCalled()
    })
})

describe('AuthSignIn', () => {
    it('throws if no user is returned', async () => {
        q.signInWithPassword.mockResolvedValue({ user: null } as any)
        await expect(
            AuthSignIn({} as any, { email: 'a@b.com', password: 'x', rememberMe: false }, createMockRouter() as any, createMockToast() as any)
        ).rejects.toThrow(/no user returned/i)
    })

    it('throws if the email is not verified', async () => {
        q.signInWithPassword.mockResolvedValue({ user: { id: 'u1', email_confirmed_at: null } } as any)
        await expect(
            AuthSignIn({} as any, { email: 'a@b.com', password: 'x', rememberMe: false }, createMockRouter() as any, createMockToast() as any)
        ).rejects.toThrow(/email not verified/i)
    })

    it('persists remember-me email when rememberMe is true', async () => {
        q.signInWithPassword.mockResolvedValue({ user: { id: 'u1', email_confirmed_at: 'now' } } as any)
        q.getUserProfile.mockResolvedValue({ onboarding_complete: true } as any)

        await AuthSignIn({} as any, { email: 'a@b.com', password: 'x', rememberMe: true }, createMockRouter() as any, createMockToast() as any)

        expect(localStorage.getItem('remember_me')).toBe('true')
        expect(localStorage.getItem('remember_email')).toBe('a@b.com')
    })

    it('clears remember-me storage when rememberMe is false', async () => {
        localStorage.setItem('remember_me', 'true')
        localStorage.setItem('remember_email', 'old@b.com')
        q.signInWithPassword.mockResolvedValue({ user: { id: 'u1', email_confirmed_at: 'now' } } as any)
        q.getUserProfile.mockResolvedValue({ onboarding_complete: true } as any)

        await AuthSignIn({} as any, { email: 'a@b.com', password: 'x', rememberMe: false }, createMockRouter() as any, createMockToast() as any)

        expect(localStorage.getItem('remember_me')).toBeNull()
    })

    it('redirects to /console when onboarding is complete', async () => {
        q.signInWithPassword.mockResolvedValue({ user: { id: 'u1', email_confirmed_at: 'now' } } as any)
        q.getUserProfile.mockResolvedValue({ onboarding_complete: true } as any)
        const router = createMockRouter()

        await AuthSignIn({} as any, { email: 'a@b.com', password: 'x', rememberMe: false }, router as any, createMockToast() as any)

        expect(router.push).toHaveBeenCalledWith('/console')
    })

    it('redirects to /onboarding when onboarding is incomplete or profile is missing', async () => {
        q.signInWithPassword.mockResolvedValue({ user: { id: 'u1', email_confirmed_at: 'now' } } as any)
        q.getUserProfile.mockResolvedValue(null)
        const router = createMockRouter()

        await AuthSignIn({} as any, { email: 'a@b.com', password: 'x', rememberMe: false }, router as any, createMockToast() as any)

        expect(router.push).toHaveBeenCalledWith('/onboarding')
    })
})

describe('AuthSignOut', () => {
    it('signs out then redirects to /login with a toast', async () => {
        q.signOut.mockResolvedValue(undefined as any)
        const router = createMockRouter()
        const toast = createMockToast()

        await AuthSignOut({} as any, router as any, toast as any)

        expect(q.signOut).toHaveBeenCalled()
        expect(router.push).toHaveBeenCalledWith('/login')
        expect(toast.success).toHaveBeenCalled()
    })
})

describe('AuthResetPassword', () => {
    it('sets an error and does not call resetPassword for an empty email', async () => {
        const setError = vi.fn()
        await AuthResetPassword({} as any, '  ', createMockToast() as any, setError, vi.fn(), vi.fn())
        expect(setError).toHaveBeenCalledWith({ email: 'Email is required.' })
        expect(q.resetPassword).not.toHaveBeenCalled()
    })

    it('sets an error for a malformed email', async () => {
        const setError = vi.fn()
        await AuthResetPassword({} as any, 'not-an-email', createMockToast() as any, setError, vi.fn(), vi.fn())
        expect(setError).toHaveBeenCalledWith({ email: 'Invalid email format.' })
    })

    it('on success, sets sent, starts a 60s cooldown, and toasts', async () => {
        q.resetPassword.mockResolvedValue(undefined as any)
        const setSent = vi.fn()
        const setCooldown = vi.fn()
        const toast = createMockToast()

        await AuthResetPassword({} as any, 'a@b.com', toast as any, vi.fn(), setSent, setCooldown)

        expect(setSent).toHaveBeenCalledWith(true)
        expect(setCooldown).toHaveBeenCalledWith(60)
        expect(toast.success).toHaveBeenCalled()
    })
})

describe('AuthUpdatePassword', () => {
    it('sets validation errors and returns undefined without calling updatePassword', async () => {
        const setUpdatePasswordError = vi.fn()
        const result = await AuthUpdatePassword(
            {} as any, { next: '', confirm: '', current: '', isRecovery: false },
            'a@b.com', createMockToast() as any, setUpdatePasswordError
        )
        expect(setUpdatePasswordError).toHaveBeenCalled()
        expect(result).toBeUndefined()
        expect(q.updatePassword).not.toHaveBeenCalled()
    })

    it('verifies the current password first when provided, and throws a specific message if it\'s wrong', async () => {
        const supabase = { auth: { signInWithPassword: vi.fn().mockResolvedValue({ error: { message: 'bad' } }) } }
        await expect(
            AuthUpdatePassword(
                supabase as any,
                { next: 'newpass1', confirm: 'newpass1', current: 'wrongpass', isRecovery: false },
                'a@b.com', createMockToast() as any, vi.fn()
            )
        ).rejects.toThrow('Current password is incorrect.')
        expect(q.updatePassword).not.toHaveBeenCalled()
    })

    it('skips current-password verification when payload.current is absent (recovery-link flow)', async () => {
        q.updatePassword.mockResolvedValue(undefined as any)
        const supabase = { auth: { signInWithPassword: vi.fn() } }

        await AuthUpdatePassword(
            supabase as any,
            { next: 'newpass1', confirm: 'newpass1', current: '', isRecovery: true },
            'a@b.com', createMockToast() as any, vi.fn()
        )

        expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled()
        expect(q.updatePassword).toHaveBeenCalled()
    })

    it('returns { isRecovery, success: true } on success', async () => {
        q.updatePassword.mockResolvedValue(undefined as any)
        const result = await AuthUpdatePassword(
            {} as any, { next: 'newpass1', confirm: 'newpass1', current: '', isRecovery: true },
            'a@b.com', createMockToast() as any, vi.fn()
        )
        expect(result).toEqual({ isRecovery: true, success: true })
    })
})

describe('AuthUpdateEmail', () => {
    it('throws on empty or malformed email without calling supabase', async () => {
        const supabase = { auth: { updateUser: vi.fn() } }
        await expect(AuthUpdateEmail(supabase as any, '', createMockToast() as any)).rejects.toThrow(/cannot be empty/i)
        await expect(AuthUpdateEmail(supabase as any, 'bad', createMockToast() as any)).rejects.toThrow(/invalid email/i)
        expect(supabase.auth.updateUser).not.toHaveBeenCalled()
    })

    it('toasts success when supabase accepts the update', async () => {
        const supabase = { auth: { updateUser: vi.fn().mockResolvedValue({ error: null }) } }
        const toast = createMockToast()
        await AuthUpdateEmail(supabase as any, 'new@b.com', toast as any)
        expect(toast.success).toHaveBeenCalled()
    })
})

describe('AuthResendEmail', () => {
    it('warns and returns early if no signup email was stored', async () => {
        const toast = createMockToast()
        await AuthResendEmail({} as any, toast as any, vi.fn(), vi.fn())
        expect(toast.warning).toHaveBeenCalled()
        expect(q.resendEmailVerification).not.toHaveBeenCalled()
    })

    it('resends using the stored signup email and bumps the resend count', async () => {
        localStorage.setItem('signup_email', 'a@b.com')
        q.resendEmailVerification.mockResolvedValue(undefined as any)
        const setResendCount = vi.fn()

        await AuthResendEmail({} as any, createMockToast() as any, setResendCount, vi.fn())

        expect(q.resendEmailVerification).toHaveBeenCalledWith({} as any, 'a@b.com')
        expect(setResendCount).toHaveBeenCalled()
    })

    it('BUG: falls back to 60, when NEXT_PUBLIC_COOLDOWN_SECONDS is unset', async () => {
        localStorage.setItem('signup_email', 'a@b.com')
        q.resendEmailVerification.mockResolvedValue(undefined as any)
        vi.stubEnv('NEXT_PUBLIC_COOLDOWN_SECONDS', undefined as any)
        const setCooldown = vi.fn()

        await AuthResendEmail({} as any, createMockToast() as any, vi.fn(), setCooldown)

        // documents current (broken) behavior — `Number(undefined) ?? 60` is NaN, not 60
        expect(setCooldown).toHaveBeenCalledWith(60)
    })

    it('uses the env cooldown value when it is set', async () => {
        localStorage.setItem('signup_email', 'a@b.com')
        q.resendEmailVerification.mockResolvedValue(undefined as any)
        vi.stubEnv('NEXT_PUBLIC_COOLDOWN_SECONDS', '30')
        const setCooldown = vi.fn()

        await AuthResendEmail({} as any, createMockToast() as any, vi.fn(), setCooldown)

        expect(setCooldown).toHaveBeenCalledWith(30)
    })
})