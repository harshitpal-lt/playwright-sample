// TC12: New Plan Hook — needsReview: false, bestPractice: false
// Scan excludes needs-review and best-practice rules
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'new', needsReview: false, bestPractice: false })

test.describe('New Plan Hook: No review/bestPractice', () => {
  test('Hook scan without review rules', async ({ page }) => {
    try {
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      const result = await page.evaluate('lambda-accessibility-scan')
      console.log('Hook result:', result)
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
