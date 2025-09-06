/**
 * Unit tests for Blog API routes
 */

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const { EventEmitter } = require('events');
const proxyquire = require('proxyquire').noCallThru();

// Import mockBlogPost model
const mockBlogPostModel = require('../../fixtures/mock-blog-model');

describe('Blog Routes', function() {
  // Mock BlogPost model
  let mockBlogPost;
  let blogRouter;
  
  beforeEach(function() {
    // Create mock BlogPost model with sinon stubs for each method
    mockBlogPost = mockBlogPostModel();
    
    // Use proxyquire to inject our mock
    blogRouter = proxyquire('../../../server/routes/blog', {
      '../models/blog': mockBlogPost
    });
  });
  
  afterEach(function() {
    // Restore all spies and stubs
    sinon.restore();
  });
  
  describe('GET /', function() {
    it('should return all blog posts', async function() {
      // Arrange
      const mockPosts = [
        { id: 1, title: 'Test Post 1', body: 'Test content 1', created_at: new Date().toISOString() },
        { id: 2, title: 'Test Post 2', body: 'Test content 2', created_at: new Date().toISOString() }
      ];
      mockBlogPost.getAll.resolves(mockPosts);
      
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/'
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      blogRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(200);
      expect(JSON.parse(data)).to.deep.equal(mockPosts);
      expect(mockBlogPost.getAll.calledOnce).to.be.true;
    });
    
    it('should handle errors properly', async function() {
      // Arrange
      mockBlogPost.getAll.rejects(new Error('Database error'));
      
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/'
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      blogRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(500);
      expect(JSON.parse(data)).to.have.property('error');
      expect(mockBlogPost.getAll.calledOnce).to.be.true;
    });
  });
  
  describe('GET /:id', function() {
    it('should return a single blog post', async function() {
      // Arrange
      const postId = '1';
      const mockPost = { id: 1, title: 'Test Post', body: 'Test content', created_at: new Date().toISOString() };
      mockBlogPost.getById.resolves(mockPost);
      
      const req = httpMocks.createRequest({
        method: 'GET',
        url: `/${postId}`,
        params: { id: postId }
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      blogRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(200);
      expect(JSON.parse(data)).to.deep.equal(mockPost);
      expect(mockBlogPost.getById.calledOnce).to.be.true;
      expect(mockBlogPost.getById.calledWith(postId)).to.be.true;
    });
    
    it('should return 404 when post not found', async function() {
      // Arrange
      const postId = '999';
      mockBlogPost.getById.resolves(null);
      
      const req = httpMocks.createRequest({
        method: 'GET',
        url: `/${postId}`,
        params: { id: postId }
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      blogRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(404);
      expect(JSON.parse(data)).to.have.property('error');
      expect(mockBlogPost.getById.calledOnce).to.be.true;
    });
  });
  
  describe('POST /', function() {
    it('should create a new blog post', async function() {
      // Arrange
      const newPost = { title: 'New Test Post', body: 'New test content' };
      const createdPost = { id: 3, ...newPost };
      mockBlogPost.create.resolves(createdPost);
      
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/',
        body: newPost
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      blogRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(201);
      expect(JSON.parse(data)).to.deep.equal(createdPost);
      expect(mockBlogPost.create.calledOnce).to.be.true;
      expect(mockBlogPost.create.calledWith(newPost)).to.be.true;
    });
    
    it('should return 400 when missing required fields', async function() {
      // Arrange
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/',
        body: { title: 'Missing Body' }
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      blogRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(400);
      expect(JSON.parse(data)).to.have.property('error');
      expect(mockBlogPost.create.called).to.be.false;
    });
  });
  
  describe('PUT /:id', function() {
    it('should update an existing blog post', async function() {
      // Arrange
      const postId = '1';
      const updatedData = { title: 'Updated Post', body: 'Updated content' };
      const updatedPost = { id: 1, ...updatedData };
      mockBlogPost.update.resolves(updatedPost);
      
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: `/${postId}`,
        params: { id: postId },
        body: updatedData
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      blogRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(200);
      expect(JSON.parse(data)).to.deep.equal(updatedPost);
      expect(mockBlogPost.update.calledOnce).to.be.true;
      expect(mockBlogPost.update.calledWith(postId, updatedData)).to.be.true;
    });
    
    it('should return 400 when missing required fields', async function() {
      // Arrange
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: '/1',
        params: { id: '1' },
        body: { title: 'Missing Body' }
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      blogRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(400);
      expect(JSON.parse(data)).to.have.property('error');
      expect(mockBlogPost.update.called).to.be.false;
    });
  });
  
  describe('DELETE /:id', function() {
    it('should delete an existing blog post', async function() {
      // Arrange
      const postId = '1';
      const deleteResult = { deleted: true };
      mockBlogPost.delete.resolves(deleteResult);
      
      const req = httpMocks.createRequest({
        method: 'DELETE',
        url: `/${postId}`,
        params: { id: postId }
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      blogRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(200);
      expect(JSON.parse(data)).to.have.property('message');
      expect(mockBlogPost.delete.calledOnce).to.be.true;
      expect(mockBlogPost.delete.calledWith(postId)).to.be.true;
    });
    
    it('should return 404 when post not found', async function() {
      // Arrange
      const postId = '999';
      mockBlogPost.delete.resolves({ deleted: false });
      
      const req = httpMocks.createRequest({
        method: 'DELETE',
        url: `/${postId}`,
        params: { id: postId }
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      blogRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(404);
      expect(JSON.parse(data)).to.have.property('error');
      expect(mockBlogPost.delete.calledOnce).to.be.true;
    });
  });
});
