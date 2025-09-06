/**
 * Integration tests for Blog API endpoints
 */

const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

// Import test setup
const testDb = require('../test-db');
const { createTestServer } = require('../test-server');
const { fixtures } = require('../test-config');

describe('Blog API Endpoints', function() {
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
    await testDb.seedTestData({ blogPosts: fixtures.blogPosts });
  });
  
  after(async function() {
    // Clean up test database
    await testDb.teardownTestDatabase();
  });
  
  describe('GET /api/blog', function() {
    it('should return all blog posts', async function() {
      // Act
      const response = await request(app)
        .get('/api/blog')
        .expect('Content-Type', /json/)
        .expect(200);
        
      // Assert
      expect(response.body).to.be.an('array');
      expect(response.body).to.have.lengthOf(2);
      expect(response.body[0].title).to.equal('Test Blog Post 1');
      expect(response.body[1].title).to.equal('Test Blog Post 2');
    });
  });
  
  describe('GET /api/blog/:id', function() {
    it('should return a single blog post', async function() {
      // Act
      const response = await request(app)
        .get('/api/blog/1')
        .expect('Content-Type', /json/)
        .expect(200);
        
      // Assert
      expect(response.body).to.be.an('object');
      expect(response.body.id).to.equal(1);
      expect(response.body.title).to.equal('Test Blog Post 1');
      expect(response.body.body).to.equal('Test blog post content 1');
    });
    
    it('should return 404 for non-existent blog post', async function() {
      // Act
      const response = await request(app)
        .get('/api/blog/999')
        .expect('Content-Type', /json/)
        .expect(404);
        
      // Assert
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('not found');
    });
  });
  
  describe('POST /api/blog', function() {
    it('should create a new blog post', async function() {
      // Arrange
      const newPost = {
        title: 'New Blog Post',
        body: 'New blog post content'
      };
      
      // Act
      const response = await request(app)
        .post('/api/blog')
        .send(newPost)
        .expect('Content-Type', /json/)
        .expect(201);
        
      // Assert
      expect(response.body).to.be.an('object');
      expect(response.body.id).to.be.a('number');
      expect(response.body.title).to.equal(newPost.title);
      expect(response.body.body).to.equal(newPost.body);
      
      // Verify it was saved to the database
      const savedPost = await testDb.getQuery('SELECT * FROM blog_posts WHERE id = ?', [response.body.id]);
      expect(savedPost).to.not.be.undefined;
      expect(savedPost.title).to.equal(newPost.title);
      expect(savedPost.body).to.equal(newPost.body);
    });
    
    it('should return 400 when missing required fields', async function() {
      // Act - missing body
      const response1 = await request(app)
        .post('/api/blog')
        .send({ title: 'Missing Body' })
        .expect('Content-Type', /json/)
        .expect(400);
        
      // Assert
      expect(response1.body).to.have.property('error');
      expect(response1.body.error).to.include('required');
      
      // Act - missing title
      const response2 = await request(app)
        .post('/api/blog')
        .send({ body: 'Missing Title' })
        .expect('Content-Type', /json/)
        .expect(400);
        
      // Assert
      expect(response2.body).to.have.property('error');
      expect(response2.body.error).to.include('required');
    });
  });
  
  describe('PUT /api/blog/:id', function() {
    it('should update an existing blog post', async function() {
      // Arrange
      const updatedPost = {
        title: 'Updated Blog Post',
        body: 'Updated blog post content'
      };
      
      // Act
      const response = await request(app)
        .put('/api/blog/1')
        .send(updatedPost)
        .expect('Content-Type', /json/)
        .expect(200);
        
      // Assert
      expect(response.body).to.be.an('object');
      expect(response.body.id).to.equal(1);
      expect(response.body.title).to.equal(updatedPost.title);
      expect(response.body.body).to.equal(updatedPost.body);
      
      // Verify it was updated in the database
      const updated = await testDb.getQuery('SELECT * FROM blog_posts WHERE id = ?', [1]);
      expect(updated.title).to.equal(updatedPost.title);
      expect(updated.body).to.equal(updatedPost.body);
    });
    
    it('should return 400 when missing required fields', async function() {
      // Act
      const response = await request(app)
        .put('/api/blog/1')
        .send({ title: 'Missing Body' })
        .expect('Content-Type', /json/)
        .expect(400);
        
      // Assert
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('required');
    });
  });
  
  describe('DELETE /api/blog/:id', function() {
    it('should delete an existing blog post', async function() {
      // Act
      const response = await request(app)
        .delete('/api/blog/1')
        .expect('Content-Type', /json/)
        .expect(200);
        
      // Assert
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.include('deleted');
      
      // Verify it was deleted from the database
      const deleted = await testDb.getQuery('SELECT * FROM blog_posts WHERE id = ?', [1]);
      expect(deleted).to.be.undefined;
    });
    
    it('should return 404 when post not found', async function() {
      // Act
      const response = await request(app)
        .delete('/api/blog/999')
        .expect('Content-Type', /json/)
        .expect(404);
        
      // Assert
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('not found');
    });
  });
});
