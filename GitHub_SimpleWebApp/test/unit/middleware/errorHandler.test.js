/**
 * Unit tests for error handler middleware
 */

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

// Import middleware
const { ApiError, notFound, errorHandler } = require('../../../server/middleware/errorHandler');

describe('Error Handler Middleware', function() {
  describe('ApiError', function() {
    it('should create an ApiError with correct properties', function() {
      // Act
      const error = new ApiError(400, 'Bad Request', { field: 'test' });
      
      // Assert
      expect(error).to.be.an.instanceOf(Error);
      expect(error.name).to.equal('ApiError');
      expect(error.statusCode).to.equal(400);
      expect(error.message).to.equal('Bad Request');
      expect(error.details).to.deep.equal({ field: 'test' });
    });
  });
  
  describe('notFound', function() {
    it('should create a 404 error and call next with it', function() {
      // Arrange
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/nonexistent'
      });
      const res = httpMocks.createResponse();
      const next = sinon.spy();
      
      // Act
      notFound(req, res, next);
      
      // Assert
      expect(next.calledOnce).to.be.true;
      const error = next.firstCall.args[0];
      expect(error).to.be.an.instanceOf(Error);
      expect(error.statusCode).to.equal(404);
      expect(error.message).to.include('/nonexistent');
    });
  });
  
  describe('errorHandler', function() {
    it('should handle ApiError with correct status code', function() {
      // Arrange
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = sinon.spy();
      const error = new ApiError(400, 'Bad Request');
      
      // Act
      errorHandler(error, req, res, next);
      
      // Assert
      expect(res.statusCode).to.equal(400);
      const data = JSON.parse(res._getData());
      expect(data.error).to.be.true;
      expect(data.message).to.equal('Bad Request');
    });
    
    it('should handle regular Error with 500 status code', function() {
      // Arrange
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = sinon.spy();
      const error = new Error('Internal Error');
      
      // Act
      errorHandler(error, req, res, next);
      
      // Assert
      expect(res.statusCode).to.equal(500);
      const data = JSON.parse(res._getData());
      expect(data.error).to.be.true;
      expect(data.message).to.equal('Internal Error');
    });
    
    it('should include error details in development but not in production', function() {
      // Arrange
      const req = httpMocks.createRequest();
      const res1 = httpMocks.createResponse();
      const res2 = httpMocks.createResponse();
      const next = sinon.spy();
      const error = new ApiError(400, 'Bad Request', { field: 'test' });
      
      // Save original NODE_ENV
      const originalEnv = process.env.NODE_ENV;
      
      // Act - Development mode
      process.env.NODE_ENV = 'development';
      errorHandler(error, req, res1, next);
      
      // Production mode
      process.env.NODE_ENV = 'production';
      errorHandler(error, req, res2, next);
      
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalEnv;
      
      // Assert
      const devData = JSON.parse(res1._getData());
      expect(devData.details).to.deep.equal({ field: 'test' });
      
      const prodData = JSON.parse(res2._getData());
      expect(prodData.details).to.deep.equal({ field: 'test' }); // Details are from ApiError.details
      expect(prodData.stack).to.be.undefined;
    });
  });
});
