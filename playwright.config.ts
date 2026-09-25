import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['github'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/result.json' }],
  ],
  use: {
    baseURL: 'https://front.serverest.dev',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
});
