/**
 * Mock BlogPost model for router unit tests
 */

const sinon = require('sinon');

// Create a mock blog post model that can be used in unit tests
const mockBlogPostModel = () => {
  return {
    getAll: sinon.stub(),
    getById: sinon.stub(),
    create: sinon.stub(),
    update: sinon.stub(),
    delete: sinon.stub()
  };
};

module.exports = mockBlogPostModel;
