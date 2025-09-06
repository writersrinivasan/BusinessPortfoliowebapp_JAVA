/**
 * Mock Habit model for router unit tests
 */

const sinon = require('sinon');

// Create a mock habit model that can be used in unit tests
const mockHabitModel = () => {
  return {
    getAll: sinon.stub(),
    create: sinon.stub(),
    toggleCompletion: sinon.stub(),
    delete: sinon.stub()
  };
};

module.exports = mockHabitModel;
