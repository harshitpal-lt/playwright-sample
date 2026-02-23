// TC14: Old Plan — captureScreenshotEnabled: true (explicit)
// Auto-scan runs with screenshots captured
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'old', captureScreenshot: true })

test.describe('Old Plan: With screenshot', () => {
  test('Navigate 2 pages with screenshot', async ({ page }) => {
    try {
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      await page.goto('https://www.duckduckgo.com', { waitUntil: 'domcontentloaded' })
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
