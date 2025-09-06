# Error Handling System Documentation

This document details the comprehensive error handling system implemented in the Lifestyle Manager application.

## Overview

The error handling system is designed to:

1. Provide consistent error responses across the application
2. Log errors with appropriate context for debugging
3. Present user-friendly error messages
4. Handle both expected and unexpected errors
5. Enable graceful degradation and recovery

## Error Handling Architecture

```
┌─────────────────────────────┐
│    Error Handling System    │
├─────────────────────────────┘
│
├── Custom Error Classes
│   └── ApiError
│
├── Middleware
│   ├── Global Error Handler
│   ├── Not Found Handler
│   └── Request Logger
│
├── Process-Level Handlers
│   ├── Unhandled Promise Rejection Handler
│   ├── Uncaught Exception Handler
│   └── Graceful Shutdown Handler
│
└── Logging System
    ├── Logger Utility
    ├── Log Levels
    └── Log Rotation
```

## Error Types

### 1. Client Errors (4xx)
- **400 Bad Request**: Invalid input, missing required fields
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., duplicate entry)

### 2. Server Errors (5xx)
- **500 Internal Server Error**: Unexpected server error
- **503 Service Unavailable**: Server temporarily unavailable

## Custom Error Classes

### ApiError

```javascript
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}
```

Usage examples:

```javascript
// 404 Not Found error
throw new ApiError(404, `Recipe with ID ${id} not found`);

// 400 Bad Request error with details
throw new ApiError(400, 'Missing required fields', { 
  missingFields: ['title', 'category'] 
});

// 500 Internal Server Error
throw new ApiError(500, 'Database query failed', error.message);
```

## Error Handling Middleware

### Global Error Handler

The central error handling middleware processes all errors thrown during request processing:

```javascript
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
```

### Not Found Handler

Handles requests to non-existent routes:

```javascript
const notFound = (req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, { 
    ip: req.ip, 
    userAgent: req.get('user-agent') 
  });
  
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
```

### Request Logger

Logs all incoming requests and their responses:

```javascript
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
```

## Process-Level Error Handling

### Unhandled Promise Rejections

```javascript
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { 
    reason: reason?.message || reason, 
    stack: reason?.stack 
  });
  // In a production app, you might want to alert monitoring system
});
```

### Uncaught Exceptions

```javascript
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { 
    error: error.message, 
    stack: error.stack, 
    name: error.name 
  });
  // In a production environment, you might want to gracefully shutdown
  // process.exit(1);
});
```

### Graceful Shutdown

```javascript
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
```

## Logging System

### Logger Utility

A custom logger utility provides consistent logging across the application:

```javascript
const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transport with rotation
    new winston.transports.DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});
```

### Log Levels

The logging system uses the following levels:
- **error**: Critical errors that require immediate attention
- **warn**: Warnings that don't stop the application but require monitoring
- **info**: General operational information
- **debug**: Detailed information for debugging purposes

### Environment-Specific Behavior

Error handling behavior adapts to different environments:

#### Development Environment
- Detailed error messages
- Stack traces included in responses
- Debug level logging
- Errors displayed in console with colors

#### Production Environment
- Generic error messages to clients (no sensitive information)
- No stack traces in responses
- Info level logging by default
- Error alerts for critical issues

## Frontend Error Handling

### Error Display Component

```html
<div id="error-container" class="error-container">
  <div class="error-content">
    <span class="error-close">&times;</span>
    <h3>Error</h3>
    <p id="error-message"></p>
  </div>
</div>
```

### JavaScript Error Handlers

```javascript
// Display error message
function showError(message) {
  const errorContainer = document.getElementById('error-container');
  const errorMessage = document.getElementById('error-message');
  
  errorMessage.textContent = message;
  errorContainer.classList.add('show');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorContainer.classList.remove('show');
  }, 5000);
}

// API request error handling
async function fetchAPI(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Server error');
    }
    
    return await response.json();
  } catch (error) {
    showError(error.message);
    throw error; // Rethrow for further handling if needed
  }
}
```

### Network Status Monitoring

```javascript
// Monitor network status
window.addEventListener('online', () => {
  showMessage('You are back online. All features are available.');
});

window.addEventListener('offline', () => {
  showError('You are offline. Some features may be unavailable.');
});
```

## Best Practices Implemented

1. **Centralized Error Handling**: All errors flow through a central handling mechanism
2. **Contextual Logging**: Errors are logged with relevant context (URL, method, IP)
3. **Appropriate Status Codes**: HTTP status codes correctly reflect the error type
4. **Environment Awareness**: Different error handling for development vs. production
5. **User-Friendly Messages**: Clear, actionable error messages for users
6. **Graceful Degradation**: Application continues functioning when possible despite errors
7. **Validation**: Input validation prevents many potential errors
8. **Consistent Format**: All error responses follow the same format
9. **Log Rotation**: Prevents log files from consuming too much disk space
10. **Process-Level Guards**: Catches errors that might otherwise crash the application

## Error Response Examples

### 400 Bad Request (Validation Error)

```json
{
  "error": true,
  "message": "Missing required recipe fields",
  "details": {
    "missingFields": ["title", "instructions"]
  }
}
```

### 404 Not Found

```json
{
  "error": true,
  "message": "Recipe with ID 999 not found"
}
```

### 500 Internal Server Error

```json
{
  "error": true,
  "message": "Internal Server Error"
}
```

Development mode only:
```json
{
  "error": true,
  "message": "Database query failed",
  "stack": "Error: SQLITE_CONSTRAINT: UNIQUE constraint failed...",
  "details": "Error code: SQLITE_CONSTRAINT"
}
```
