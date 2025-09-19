import { chromium } from 'playwright';

// Test to reproduce the ORIGINAL problematic LambdaTest setStatus hook
export async function runTest() {
    const capabilities = {
        'browserName': 'chrome',
        'browserVersion': 'latest',
        'LT:Options': {
            'platform': 'Windows 11',
            'build': 'Playwright Test - Problematic Status',
            'name': 'LambdaTest setStatus Hook Bug Reproduction',
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
        await page.goto("https://lambdatest.github.io/sample-todo-app/");
        
        // ❌ PROBLEMATIC PATTERN 1: Variable scope issue
        const status = {
            action: 'setTestStatus',
            arguments: {
                status: 'passed',
                remark: 'Test with problematic hook pattern'
            }
        };
        console.log("About to execute problematic pattern 1...");
        await page.evaluate(status => {
            `lambdatest_action: ${JSON.stringify(status)}`
        }, status);
        

        await page?.close();
        await context?.close();
    } catch (error) {
        console.error("Expected error occurred:", error.message);
        
    } finally {
        await browser.close();
    }
}

// Run the test directly if executed
if (import.meta.url === `file://${process.argv[1]}`) {
    runTest().catch(console.error);
} 