/**
 * Unit tests for logger utility
 */

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');

// Import test configuration
const originalNodeEnv = process.env.NODE_ENV;

describe('Logger Utility', function() {
  let logger;
  let consoleStub;
  let fsStub;
  
  beforeEach(function() {
    // Stub console methods
    consoleStub = {
      error: sinon.stub(console, 'error'),
      warn: sinon.stub(console, 'warn'),
      info: sinon.stub(console, 'info'),
      debug: sinon.stub(console, 'debug'),
      log: sinon.stub(console, 'log')
    };
    
    // Stub fs.appendFile
    fsStub = sinon.stub(fs, 'appendFile').callsFake((path, data, callback) => {
      callback(null);
    });
    
    // Clear require cache to get fresh logger instance
    delete require.cache[require.resolve('../../server/utils/logger')];
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Now import logger
    logger = require('../../server/utils/logger');
  });
  
  afterEach(function() {
    // Restore stubs
    sinon.restore();
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });
  
  describe('Log Levels', function() {
    it('should have correct log levels', function() {
      expect(logger.LOG_LEVELS).to.be.an('object');
      expect(logger.LOG_LEVELS.ERROR).to.equal('ERROR');
      expect(logger.LOG_LEVELS.WARN).to.equal('WARN');
      expect(logger.LOG_LEVELS.INFO).to.equal('INFO');
      expect(logger.LOG_LEVELS.DEBUG).to.equal('DEBUG');
    });
    
    it('should expose log methods', function() {
      expect(logger.error).to.be.a('function');
      expect(logger.warn).to.be.a('function');
      expect(logger.info).to.be.a('function');
      expect(logger.debug).to.be.a('function');
    });
  });
  
  describe('Logging Methods', function() {
    it('should log errors to console', function() {
      // Act
      logger.error('Test error message', { code: 'TEST_ERROR' });
      
      // Assert
      expect(consoleStub.error.calledOnce).to.be.true;
      const args = consoleStub.error.firstCall.args;
      expect(args[0]).to.include('ERROR');
      expect(args[0]).to.include('Test error message');
    });
    
    it('should log warnings to console', function() {
      // Act
      logger.warn('Test warning message');
      
      // Assert
      expect(consoleStub.warn.calledOnce).to.be.true;
      expect(consoleStub.warn.firstCall.args[0]).to.include('WARN');
    });
    
    it('should append logs to file', function() {
      // Act
      logger.info('Test info message');
      
      // Assert
      expect(fsStub.calledOnce).to.be.true;
      const data = fsStub.firstCall.args[1];
      expect(data).to.include('INFO');
      expect(data).to.include('Test info message');
    });
    
    it('should include metadata in logs', function() {
      // Act
      const metadata = { user: 'test-user', action: 'login' };
      logger.info('User action', metadata);
      
      // Assert
      expect(consoleStub.info.calledOnce).to.be.true;
      expect(consoleStub.info.firstCall.args[1]).to.deep.equal(metadata);
      
      expect(fsStub.calledOnce).to.be.true;
      const fileData = fsStub.firstCall.args[1];
      expect(fileData).to.include(JSON.stringify(metadata));
    });
  });
  
  describe('Environment Handling', function() {
    it('should respect log levels based on environment', function() {
      // Setup production environment
      process.env.NODE_ENV = 'production';
      
      // Clear require cache and reload logger
      delete require.cache[require.resolve('../../server/utils/logger')];
      logger = require('../../server/utils/logger');
      
      // Reset stubs
      consoleStub.debug.reset();
      consoleStub.info.reset();
      fsStub.reset();
      
      // Act - debug should not log in production
      logger.debug('Debug message should not appear');
      
      // Assert
      expect(consoleStub.debug.called).to.be.false;
      
      // But error should still log
      logger.error('Error should appear');
      expect(consoleStub.error.called).to.be.true;
    });
  });
});
