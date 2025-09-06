/**
 * Test configuration and helpers
 */

const path = require('path');
const fs = require('fs');

// Test-specific configurations
const config = {
  // Use in-memory SQLite for tests
  dbPath: ':memory:',
  // Optional: test-specific file-based database (uncomment if needed)
  // dbPath: path.join(__dirname, '../test_database.sqlite'),
  port: 3001, // Use a different port for tests
  apiUrl: 'http://localhost:3001/api',
};

// Helper to clean up test database if using file-based DB
const cleanTestDb = () => {
  const dbPath = path.join(__dirname, '../test_database.sqlite');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
};

// Common test fixtures
const fixtures = {
  recipes: [
    {
      id: 1,
      title: 'Test Recipe 1',
      category: 'Breakfast',
      instructions: 'Test instructions 1',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Test Recipe 2',
      category: 'Dinner',
      instructions: 'Test instructions 2',
      created_at: new Date().toISOString()
    }
  ],
  habits: [
    {
      id: 1,
      title: 'Test Habit 1',
      created_at: new Date().toISOString(),
      current_streak: 3,
      completed_today: 1
    },
    {
      id: 2,
      title: 'Test Habit 2',
      created_at: new Date().toISOString(),
      current_streak: 0,
      completed_today: 0
    }
  ],
  blogPosts: [
    {
      id: 1,
      title: 'Test Blog Post 1',
      body: 'Test blog post content 1',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Test Blog Post 2',
      body: 'Test blog post content 2',
      created_at: new Date().toISOString()
    }
  ]
};

module.exports = {
  config,
  cleanTestDb,
  fixtures
};
