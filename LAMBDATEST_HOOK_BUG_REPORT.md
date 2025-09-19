# LambdaTest Hook Unmarshalling Bug Report

## Issue Description
LambdaTest is experiencing wrong unmarshalling of hooks which eventually sends wrong messages to the Playwright server. This is causing test failures and incorrect test status reporting.

## Problematic Code Patterns

### Pattern 1: Variable Scope Issue (Most Common)
```javascript
// ❌ PROBLEMATIC - Variable not accessible in browser context
const _status = {
    action: 'setTestStatus',
    arguments: {
        status: 'passed',
        remark: 'Test status'
    }
};

await page.evaluate(() => { 
    console.log(`lambdatest_action: ${JSON.stringify(_status)}`);
});
```

**Error**: `ReferenceError: _status is not defined`

### Pattern 2: Incorrect page.evaluate Usage
```javascript
// ❌ PROBLEMATIC - Using empty function with string parameter
const statusAction = {
    action: 'setTestStatus',
    arguments: {
        status: 'passed',
        remark: 'Test status'
    }
};

await page.evaluate(() => {}, `lambdatest_action: ${JSON.stringify(statusAction)}`);
```

**Issue**: This pattern doesn't properly serialize the data and can cause unmarshalling issues.

## Correct Pattern

### ✅ CORRECT - Proper Function Parameter Passing
```javascript
const statusAction = {
    action: 'setTestStatus',
    arguments: {
        status: 'passed',
        remark: 'Test status'
    }
};

await page.evaluate(status => {
    console.log(`lambdatest_action: ${JSON.stringify(status)}`);
}, statusAction);
```

## Files Affected

### Original Problematic Code (Fixed)
- `pwrahultest.js` - Lines 47, 53, 59, 82, 147
- All LambdaTest annotation methods were using Pattern 2

### Bug Reproduction
- `pwrahultest-bug-reproduction.mjs` - Demonstrates both problematic patterns

## Root Cause
1. **Variable Scope**: Variables defined in Node.js context are not accessible in browser context
2. **Serialization Issues**: Using `page.evaluate(() => {}, string)` doesn't properly handle complex objects
3. **Hook Format**: LambdaTest expects properly formatted hooks through browser console

## Impact
- Test status not properly reported to LambdaTest dashboard
- Incorrect test results and annotations
- Failed test executions due to unmarshalling errors

## Fix Applied
All LambdaTest annotation methods in `pwrahultest.js` have been updated to use the correct pattern with proper function parameter passing.

## Testing
Run the bug reproduction file to see the exact error:
```bash
node pwrahultest-bug-reproduction.mjs
```

Run the fixed version:
```bash
node pwrahultest.mjs
``` 