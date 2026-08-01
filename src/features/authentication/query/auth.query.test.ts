// src/features/auth/query/auth.query.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChainableResult } from '../../../../tests/mocks/supabase'
import {
    getUserProfile, signInWithPassword, signUp, signOut,
    resetPassword, resendEmailVerification, updatePassword,
    oauthSignIn, createUserProfile, updateUserProfile,
} from './auth.query'

beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: 'https://scanify.co.in', host: 'scanify.co.in' } })
})

describe('getUserProfile', () => {
    it('returns the profile row on success', async () => {
        const builder = createChainableResult({ data: { id: 'u1', name: 'Test' }, error: null })
        const supabase = { from: vi.fn(() => builder) }
        const result = await getUserProfile(supabase as any, 'u1')
        expect(supabase.from).toHaveBeenCalledWith('users')
        expect(builder.eq).toHaveBeenCalledWith('id', 'u1')
        expect(result).toEqual({ id: 'u1', name: 'Test' })
    })

    it('throws a prefixed error message on failure', async () => {
        const builder = createChainableResult({ data: null, error: { message: 'RLS denied' } })
        const supabase = { from: vi.fn(() => builder) }
        await expect(getUserProfile(supabase as any, 'u1')).rejects.toThrow('Get User Profile error: RLS denied')
    })
})

describe('signInWithPassword', () => {
    it('passes email/password through and returns data on success', async () => {
        const supabase = { auth: { signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }) } }
        const result = await signInWithPassword(supabase as any, { email: 'a@b.com', password: 'secret1' })
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret1' })
        expect(result).toEqual({ user: { id: 'u1' } })
    })

    it('throws the raw supabase error message (no prefix, unlike other query fns)', async () => {
        const supabase = { auth: { signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: { message: 'Invalid credentials' } }) } }
        await expect(signInWithPassword(supabase as any, { email: 'a@b.com', password: 'wrong' }))
            .rejects.toThrow('Invalid credentials')
    })
})

describe('signUp', () => {
    it('builds emailRedirectTo from window.location.origin + env var', async () => {
        vi.stubEnv('NEXT_PUBLIC_SIGNUP_EMAIL_REDIRECT_TO', 'check-mail')
        const supabase = { auth: { signUp: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }) } }

        await signUp(supabase as any, { email: 'a@b.com', password: 'secret1' })

        expect(supabase.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
            options: { emailRedirectTo: 'https://scanify.co.in/check-mail' },
        }))
    })

    it('throws a prefixed error on failure', async () => {
        const supabase = { auth: { signUp: vi.fn().mockResolvedValue({ data: null, error: { message: 'email taken' } }) } }
        await expect(signUp(supabase as any, { email: 'a@b.com', password: 'x' })).rejects.toThrow('Sign Up error: email taken')
    })
})

describe('signOut / resetPassword / resendEmailVerification / updatePassword / oauthSignIn', () => {
    it('signOut throws a prefixed error on failure, resolves silently on success', async () => {
        const ok = { auth: { signOut: vi.fn().mockResolvedValue({ error: null }) } }
        await expect(signOut(ok as any)).resolves.toBeUndefined()

        const fail = { auth: { signOut: vi.fn().mockResolvedValue({ error: { message: 'network' } }) } }
        await expect(signOut(fail as any)).rejects.toThrow('Sign Out error: network')
    })

    it('resetPassword builds redirectTo from window origin + env var', async () => {
        vi.stubEnv('NEXT_PUBLIC_PASSWORD_RESET_EMAIL_REDIRECT_TO', 'reset')
        const supabase = { auth: { resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }) } }
        await resetPassword(supabase as any, 'a@b.com')
        expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('a@b.com', {
            redirectTo: 'https://scanify.co.in/reset',
        })
    })

    it('resendEmailVerification sends type "signup" with the given email', async () => {
        const supabase = { auth: { resend: vi.fn().mockResolvedValue({ error: null }) } }
        await resendEmailVerification(supabase as any, 'a@b.com')
        expect(supabase.auth.resend).toHaveBeenCalledWith(expect.objectContaining({ type: 'signup', email: 'a@b.com' }))
    })

    it('updatePassword throws a prefixed error on failure', async () => {
        const supabase = { auth: { updateUser: vi.fn().mockResolvedValue({ error: { message: 'weak password' } }) } }
        await expect(updatePassword(supabase as any, '123')).rejects.toThrow('Update Password error: weak password')
    })

    it('oauthSignIn requests the google provider', async () => {
        const supabase = { auth: { signInWithOAuth: vi.fn().mockResolvedValue({ error: null }) } }
        await oauthSignIn(supabase as any)
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(expect.objectContaining({ provider: 'google' }))
    })
})

describe('createUserProfile / updateUserProfile', () => {
    it('createUserProfile inserts and returns the single row', async () => {
        const builder = createChainableResult({ data: { id: 'u1' }, error: null })
        const supabase = { from: vi.fn(() => builder) }
        const result = await createUserProfile(supabase as any, { id: 'u1' } as any)
        expect(builder.insert).toHaveBeenCalledWith({ id: 'u1' })
        expect(result).toEqual({ id: 'u1' })
    })

    it('updateUserProfile throws if payload.id is missing — before ever calling supabase', async () => {
        const supabase = { from: vi.fn() }
        await expect(updateUserProfile(supabase as any, { name: 'x' } as any))
            .rejects.toThrow('updateUserProfile: payload.id is required')
        expect(supabase.from).not.toHaveBeenCalled()
    })

    it('updateUserProfile updates by id and returns the row on success', async () => {
        const builder = createChainableResult({ data: { id: 'u1', name: 'New' }, error: null })
        const supabase = { from: vi.fn(() => builder) }
        const result = await updateUserProfile(supabase as any, { id: 'u1', name: 'New' } as any)
        expect(builder.eq).toHaveBeenCalledWith('id', 'u1')
        expect(result).toEqual({ id: 'u1', name: 'New' })
    })
})