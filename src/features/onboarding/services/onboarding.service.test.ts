// src/features/onboarding/services/onboarding.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchOnboardingSession, submitOnboarding, getFriendlyError } from './onboarding.service'
import * as queries from '../queries/onboarding.queries'

vi.mock('../queries/onboarding.queries')
const q = vi.mocked(queries)

beforeEach(() => vi.clearAllMocks())

describe('fetchOnboardingSession', () => {
    it('returns null (not an error) when there is simply no session', async () => {
        q.getSession.mockResolvedValue({ session: null, error: null })
        const result = await fetchOnboardingSession({} as any)
        expect(result).toBeNull()
    })

    it('throws when supabase itself errors', async () => {
        q.getSession.mockResolvedValue({ session: null, error: { message: 'network down' } as any })
        await expect(fetchOnboardingSession({} as any)).rejects.toMatchObject({ message: 'network down' })
    })

    it('returns the session when present', async () => {
        q.getSession.mockResolvedValue({ session: { user: { id: 'u1' } } as any, error: null })
        const result = await fetchOnboardingSession({} as any)
        expect(result?.user.id).toBe('u1')
    })
})

const baseForm = {
    restaurant_name: 'Spice Route', description: 'Great food', logo_url: '',
    address: '123 MG Road', city: 'Bengaluru', pincode: '560001',
    cuisine_types: ['Indian'], restaurant_types: ['Casual Dining'], service_types: ['Dine-in'],
    name: 'Priya', phone: '+919876543210', website: '', email: 'a@b.com',
} as any

describe('submitOnboarding', () => {
    it('generates a slug, inserts the hotel, marks onboarding complete, and creates a trial subscription', async () => {
        q.generateUniqueSlug.mockResolvedValue('spice-route')
        q.insertHotel.mockResolvedValue({ id: 'h1' } as any)
        q.updateUserProfile.mockResolvedValue(undefined as any)
        q.createSubscriptionRecord.mockResolvedValue(undefined as any)

        const slug = await submitOnboarding({} as any, 'u1', baseForm, 'a@b.com')

        expect(slug).toBe('spice-route')
        expect(q.updateUserProfile).toHaveBeenCalledWith({} as any, 'u1', expect.objectContaining({ onboarding_complete: true }))
        expect(q.createSubscriptionRecord).toHaveBeenCalledWith({} as any, expect.objectContaining({
            hotel_id: 'h1', status: 'trialing', plan: 'starter',
        }))
    })

    it('combines address and city into a single address field', async () => {
        q.generateUniqueSlug.mockResolvedValue('spice-route')
        q.insertHotel.mockResolvedValue({ id: 'h1' } as any)
        q.updateUserProfile.mockResolvedValue(undefined as any)
        q.createSubscriptionRecord.mockResolvedValue(undefined as any)

        await submitOnboarding({} as any, 'u1', baseForm, 'a@b.com')

        expect(q.insertHotel).toHaveBeenCalledWith({} as any, expect.objectContaining({
            address: '123 MG Road, Bengaluru',
        }))
    })

    it('sets trial_ends_at 4 days in the future', async () => {
        q.generateUniqueSlug.mockResolvedValue('spice-route')
        q.insertHotel.mockResolvedValue({ id: 'h1' } as any)
        q.updateUserProfile.mockResolvedValue(undefined as any)
        q.createSubscriptionRecord.mockResolvedValue(undefined as any)

        const before = Date.now()
        await submitOnboarding({} as any, 'u1', baseForm, 'a@b.com')
        const call = q.createSubscriptionRecord.mock.calls[0][1]
        const daysAhead = (new Date(call.trial_ends_at).getTime() - before) / 86_400_000

        expect(daysAhead).toBeGreaterThan(3.9)
        expect(daysAhead).toBeLessThan(4.1)
    })

    it('BUG: throws "Cannot read properties of null" when insertHotel resolves to null', async () => {
        q.generateUniqueSlug.mockResolvedValue('spice-route')
        q.insertHotel.mockResolvedValue(null) // e.g. RLS blocked the select-back
        q.updateUserProfile.mockResolvedValue(undefined as any)

        // this documents the crash — submitOnboarding has no null check on hotelData
        await expect(submitOnboarding({} as any, 'u1', baseForm, 'a@b.com')).rejects.toThrow(TypeError)
    })
})

describe('getFriendlyError', () => {
    it('returns a generic message for a falsy error', () => {
        expect(getFriendlyError(null)).toBe('Something went wrong.')
    })

    it('maps known unique-constraint violations to friendly messages', () => {
        expect(getFriendlyError({ code: '23505', constraint: 'hotels_owner_id_key' })).toMatch(/already exists/i)
        expect(getFriendlyError({ code: '23505', constraint: 'users_phone_key' })).toMatch(/phone number/i)
        expect(getFriendlyError({ code: '23505', constraint: 'subscriptions_user_id_key' })).toMatch(/subscription/i)
        expect(getFriendlyError({ code: '23505', constraint: 'some_other_key' })).toMatch(/already exists/i)
    })

    it('maps 42501 to a permissions message', () => {
        expect(getFriendlyError({ code: '42501' })).toMatch(/permission/i)
    })

    it('falls back to err.message for anything else', () => {
        expect(getFriendlyError({ message: 'custom failure' })).toBe('custom failure')
    })

    it('BUG: returns undefined when called with a plain string, as useOnboarding\'s run() actually does', () => {
        // this reproduces the real call site: `getFriendlyError(err.message + err.name)`
        const result = getFriendlyError('Duplicate keyError')
        expect(result).toBeUndefined()
    })
})

