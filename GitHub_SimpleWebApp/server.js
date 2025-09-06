const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Import routes
const recipesRoutes = require('./server/routes/recipes');
const habitsRoutes = require('./server/routes/habits');
const blogRoutes = require('./server/routes/blog');

// Import error handling middleware
const { notFound, errorHandler, requestLogger } = require('./server/middleware/errorHandler');

// Import logger
const logger = require('./server/utils/logger');

// Initialize database
const dbSetup = require('./server/models/db-setup');

// Handle database initialization
(async () => {
  try {
    await dbSetup.setupDatabase();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database', { error: error.message });
    console.error('Error initializing database:', error);
    // In a production app, you might want to exit here
    // process.exit(1);
  }
})();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(requestLogger);  // Add request logging

// Routes
app.use('/api/recipes', recipesRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/blog', blogRoutes);

// Serve the main HTML file for all client routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware (must be after all routes)
app.use(notFound);
app.use(errorHandler);

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason, stack: reason?.stack });
  // In a production app, you might want to alert monitoring system
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { 
    error: error.message, 
    stack: error.stack, 
    name: error.name 
  });
  // In a production environment, you might want to gracefully shutdown
  // process.exit(1);
});

// Create HTTP server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
