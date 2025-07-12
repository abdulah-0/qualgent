#!/bin/bash

# QGJob System Test Script
# This script tests the entire system end-to-end

set -e

echo "🧪 Testing QGJob System..."

# Check if server is running
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ Server is not running. Please start the server first:"
    echo "  cd server && npm run dev"
    exit 1
fi

echo "✅ Server is running"

# Test CLI installation
if ! command -v qgjob &> /dev/null; then
    echo "❌ qgjob CLI is not installed. Please run setup first:"
    echo "  ./scripts/setup.sh"
    exit 1
fi

echo "✅ CLI is installed"

# Submit test jobs
echo "📝 Submitting test jobs..."

# Test 1: Onboarding test
echo "  Submitting onboarding test..."
ONBOARDING_OUTPUT=$(qgjob submit \
    --org-id=test-org \
    --app-version-id=v1.0.0-test \
    --test=tests/onboarding.spec.js \
    --target=emulator \
    --priority=1)

ONBOARDING_JOB_ID=$(echo "$ONBOARDING_OUTPUT" | grep "Job ID:" | cut -d' ' -f3)
echo "  ✅ Onboarding job submitted: $ONBOARDING_JOB_ID"

# Test 2: Login test
echo "  Submitting login test..."
LOGIN_OUTPUT=$(qgjob submit \
    --org-id=test-org \
    --app-version-id=v1.0.0-test \
    --test=tests/login.spec.js \
    --target=device \
    --priority=5)

LOGIN_JOB_ID=$(echo "$LOGIN_OUTPUT" | grep "Job ID:" | cut -d' ' -f3)
echo "  ✅ Login job submitted: $LOGIN_JOB_ID"

# Test 3: Smoke test
echo "  Submitting smoke test..."
SMOKE_OUTPUT=$(qgjob submit \
    --org-id=test-org \
    --app-version-id=v1.0.0-test \
    --test=tests/smoke.spec.js \
    --target=simulator \
    --priority=10)

SMOKE_JOB_ID=$(echo "$SMOKE_OUTPUT" | grep "Job ID:" | cut -d' ' -f3)
echo "  ✅ Smoke job submitted: $SMOKE_JOB_ID"

# Wait a moment for jobs to be processed
echo "⏳ Waiting for jobs to be processed..."
sleep 5

# Check job statuses
echo "📊 Checking job statuses..."

echo "  Onboarding test status:"
qgjob status --job-id=$ONBOARDING_JOB_ID

echo ""
echo "  Login test status:"
qgjob status --job-id=$LOGIN_JOB_ID

echo ""
echo "  Smoke test status:"
qgjob status --job-id=$SMOKE_JOB_ID

echo ""
echo "🎉 System test completed!"
echo ""
echo "Job IDs for reference:"
echo "  Onboarding: $ONBOARDING_JOB_ID"
echo "  Login: $LOGIN_JOB_ID"
echo "  Smoke: $SMOKE_JOB_ID"
echo ""
