#!/bin/bash

# Script to test E2E setup and detect port conflicts
# This script helps identify and resolve the EADDRINUSE error

echo "🔍 Checking for port 3000 usage..."

# Check if port 3000 is in use
PORT_CHECK=$(lsof -ti:3000)

if [ ! -z "$PORT_CHECK" ]; then
    echo "⚠️  Port 3000 is currently in use by process(es): $PORT_CHECK"
    echo "📝 Process details:"
    lsof -i:3000
    echo ""
    echo "🛑 Stopping processes on port 3000..."
    
    # Kill processes using port 3000
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    # Wait a moment for processes to stop
    sleep 2
    
    # Check again
    NEW_PORT_CHECK=$(lsof -ti:3000)
    if [ ! -z "$NEW_PORT_CHECK" ]; then
        echo "❌ Failed to stop all processes on port 3000"
        echo "Please manually stop these processes before continuing:"
        lsof -i:3000
        exit 1
    else
        echo "✅ Port 3000 is now free"
    fi
else
    echo "✅ Port 3000 is available"
fi

echo ""
echo "🏗️  Building application..."
yarn build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🚀 Starting application..."
yarn start &
APP_PID=$!

# Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the application is running
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "✅ Application is running and healthy"
    echo "🩺 Health check response:"
    curl -s http://localhost:3000/api/health | jq . 2>/dev/null || curl -s http://localhost:3000/api/health
else
    echo "❌ Application health check failed"
    echo "🔍 Checking if port is in use again:"
    lsof -i:3000
fi

echo ""
echo "🧪 Running Cypress CI validation test..."
yarn cypress run --spec "cypress/e2e/ci-validation.cy.ts" --browser chrome

CYPRESS_EXIT_CODE=$?

echo ""
echo "🛑 Stopping application..."
kill $APP_PID 2>/dev/null || true

# Wait for process to stop
sleep 2

if [ $CYPRESS_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed! E2E setup is working correctly."
else
    echo "❌ Some tests failed. Check the output above for details."
fi

exit $CYPRESS_EXIT_CODE
