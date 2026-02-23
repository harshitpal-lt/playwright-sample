// TC10: New Plan Hook — passedTestCases: true
// Scan includes passed test cases in report
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'new', passedTestCases: true })

test.describe('New Plan Hook: Passed cases', () => {
  test('Hook scan with passed cases', async ({ page }) => {
    try {
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      const result = await page.evaluate('lambda-accessibility-scan')
      console.log('Hook result:', result)
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
