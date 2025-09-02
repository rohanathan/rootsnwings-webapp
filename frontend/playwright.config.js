// Basic Playwright config for testing Cloud Run deployment
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  
  // Test against Cloud Run production
  use: {
    baseURL: 'https://frontend-944856745086.europe-west2.run.app',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  // Run tests Chrome 
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Output settings
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  outputDir: 'test-results/',
});