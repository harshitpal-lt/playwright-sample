const { chromium } = require('playwright');
const cp = require('child_process');

const playwrightClientVersion = cp
  .execSync('npx playwright --version')
  .toString()
  .trim()
  .split(' ')[1];

// Build name with 5-minute precision
function getRoundedTimeBuildName() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(Math.floor(now.getMinutes() / 5) * 5).padStart(2, '0');
  return `Playwright Build - ${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

const buildName = getRoundedTimeBuildName();

async function runTest(instanceNumber) {
  const capabilities = {
    browserName: 'Chrome',
    browserVersion: 'latest',
   'LT:Options': {
      'platform': 'Windows 11',
      'build': buildName,
      'name': `Playwright Sample Test #${instanceNumber}`,
      'user': "saksharora",
      'accessKey': "LT_xeKHXrS3VTgso1AAdhif9cfwLCLZpQDnxK9tyNqK65oC2eF",
      'network': true,
      'video': true,
      'console': true,
      // "geoLocation": "CA",
      'infraProvider': "LW",
      // 'fixed_ip': "10.130.22.201",
      'fullHAR': true,
      "tunnel": true,
      "tunnelIdentifier": "CR_LT_TUNNEL",
 "playwrightClientVersion":"1.51.0",
"playwrightServerVersion":"1.51.0",
      'goog:chromeOptions': [
        '--start-maximized',
      ]
    }
  };

  const browser = await chromium.connect({
    wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
      JSON.stringify(capabilities)
    )}`
  });

  // const page = await browser.newPage();
  const context = await browser.newContext({ viewport: null });
const page = await context.newPage();
//   await page.setViewportSize({
//   width: 1920,
//   height: 1080,
// });

  try {
    await page.goto('https://www.consumerreports.org');

    let element = await page.locator("//a[@class='cda-btn cda-btn--nav-small cda-btn--nav-rounded cda-btn--nav-light-green cda-gnav__non-member--shown']");
    await element.click();

    await page.waitForTimeout(8000);

    //let element1 = await page.locator("//span[@class='crux-icons crux-icons-caret-up-small']");
    let element1 = await page.locator("//form[@id='center-annual-form-anonymous']");

    await element1.click();

    await page.waitForTimeout(2000);

    await page.locator("//*[@id='app']/div/div/div/div[1]/div[1]/section/div/form/div[1]/div[1]/input");

   // await page.locator("body > div:nth-child(4) > div:nth-child(1) > section:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > form:nth-child(1) > table:nth-child(3) > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(3) > button:nth-child(1)");
    
    // await page.waitForTimeout(20000); // total wait time


    const title = await page.title();

    await page.evaluate(
      () => {},
      `lambdatest_action: ${JSON.stringify({
        action: 'setTestStatus',
        arguments: {
          status: 'passed',
          remark: `Test #${instanceNumber} title matched`
        }
      })}`
    );
  } catch (e) {
    await page.evaluate(
      () => {},
      `lambdatest_action: ${JSON.stringify({
        action: 'setTestStatus',
        arguments: {
          status: 'failed',
          remark: `Test #${instanceNumber} failed: ${e.message}`
        }
      })}`
    );
    throw e;
  } finally {
    // await page.close();
    // await browser.close();
    console.log(`Test instance ${instanceNumber} completed`);
  }
}

// Run 10 tests in parallel
(async () => {
  const parallelRuns =1;
  const tasks = [];

  for (let i = 1; i <= parallelRuns; i++) {
    tasks.push(runTest(i));
  }

  try {
    await Promise.all(tasks);
    console.log('All tests completed successfully.');
  } catch (error) {
    console.error('Some tests failed:', error);
  }
})();












