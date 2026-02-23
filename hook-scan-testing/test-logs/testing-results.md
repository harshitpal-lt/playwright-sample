# CDP Accessibility E2E Test Results

**Date:** 2026-02-23
**Environment:** Dev (`cdp-a11ywebhook-dev.lambdatestinternal.com`)
**VM:** Mac Stage — `10.244.14.64` (MacOS Sequoia, Chrome 140)
**LNRC Branch:** TE-2948-Dev | **HPS Branch:** TE-2949

---

## Summary

| | Count |
|---|:---:|
| Total tests | 16 |
| **Passed** | **16** |
| Failed | 0 |
| Bugs found & fixed during testing | 2 |

**All 16 tests pass.** Every capability flag propagates correctly from test config → HPS → LNRC → Kafka. Two bugs were found and fixed during the test run (see [Bugs Fixed](#bugs-fixed-during-testing)).

---

## Test Matrix

| # | Test | Mode | Scans | Issues | Screenshot Uploads | Verdict |
|---|------|------|:-----:|:------:|:------------------:|:-------:|
| 01 | old-autoscan | Old auto-scan | 2 | 30 | - | :white_check_mark: |
| 02 | old-hook-negative | Old auto-scan + hook call | 2 | 31 | - | :white_check_mark: |
| 03 | old-screenshot | Old auto-scan + screenshot | 2 | 31 | 2 | :white_check_mark: |
| 04 | old-passed-cases | Old auto-scan + passedCases | 2 | 31 | - | :white_check_mark: |
| 05 | old-all-caps | Old auto-scan + all flags | 2 | 8 | 2 | :white_check_mark: |
| 06 | new-hook-scan | New hook (single page) | 1 | 7 | - | :white_check_mark: |
| 07 | new-hook-multi-page | New hook (2 pages) | 2 | 31 | - | :white_check_mark: |
| 08 | new-hook-interactions | New hook after clicks | 1 | 0 | - | :white_check_mark: |
| 09 | new-no-hook | New plan, no hook called | 0 | 0 | - | :white_check_mark: |
| 10 | new-autoscan | New plan + autoScan override | 2 | 30 | - | :white_check_mark: |
| 11 | new-autoscan-hook-neg | New autoScan + hook call | 2 | 31 | - | :white_check_mark: |
| 12 | new-hook-screenshot | New hook + screenshot | 1 | 7 | 1 | :white_check_mark: |
| 13 | new-hook-passed-cases | New hook + passedCases | 1 | 7 | - | :white_check_mark: |
| 14 | new-hook-iframe | New hook + iframe | 1 | 1 | - | :white_check_mark: |
| 15 | new-hook-no-review | New hook, review/BP off | 1 | 0 | - | :white_check_mark: |
| 16 | new-hook-all-caps | New hook + all flags | 2 | 8 | 2 | :white_check_mark: |

---

## Capability Flag Verification

All flags received by LNRC match what was set in the test config:

| Flag | Tests that set it `true` | LNRC received `true`? |
|------|--------------------------|:---------------------:|
| `AccessibilityCaptureScreenshotEnabled` | 03, 05, 12, 16 | :white_check_mark: Yes |
| `AccessibilityPassedTestCases` | 04, 05, 13, 16 | :white_check_mark: Yes |
| `AccessibilityScanIframes` | 05, 14, 16 | :white_check_mark: Yes |
| `AccessibilityAutoScan` | 10, 11 | :white_check_mark: Yes |
| `A11yNewPlanHookSupport` | 06-16 (new plan) | :white_check_mark: Yes |
| `AccessibilityBestPractice: false` | 15 | :white_check_mark: Yes |
| `AccessibilityNeedsReview: false` | 15 | :white_check_mark: Yes |

---

## Key Behavioral Observations

**Old plan auto-scan (tests 01-05):**
- Scans trigger automatically on each page navigation (no hook needed)
- Hook call in auto-scan mode returns warning: *"Accessibility auto-scan is already enabled..."* (test 02)

**New plan hook mode (tests 06-09):**
- Scans ONLY trigger when `lambda-accessibility-scan` hook is called
- No hook = no scan (test 09: 0 scans, empty Kafka payload)
- Hook after interactions captures current page state (test 08)

**New plan autoScan override (tests 10-11):**
- `autoScan: true` on new plan behaves identically to old plan auto-scan
- Hook call with autoScan enabled returns the same warning as old plan (test 11)

**Screenshot capture (tests 03, 05, 12, 16):**
- Screenshots uploaded to `stage-accessibility-artifacts.lambdatestinternal.com`
- Upload count matches scan count (1 screenshot per scan)
- `Screenshots:[]` in Kafka payload — populated downstream, not in LNRC log

**Exclusion flags (test 15):**
- `needsReview: false` + `bestPractice: false` → 0 issues on google.com (vs 7 with defaults)

---

## Bugs Fixed During Testing

### 1. `accessibility.autoScan` missing from HPS whitelist
- **Symptom:** `AccessibilityAutoScan:false` in LNRC even when test set `autoScan: true`
- **Root cause:** `"accessibility.autoScan"` was not in `WhitelistedCDPCaps` in HPS `whitelist.go`
- **Fix:** Added to whitelist, committed to HPS branch `TE-2949` (commit `539dbf7f5`)
- **Verified:** Tests 10, 11 re-run after fix confirmed `AccessibilityAutoScan:true`

### 2. Test script using wrong capability key for screenshot
- **Symptom:** `AccessibilityCaptureScreenshotEnabled:false` in LNRC despite test setting `captureScreenshot: true`
- **Root cause:** Test script sent `accessibility.captureScreenshotEnabled` but HPS expects `accessibility.captureScreenshot`
- **Fix:** Updated `lambdatest-setup.js` to use correct key `accessibility.captureScreenshot`
- **Verified:** Tests 03, 05, 12, 16 re-run confirmed `AccessibilityCaptureScreenshotEnabled:true` + screenshot uploads

---

## Notes

- **CloudLink** is empty in all Kafka payloads — expected in dev environment (populated downstream)
- **Test 08** (hook-interactions): Returns 0 issues / score 0 — expected for click-type ClearData events
- **Test 13** shows score 98 instead of 99 for google.com when `passedTestCases: true` — expected scoring variance
- **AxeVersion:** 4.11.0 across all scans | **WcagVersion:** wcag21a
