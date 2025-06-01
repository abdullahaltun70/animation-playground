# E2E Tests Workflow Build Fix

## Problem

The E2E tests workflow was failing during the build step with the error:
```
Error occurred prerendering page "/_not-found". Read more: https://nextjs.org/docs/messages/prerender-error
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

## Root Cause

The issue was in the **`install` job** of the E2E tests workflow (`.github/workflows/e2e-tests.yml`). This job runs `yarn build` to create the application build that gets shared with all the parallel test jobs, but it was missing the required Supabase environment variables.

### Comparison with CI-CD Workflow

The **ci-cd workflow** (`.github/workflows/ci-cd.yml`) works correctly because its build step includes the environment variables:

```yaml
- name: Build Next.js Application
  run: yarn build
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
    DATABASE_URL: ${{ secrets.DATABASE_URL_FOR_CI }}
    CI: true
```

## Solution

Added the missing environment variables to the `install` job in the E2E tests workflow:

```yaml
- name: Install dependencies
  uses: cypress-io/github-action@v6
  with:
    runTests: false
    build: yarn build
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
    DATABASE_URL: ${{ secrets.DATABASE_URL_FOR_CI }}
    CI: true
```

## Why This Fixes the Issue

1. **Next.js Build Requirements**: During the build process, Next.js pre-renders pages that might use Supabase
2. **Static Generation**: The `/_not-found` page and other pages require Supabase configuration to be available at build time
3. **Environment Variables**: The Supabase client initialization needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to be available during the build
4. **Shared Build**: The `install` job creates the build artifact that all test jobs use, so the environment variables must be available during this build step

## Verification

The parallel test jobs already had the correct environment variables:
- ✅ `cypress-chrome` job
- ✅ `cypress-firefox` job  
- ✅ `cypress-edge` job
- ✅ `cypress-accessibility` job
- ✅ `cypress-mobile` job

The issue was only in the `install` job that creates the shared build.

## Next Steps

1. **Test the fix**: Push the changes and verify the E2E workflow passes
2. **Monitor**: Check that all parallel jobs can successfully use the built artifacts
3. **Consistency**: Ensure both workflows (ci-cd and e2e-tests) use the same environment variables for builds

## Required GitHub Secrets

Make sure these secrets are configured in your repository:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL_FOR_CI`
- `CYPRESS_RECORD_KEY`
