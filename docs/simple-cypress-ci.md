# Simple Cypress CI Workflow

## Approach: Back to Basics

After encountering issues with parallel testing and artifact management, we've reverted to a simple, traditional Cypress CI workflow that prioritizes reliability over complexity.

## Current Configuration

### Single Job Workflow
```yaml
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 22.14.0
      - Install dependencies with yarn
      - Run Cypress tests with build and start
      - Upload screenshots on failure
      - Upload videos always
```

### Key Features
- ✅ **Single job execution** - No parallel complexity
- ✅ **Cypress Dashboard recording** - Uses your record key for better reporting
- ✅ **Chrome browser testing** - Standard and reliable
- ✅ **Build + Start pattern** - `yarn build` then `yarn start`
- ✅ **Artifact collection** - Screenshots and videos for debugging
- ✅ **Environment variables** - Supabase configuration included

## Setup Requirements

### GitHub Secrets Needed
Make sure these are set in your repository settings → Secrets and variables → Actions:

1. **CYPRESS_RECORD_KEY** = `230c8d82-b4ae-4296-87b0-f84017777a82`
2. **NEXT_PUBLIC_SUPABASE_URL** = Your Supabase URL
3. **NEXT_PUBLIC_SUPABASE_ANON_KEY** = Your Supabase anon key

### Cypress Dashboard
With the record key configured, you'll get:
- Test execution videos and screenshots
- Test performance analytics
- Flaky test detection
- Historical test data
- Better debugging capabilities

## Benefits of This Approach

### Reliability First
- ✅ **Simple execution path** - Fewer moving parts
- ✅ **Proven pattern** - Standard Cypress CI approach
- ✅ **Easy debugging** - Clear, linear workflow
- ✅ **Stable foundation** - Can build upon once working

### Future Improvements
Once this basic workflow is stable, we can consider:
- Adding parallel execution back
- Multiple browser testing
- Accessibility-specific tests
- Mobile viewport testing

## Next Steps

1. **Verify secrets are set** in GitHub repository settings
2. **Monitor the workflow** in GitHub Actions tab
3. **Check Cypress Dashboard** for detailed test results
4. **Iterate and improve** once basic tests are passing consistently

## File Location
- `.github/workflows/e2e-tests.yml`

This approach focuses on getting Cypress tests running reliably in CI before adding complexity. Once stable, we can incrementally add more advanced features.
