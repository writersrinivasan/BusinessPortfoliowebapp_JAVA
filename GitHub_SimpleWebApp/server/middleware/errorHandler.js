/**
 * Central error handler middleware
 * Handles different types of errors and sends appropriate responses
 */

// Import logger
const logger = require('../utils/logger');

// Custom error class for API errors
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

// Not Found error handler middleware
const notFound = (req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, { 
    ip: req.ip, 
    userAgent: req.get('user-agent') 
  });
  
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`Response: ${req.method} ${req.originalUrl}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log error with details
  const logData = {
    error: err.name || 'Error',
    message: err.message,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    ...(err.details && { details: err.details }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };
  
  // Log based on severity
  if (statusCode >= 500) {
    logger.error(`Server error: ${err.message}`, logData);
  } else if (statusCode >= 400) {
    logger.warn(`Client error: ${err.message}`, logData);
  }

  // Prepare response
  const errorResponse = {
    error: true,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    ...(err.details && { details: err.details })
  };

  res.status(statusCode).json(errorResponse);
};

module.exports = {
  ApiError,
  notFound,
  errorHandler,
  requestLogger
};
