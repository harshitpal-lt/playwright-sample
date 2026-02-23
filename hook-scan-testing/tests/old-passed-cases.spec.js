// TC15: Old Plan — passedTestCases: true
// Auto-scan with passed test cases in report
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'old', passedTestCases: true })

test.describe('Old Plan: Passed cases', () => {
  test('Navigate 2 pages with passed cases', async ({ page }) => {
    try {
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      await page.goto('https://www.duckduckgo.com', { waitUntil: 'domcontentloaded' })
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
