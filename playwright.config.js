// End-to-end tests: Playwright opens a real browser and clicks through the app.
const { defineConfig, devices } = require('@playwright/test')

// E2E tests use their own database so they never touch real data
const E2E_DATABASE = 'event_planner_e2e'

module.exports = defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.js',
  workers: 1,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  // Start the server and client before the tests, and stop them afterwards.
  // reuseExistingServer is off so tests never run against your real database:
  // stop "npm run dev" first.
  webServer: [
    {
      command: 'node server/index.js',
      url: 'http://localhost:3000/api/auth/me',
      env: { PGDATABASE: E2E_DATABASE, JWT_SECRET: 'e2e-secret' },
      reuseExistingServer: false,
    },
    {
      command: 'npm --prefix client run dev -- --port 5173 --strictPort',
      url: 'http://localhost:5173',
      reuseExistingServer: false,
    },
  ],
})