// TC3: New Plan — Hook mode, single scan
// Navigate to page, call hook to trigger scan
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'new' })

test.describe('New Plan: Hook scan', () => {
  test('Single page + hook', async ({ page }) => {
    try {
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      const result = await page.evaluate('lambda-accessibility-scan')
      console.log('Hook result:', result)
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
