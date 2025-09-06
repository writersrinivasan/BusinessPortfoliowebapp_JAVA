/**
 * Test server setup for integration and E2E tests
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Mock logger for testing
const logger = {
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {}
};

// Setup routes with test DB
const setupTestRoutes = (testDb) => {
  // Use proxyquire to inject the test DB
  const proxyquire = require('proxyquire').noCallThru();
  
  // Create a mock db setup module
  const mockDbSetup = {
    db: testDb.db
  };
  
  // Mock models with test DB - properly handle the db-setup format
  const Recipe = proxyquire('../server/models/recipe', {
    './db-setup': mockDbSetup
  });
  
  const Habit = proxyquire('../server/models/habit', {
    './db-setup': mockDbSetup
  });
  
  const BlogPost = proxyquire('../server/models/blog', {
    './db-setup': mockDbSetup
  });
  
  // Create Express router instances for testing with the mocked models
  const recipesRoutes = proxyquire('../server/routes/recipes', {
    '../models/recipe': Recipe
  });
  
  const habitsRoutes = proxyquire('../server/routes/habits', {
    '../models/habit': Habit
  });
  
  const blogRoutes = proxyquire('../server/routes/blog', {
    '../models/blog': BlogPost
  });
  
  return {
    recipesRoutes,
    habitsRoutes,
    blogRoutes
  };
};

// Create a test server
function createTestServer(testDb) {
  // Import error handling middleware
  const { notFound, errorHandler } = require('../server/middleware/errorHandler');
  
  const app = express();
  const { config } = require('./test-config');
  
  // Setup routes with test DB
  const routes = setupTestRoutes(testDb);
  
  // Middleware
  app.use(cors());
  app.use(bodyParser.json());
  
  // API routes
  app.use('/api/recipes', routes.recipesRoutes);
  app.use('/api/habits', routes.habitsRoutes);
  app.use('/api/blog', routes.blogRoutes);
  
  // Error handling
  app.use(notFound);
  app.use(errorHandler);
  
  return app;
}

module.exports = {
  createTestServer
};
