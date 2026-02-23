// TC4: New Plan — Hook mode, multi-page scan
// Navigate to 2 pages, call hook after each
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'new' })

test.describe('New Plan: Hook multi-page', () => {
  test('2 pages + hook each', async ({ page }) => {
    try {
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      const result1 = await page.evaluate('lambda-accessibility-scan')
      console.log('Hook result page 1:', result1)

      await page.goto('https://www.duckduckgo.com', { waitUntil: 'domcontentloaded' })
      const result2 = await page.evaluate('lambda-accessibility-scan')
      console.log('Hook result page 2:', result2)
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
