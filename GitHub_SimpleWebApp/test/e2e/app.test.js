/**
 * End-to-End tests
 * Tests the full application stack from API to database
 */

const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

// Import test setup
const testDb = require('../test-db');
const { config } = require('../test-config');
const { createTestServer } = require('../test-server');

describe('E2E Tests', function() {
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
  
  describe('Basic CRUD operations', function() {
    it('should perform a full CRUD lifecycle for a recipe', async function() {
      // 1. Create a new recipe
      const newRecipe = {
        title: 'E2E Test Recipe',
        category: 'Testing',
        instructions: 'Instructions for E2E test'
      };
      
      const createResponse = await request(app)
        .post('/api/recipes')
        .send(newRecipe)
        .expect('Content-Type', /json/)
        .expect(201);
        
      expect(createResponse.body).to.have.property('id');
      const recipeId = createResponse.body.id;
      
      // 2. Retrieve the created recipe
      const getResponse = await request(app)
        .get(`/api/recipes/${recipeId}`)
        .expect('Content-Type', /json/)
        .expect(200);
        
      expect(getResponse.body.title).to.equal(newRecipe.title);
      
      // 3. Update the recipe
      const updatedRecipe = {
        title: 'Updated E2E Recipe',
        category: 'Testing',
        instructions: 'Updated instructions for E2E test'
      };
      
      await request(app)
        .put(`/api/recipes/${recipeId}`)
        .send(updatedRecipe)
        .expect('Content-Type', /json/)
        .expect(200);
        
      // 4. Verify the update
      const getUpdatedResponse = await request(app)
        .get(`/api/recipes/${recipeId}`)
        .expect('Content-Type', /json/)
        .expect(200);
        
      expect(getUpdatedResponse.body.title).to.equal(updatedRecipe.title);
      
      // 5. Delete the recipe
      await request(app)
        .delete(`/api/recipes/${recipeId}`)
        .expect('Content-Type', /json/)
        .expect(200);
        
      // 6. Verify deletion
      await request(app)
        .get(`/api/recipes/${recipeId}`)
        .expect(404);
    });

    it('should perform a full CRUD lifecycle for a habit', async function() {
      // 1. Create a new habit
      const newHabit = {
        title: 'E2E Test Habit'
      };
      
      const createResponse = await request(app)
        .post('/api/habits')
        .send(newHabit)
        .expect('Content-Type', /json/)
        .expect(201);
        
      expect(createResponse.body).to.have.property('id');
      const habitId = createResponse.body.id;
      
      // 2. Verify it appears in the list
      const listResponse = await request(app)
        .get('/api/habits')
        .expect('Content-Type', /json/)
        .expect(200);
        
      const createdHabit = listResponse.body.find(h => h.id === habitId);
      expect(createdHabit).to.not.be.undefined;
      expect(createdHabit.title).to.equal(newHabit.title);
      
      // 3. Toggle habit completion
      const today = new Date().toISOString().split('T')[0];
      
      const toggleResponse = await request(app)
        .post(`/api/habits/${habitId}/toggle`)
        .send({ date: today })
        .expect('Content-Type', /json/)
        .expect(200);
        
      expect(toggleResponse.body.completed).to.be.true;
      
      // 4. Get habits again to verify completion
      const listAfterToggleResponse = await request(app)
        .get('/api/habits')
        .expect('Content-Type', /json/)
        .expect(200);
        
      const updatedHabit = listAfterToggleResponse.body.find(h => h.id === habitId);
      expect(updatedHabit.completed_today).to.equal(1);
      
      // 5. Delete the habit
      await request(app)
        .delete(`/api/habits/${habitId}`)
        .expect('Content-Type', /json/)
        .expect(200);
        
      // 6. Verify it's gone from the list
      const listAfterDeleteResponse = await request(app)
        .get('/api/habits')
        .expect('Content-Type', /json/)
        .expect(200);
        
      const deletedHabit = listAfterDeleteResponse.body.find(h => h.id === habitId);
      expect(deletedHabit).to.be.undefined;
    });
    
    it('should perform a full CRUD lifecycle for a blog post', async function() {
      // 1. Create a new blog post
      const newPost = {
        title: 'E2E Test Blog Post',
        body: 'This is a test blog post created during E2E testing.'
      };
      
      const createResponse = await request(app)
        .post('/api/blog')
        .send(newPost)
        .expect('Content-Type', /json/)
        .expect(201);
        
      expect(createResponse.body).to.have.property('id');
      const postId = createResponse.body.id;
      
      // 2. Retrieve the created post
      const getResponse = await request(app)
        .get(`/api/blog/${postId}`)
        .expect('Content-Type', /json/)
        .expect(200);
        
      expect(getResponse.body.title).to.equal(newPost.title);
      expect(getResponse.body.body).to.equal(newPost.body);
      
      // 3. Update the post
      const updatedPost = {
        title: 'Updated E2E Blog Post',
        body: 'This blog post has been updated during E2E testing.'
      };
      
      await request(app)
        .put(`/api/blog/${postId}`)
        .send(updatedPost)
        .expect('Content-Type', /json/)
        .expect(200);
        
      // 4. Verify the update
      const getUpdatedResponse = await request(app)
        .get(`/api/blog/${postId}`)
        .expect('Content-Type', /json/)
        .expect(200);
        
      expect(getUpdatedResponse.body.title).to.equal(updatedPost.title);
      expect(getUpdatedResponse.body.body).to.equal(updatedPost.body);
      
      // 5. Delete the post
      await request(app)
        .delete(`/api/blog/${postId}`)
        .expect('Content-Type', /json/)
        .expect(200);
        
      // 6. Verify deletion
      await request(app)
        .get(`/api/blog/${postId}`)
        .expect(404);
    });
  });
  
  describe('Cross-entity interactions', function() {
    it('should add a habit and mark it complete', async function() {
      // 1. Create a new habit
      const habitResponse = await request(app)
        .post('/api/habits')
        .send({ title: 'Test Habit' })
        .expect(201);
      
      const habitId = habitResponse.body.id;
      
      // 2. Toggle the habit completion for today
      const today = new Date().toISOString().split('T')[0];
      
      await request(app)
        .post(`/api/habits/${habitId}/toggle`)
        .send({ date: today })
        .expect(200);
      
      // 3. Get all habits and verify completion
      const getResponse = await request(app)
        .get('/api/habits')
        .expect(200);
      
      const habit = getResponse.body.find(h => h.id === habitId);
      expect(habit).to.exist;
      expect(habit.completed_today).to.equal(1);
    });
  });
});
