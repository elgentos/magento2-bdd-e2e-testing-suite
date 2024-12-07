import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import fs from "node:fs";
dotenv.config({ path: path.resolve(__dirname, '.env') });

function getTestFiles(baseDir: string, customDir: string): string[] {
  const baseFiles = new Set(fs.readdirSync(baseDir).filter(file => file.endsWith('.spec.ts')));
  const customFiles = fs.readdirSync(customDir).filter(file => file.endsWith('.spec.ts'));
  const testFiles = new Set<string>();

  // Get base files that have an override in custom
  for (const file of baseFiles) {
    const baseFilePath = path.join(baseDir, file);
    const customFilePath = path.join(customDir, file);

    testFiles.add(fs.existsSync(customFilePath) ? customFilePath : baseFilePath);
  }

  // Add custom tests that aren't in base
  for (const file of customFiles) {
    if (!baseFiles.has(file)) {
      testFiles.add(path.join(customDir, file));
    }
  }

  return Array.from(testFiles);
}

const testFiles = getTestFiles(
  path.join(__dirname, 'tests', 'base'),
  path.join(__dirname, 'tests', 'custom'),
);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: process.env.BASE_URL || 'https://hyva-demo.elgentos.io/',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Ignore https errors if they apply (should only happen on local) */
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      testMatch: testFiles,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      testMatch: testFiles,
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      testMatch: testFiles,
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
