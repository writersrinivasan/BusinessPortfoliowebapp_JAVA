/**
 * Integration tests for Recipe API endpoints
 */

const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

// Import test setup
const testDb = require('../test-db');
const { createTestServer } = require('../test-server');
const { fixtures } = require('../test-config');

describe('Recipe API Endpoints', function() {
  let app;
  
  before(async function() {
    // Set up test database
    await testDb.setupTestDatabase();
    
    // Create test server with our test DB
    app = createTestServer(testDb);
  });
  
  beforeEach(async function() {
    // Reset and seed database before each test
    await testDb.resetTestDatabase();
    await testDb.seedTestData({ recipes: fixtures.recipes });
  });
  
  after(async function() {
    // Clean up test database
    await testDb.teardownTestDatabase();
  });
  
  describe('GET /api/recipes', function() {
    it('should return all recipes', async function() {
      // Act
      const response = await request(app)
        .get('/api/recipes')
        .expect('Content-Type', /json/)
        .expect(200);
        
      // Assert
      expect(response.body).to.be.an('array');
      expect(response.body).to.have.lengthOf(2);
      expect(response.body[0].title).to.equal('Test Recipe 1');
    });
  });
  
  describe('GET /api/recipes/:id', function() {
    it('should return a single recipe', async function() {
      // Act
      const response = await request(app)
        .get('/api/recipes/1')
        .expect('Content-Type', /json/)
        .expect(200);
        
      // Assert
      expect(response.body).to.be.an('object');
      expect(response.body.id).to.equal(1);
      expect(response.body.title).to.equal('Test Recipe 1');
    });
    
    it('should return 404 for non-existent recipe', async function() {
      // Act
      const response = await request(app)
        .get('/api/recipes/999')
        .expect('Content-Type', /json/)
        .expect(404);
        
      // Assert
      expect(response.body).to.have.property('error', true);
    });
    
    it('should return 400 for invalid recipe ID', async function() {
      // Act
      const response = await request(app)
        .get('/api/recipes/invalid')
        .expect('Content-Type', /json/)
        .expect(400);
        
      // Assert
      expect(response.body).to.have.property('error', true);
    });
  });
  
  describe('POST /api/recipes', function() {
    it('should create a new recipe', async function() {
      // Arrange
      const newRecipe = {
        title: 'New Recipe',
        category: 'Lunch',
        instructions: 'Test instructions'
      };
      
      // Act
      const response = await request(app)
        .post('/api/recipes')
        .send(newRecipe)
        .expect('Content-Type', /json/)
        .expect(201);
        
      // Assert
      expect(response.body).to.be.an('object');
      expect(response.body.id).to.be.a('number');
      expect(response.body.title).to.equal(newRecipe.title);
      
      // Verify it was saved to the database
      const savedRecipe = await testDb.getQuery('SELECT * FROM recipes WHERE id = ?', [response.body.id]);
      expect(savedRecipe).to.not.be.undefined;
      expect(savedRecipe.title).to.equal(newRecipe.title);
    });
    
    it('should return 400 when missing required fields', async function() {
      // Act
      const response = await request(app)
        .post('/api/recipes')
        .send({ title: 'Incomplete Recipe' })
        .expect('Content-Type', /json/)
        .expect(400);
        
      // Assert
      expect(response.body).to.have.property('error', true);
      expect(response.body.message).to.include('required');
    });
  });
  
  describe('PUT /api/recipes/:id', function() {
    it('should update an existing recipe', async function() {
      // Arrange
      const updatedRecipe = {
        title: 'Updated Recipe',
        category: 'Updated Category',
        instructions: 'Updated instructions'
      };
      
      // Act
      const response = await request(app)
        .put('/api/recipes/1')
        .send(updatedRecipe)
        .expect('Content-Type', /json/)
        .expect(200);
        
      // Assert
      expect(response.body).to.be.an('object');
      expect(response.body.id).to.equal(1);
      expect(response.body.title).to.equal(updatedRecipe.title);
      
      // Verify it was updated in the database
      const updated = await testDb.getQuery('SELECT * FROM recipes WHERE id = ?', [1]);
      expect(updated.title).to.equal(updatedRecipe.title);
    });
    
    it('should return 404 when updating non-existent recipe', async function() {
      // Act
      const response = await request(app)
        .put('/api/recipes/999')
        .send({
          title: 'Won\'t Update',
          category: 'Test',
          instructions: 'Test'
        })
        .expect('Content-Type', /json/)
        .expect(404);
        
      // Assert
      expect(response.body).to.have.property('error', true);
    });
  });
  
  describe('DELETE /api/recipes/:id', function() {
    it('should delete an existing recipe', async function() {
      // Act
      const response = await request(app)
        .delete('/api/recipes/1')
        .expect('Content-Type', /json/)
        .expect(200);
        
      // Assert
      expect(response.body).to.have.property('message');
      
      // Verify it was deleted from the database
      const deleted = await testDb.getQuery('SELECT * FROM recipes WHERE id = ?', [1]);
      expect(deleted).to.be.undefined;
    });
    
    it('should return 404 when deleting non-existent recipe', async function() {
      // Act
      const response = await request(app)
        .delete('/api/recipes/999')
        .expect('Content-Type', /json/)
        .expect(404);
        
      // Assert
      expect(response.body).to.have.property('error', true);
    });
  });
});
