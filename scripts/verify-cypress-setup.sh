#!/bin/bash

# Cypress Parallel Setup Verification Script
# This script checks if your environment is properly configured for parallel testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Cypress Parallel Setup Verification${NC}"
echo "==========================================="

# Check 1: Cypress installation
echo -n "Checking Cypress installation... "
if npx cypress version &>/dev/null; then
    echo -e "${GREEN}✅ Installed${NC}"
    cypress_version=$(npx cypress version --component package 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
    echo "   Version: $cypress_version"
else
    echo -e "${RED}❌ Not found${NC}"
    echo -e "${YELLOW}   Run: yarn install${NC}"
fi

# Check 2: Cypress config
echo -n "Checking Cypress configuration... "
if [ -f "cypress.config.ts" ]; then
    echo -e "${GREEN}✅ Found${NC}"
    project_id=$(grep -o 'projectId.*['\''"][^'\'']*['\''"]' cypress.config.ts | cut -d"'" -f2 | cut -d'"' -f2)
    if [ -n "$project_id" ]; then
        echo "   Project ID: $project_id"
    else
        echo -e "${YELLOW}   ⚠️  Project ID not found${NC}"
    fi
else
    echo -e "${RED}❌ cypress.config.ts not found${NC}"
fi

# Check 3: Environment variables
echo -n "Checking CYPRESS_RECORD_KEY... "
if [ -n "230c8d82-b4ae-4296-87b0-f84017777a82" ]; then
    echo -e "${GREEN}✅ Set${NC}"
    key_preview="${CYPRESS_RECORD_KEY:0:8}..."
    echo "   Key: $key_preview"
else
    echo -e "${YELLOW}⚠️  Not set${NC}"
    echo -e "${YELLOW}   Set with: export CYPRESS_RECORD_KEY=your-key${NC}"
fi

# Check 4: GitHub secrets (if in CI)
if [ -n "$GITHUB_ACTIONS" ]; then
    echo -n "Checking GitHub secrets... "
    secrets_ok=true
    
    if [ -z "230c8d82-b4ae-4296-87b0-f84017777a82" ]; then
        echo -e "${RED}❌ CYPRESS_RECORD_KEY not set${NC}"
        secrets_ok=false
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not set${NC}"
    fi
    
    if [ "$secrets_ok" = true ]; then
        echo -e "${GREEN}✅ Configured${NC}"
    fi
fi

# Check 5: Package.json scripts
echo -n "Checking package.json scripts... "
required_scripts=("cy:run" "cy:run:parallel" "test:e2e" "test:e2e:parallel")
missing_scripts=()

for script in "${required_scripts[@]}"; do
    if ! grep -q "\"$script\":" package.json; then
        missing_scripts+=("$script")
    fi
done

if [ ${#missing_scripts[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All scripts present${NC}"
else
    echo -e "${YELLOW}⚠️  Missing scripts: ${missing_scripts[*]}${NC}"
fi

# Check 6: Test files
echo -n "Checking test files... "
test_count=$(find cypress/e2e -name "*.cy.ts" -o -name "*.cy.js" | wc -l)
if [ "$test_count" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $test_count test files${NC}"
else
    echo -e "${YELLOW}⚠️  No test files found in cypress/e2e${NC}"
fi

# Check 7: Dependencies
echo -n "Checking start-server-and-test... "
if grep -q "start-server-and-test" package.json; then
    echo -e "${GREEN}✅ Installed${NC}"
else
    echo -e "${YELLOW}⚠️  Not found${NC}"
    echo -e "${YELLOW}   Install with: yarn add -D start-server-and-test${NC}"
fi

# Check 8: Workflow file
echo -n "Checking GitHub Actions workflow... "
if [ -f ".github/workflows/e2e-tests.yml" ]; then
    echo -e "${GREEN}✅ Found${NC}"
    if grep -q "parallel: true" .github/workflows/e2e-tests.yml; then
        echo "   Parallel execution: Enabled"
    else
        echo -e "${YELLOW}   ⚠️  Parallel execution not configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Workflow file not found${NC}"
fi

echo ""
echo "==========================================="

# Summary
all_good=true

if ! npx cypress version &>/dev/null; then
    all_good=false
fi

if [ ! -f "cypress.config.ts" ]; then
    all_good=false
fi

if [ -z "230c8d82-b4ae-4296-87b0-f84017777a82" ] && [ -z "$GITHUB_ACTIONS" ]; then
    echo -e "${YELLOW}💡 To enable parallel testing locally:${NC}"
    echo "   1. Get your record key from Cypress Cloud"
    echo "   2. Export it: export CYPRESS_RECORD_KEY=your-key"
    echo "   3. Run: yarn cypress:parallel"
fi

if [ "$all_good" = true ]; then
    echo -e "${GREEN}🎉 Setup verification complete! Ready for parallel testing.${NC}"
else
    echo -e "${YELLOW}⚠️  Some issues found. Please review the output above.${NC}"
fi

# Quick commands reference
echo ""
echo -e "${BLUE}📚 Quick Commands:${NC}"
echo "   Local testing:    yarn cy:open"
echo "   Run all tests:    yarn test:e2e"
echo "   Parallel (local): yarn cypress:parallel"
echo "   Chrome parallel:  yarn cypress:parallel:chrome"
echo "   All browsers:     yarn cypress:parallel:all"
