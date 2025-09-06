/**
 * Integration tests for Habit API endpoints
 */

const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

// Import test setup
const testDb = require('../test-db');
const { createTestServer } = require('../test-server');
const { fixtures } = require('../test-config');

describe('Habits API Endpoints', function() {
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
    await testDb.seedTestData({ habits: fixtures.habits });
    
    // Add some habit completions for testing
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
    
    await testDb.runQuery(
      'INSERT INTO habit_completions (habit_id, completed_date) VALUES (?, ?)',
      [1, today]
    );
    await testDb.runQuery(
      'INSERT INTO habit_completions (habit_id, completed_date) VALUES (?, ?)',
      [1, yesterday]
    );
    await testDb.runQuery(
      'INSERT INTO habit_completions (habit_id, completed_date) VALUES (?, ?)',
      [1, twoDaysAgo]
    );
  });
  
  after(async function() {
    // Clean up test database
    await testDb.teardownTestDatabase();
  });
  
  describe('GET /api/habits', function() {
    it('should return all habits with completion data', async function() {
      // Act
      const response = await request(app)
        .get('/api/habits')
        .expect('Content-Type', /json/)
        .expect(200);
        
      // Assert
      expect(response.body).to.be.an('array');
      expect(response.body).to.have.lengthOf(2);
      
      // Check that first habit has completions and streaks
      expect(response.body[0].title).to.equal('Test Habit 1');
      expect(response.body[0]).to.have.property('completed_today');
      expect(response.body[0]).to.have.property('current_streak');
      expect(response.body[0]).to.have.property('total_completions');
      expect(response.body[0]).to.have.property('month_completions');
      
      // Check that second habit has no completions
      expect(response.body[1].title).to.equal('Test Habit 2');
      expect(response.body[1].completed_today).to.equal(0);
    });
  });
  
  describe('POST /api/habits', function() {
    it('should create a new habit', async function() {
      // Arrange
      const newHabit = {
        title: 'New Habit'
      };
      
      // Act
      const response = await request(app)
        .post('/api/habits')
        .send(newHabit)
        .expect('Content-Type', /json/)
        .expect(201);
        
      // Assert
      expect(response.body).to.be.an('object');
      expect(response.body.id).to.be.a('number');
      expect(response.body.title).to.equal(newHabit.title);
      
      // Verify it was saved to the database
      const savedHabit = await testDb.getQuery('SELECT * FROM habits WHERE id = ?', [response.body.id]);
      expect(savedHabit).to.not.be.undefined;
      expect(savedHabit.title).to.equal(newHabit.title);
    });
    
    it('should return 400 when title is missing', async function() {
      // Act
      const response = await request(app)
        .post('/api/habits')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);
        
      // Assert
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('required');
    });
  });
  
  describe('POST /api/habits/:id/toggle', function() {
    it('should toggle a habit completion on', async function() {
      // Arrange
      const habitId = 2; // habit with no completions
      const today = new Date().toISOString().split('T')[0];
      
      // Act
      const response = await request(app)
        .post(`/api/habits/${habitId}/toggle`)
        .send({ date: today })
        .expect('Content-Type', /json/)
        .expect(200);
        
      // Assert
      expect(response.body).to.be.an('object');
      expect(response.body.completed).to.be.true;
      expect(response.body.date).to.equal(today);
      
      // Verify it was saved to the database
      const completion = await testDb.getQuery(
        'SELECT * FROM habit_completions WHERE habit_id = ? AND completed_date = ?',
        [habitId, today]
      );
      expect(completion).to.not.be.undefined;
    });
    
    it('should toggle a habit completion off', async function() {
      // Arrange
      const habitId = 1; // habit with existing completions
      const today = new Date().toISOString().split('T')[0];
      
      // Act
      const response = await request(app)
        .post(`/api/habits/${habitId}/toggle`)
        .send({ date: today })
        .expect('Content-Type', /json/)
        .expect(200);
        
      // Assert
      expect(response.body).to.be.an('object');
      expect(response.body.completed).to.be.false;
      expect(response.body.date).to.equal(today);
      
      // Verify it was removed from the database
      const completion = await testDb.getQuery(
        'SELECT * FROM habit_completions WHERE habit_id = ? AND completed_date = ?',
        [habitId, today]
      );
      expect(completion).to.be.undefined;
    });
    
    it('should return 400 when date is missing', async function() {
      // Act
      const response = await request(app)
        .post(`/api/habits/1/toggle`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);
        
      // Assert
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('required');
    });
  });
  
  describe('DELETE /api/habits/:id', function() {
    it('should delete a habit and its completions', async function() {
      // Act
      const response = await request(app)
        .delete('/api/habits/1')
        .expect('Content-Type', /json/)
        .expect(200);
        
      // Assert
      expect(response.body).to.have.property('message');
      
      // Verify habit was deleted
      const habit = await testDb.getQuery('SELECT * FROM habits WHERE id = ?', [1]);
      expect(habit).to.be.undefined;
      
      // Verify completions were also deleted (cascade delete)
      const completions = await testDb.getAllQuery(
        'SELECT * FROM habit_completions WHERE habit_id = ?',
        [1]
      );
      expect(completions).to.be.an('array').that.is.empty;
    });
    
    it('should return 404 when habit not found', async function() {
      // Act
      const response = await request(app)
        .delete('/api/habits/999')
        .expect('Content-Type', /json/)
        .expect(404);
        
      // Assert
      expect(response.body).to.have.property('error');
    });
  });
});
