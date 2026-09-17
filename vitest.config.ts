import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        // Playwright specs live in e2e/ and are driven by playwright.config.ts.
        // Without this, vitest collects them and they fail on import.
        exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'e2e/**'],
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            exclude: ['**/*.config.*', '**/types/**'],
        },
    },
})