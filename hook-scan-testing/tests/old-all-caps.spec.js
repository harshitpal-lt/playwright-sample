// TC16: Old Plan — All capability flags enabled
// captureScreenshot, passedTestCases, iframe, needsReview, bestPractice all true
const { createTest } = require('../lambdatest-setup')
const test = createTest({
  planType: 'old',
  captureScreenshot: true,
  passedTestCases: true,
  iframe: true,
  needsReview: true,
  bestPractice: true,
})

test.describe('Old Plan: All caps enabled', () => {
  test('Navigate 2 pages with all flags', async ({ page }) => {
    try {
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      await page.goto('https://www.wikipedia.org', { waitUntil: 'domcontentloaded' })
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
