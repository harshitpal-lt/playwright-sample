// TC9: New Plan Hook — captureScreenshotEnabled: true (explicit)
// Scan runs with screenshot captured
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'new', captureScreenshot: true })

test.describe('New Plan Hook: With screenshot', () => {
  test('Hook scan with screenshot', async ({ page }) => {
    try {
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      const result = await page.evaluate('lambda-accessibility-scan')
      console.log('Hook result:', result)
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
