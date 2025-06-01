# Server Startup Delays for E2E Tests

## Added Delays - Summary

I've added several layers of delays to ensure your application is fully ready before tests start:

### 1. **Pre-warm Step** (Workflow Level)
**Location**: `.github/workflows/e2e-tests.yml`
```yaml
- name: Pre-warm Next.js build
  run: |
    echo "Pre-warming Next.js application..."
    timeout 30s yarn start &
    SERVER_PID=$!
    sleep 15
    kill $SERVER_PID 2>/dev/null || true
    echo "Pre-warm complete"
```

**What it does**: Starts the app, lets it initialize for 15 seconds, then stops it. This "pre-warms" the Next.js build and ensures faster subsequent startup.

### 2. **Health Check Delay** (Cypress Command)
**Location**: `cypress/support/commands.ts`
```typescript
Cypress.Commands.add('checkAppHealth', () => {
  cy.log('Checking application health...');
  
  // Add a small delay to ensure the server has fully started
  cy.wait(2000);
  
  // Check if the health endpoint is responding
  cy.request({...});
});
```

**What it does**: Waits 2 seconds before checking health endpoint to ensure server is fully ready.

### 3. **CI-Specific Delays** (Test Level)
**Location**: `cypress/e2e/ci-validation.cy.ts`
```typescript
before(() => {
  cy.checkAppHealth();
  
  // Extra delay in CI to ensure everything is fully ready
  if (Cypress.env('CI')) {
    cy.wait(3000);
  }
});
```

**What it does**: Adds an extra 3-second delay specifically in CI environments after health check passes.

### 4. **Enhanced Page Load Wait** (Cypress Command)
**Location**: `cypress/support/commands.ts`
```typescript
Cypress.Commands.add('waitForPageLoad', () => {
  cy.document().should('have.property', 'readyState', 'complete');

  // Wait longer in CI environments
  const waitTime = Cypress.env('CI') ? 3000 : 1000;
  cy.wait(waitTime);

  cy.get('body').should('be.visible');
  cy.window().its('React', { timeout: 10000 }).should('exist');
});
```

**What it does**: 
- Waits for document ready state
- Applies longer delays in CI (3s vs 1s locally)
- Ensures React has hydrated properly

### 5. **Cypress Built-in Wait** (Workflow Level)
```yaml
with:
  start: yarn start
  wait-on: 'http://localhost:3000'
  wait-on-timeout: 180
```

**What it does**: Cypress waits up to 180 seconds for the server to respond before starting tests.

## Total Delay Breakdown

### In CI Environment:
1. **Pre-warm**: 15 seconds
2. **Cypress wait-on**: Until server responds (typically 10-30s)
3. **Health check delay**: 2 seconds
4. **CI-specific delay**: 3 seconds
5. **Page load delays**: 3 seconds per page visit

### Locally:
- Much faster since `CI` environment variable is not set
- Pre-warm step still runs (helps with consistency)
- Shorter wait times in `waitForPageLoad` command

## Is This Necessary?

**Yes, these delays help with**:
- ✅ **Next.js cold start issues** - Pre-warming helps
- ✅ **Database connection establishment** - Health check validates
- ✅ **React hydration** - Page load command waits for React
- ✅ **CI environment slower performance** - Longer waits in CI
- ✅ **Race conditions** - Multiple layers prevent timing issues

## Customization

You can adjust delays by modifying:

**For shorter delays**: Reduce wait times in the commands
**For longer delays**: Increase the `cy.wait()` values
**To disable pre-warm**: Remove the "Pre-warm Next.js build" step

## Testing Locally

Run this to test the timing locally:
```bash
./scripts/test-e2e-setup.sh
```

This will show you how the delays work in practice and help optimize them if needed.
