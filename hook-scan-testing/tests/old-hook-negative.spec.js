// TC2: Old Plan — Hook command in auto-scan mode (negative test)
// Hook should return warning message, not trigger scan
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'old' })

test.describe('Old Plan: Hook negative', () => {
  test('Hook in auto-scan mode', async ({ page }) => {
    try {
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      const result = await page.evaluate('lambda-accessibility-scan')
      console.log('Hook result (should be warning):', result)
      await page.goto('https://www.duckduckgo.com', { waitUntil: 'domcontentloaded' })
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
