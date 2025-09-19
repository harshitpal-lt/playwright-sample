import { chromium } from 'playwright';

// Main test function to reproduce the LambdaTest hook unmarshalling bug
export async function runTest() {
    const capabilities = {
        'browserName': 'chrome',
        'browserVersion': 'latest',
        'LT:Options': {
            'platform': 'Windows 11',
            'build': 'Playwright Test - Bug Reproduction',
            'name': 'LambdaTest Hook Unmarshalling Bug Test',
            'user': 'saksharora',
            'accessKey': 'LT_xeKHXrS3VTgso1AAdhif9cfwLCLZpQDnxK9tyNqK65oC2eF',
            'visual': true,
            'console': true,
            'projectName': 'CDP Project',
            'resolution': '1920x1080',
            'video': true,
            'commandLog': true,
        }
    };

    const wsEndpoint = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`;
    const browser = await chromium.connect(wsEndpoint);
    const context = browser.contexts()[0] || await browser.newContext();
    const page = await context.newPage();

    try {
        const ltSampleUrl = "https://lambdatest.github.io/sample-todo-app/";
        await page.goto(ltSampleUrl);

        // PROBLEMATIC PATTERN 1: Direct console.log with lambdatest_action
        // This is the pattern mentioned in the bug report
        const _status = {
            action: 'setTestStatus',
            arguments: {
                status: 'passed',
                remark: 'Test with problematic hook pattern'
            }
        };

        // ❌ PROBLEMATIC CODE - This causes the unmarshalling issue
        // The variable _status is not accessible in the browser context
        await page.evaluate(() => { 
            console.log(`lambdatest_action: ${JSON.stringify(_status)}`);
        });

        // PROBLEMATIC PATTERN 2: Using page.evaluate with empty function and string parameter
        // This is also problematic as seen in the original code
        const statusAction = {
            action: 'setTestStatus',
            arguments: {
                status: 'passed',
                remark: 'Test with second problematic pattern'
            }
        };

        // ❌ PROBLEMATIC CODE - This also causes issues
        await page.evaluate(() => {}, `lambdatest_action: ${JSON.stringify(statusAction)}`);

        // CORRECT PATTERN: Using page.evaluate with proper function and parameter passing
        const correctStatusAction = {
            action: 'setTestStatus',
            arguments: {
                status: 'passed',
                remark: 'Test with correct pattern'
            }
        };

        // ✅ CORRECT CODE - This should work properly
        await page.evaluate(status => {
            console.log(`lambdatest_action: ${JSON.stringify(status)}`);
        }, correctStatusAction);

        console.log("Test completed - check LambdaTest dashboard for unmarshalling errors");

    } catch (error) {
        console.error("Test failed:", error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test directly if executed
if (import.meta.url === `file://${process.argv[1]}`) {
    runTest().catch(console.error);
} 