#!/bin/bash

# Cypress Parallel Testing Helper Script
# Usage: ./scripts/cypress-parallel.sh [chrome|firefox|all] [workers]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
BROWSER=${1:-chrome}
WORKERS=${2:-4}

echo -e "${BLUE}🚀 Starting Cypress Parallel Testing${NC}"
echo -e "${BLUE}Browser: ${BROWSER}${NC}"
echo -e "${BLUE}Workers: ${WORKERS}${NC}"

# Check if CYPRESS_RECORD_KEY is set
if [ -z "230c8d82-b4ae-4296-87b0-f84017777a82" ]; then
    echo -e "${RED}❌ CYPRESS_RECORD_KEY environment variable is not set${NC}"
    echo -e "${YELLOW}💡 Please set your Cypress Cloud record key:${NC}"
    echo -e "${YELLOW}   export CYPRESS_RECORD_KEY=your-key-here${NC}"
    exit 1
fi

# Check if project is built
if [ ! -d ".next" ] && [ ! -d "dist" ] && [ ! -d "build" ]; then
    echo -e "${YELLOW}⚠️  No build directory found. Building application...${NC}"
    yarn build
fi

# Function to run parallel tests
run_parallel_tests() {
    local browser=$1
    local group_name="E2E-${browser^}"
    
    echo -e "${GREEN}🧪 Running ${browser} tests in parallel...${NC}"
    
    # Start server in background
    echo -e "${BLUE}🌐 Starting development server...${NC}"
    yarn dev &
    SERVER_PID=$!
    
    # Wait for server to be ready
    echo -e "${BLUE}⏳ Waiting for server to be ready...${NC}"
    npx wait-on http://localhost:3000 --timeout 60000
    
    # Run tests
    cypress run \
        --record \
        --parallel \
        --browser "$browser" \
        --group "$group_name" \
        --ci-build-id "local-$(date +%s)" || {
        echo -e "${RED}❌ Tests failed${NC}"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    }
    
    # Stop server
    kill $SERVER_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Tests completed successfully${NC}"
}

# Function to run tests for all browsers
run_all_browsers() {
    echo -e "${GREEN}🌐 Running tests for all browsers...${NC}"
    
    for browser in chrome firefox; do
        echo -e "${BLUE}Testing with ${browser}...${NC}"
        run_parallel_tests "$browser"
        echo ""
    done
}

# Main execution
case $BROWSER in
    "all")
        run_all_browsers
        ;;
    "chrome"|"firefox"|"edge")
        run_parallel_tests "$BROWSER"
        ;;
    *)
        echo -e "${RED}❌ Unsupported browser: $BROWSER${NC}"
        echo -e "${YELLOW}💡 Supported browsers: chrome, firefox, edge, all${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 All tests completed!${NC}"
