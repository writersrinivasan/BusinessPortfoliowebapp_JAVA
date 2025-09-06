/**
 * Unit tests for Habit model
 */

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const { ApiError } = require('../../../server/middleware/errorHandler');

// Import test configuration
const { fixtures } = require('../../test-config');
const testDb = require('../../test-db');

describe('Habit Model', function() {
  // Load the model with our test database
  let Habit;
  
  before(async function() {
    // Set up test database
    await testDb.setupTestDatabase();
    
    // Mock the db-setup import in habit.js
    const mockDbSetup = {
      db: testDb.db
    };
    
    // Use proxyquire to inject our test db into the model
    const proxyquire = require('proxyquire').noCallThru();
    Habit = proxyquire('../../../server/models/habit', {
      './db-setup': mockDbSetup,
      '../middleware/errorHandler': { ApiError }
    });
  });
  
  beforeEach(async function() {
    // Reset database before each test
    await testDb.resetTestDatabase();
    // Seed with test data
    await testDb.seedTestData({ 
      habits: fixtures.habits,
      // Add some habit completions for testing
      habitCompletions: [
        { habit_id: 1, completed_date: new Date().toISOString().split('T')[0] }, // Today
        { habit_id: 1, completed_date: new Date(Date.now() - 86400000).toISOString().split('T')[0] }, // Yesterday
        { habit_id: 1, completed_date: new Date(Date.now() - 172800000).toISOString().split('T')[0] } // 2 days ago
      ]
    });
  });
  
  after(async function() {
    // Tear down test database
    await testDb.teardownTestDatabase();
  });
  
  describe('getAll()', function() {
    it('should return all habits with completion and streak data', async function() {
      // Act
      const habits = await Habit.getAll();
      
      // Assert
      expect(habits).to.be.an('array');
      expect(habits).to.have.lengthOf(2);
      expect(habits[0].title).to.equal('Test Habit 1');
      
      // Check that completion data is included
      expect(habits[0]).to.have.property('completed_today');
      expect(habits[0]).to.have.property('current_streak');
    });
    
    it('should handle database errors gracefully', async function() {
      // Arrange
      const originalAll = testDb.db.all;
      testDb.db.all = sinon.stub().callsFake((query, params, callback) => {
        callback(new Error('Database error'));
      });
      
      try {
        // Act & Assert
        await expect(Habit.getAll()).to.be.rejectedWith(Error);
      } finally {
        // Restore original function
        testDb.db.all = originalAll;
      }
    });
  });
  
  describe('create()', function() {
    it('should create a new habit', async function() {
      // Arrange
      const newHabit = {
        title: 'New Test Habit'
      };
      
      // Act
      const result = await Habit.create(newHabit);
      
      // Assert
      expect(result).to.be.an('object');
      expect(result.id).to.be.a('number');
      expect(result.title).to.equal(newHabit.title);
      
      // Verify it was actually saved to the database
      const savedHabit = await testDb.getQuery('SELECT * FROM habits WHERE id = ?', [result.id]);
      expect(savedHabit).to.be.an('object');
      expect(savedHabit.title).to.equal(newHabit.title);
    });
    
    it('should handle database errors gracefully', async function() {
      // Arrange
      const originalRun = testDb.db.run;
      testDb.db.run = sinon.stub().callsFake((query, params, callback) => {
        callback(new Error('Database error'));
      });
      
      try {
        // Act & Assert
        await expect(Habit.create({ title: 'Test' })).to.be.rejectedWith(Error);
      } finally {
        // Restore original function
        testDb.db.run = originalRun;
      }
    });
  });
  
  describe('toggleCompletion()', function() {
    it('should add a completion record when toggling on', async function() {
      // Arrange
      const habitId = 2; // habit with no completions
      const date = new Date().toISOString().split('T')[0]; // today
      
      // Act
      const result = await Habit.toggleCompletion(habitId, date);
      
      // Assert
      expect(result).to.be.an('object');
      expect(result.completed).to.be.true;
      expect(result.date).to.equal(date);
      
      // Verify it was actually saved to the database
      const completion = await testDb.getQuery(
        'SELECT * FROM habit_completions WHERE habit_id = ? AND completed_date = ?',
        [habitId, date]
      );
      expect(completion).to.be.an('object');
    });
    
    it('should remove a completion record when toggling off', async function() {
      // Arrange
      const habitId = 1; // habit with existing completion for today
      const date = new Date().toISOString().split('T')[0]; // today
      
      // Act
      const result = await Habit.toggleCompletion(habitId, date);
      
      // Assert
      expect(result).to.be.an('object');
      expect(result.completed).to.be.false;
      expect(result.date).to.equal(date);
      
      // Verify it was actually removed from the database
      const completion = await testDb.getQuery(
        'SELECT * FROM habit_completions WHERE habit_id = ? AND completed_date = ?',
        [habitId, date]
      );
      expect(completion).to.be.undefined;
    });
    
    it('should handle database errors gracefully', async function() {
      // Arrange
      const originalGet = testDb.db.get;
      testDb.db.get = sinon.stub().callsFake((query, params, callback) => {
        callback(new Error('Database error'));
      });
      
      try {
        // Act & Assert
        await expect(Habit.toggleCompletion(1, '2023-01-01')).to.be.rejectedWith(Error);
      } finally {
        // Restore original function
        testDb.db.get = originalGet;
      }
    });
  });
  
  describe('delete()', function() {
    it('should delete an existing habit', async function() {
      // Act
      const result = await Habit.delete(1);
      
      // Assert
      expect(result).to.be.an('object');
      expect(result.deleted).to.be.true;
      
      // Verify it was actually deleted from the database
      const deletedHabit = await testDb.getQuery('SELECT * FROM habits WHERE id = ?', [1]);
      expect(deletedHabit).to.be.undefined;
      
      // Verify cascade deletion of completions
      const completions = await testDb.getAllQuery('SELECT * FROM habit_completions WHERE habit_id = ?', [1]);
      expect(completions).to.be.an('array').that.is.empty;
    });
    
    it('should handle database errors gracefully', async function() {
      // Arrange
      const originalRun = testDb.db.run;
      testDb.db.run = sinon.stub().callsFake((query, params, callback) => {
        callback(new Error('Database error'));
      });
      
      try {
        // Act & Assert
        await expect(Habit.delete(1)).to.be.rejectedWith(Error);
      } finally {
        // Restore original function
        testDb.db.run = originalRun;
      }
    });
  });
});
