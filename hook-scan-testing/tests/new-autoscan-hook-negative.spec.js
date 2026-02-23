// TC8: New Plan — AutoScan + hook command (negative test)
// Hook should return warning message since autoScan is active
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'new', autoScan: true })

test.describe('New Plan: AutoScan + hook negative', () => {
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
