import { chromium } from '@playwright/test';
import axios from 'axios';
import { writeFileSync } from 'fs';

// Parse command line arguments
const getArgValue = (argName) => {
    const arg = process.argv.find(arg => arg.startsWith(`--${argName}=`));
    return arg ? arg.split('=')[1] : null;
};

// Get environment and credentials from command line or environment variables
const env = getArgValue('env') || 'prod';
const username = getArgValue('username') || process.env.LAMBDATEST_USERNAME;
const accessKey = getArgValue('accessKey') || process.env.LAMBDATEST_ACCESS_KEY;

// Configuration based on environment
const getApiConfig = (environment) => {
    const baseConfigs = {
        prod: {
            hub: 'wss://cdp.lambdatest.com/playwright?capabilities',
            api: 'https://api.lambdatest.com'
        },
        stage: {
            hub: 'wss://stage-cdp.lambdatestinternal.com/playwright?capabilities',
            api: 'https://stage-api.lambdatestinternal.com'
        }
    };

    return baseConfigs[environment] || baseConfigs.prod;
};

const apiConfig = getApiConfig(env);
console.log(`Using ${env} environment with API: ${apiConfig.api}`);
console.log(`Using credentials for user: ${username}`);

// Basic Auth token for API calls
const authToken = Buffer.from(`${username}:${accessKey}`).toString('base64');

// API client for LambdaTest REST API
const apiClient = axios.create({
    baseURL: apiConfig.api,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authToken}`
    }
});

// URLs to test - same as in the original script
const urlsToVisit = [
    // 'https://the-internet.herokuapp.com/',
    // 'https://the-internet.herokuapp.com/abtest',
    // 'https://the-internet.herokuapp.com/add_remove_elements/',
    // 'https://the-internet.herokuapp.com/broken_images',
    // 'https://the-internet.herokuapp.com/challenging_dom',
    // 'https://the-internet.herokuapp.com/checkboxes',
    // 'https://the-internet.herokuapp.com/context_menu',
    // // 'https://the-internet.herokuapp.com/digest_auth',
    // 'https://the-internet.herokuapp.com/disappearing_elements',
    // 'https://the-internet.herokuapp.com/drag_and_drop',
    // 'https://the-internet.herokuapp.com/dropdown',
    // 'https://the-internet.herokuapp.com/dynamic_content',
    // 'https://the-internet.herokuapp.com/dynamic_controls',
    // 'https://the-internet.herokuapp.com/dynamic_loading',
    // 'https://the-internet.herokuapp.com/entry_ad',
    // 'https://the-internet.herokuapp.com/exit_intent',
    // 'https://the-internet.herokuapp.com/download',
    // 'https://the-internet.herokuapp.com/upload',
    // 'https://the-internet.herokuapp.com/floating_menu',
    // 'https://the-internet.herokuapp.com/forgot_password',
    // 'https://the-internet.herokuapp.com/login',
    // 'https://the-internet.herokuapp.com/frames',
    // 'https://the-internet.herokuapp.com/geolocation',
    // 'https://the-internet.herokuapp.com/horizontal_slider',
    // 'https://the-internet.herokuapp.com/hovers',
    // 'https://the-internet.herokuapp.com/infinite_scroll',
    // 'https://the-internet.herokuapp.com/inputs',
    // 'https://the-internet.herokuapp.com/jqueryui/menu',
    // 'https://the-internet.herokuapp.com/javascript_alerts',
    // 'https://the-internet.herokuapp.com/javascript_error',
    // 'https://the-internet.herokuapp.com/key_presses',
    // 'https://the-internet.herokuapp.com/large',
    // 'https://the-internet.herokuapp.com/windows',
    // 'https://the-internet.herokuapp.com/nested_frames',
    // 'https://the-internet.herokuapp.com/notification_message_rendered',
    // 'https://the-internet.herokuapp.com/redirector',
    // 'https://the-internet.herokuapp.com/download_secure',
    // 'https://the-internet.herokuapp.com/shadowdom',
    // 'https://the-internet.herokuapp.com/shifting_content',
    // 'https://the-internet.herokuapp.com/slow',
    // 'https://the-internet.herokuapp.com/tables',
    // 'https://the-internet.herokuapp.com/status_codes',
    // 'https://the-internet.herokuapp.com/typos',
    // 'https://the-internet.herokuapp.com/tinymce'
    'https://www.makemytrip.com/'
];

// Hook to get test information directly from LambdaTest
export const getCurrentTestInfo = async (page) => {
    let response = JSON.parse(
        await page.evaluate((_) => { }, `lambdatest_action: ${JSON.stringify({ action: 'getTestDetails' })}`)
    );
    return { test_id: response.data.test_id, build_id: response.data.build_id };
};

// Retry function for handling transient failures
async function retry(fn, args, maxRetries = 3, delay = 2000) {
    try {
        return await fn(...args);
    } catch (error) {
        if (maxRetries <= 0) {
            throw error;
        }

        console.log(`Retrying in ${delay}ms... (${maxRetries} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, args, maxRetries - 1, delay * 1.5);
    }
}

// Function to get accessibility report
async function getAccessibilityReport(testId, maxAttempts = 30, pollInterval = 10000) {
    console.log(`Fetching accessibility report for test: ${testId}`);

    let attempts = 0;

    while (attempts < maxAttempts) {
        attempts++;
        console.log(`Attempt ${attempts}/${maxAttempts} to fetch accessibility report...`);

        try {
            const response = await apiClient.get(`/accessibility/api/v1/test-issue/${testId}`);

            if (response.data && response.data.test_info && response.data.test_info.status === 'completed') {
                console.log('Accessibility report fetched successfully');

                const reportFilename = `accessibility-report-${testId}.json`;
                writeFileSync(reportFilename, JSON.stringify(response.data, null, 2));
                console.log(`Report saved to ${reportFilename}`);

                return response.data;
            } else {
                console.log('Accessibility report not ready yet, waiting...');
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('Report not ready yet (404), waiting for next poll...');
            } else {
                console.error('Error fetching accessibility report:', error.response?.data || error.message);
            }
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Failed to fetch accessibility report after ${maxAttempts} attempts`);
}

// Function to validate visited URLs
async function validateVisitedUrls(report, visitedUrls) {
    const reportedUrls = report.scan_json.map(scan => scan.url);

    const missingUrls = visitedUrls.filter(url => !reportedUrls.includes(url));

    if (missingUrls.length > 0) {
        console.log('The following URLs were visited but not found in the accessibility report:');
        missingUrls.forEach(url => console.log(`- ${url}`));
        return false;
    } else {
        console.log('All visited URLs are included in the accessibility report.');
        return true;
    }
}

// Main test function
async function runTest() {
    let browser = null;
    let testId = null;
    const visitedUrls = [];

    try {
        console.log('Connecting to LambdaTest...');

        // LambdaTest connection capabilities
        const capabilities = {
            'browserName': 'Chrome',
            'browserVersion': 'latest',
            'LT:Options': {
                'platform': 'macos Sonoma',
                'build': 'Playwright Accessibility Build',
                'name': 'Playwright Accessibility Test',
                'user': username,
                'accessKey': accessKey,
                'network': true,
                'video': true,
                'console': true,
                'tunnel': false,
                'accessibility': true,
            }
        };

        // Connect to LambdaTest
        browser = await chromium.connect({
            wsEndpoint: `${apiConfig.hub}=${encodeURIComponent(JSON.stringify(capabilities))}`
        });

        // Create a new page
        const context = await browser.newContext();
        const page = await context.newPage();

        // Get the test ID directly using the LambdaTest hook (after visiting at least one page)
        await page.goto("chrome://extensions/?id=johgkfjmgfeapgnbkmfkfkaholjbcnah");
        const secondToggleButton = page.locator('#crToggle').nth(0);
        await secondToggleButton.click();

        await page.goto('about:blank');
        const testInfo = await getCurrentTestInfo(page);
        testId = testInfo.test_id;
        console.log(`Got test ID directly: ${testId}`);

        // Visit each URL in the list
        for (const url of urlsToVisit) {
            try {
                console.log(`Navigating to: ${url}`);
                await page.goto(url, { timeout: 60000 });

                // Wait for the page to load
                // await page.waitForLoadState();

                // Take screenshot
                // await page.screenshot({ path: `screenshot-${url.replace(/[^a-zA-Z0-9]/g, '-')}.png` });

                // Record that we successfully visited this URL
                visitedUrls.push(url);

                // Short delay between pages to ensure accessibility scanning
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (error) {
                console.error(`Error navigating to ${url}:`, error);
                // Continue with the next URL even if this one failed
            }
        }

    await browser.close();
    console.log('Test completed successfully!');

        // Wait for LambdaTest to process the test
        console.log('Waiting 10 seconds before fetching accessibility report...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Get accessibility report using the test ID we obtained earlier
        const accessibilityReport = await getAccessibilityReport(testId);

        // Validate that all visited URLs are in the report
        const validationResult = await validateVisitedUrls(accessibilityReport, visitedUrls);

        if (validationResult) {
            console.log('Test validation completed successfully!');
        } else {
            console.log('Test validation failed: Some URLs are missing from the accessibility report.');
        }

        return { success: true, report: accessibilityReport };
    } catch (error) {
        console.error('Test failed:', error);
        return { success: false, error: error.message };
    } finally {
        // Close the browser
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
runTest().then(result => {
    if (result.success) {
        console.log('Test execution completed successfully!');
    } else {
        console.error('Test execution failed:', result.error);
        process.exit(1);
    }
}).catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});