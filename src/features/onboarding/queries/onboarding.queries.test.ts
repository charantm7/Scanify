// src/features/onboarding/queries/onboarding.queries.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createChainableResult } from '../../../../tests/mocks/supabase'
import { getSession, insertHotel, updateUserProfile, createSubscriptionRecord, generateUniqueSlug } from './onboarding.queries'

describe('getSession', () => {
    it('returns the session and null error on success', async () => {
        const supabase = { auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null }) } }
        const result = await getSession(supabase as any)
        expect(result.session).toEqual({ user: { id: 'u1' } })
        expect(result.error).toBeNull()
    })

    it('does not throw on error — returns it for the caller to decide', async () => {
        const supabase = { auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: { message: 'expired' } }) } }
        const result = await getSession(supabase as any)
        expect(result.error).toEqual({ message: 'expired' })
    })
})

describe('insertHotel', () => {
    it('returns the inserted row on success', async () => {
        const builder = createChainableResult({ data: { id: 'h1' }, error: null })
        const supabase = { from: vi.fn(() => builder) }
        const result = await insertHotel(supabase as any, { name: 'Spice Route' } as any)
        expect(result).toEqual({ id: 'h1' })
    })

    it('can resolve to null via maybeSingle — callers must handle this', async () => {
        const builder = createChainableResult({ data: null, error: null })
        const supabase = { from: vi.fn(() => builder) }
        const result = await insertHotel(supabase as any, { name: 'Spice Route' } as any)
        expect(result).toBeNull()
    })

    it('throws the raw error object (not wrapped) on failure', async () => {
        const builder = createChainableResult({ data: null, error: { message: 'unique violation', code: '23505' } })
        const supabase = { from: vi.fn(() => builder) }
        await expect(insertHotel(supabase as any, {} as any)).rejects.toMatchObject({ code: '23505' })
    })
})

describe('updateUserProfile / createSubscriptionRecord', () => {
    it('updateUserProfile throws the raw error on failure', async () => {
        const builder = createChainableResult({ error: { message: 'fail' } })
        const supabase = { from: vi.fn(() => builder) }
        await expect(updateUserProfile(supabase as any, 'u1', {} as any)).rejects.toMatchObject({ message: 'fail' })
    })

    it('createSubscriptionRecord inserts the payload as-is', async () => {
        const builder = createChainableResult({ error: null })
        const supabase = { from: vi.fn(() => builder) }
        const payload = { user_id: 'u1', plan: 'starter', status: 'trialing', hotel_id: 'h1', trial_ends_at: 'x', trial_used: true } as any
        await createSubscriptionRecord(supabase as any, payload)
        expect(builder.insert).toHaveBeenCalledWith(payload)
    })
})

describe('generateUniqueSlug', () => {
    it('returns the base slug untouched when nothing matches', async () => {
        const builder = createChainableResult({ data: [], error: null })
        const supabase = { from: vi.fn(() => builder) }
        const result = await generateUniqueSlug(supabase as any, 'Spice Route')
        expect(result).toBe('spice-route')
    })

    it('appends -1 when the base slug is already taken', async () => {
        const builder = createChainableResult({ data: [{ slug: 'spice-route' }], error: null })
        const supabase = { from: vi.fn(() => builder) }
        const result = await generateUniqueSlug(supabase as any, 'Spice Route')
        expect(result).toBe('spice-route-1')
    })

    it('increments past multiple existing numbered slugs', async () => {
        const builder = createChainableResult({
            data: [{ slug: 'spice-route' }, { slug: 'spice-route-1' }, { slug: 'spice-route-2' }],
            error: null,
        })
        const supabase = { from: vi.fn(() => builder) }
        const result = await generateUniqueSlug(supabase as any, 'Spice Route')
        expect(result).toBe('spice-route-3')
    })

    it('uses a wildcard when searching for existing slugs', async () => {
        const builder = createChainableResult({ data: [{ slug: 'spice-route' }], error: null })
        const supabase = { from: vi.fn(() => builder) }

        await generateUniqueSlug(supabase as any, 'Spice Route')

        // this documents the bug: the pattern passed has no `%`, so in a real
        // Postgres query this behaves as an exact match, not a prefix search —
        // meaning "spice-route-1" etc. are invisible to this query even if they exist.
        expect(builder.like).toHaveBeenCalledWith('slug', 'spice-route%')
    })

    it('throws on a query error', async () => {
        const builder = createChainableResult({ data: null, error: { message: 'timeout' } })
        const supabase = { from: vi.fn(() => builder) }
        await expect(generateUniqueSlug(supabase as any, 'Spice Route')).rejects.toMatchObject({ message: 'timeout' })
    })
})