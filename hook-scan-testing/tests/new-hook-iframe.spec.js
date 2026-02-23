// TC11: New Plan Hook — iframe: true
// Navigate to page with iframe, scan includes iframe content
const { createTest } = require('../lambdatest-setup')
const test = createTest({ planType: 'new', iframe: true })

test.describe('New Plan Hook: Iframe scan', () => {
  test('Hook scan with iframe', async ({ page }) => {
    try {
      // Wikipedia has iframes in some pages
      await page.goto('https://www.wikipedia.org', { waitUntil: 'domcontentloaded' })
      const result = await page.evaluate('lambda-accessibility-scan')
      console.log('Hook result:', result)
    } catch (e) {
      console.error('Test error:', e.message)
    }
  })
})
