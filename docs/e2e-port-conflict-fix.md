# E2E Port Conflict Fix

## Problem
The GitHub Actions E2E workflow was failing with this error:
```
Error: listen EADDRINUSE: address already in use :::3000
```

## Root Cause
The workflow was trying to start the Next.js application twice:
1. First in the "Start application for health check" step with `yarn start &`
2. Then again in the Cypress action with `start: yarn start`

This caused a port conflict because both attempts tried to bind to port 3000.

## Solution
**Removed the duplicate application startup** by:

1. **Eliminated manual app start**: Removed the "Start application for health check", "Health check", and "Stop application" steps
2. **Let Cypress handle app lifecycle**: The `cypress-io/github-action` with `start: yarn start` now handles starting and stopping the application
3. **Added health check to tests**: Created a custom Cypress command `cy.checkAppHealth()` that validates the application is running properly
4. **Early validation**: Modified the CI validation test to run the health check before other tests

## Changes Made

### 1. Updated Workflow (`.github/workflows/e2e-tests.yml`)
- Removed manual application start/stop steps
- Let Cypress action handle the application lifecycle
- Added `spec` parameter to run validation test first

### 2. Enhanced Cypress Commands (`cypress/support/commands.ts`)
- Added `checkAppHealth()` command for health validation
- Added proper TypeScript declarations in `cypress/support/e2e.ts`

### 3. Updated CI Validation Test (`cypress/e2e/ci-validation.cy.ts`)
- Added `before()` hook to run health check before tests
- Ensures application is healthy before running other validations

### 4. Created Testing Script (`scripts/test-e2e-setup.sh`)
- Local testing script to detect and resolve port conflicts
- Validates the complete E2E setup flow
- Helps debug issues before pushing to CI

## How It Works Now

1. **Cypress action starts the app** with `start: yarn start`
2. **Waits for app to be ready** with `wait-on: 'http://localhost:3000'`
3. **Runs health check** as first test via `cy.checkAppHealth()`
4. **Executes all tests** in the specified order
5. **Cypress automatically stops the app** when tests complete

## Benefits

- ✅ **No more port conflicts**: Single application instance
- ✅ **Better error handling**: Health check catches app startup issues early
- ✅ **Cleaner workflow**: Cypress manages the full application lifecycle
- ✅ **Local testing**: Script helps debug issues before CI
- ✅ **Proper validation**: Tests verify app health before running

## Usage

### In CI
The workflow now runs automatically without port conflicts.

### Local Testing
Run the validation script:
```bash
./scripts/test-e2e-setup.sh
```

This script will:
- Check for port conflicts
- Stop any conflicting processes
- Build and start the application
- Run health checks
- Execute the CI validation test
- Clean up properly

## Next Steps

1. **Add Cypress Record Key** to GitHub secrets (if you want dashboard recording)
2. **Monitor CI runs** to ensure stability
3. **Run the local test script** to validate the setup works on your machine
