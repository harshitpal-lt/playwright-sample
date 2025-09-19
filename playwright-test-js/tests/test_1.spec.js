const { test } = require('../lambdatest-setup')
const { expect } = require('@playwright/test')

test.describe('Browse Usercentrics', () => {
  test('Usercentrics Geo IN', async ({ page }) => {
    await page.goto('https://www.usercentrics.com')
  })
})
