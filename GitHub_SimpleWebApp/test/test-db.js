/**
 * Test database setup
 * This module creates an isolated test database for testing
 */

const sqlite3 = require('sqlite3').verbose();
const { config } = require('./test-config');

// Create a database connection for tests
const db = new sqlite3.Database(config.dbPath, (err) => {
  if (err) {
    console.error('Error connecting to test database:', err.message);
  } else {
    if (process.env.NODE_ENV === 'test') {
      console.log('Connected to the test SQLite database.');
    }
  }
});

// Helper function to run SQL queries with proper error handling
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper for database queries that return data
function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Helper for database queries that return multiple rows
function getAllQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Function to set up test database
async function setupTestDatabase() {
  try {
    // Create Recipes table
    await runQuery(`CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      instructions TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create Habits table
    await runQuery(`CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create Habit Completions table
    await runQuery(`CREATE TABLE IF NOT EXISTS habit_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      completed_date DATE NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
      UNIQUE(habit_id, completed_date)
    )`);

    // Create Blog Posts table
    await runQuery(`CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    return true;
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

// Function to tear down the test database
async function teardownTestDatabase() {
  try {
    // Drop all tables
    await runQuery('DROP TABLE IF EXISTS habit_completions');
    await runQuery('DROP TABLE IF EXISTS habits');
    await runQuery('DROP TABLE IF EXISTS recipes');
    await runQuery('DROP TABLE IF EXISTS blog_posts');
    
    return true;
  } catch (error) {
    console.error('Error tearing down test database:', error);
    throw error;
  }
}

// Function to reset the database (for test isolation)
async function resetTestDatabase() {
  try {
    await teardownTestDatabase();
    await setupTestDatabase();
    return true;
  } catch (error) {
    console.error('Error resetting test database:', error);
    throw error;
  }
}

// Function to seed test data
async function seedTestData(data = {}) {
  try {
    // Insert recipes if provided
    if (data.recipes && data.recipes.length > 0) {
      for (const recipe of data.recipes) {
        await runQuery(
          'INSERT INTO recipes (id, title, category, instructions, created_at) VALUES (?, ?, ?, ?, ?)',
          [recipe.id, recipe.title, recipe.category, recipe.instructions, recipe.created_at]
        );
      }
    }

    // Insert habits if provided
    if (data.habits && data.habits.length > 0) {
      for (const habit of data.habits) {
        await runQuery(
          'INSERT INTO habits (id, title, created_at) VALUES (?, ?, ?)',
          [habit.id, habit.title, habit.created_at]
        );
      }
    }

    // Insert habit completions if provided
    if (data.habitCompletions && data.habitCompletions.length > 0) {
      for (const completion of data.habitCompletions) {
        await runQuery(
          'INSERT INTO habit_completions (habit_id, completed_date) VALUES (?, ?)',
          [completion.habit_id, completion.completed_date]
        );
      }
    }

    // Insert blog posts if provided
    if (data.blogPosts && data.blogPosts.length > 0) {
      for (const post of data.blogPosts) {
        await runQuery(
          'INSERT INTO blog_posts (id, title, body, created_at) VALUES (?, ?, ?, ?)',
          [post.id, post.title, post.body, post.created_at]
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
}

module.exports = {
  db,
  setupTestDatabase,
  teardownTestDatabase,
  resetTestDatabase,
  seedTestData,
  runQuery,
  getQuery,
  getAllQuery
};
