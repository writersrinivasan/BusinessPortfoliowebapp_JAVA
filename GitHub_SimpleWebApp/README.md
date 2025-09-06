# Lifestyle Manager

A minimal, lightweight web application that combines three lifestyle tools:
1. Recipe Manager
2. Habit Tracker
3. Blog Platform

## Features

### Recipe Manager
- Add, edit, and delete recipes
- Categorize recipes
- View all recipes in a list

### Habit Tracker
- Add and delete habits
- Track daily habit completion
- View streak counts for consistent habits

### Blog Platform
- Write and publish simple blog posts
- Edit and delete existing posts
- View posts in chronological order

## Technical Details

### Frontend
- Vanilla JavaScript
- Minimal CSS
- No external libraries or frameworks
- Responsive design

### Backend
- Node.js with Express
- SQLite database
- RESTful API endpoints

### Data Storage
- Recipes: title, category, instructions
- Habits: title, completion status by date
- Blog Posts: title, body content

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   node server.js
   ```
4. Open your browser and navigate to http://localhost:3000

## API Endpoints

### Recipes
- GET /api/recipes - Get all recipes
- GET /api/recipes/:id - Get a specific recipe
- POST /api/recipes - Create a new recipe
- PUT /api/recipes/:id - Update a recipe
- DELETE /api/recipes/:id - Delete a recipe

### Habits
- GET /api/habits - Get all habits with completion data
- POST /api/habits - Create a new habit
- POST /api/habits/:id/toggle - Toggle habit completion for today
- DELETE /api/habits/:id - Delete a habit

### Blog
- GET /api/blog - Get all blog posts
- GET /api/blog/:id - Get a specific blog post
- POST /api/blog - Create a new blog post
- PUT /api/blog/:id - Update a blog post
- DELETE /api/blog/:id - Delete a blog post

## Dependencies

- express: Web server framework
- sqlite3: SQLite database driver
- cors: Cross-Origin Resource Sharing middleware
- body-parser: Request body parsing middleware

## Testing

This application includes comprehensive test coverage with unit, integration, and end-to-end tests.

### Running Tests

Run all tests:
```
npm test
```

Run specific test suites:
```
npm run test:unit        # Run all unit tests
npm run test:integration # Run all integration tests
npm run test:e2e         # Run all end-to-end tests
```

Run individual model tests:
```
npm run test:recipe      # Test the recipe model
npm run test:habit       # Test the habit model
npm run test:blog        # Test the blog model
```

Generate test coverage report:
```
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Tests individual components in isolation
  - Models: Recipe, Habit, Blog
  - Middleware: Error handling
  - Utils: Logger
  - Frontend: Validation and UI logic

- **Integration Tests**: Tests API endpoints and database interactions
  - Recipe API endpoints
  - Habit API endpoints
  - Blog API endpoints

- **End-to-End Tests**: Tests complete user flows
  - Full CRUD operations for all components
  - Cross-component interactions
  - Error handling across the application

## Documentation

This project includes comprehensive documentation:

- [System Overview](./SYSTEM_OVERVIEW.md): High-level overview of how all components work together
- [Visual Architecture](./VISUAL_ARCHITECTURE.md): Visual representation of the application architecture
- [Architecture Documentation](./ARCHITECTURE.md): Detailed architecture of the application
- [API Documentation](./API_DOCS.md): Complete API reference
- [Error Handling Documentation](./ERROR_HANDLING.md): Error handling system overview
- [Testing Strategy](./TESTING.md): Testing approach and test organization
- [Deployment Guide](./DEPLOYMENT.md): Instructions for deploying the application
- [Developer Guide](./DEVELOPER_GUIDE.md): Guide for developers contributing to the project
- [Contributing Guidelines](./CONTRIBUTING.md): How to contribute to this project
- [Security Policy](./SECURITY.md): Security guidelines and vulnerability reporting
- [License](./LICENSE): MIT License
