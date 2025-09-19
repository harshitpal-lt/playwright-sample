import { chromium } from 'playwright';

// Simple test to reproduce LambdaTest setStatus hook issue
export async function runTest() {
    const capabilities = {
        'browserName': 'chrome',
        'browserVersion': 'latest',
        'LT:Options': {
            'platform': 'Windows 11',
            'build': 'Playwright Test - Simple Status',
            'name': 'LambdaTest setStatus Hook Test',
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
        // Just navigate to a simple page
        await page.goto("https://lambdatest.github.io/sample-todo-app/");
        
        // Test the setStatus method only
        const setStatus = async (status) => {
            const statusAction = {
                action: 'setTestStatus',
                arguments: {
                    status,
                    remark: 'Test Status - Set by LambdaTest annotation'
                }
            };
            // ✅ CORRECT LambdaTest annotation - using proper function parameter passing
            await page.evaluate(status => {
                console.log(`lambdatest_action: ${JSON.stringify(status)}`);
            }, statusAction);
        };

        // Call setStatus to reproduce the hook
        await setStatus('passed');
        
        console.log("Test completed - check LambdaTest dashboard for setStatus hook");

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