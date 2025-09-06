/**
 * Unit tests for Habits API routes
 */

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const { EventEmitter } = require('events');
const proxyquire = require('proxyquire').noCallThru();

// Import mockHabit model
const mockHabitModel = require('../../fixtures/mock-habit-model');

describe('Habits Routes', function() {
  // Mock Habit model
  let mockHabit;
  let habitsRouter;
  
  beforeEach(function() {
    // Create mock Habit model with sinon stubs for each method
    mockHabit = mockHabitModel();
    
    // Use proxyquire to inject our mock
    habitsRouter = proxyquire('../../../server/routes/habits', {
      '../models/habit': mockHabit
    });
  });
  
  afterEach(function() {
    // Restore all spies and stubs
    sinon.restore();
  });
  
  describe('GET /', function() {
    it('should return all habits', async function() {
      // Arrange
      const mockHabits = [
        { id: 1, title: 'Test Habit 1', completed_today: 1, current_streak: 3 },
        { id: 2, title: 'Test Habit 2', completed_today: 0, current_streak: 0 }
      ];
      mockHabit.getAll.resolves(mockHabits);
      
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
      
      habitsRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(200);
      expect(JSON.parse(data)).to.deep.equal(mockHabits);
      expect(mockHabit.getAll.calledOnce).to.be.true;
    });
    
    it('should handle errors properly', async function() {
      // Arrange
      mockHabit.getAll.rejects(new Error('Database error'));
      
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
      
      habitsRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(500);
      expect(JSON.parse(data)).to.have.property('error');
      expect(mockHabit.getAll.calledOnce).to.be.true;
    });
  });
  
  describe('POST /', function() {
    it('should create a new habit', async function() {
      // Arrange
      const newHabit = { title: 'New Test Habit' };
      const createdHabit = { id: 3, ...newHabit };
      mockHabit.create.resolves(createdHabit);
      
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/',
        body: newHabit
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      habitsRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(201);
      expect(JSON.parse(data)).to.deep.equal(createdHabit);
      expect(mockHabit.create.calledOnce).to.be.true;
      expect(mockHabit.create.calledWith(newHabit)).to.be.true;
    });
    
    it('should return 400 when missing required fields', async function() {
      // Arrange
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/',
        body: {}
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      habitsRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(400);
      expect(JSON.parse(data)).to.have.property('error');
      expect(mockHabit.create.called).to.be.false;
    });
  });
  
  describe('POST /:id/toggle', function() {
    it('should toggle habit completion', async function() {
      // Arrange
      const habitId = '1';
      const date = new Date().toISOString().split('T')[0];
      const toggleResult = { completed: true, date };
      mockHabit.toggleCompletion.resolves(toggleResult);
      
      const req = httpMocks.createRequest({
        method: 'POST',
        url: `/1/toggle`,
        params: { id: habitId },
        body: { date }
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      habitsRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(200);
      expect(JSON.parse(data)).to.deep.equal(toggleResult);
      expect(mockHabit.toggleCompletion.calledOnce).to.be.true;
      expect(mockHabit.toggleCompletion.calledWith(habitId, date)).to.be.true;
    });
    
    it('should return 400 when missing date', async function() {
      // Arrange
      const req = httpMocks.createRequest({
        method: 'POST',
        url: `/1/toggle`,
        params: { id: '1' },
        body: {}
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      habitsRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(400);
      expect(JSON.parse(data)).to.have.property('error');
      expect(mockHabit.toggleCompletion.called).to.be.false;
    });
  });
  
  describe('DELETE /:id', function() {
    it('should delete an existing habit', async function() {
      // Arrange
      const habitId = '1';
      const deleteResult = { deleted: true };
      mockHabit.delete.resolves(deleteResult);
      
      const req = httpMocks.createRequest({
        method: 'DELETE',
        url: `/1`,
        params: { id: habitId }
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      habitsRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(200);
      expect(JSON.parse(data)).to.have.property('message');
      expect(mockHabit.delete.calledOnce).to.be.true;
      expect(mockHabit.delete.calledWith(habitId)).to.be.true;
    });
    
    it('should return 404 when habit not found', async function() {
      // Arrange
      const habitId = '999';
      mockHabit.delete.resolves({ deleted: false });
      
      const req = httpMocks.createRequest({
        method: 'DELETE',
        url: `/999`,
        params: { id: habitId }
      });
      const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
      
      // Act
      const responsePromise = new Promise(resolve => {
        res.on('end', () => {
          resolve(res._getData());
        });
      });
      
      habitsRouter.handle(req, res);
      const data = await responsePromise;
      
      // Assert
      expect(res._getStatusCode()).to.equal(404);
      expect(JSON.parse(data)).to.have.property('error');
      expect(mockHabit.delete.calledOnce).to.be.true;
    });
  });
});
