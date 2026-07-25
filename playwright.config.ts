import { defineConfig } from '@playwright/test'

/**
 * Product smoke tests. CI runs them only when PLAYWRIGHT=1 is set
 * (unit tests via Vitest are the hard-fail gate). Locally:
 *   PLAYWRIGHT=1 npx playwright test
 */
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000',
    trace: 'off',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
})
