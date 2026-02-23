// TC6: New Plan — Hook mode, no hook called
// Navigate to 2 pages, do interactions, never call hook
// ClearData runs silently, no scans triggered
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'new' })

test.describe('New Plan: No hook called', () => {
  test('Navigate without hook', async ({ page }) => {
    try {
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      await page.goto('https://www.duckduckgo.com', { waitUntil: 'domcontentloaded' })

      const searchBox = page.locator('input[name="q"]')
      if (await searchBox.count()) {
        await searchBox.click()
        await searchBox.fill('test')
      }
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
