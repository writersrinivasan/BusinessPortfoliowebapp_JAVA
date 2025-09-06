/**
 * Unit tests for Recipe model
 */

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const { ApiError } = require('../../../server/middleware/errorHandler');

// Import test configuration
const { fixtures } = require('../../test-config');
const testDb = require('../../test-db');

describe('Recipe Model', function() {
  // Load the model with our test database
  let Recipe;
  
  before(async function() {
    // Set up test database
    await testDb.setupTestDatabase();
    
    // Mock the db-setup import in recipe.js
    const mockDbSetup = {
      getAllQuery: testDb.getAllQuery,
      getQuery: testDb.getQuery,
      runQuery: testDb.runQuery
    };
    
    // Use proxyquire to inject our test db into the model
    const proxyquire = require('proxyquire').noCallThru();
    Recipe = proxyquire('../../../server/models/recipe', {
      './db-setup': mockDbSetup,
      '../middleware/errorHandler': { ApiError }
    });
  });
  
  beforeEach(async function() {
    // Reset database before each test
    await testDb.resetTestDatabase();
    // Seed with test data
    await testDb.seedTestData({ recipes: fixtures.recipes });
  });
  
  after(async function() {
    // Tear down test database
    await testDb.teardownTestDatabase();
  });
  
  describe('getAll()', function() {
    it('should return all recipes', async function() {
      // Act
      const recipes = await Recipe.getAll();
      
      // Assert
      expect(recipes).to.be.an('array');
      expect(recipes).to.have.lengthOf(2);
      expect(recipes[0].title).to.equal('Test Recipe 1');
      expect(recipes[1].title).to.equal('Test Recipe 2');
    });
    
    it('should throw ApiError when database fails', async function() {
      // Arrange
      const originalGetAllQuery = testDb.getAllQuery;
      testDb.getAllQuery = sinon.stub().rejects(new Error('Database error'));
      
      // Act & Assert
      try {
        await Recipe.getAll();
        // If we get here, the test should fail
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ApiError);
        expect(error.statusCode).to.equal(500);
        expect(error.message).to.equal('Failed to retrieve recipes');
      } finally {
        // Restore original function
        testDb.getAllQuery = originalGetAllQuery;
      }
    });
  });
  
  describe('getById()', function() {
    it('should return a recipe by ID', async function() {
      // Act
      const recipe = await Recipe.getById(1);
      
      // Assert
      expect(recipe).to.be.an('object');
      expect(recipe.id).to.equal(1);
      expect(recipe.title).to.equal('Test Recipe 1');
    });
    
    it('should throw ApiError when recipe not found', async function() {
      // Act & Assert
      try {
        await Recipe.getById(999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ApiError);
        expect(error.statusCode).to.equal(404);
        expect(error.message).to.equal('Recipe with ID 999 not found');
      }
    });
    
    it('should throw ApiError with 400 when ID is invalid', async function() {
      // Act & Assert
      try {
        await Recipe.getById('invalid');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ApiError);
        expect(error.statusCode).to.equal(400);
        expect(error.message).to.equal('Invalid recipe ID provided');
      }
    });
  });
  
  describe('create()', function() {
    it('should create a new recipe', async function() {
      // Arrange
      const newRecipe = {
        title: 'New Test Recipe',
        category: 'Lunch',
        instructions: 'New test instructions'
      };
      
      // Act
      const result = await Recipe.create(newRecipe);
      
      // Assert
      expect(result).to.be.an('object');
      expect(result.id).to.be.a('number');
      expect(result.title).to.equal(newRecipe.title);
      expect(result.category).to.equal(newRecipe.category);
      expect(result.instructions).to.equal(newRecipe.instructions);
      
      // Verify it was actually saved to the database
      const savedRecipe = await testDb.getQuery('SELECT * FROM recipes WHERE id = ?', [result.id]);
      expect(savedRecipe).to.be.an('object');
      expect(savedRecipe.title).to.equal(newRecipe.title);
    });
    
    it('should throw ApiError when missing required fields', async function() {
      // Act & Assert
      try {
        await Recipe.create({ title: 'Incomplete Recipe' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ApiError);
        expect(error.statusCode).to.equal(400);
        expect(error.message).to.equal('Missing required recipe fields');
      }
    });
  });
  
  describe('update()', function() {
    it('should update an existing recipe', async function() {
      // Arrange
      const updatedData = {
        title: 'Updated Recipe',
        category: 'Updated Category',
        instructions: 'Updated instructions'
      };
      
      // Act
      const result = await Recipe.update(1, updatedData);
      
      // Assert
      expect(result).to.be.an('object');
      expect(result.id).to.equal(1);
      expect(result.title).to.equal(updatedData.title);
      
      // Verify it was actually updated in the database
      const updatedRecipe = await testDb.getQuery('SELECT * FROM recipes WHERE id = ?', [1]);
      expect(updatedRecipe.title).to.equal(updatedData.title);
    });
    
    it('should throw ApiError when recipe not found', async function() {
      // Act & Assert
      try {
        await Recipe.update(999, { title: 'Won\'t Update', category: 'Test', instructions: 'Test' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ApiError);
        expect(error.statusCode).to.equal(404);
      }
    });
  });
  
  describe('delete()', function() {
    it('should delete an existing recipe', async function() {
      // Act
      const result = await Recipe.delete(1);
      
      // Assert
      expect(result).to.be.an('object');
      expect(result.deleted).to.be.true;
      expect(result.id).to.equal(1);
      
      // Verify it was actually deleted from the database
      const deletedRecipe = await testDb.getQuery('SELECT * FROM recipes WHERE id = ?', [1]);
      expect(deletedRecipe).to.be.undefined;
    });
    
    it('should throw ApiError when recipe not found', async function() {
      // Act & Assert
      try {
        await Recipe.delete(999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ApiError);
        expect(error.statusCode).to.equal(404);
      }
    });
  });
});
