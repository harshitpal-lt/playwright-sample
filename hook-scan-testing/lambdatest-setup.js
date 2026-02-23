/**
 * LambdaTest Playwright setup with configurable accessibility capabilities.
 *
 * Usage:
 *   const { createTest } = require('../lambdatest-setup')
 *   const test = createTest({ planType: 'old' })                             // old plan, auto-scan
 *   const test = createTest({ planType: 'new', autoScan: true })             // new plan, auto-scan override
 *   const test = createTest({ captureScreenshot: false, iframe: true })      // new plan hook + cap overrides
 */

const NEW_PLAN_USERNAME = process.env.LT_NEW_PLAN_USERNAME || "";
const NEW_PLAN_KEY = process.env.LT_NEW_PLAN_KEY || "";

const OLD_PLAN_USERNAME = process.env.LT_OLD_PLAN_USERNAME || "";
const OLD_PLAN_KEY = process.env.LT_OLD_PLAN_KEY || "";

const base = require('@playwright/test')
const path = require('path')
const { chromium, _android } = require('playwright')
const cp = require('child_process');
const playwrightClientVersion = cp.execSync('npx playwright --version').toString().trim().split(' ')[1];

const CDP_HUB_URL = 'wss://cdp-a11ywebhook-dev.lambdatestinternal.com/playwright'

/**
 * Build a fresh capabilities object with the given options.
 */
function buildCapabilities(options = {}) {
  const {
    planType = 'new',
    autoScan,
    captureScreenshot = true,
    passedTestCases,
    iframe,
    needsReview = true,
    bestPractice = true,
  } = options

  const isOldPlan = planType === 'old'

  const caps = {
    'browserName': 'Chrome',
    'browserVersion': '140',
    'LT:Options': {
      'platform': 'MacOS Sequoia',
      'build': 'Test New Plan Hook',
      'name': 'PW Hook Scan Test',
      'user': isOldPlan ? OLD_PLAN_USERNAME : NEW_PLAN_USERNAME,
      'accessKey': isOldPlan ? OLD_PLAN_KEY : NEW_PLAN_KEY,
      'network': true,
      'video': true,
      'console': true,
      'commandLog': true,
      'terminal': true,
      'DisableXFHeaders': true,
      'accessibility': true,
      'accessibility.needsReview': needsReview,
      'accessibility.bestPractice': bestPractice,
      'accessibility.wcagVersion': 'wcag21a',
      'accessibility.captureScreenshot': captureScreenshot,
      'tunnel': false,
      'playwrightClientVersion': playwrightClientVersion,
    }
  }

  if (autoScan === true) {
    caps['LT:Options']['accessibility.autoScan'] = true
  }
  if (passedTestCases === true) {
    caps['LT:Options']['accessibility.passedTestCases'] = true
  }
  if (iframe === true) {
    caps['LT:Options']['accessibility.iframe'] = true
  }

  return caps
}

/**
 * Patch capabilities with browser/version/platform from project name.
 */
function modifyCapabilities(caps, configName, testName) {
  let config = configName.split('@lambdatest')[0]

  if (configName.match(/android/)) {
    let [deviceName, platformVersion, platform] = config.split(':')
    caps['LT:Options']['deviceName'] = deviceName
    caps['LT:Options']['platformVersion'] = platformVersion
    caps['LT:Options']['platformName'] = platform
    caps['LT:Options']['name'] = testName
    caps['LT:Options']['build'] = 'Playwright JS Android Build'
    caps['LT:Options']['isRealMobile'] = true
    delete caps.browserName
    delete caps.browserVersion
  } else {
    let [browserName, browserVersion, platform] = config.split(':')
    caps.browserName = browserName ? browserName : caps.browserName
    caps.browserVersion = browserVersion ? browserVersion : caps.browserVersion
    caps['LT:Options']['platform'] = platform ? platform : caps['LT:Options']['platform']
    caps['LT:Options']['name'] = testName
  }
}

/**
 * Create a Playwright test fixture with custom LambdaTest capabilities.
 */
function createTest(options = {}) {
  return base.test.extend({
    page: async ({ page, playwright }, use, testInfo) => {
      let fileName = testInfo.file.split(path.sep).pop()
      if (testInfo.project.name.match(/lambdatest/)) {
        const caps = buildCapabilities(options)
        modifyCapabilities(caps, testInfo.project.name, `${testInfo.title} - ${fileName}`)

        let device, context, browser, ltPage;

        if (testInfo.project.name.match(/android/)) {
          device = await _android.connect(`wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(caps))}`);
          await device.shell("am force-stop com.android.chrome");
          context = await device.launchBrowser();
          ltPage = await context.newPage(testInfo.project.use);
        } else {
          browser = await chromium.connect(`${CDP_HUB_URL}?capabilities=${encodeURIComponent(JSON.stringify(caps))}`)
          ltPage = await browser.newPage(testInfo.project.use)

          // Enable accessibility extension for LambdaTest
          await ltPage.goto("chrome://extensions/?id=johgkfjmgfeapgnbkmfkfkaholjbcnah");
          const secondToggleButton = ltPage.locator('#crToggle').nth(0);
          await secondToggleButton.click();
        }

        await use(ltPage)

        const testStatus = {
          action: 'setTestStatus',
          arguments: {
            status: testInfo.status,
            remark: testInfo.error?.stack || testInfo.error?.message,
          }
        }
        await ltPage.evaluate(() => {},
          `lambdatest_action: ${JSON.stringify(testStatus)}`)

        await ltPage.close()
        await context?.close();
        await browser?.close()
        await device?.close();
      } else {
        await use(page)
      }
    },
  })
}

exports.createTest = createTest
// Default: new plan, hook mode
exports.test = createTest()
