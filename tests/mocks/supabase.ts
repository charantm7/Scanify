import { vi } from 'vitest'

/**
 * Chainable query builder mock. Every method returns `this` so any
 * chain length works — call `.mockResolvedValueOnce(...)` on the
 * terminal method (select/maybeSingle/single) per-test.
 */
function createQueryBuilder() {
    const builder: any = {}
    const chainMethods = [
        'select', 'insert', 'update', 'upsert', 'delete',
        'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is', 'in', 'not',
        'like', 'ilike', 'contains', 'filter', 'match', 'or',
        'order', 'limit', 'range',
    ]
    const terminalMethods = ['maybeSingle', 'single', 'then']

    chainMethods.forEach((m) => { builder[m] = vi.fn(() => builder) })
    terminalMethods.forEach((m) => { builder[m] = vi.fn().mockResolvedValue({ data: null, error: null }) })

    return builder
}

export function createMockSupabaseClient() {
    const queryBuilder = createQueryBuilder()

    return {
        from: vi.fn(() => queryBuilder),
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } },
            })),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
        },
        _queryBuilder: queryBuilder, // exposed so tests can assert/override
    }
}

export function createChainableResult(result: { data?: any; error?: any; count?: number | null }) {
    const builder: any = {
        maybeSingle: vi.fn(() => Promise.resolve(result)),
        single: vi.fn(() => Promise.resolve(result)),
        then: (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject),
    }

    // Every filter/modifier returns the builder so chains of any length and
    // order resolve to the same canned result. Keep this list in step with the
    // PostgREST methods the app actually calls — a missing one throws
    // "is not a function" deep inside a Promise.all and surfaces as a
    // confusing empty-state assertion failure rather than a clear error.
    const chainMethods = [
        'select', 'insert', 'update', 'upsert', 'delete',
        'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is', 'in', 'not',
        'like', 'ilike', 'contains', 'filter', 'match', 'or',
        'order', 'limit', 'range',
    ]
    chainMethods.forEach((m) => { builder[m] = vi.fn(() => builder) })

    return builder
}

export function createMockToast() {
    return { success: vi.fn(), error: vi.fn(), warning: vi.fn() }
}

// Routes supabase.from(table) to a canned result per table name — safer than
// positional mockReturnValueOnce chains when a component fires several
// Promise.all'd queries whose call order you don't want to hard-code.
export function createTableRoutedClient(
    tableResults: Record<string, { data?: any; error?: any; count?: number | null }>,
    opts?: { session?: any }
) {
    const from = vi.fn((table: string) => {
        const result = tableResults[table] ?? { data: null, error: null, count: null }
        return createChainableResult(result)
    })

    return {
        from,
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: opts?.session ?? null }, error: null }),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
    }
}

export function mockMatchMedia(matches: boolean) {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
        matches,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    })))
}


export function createMockRouter() {
    return { push: vi.fn(), replace: vi.fn(), back: vi.fn() }
}