//@ts-check
import * as os from 'os';
const { defineConfig, devices } = require('@playwright/test');
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();
/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/',
  /* Maximum time one test can run for. */
  timeout: 3 * 60 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 20000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  // @ts-ignore
  workers: process.env.CI ? parseInt(process.env.WORKER_COUNT) : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      environmentInfo: {
        OS_Platform: os.platform(),
        OS_Release: os.release(),
        OS_Version: os.version(),
        Node_Version: process.version,
        Test_Environment: process.env.TEST_ENV,
      },
    }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    // viewport: null,
    actionTimeout: 30000,
    headless: false,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chrome:136:Windows 11@lambdatest',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        // viewport: null,
        actionTimeout: 40000,
        headless: true,
        trace: 'off',
        screenshot: 'only-on-failure',
        acceptDownloads: true,
      },
    },
    {
      name: 'pw-webkit:latest:MacOS Big sur@lambdatest',
      use: {
        viewport: { width: 1680, height: 900 },
        actionTimeout: 30000,
        headless: false,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
      },
    },
    // {
    //   name: 'chromium',
    //   use: {
    //     browserName: 'chromium',
    //     channel: 'chrome',
    //     actionTimeout: 30000,
    //     headless: false,
    //     trace: 'retain-on-failure',
    //     screenshot: 'only-on-failure',
    //     viewport: null,
    //     launchOptions: {
    //       args: ['--start-maximized'],
    //     },
    //   },
    // },
    // {
    //   name: 'firefox',
    //   use: {
    //     browserName: 'firefox',
    //     channel: 'firefox',
    //     actionTimeout: 30000,
    //     headless: false,
    //     trace: 'retain-on-failure',
    //     screenshot: 'only-on-failure',
    //     // launchOptions:{
    //     //   args:["--kiosk"]
    //     // }
    //     viewport: { width: 1536, height: 864 },
    //   },
    // },
    // {
    //   name: 'webkit',
    //   use: {
    //     browserName: 'webkit',
    //     actionTimeout: 30000,
    //     headless: false,
    //     trace: 'retain-on-failure',
    //     screenshot: 'only-on-failure',
    //     viewport: { width: 1680, height: 900 },
    //   },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'MobileSafari',
    //   use: { ...devices['iPhone 13'] },
    // },
  ],
  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',
  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
});
