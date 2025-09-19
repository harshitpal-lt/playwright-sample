import { chromium } from 'playwright';

export async function runTest() {
    const capabilities = {
        'browserName': 'chrome',
        'browserVersion': 'latest',
        'LT:Options': {
            'platform': 'Windows 11',
            'build': 'Playwright Test - Explanation',
            'name': 'Understanding the Problem',
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
        
        console.log("=== STEP 1: Creating variable in Node.js room ===");
        const myVariable = "Hello from Node.js!";
        console.log("In Node.js room, myVariable =", myVariable);
        
        console.log("\n=== STEP 2: Trying to use it in Browser room ===");
        console.log("Sending code to browser room...");
        
        try {
            await page.evaluate(() => {
                console.log("In browser room, trying to read myVariable...");
                console.log("myVariable =", myVariable); // ❌ THIS WILL FAIL
            });
        } catch (error) {
            console.log("❌ ERROR:", error.message);
            console.log("The browser room doesn't know about myVariable!");
        }
        
        console.log("\n=== STEP 3: The correct way ===");
        console.log("Sending myVariable as a parameter to browser room...");
        
        await page.evaluate((variable) => {
            console.log("In browser room, received variable as parameter:");
            console.log("variable =", variable); // ✅ THIS WORKS
        }, myVariable);
        
        console.log("\n=== STEP 4: Now with LambdaTest hook ===");
        const lambdaTestStatus = {
            action: 'setTestStatus',
            arguments: {
                status: 'passed',
                remark: 'Understanding the problem'
            }
        };
        
        console.log("Sending LambdaTest status to browser room...");
        await page.evaluate((status) => {
            console.log("In browser room, logging LambdaTest action:");
            console.log(`lambdatest_action: ${JSON.stringify(status)}`);
        }, lambdaTestStatus);
        
        console.log("\n✅ SUCCESS! LambdaTest hook sent correctly!");

    } catch (error) {
        console.error("Test failed:", error);
        throw error;
    } finally {
        await browser.close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runTest().catch(console.error);
} 