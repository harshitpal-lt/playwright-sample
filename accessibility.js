// playwright-lambdatest-accessibility.js
import { chromium } from '@playwright/test';
const {expect} = require("expect");
const cp = require('child_process');
const playwrightClientVersion = cp.execSync('npx playwright --version').toString().trim().split(' ')[1];

// Get credentials from environment variables
const username = process.env.LT_USERNAME || 'rahulmishra';
const accessKey = process.env.LT_ACCESS_KEY || 'gX28gNf5qCQwLSHn3d425FdJIlnnPVmM9tcBk0fb3UCbti2hq0';

async function runAccessibilityTest() {
  let browser;
  try {
    // LambdaTest capabilities with accessibility enabled
    const capabilities = {
      'browserName': 'Chrome',
      'browserVersion': 'latest',
      'LT:Options': {
        'platform': 'MacOS Monterey',
        'build': 'Playwright Accessibility Test',
        'name': 'Basic Accessibility Test',
        'user': username,
        'accessKey': accessKey,
        'accessibility': true, // This enables accessibility testing
        'console': true,
        'network': true,
        'video': true,
        // 'playwrightClientVersion':'1.53.2',
        'playwrightClientVersion':playwrightClientVersion,


      }
    };

    // Connect to LambdaTest
    browser = await chromium.connect({
      wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Enable accessibility in Chrome (for LambdaTest extension)
    await page.goto("chrome://extensions/?id=johgkfjmgfeapgnbkmfkfkaholjbcnah");
    const secondToggleButton = page.locator('#crToggle').nth(0);
    await secondToggleButton.click();
    // await page.goto('about:blank');

    // Navigate to your test URL
    await page.goto('https://www.lambdatest.com', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });

    console.log('Accessibility test triggered successfully!');
    console.log('Check your LambdaTest dashboard for results.');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (browser) await browser.close();
  }
}

runAccessibilityTest();