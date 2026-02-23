// TC13: New Plan Hook — All capability flags enabled
// captureScreenshot, passedTestCases, iframe, needsReview, bestPractice all true
const { createTest } = require('../lambdatest-setup')
const test = createTest({
  planType: 'new',
  captureScreenshot: true,
  passedTestCases: true,
  iframe: true,
  needsReview: true,
  bestPractice: true,
})

test.describe('New Plan Hook: All caps enabled', () => {
  test('Hook scan with all flags', async ({ page }) => {
    try {
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      const result = await page.evaluate('lambda-accessibility-scan')
      console.log('Hook result:', result)

      await page.goto('https://www.wikipedia.org', { waitUntil: 'domcontentloaded' })
      const result2 = await page.evaluate('lambda-accessibility-scan')
      console.log('Hook result page 2:', result2)
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
