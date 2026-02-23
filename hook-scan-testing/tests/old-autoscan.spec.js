// TC1: Old Plan — Auto-scan mode
// Navigate to 2 pages, auto-scan triggers on each page navigation
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'old' })

test.describe('Old Plan: Auto-scan', () => {
  test('Navigate 2 pages', async ({ page }) => {
    try {
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      await page.goto('https://www.duckduckgo.com', { waitUntil: 'domcontentloaded' })
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
