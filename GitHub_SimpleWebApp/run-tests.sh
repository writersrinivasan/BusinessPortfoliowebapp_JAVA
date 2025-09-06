#!/bin/bash

# Set environment
export NODE_ENV=test

# Run unit tests
echo "=== Running Unit Tests ==="
echo "--- Models ---"
echo "Testing Recipe Model..."
npx mocha ./test/unit/models/recipe.test.js
echo "Testing Habit Model..."
npx mocha ./test/unit/models/habit.test.js
echo "Testing Blog Model..."
npx mocha ./test/unit/models/blog.test.js

echo "--- Middleware ---"
echo "Testing Error Handler..."
npx mocha ./test/unit/middleware/errorHandler.test.js

echo "--- Utils ---"
echo "Testing Logger..."
npx mocha ./test/unit/utils/logger.test.js

echo "--- Routes ---"
echo "Testing Recipe Routes..."
npx mocha ./test/unit/routes/blog.test.js
echo "Testing Habit Routes..."
npx mocha ./test/unit/routes/habits.test.js

# Run integration tests
echo "=== Running Integration Tests ==="
echo "Testing Recipes API..."
npx mocha ./test/integration/recipes.test.js
echo "Testing Habits API..."
npx mocha ./test/integration/habits.test.js
echo "Testing Blog API..."
npx mocha ./test/integration/blog.test.js

# Run E2E tests
echo "=== Running E2E Tests ==="
echo "Testing App Lifecycle..."
npx mocha ./test/e2e/app.test.js
echo "Testing Cross-Component Integration..."
npx mocha ./test/e2e/cross-component.test.js
