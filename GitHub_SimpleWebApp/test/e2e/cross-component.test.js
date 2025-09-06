/**
 * E2E test for cross-component interactions
 */

const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

// Import test setup
const testDb = require('../test-db');
const { config } = require('../test-config');
const { createTestServer } = require('../test-server');

describe('Cross-Component Integration Tests', function() {
  let app;
  let server;
  
  before(async function() {
    // Set up test database
    await testDb.setupTestDatabase();
    
    // Create and start test server
    app = createTestServer(testDb);
    server = app.listen(config.port);
  });
  
  beforeEach(async function() {
    // Reset database before each test
    await testDb.resetTestDatabase();
  });
  
  after(async function() {
    // Close server and clean up
    if (server) {
      server.close();
    }
    await testDb.teardownTestDatabase();
  });
  
  describe('Cross-entity workflow', function() {
    it('should support a workflow involving recipes, habits and blog posts', async function() {
      // 1. Create a cooking habit
      const cookingHabit = {
        title: 'Cook a healthy meal'
      };
      
      const habitResponse = await request(app)
        .post('/api/habits')
        .send(cookingHabit)
        .expect(201);
      
      const habitId = habitResponse.body.id;
      
      // 2. Create a recipe
      const healthyRecipe = {
        title: 'Healthy Salad',
        category: 'Lunch',
        instructions: 'Mix fresh vegetables with olive oil and lemon juice.'
      };
      
      const recipeResponse = await request(app)
        .post('/api/recipes')
        .send(healthyRecipe)
        .expect(201);
      
      const recipeId = recipeResponse.body.id;
      
      // 3. Mark the cooking habit as completed today
      const today = new Date().toISOString().split('T')[0];
      
      await request(app)
        .post(`/api/habits/${habitId}/toggle`)
        .send({ date: today })
        .expect(200);
      
      // 4. Create a blog post about the experience
      const blogPost = {
        title: 'My Healthy Cooking Journey',
        body: `Today I made a ${healthyRecipe.title} following my new habit of ${cookingHabit.title}. I've been tracking this habit and the recipe turned out great!`
      };
      
      const blogResponse = await request(app)
        .post('/api/blog')
        .send(blogPost)
        .expect(201);
      
      const blogId = blogResponse.body.id;
      
      // 5. Verify all entities were created properly and are related
      // Check habit is completed
      const habitsResponse = await request(app)
        .get('/api/habits')
        .expect(200);
      
      const habit = habitsResponse.body.find(h => h.id === habitId);
      expect(habit).to.not.be.undefined;
      expect(habit.completed_today).to.equal(1);
      
      // Check recipe exists
      const recipeDetailResponse = await request(app)
        .get(`/api/recipes/${recipeId}`)
        .expect(200);
      
      expect(recipeDetailResponse.body.title).to.equal(healthyRecipe.title);
      
      // Check blog post contains references to both
      const blogDetailResponse = await request(app)
        .get(`/api/blog/${blogId}`)
        .expect(200);
      
      expect(blogDetailResponse.body.body).to.include(healthyRecipe.title);
      expect(blogDetailResponse.body.body).to.include(cookingHabit.title);
      
      // 6. Clean up - delete all entities
      await request(app)
        .delete(`/api/recipes/${recipeId}`)
        .expect(200);
      
      await request(app)
        .delete(`/api/habits/${habitId}`)
        .expect(200);
      
      await request(app)
        .delete(`/api/blog/${blogId}`)
        .expect(200);
      
      // 7. Verify all are gone
      await request(app)
        .get(`/api/recipes/${recipeId}`)
        .expect(404);
      
      const habitsAfterDelete = await request(app)
        .get('/api/habits')
        .expect(200);
      
      const deletedHabit = habitsAfterDelete.body.find(h => h.id === habitId);
      expect(deletedHabit).to.be.undefined;
      
      await request(app)
        .get(`/api/blog/${blogId}`)
        .expect(404);
    });
  });
  
  describe('Error handling across components', function() {
    it('should handle invalid requests consistently across all endpoints', async function() {
      // Test invalid recipe creation
      const invalidRecipeResponse = await request(app)
        .post('/api/recipes')
        .send({ title: 'Missing Fields' })
        .expect(400);
      
      expect(invalidRecipeResponse.body).to.have.property('error');
      
      // Test invalid habit creation
      const invalidHabitResponse = await request(app)
        .post('/api/habits')
        .send({})
        .expect(400);
      
      expect(invalidHabitResponse.body).to.have.property('error');
      
      // Test invalid blog post creation
      const invalidBlogResponse = await request(app)
        .post('/api/blog')
        .send({ title: 'Missing Body' })
        .expect(400);
      
      expect(invalidBlogResponse.body).to.have.property('error');
      
      // Test non-existent resources
      await request(app)
        .get('/api/recipes/999')
        .expect(404);
      
      await request(app)
        .delete('/api/habits/999')
        .expect(404);
      
      await request(app)
        .get('/api/blog/999')
        .expect(404);
      
      // Test invalid method or route
      await request(app)
        .patch('/api/recipes/1') // Method not supported
        .send({ title: 'Test' })
        .expect(404);
    });
  });
});
