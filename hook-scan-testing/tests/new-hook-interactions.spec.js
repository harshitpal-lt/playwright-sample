// TC5: New Plan — Hook mode with interactions before scan
// Navigate, do clicks (ClearData happens), then call hook
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'new' })

test.describe('New Plan: Hook after interactions', () => {
  test('Navigate + clicks + hook', async ({ page }) => {
    try {
      await page.goto('https://www.duckduckgo.com', { waitUntil: 'domcontentloaded' })

      // Perform some interactions (ClearData should trigger on these)
      const searchBox = page.locator('input[name="q"]')
      if (await searchBox.count()) {
        await searchBox.click()
        await searchBox.fill('lambdatest accessibility')
      }

      // Now trigger scan via hook
      const result = await page.evaluate('lambda-accessibility-scan')
      console.log('Hook result after interactions:', result)
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
