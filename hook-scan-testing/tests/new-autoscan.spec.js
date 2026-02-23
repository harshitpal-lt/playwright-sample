// TC7: New Plan — AutoScan override
// Navigate to 2 pages, auto-scan triggers on each (same as old plan)
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'new', autoScan: true })

test.describe('New Plan: AutoScan override', () => {
  test('Navigate 2 pages', async ({ page }) => {
    try {
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      await page.goto('https://www.duckduckgo.com', { waitUntil: 'domcontentloaded' })
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
