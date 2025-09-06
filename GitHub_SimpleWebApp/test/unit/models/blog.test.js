/**
 * Unit tests for Blog model
 */

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const { ApiError } = require('../../../server/middleware/errorHandler');

// Import test configuration
const { fixtures } = require('../../test-config');
const testDb = require('../../test-db');

describe('BlogPost Model', function() {
  // Load the model with our test database
  let BlogPost;
  
  before(async function() {
    // Set up test database
    await testDb.setupTestDatabase();
    
    // Mock the db-setup import in blog.js
    const mockDbSetup = {
      db: testDb.db
    };
    
    // Use proxyquire to inject our test db into the model
    const proxyquire = require('proxyquire').noCallThru();
    BlogPost = proxyquire('../../../server/models/blog', {
      './db-setup': mockDbSetup,
      '../middleware/errorHandler': { ApiError }
    });
  });
  
  beforeEach(async function() {
    // Reset database before each test
    await testDb.resetTestDatabase();
    // Seed with test data
    await testDb.seedTestData({ blogPosts: fixtures.blogPosts });
  });
  
  after(async function() {
    // Tear down test database
    await testDb.teardownTestDatabase();
  });
  
  describe('getAll()', function() {
    it('should return all blog posts', async function() {
      // Act
      const posts = await BlogPost.getAll();
      
      // Assert
      expect(posts).to.be.an('array');
      expect(posts).to.have.lengthOf(2);
      expect(posts[0].title).to.equal('Test Blog Post 1');
      expect(posts[1].title).to.equal('Test Blog Post 2');
    });
    
    it('should handle database errors gracefully', async function() {
      // Arrange
      const originalAll = testDb.db.all;
      testDb.db.all = sinon.stub().callsFake((query, params, callback) => {
        callback(new Error('Database error'));
      });
      
      try {
        // Act & Assert
        await expect(BlogPost.getAll()).to.be.rejectedWith(Error);
      } finally {
        // Restore original function
        testDb.db.all = originalAll;
      }
    });
  });
  
  describe('getById()', function() {
    it('should return a blog post by ID', async function() {
      // Act
      const post = await BlogPost.getById(1);
      
      // Assert
      expect(post).to.be.an('object');
      expect(post.id).to.equal(1);
      expect(post.title).to.equal('Test Blog Post 1');
    });
    
    it('should return undefined for non-existent blog post', async function() {
      // Act
      const post = await BlogPost.getById(999);
      
      // Assert
      expect(post).to.be.undefined;
    });
    
    it('should handle database errors gracefully', async function() {
      // Arrange
      const originalGet = testDb.db.get;
      testDb.db.get = sinon.stub().callsFake((query, params, callback) => {
        callback(new Error('Database error'));
      });
      
      try {
        // Act & Assert
        await expect(BlogPost.getById(1)).to.be.rejectedWith(Error);
      } finally {
        // Restore original function
        testDb.db.get = originalGet;
      }
    });
  });
  
  describe('create()', function() {
    it('should create a new blog post', async function() {
      // Arrange
      const newPost = {
        title: 'New Test Blog Post',
        body: 'New test blog post content'
      };
      
      // Act
      const result = await BlogPost.create(newPost);
      
      // Assert
      expect(result).to.be.an('object');
      expect(result.id).to.be.a('number');
      expect(result.title).to.equal(newPost.title);
      expect(result.body).to.equal(newPost.body);
      
      // Verify it was actually saved to the database
      const savedPost = await testDb.getQuery('SELECT * FROM blog_posts WHERE id = ?', [result.id]);
      expect(savedPost).to.be.an('object');
      expect(savedPost.title).to.equal(newPost.title);
    });
    
    it('should handle database errors gracefully', async function() {
      // Arrange
      const originalRun = testDb.db.run;
      testDb.db.run = sinon.stub().callsFake((query, params, callback) => {
        callback(new Error('Database error'));
      });
      
      try {
        // Act & Assert
        await expect(BlogPost.create({ title: 'Test', body: 'Test' })).to.be.rejectedWith(Error);
      } finally {
        // Restore original function
        testDb.db.run = originalRun;
      }
    });
  });
  
  describe('update()', function() {
    it('should update an existing blog post', async function() {
      // Arrange
      const updatedData = {
        title: 'Updated Blog Post',
        body: 'Updated blog post content'
      };
      
      // Act
      const result = await BlogPost.update(1, updatedData);
      
      // Assert
      expect(result).to.be.an('object');
      expect(result.id).to.equal(1);
      expect(result.title).to.equal(updatedData.title);
      expect(result.body).to.equal(updatedData.body);
      
      // Verify it was actually updated in the database
      const updatedPost = await testDb.getQuery('SELECT * FROM blog_posts WHERE id = ?', [1]);
      expect(updatedPost.title).to.equal(updatedData.title);
    });
    
    it('should handle database errors gracefully', async function() {
      // Arrange
      const originalRun = testDb.db.run;
      testDb.db.run = sinon.stub().callsFake((query, params, callback) => {
        callback(new Error('Database error'));
      });
      
      try {
        // Act & Assert
        await expect(BlogPost.update(1, { title: 'Test', body: 'Test' })).to.be.rejectedWith(Error);
      } finally {
        // Restore original function
        testDb.db.run = originalRun;
      }
    });
  });
  
  describe('delete()', function() {
    it('should delete an existing blog post', async function() {
      // Act
      const result = await BlogPost.delete(1);
      
      // Assert
      expect(result).to.be.an('object');
      expect(result.deleted).to.be.true;
      
      // Verify it was actually deleted from the database
      const deletedPost = await testDb.getQuery('SELECT * FROM blog_posts WHERE id = ?', [1]);
      expect(deletedPost).to.be.undefined;
    });
    
    it('should handle database errors gracefully', async function() {
      // Arrange
      const originalRun = testDb.db.run;
      testDb.db.run = sinon.stub().callsFake((query, params, callback) => {
        callback(new Error('Database error'));
      });
      
      try {
        // Act & Assert
        await expect(BlogPost.delete(1)).to.be.rejectedWith(Error);
      } finally {
        // Restore original function
        testDb.db.run = originalRun;
      }
    });
  });
});
