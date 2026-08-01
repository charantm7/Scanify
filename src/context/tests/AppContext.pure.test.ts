import { describe, it, expect } from 'vitest'
import { isUnlimited, displayLimit } from '../AppContext'

describe('isUnlimited', () => {
    it('treats -1 as unlimited', () => expect(isUnlimited(-1)).toBe(true))
    it('treats 0 as limited, not unlimited', () => expect(isUnlimited(0)).toBe(false))
    it('treats any positive number as limited', () => expect(isUnlimited(50)).toBe(false))
})

describe('displayLimit', () => {
    it('renders -1 as ∞', () => expect(displayLimit(-1)).toBe('∞'))
    it('renders a finite limit as the number itself', () => expect(displayLimit(25)).toBe(25))
    it('renders 0 as 0, not ∞ — a real hard limit, not "no limit set"', () => {
        expect(displayLimit(0)).toBe(0)
    })
})