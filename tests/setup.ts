import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// clipboard isn't implemented in jsdom — needed for your useCopyToClipboard hook
Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
})