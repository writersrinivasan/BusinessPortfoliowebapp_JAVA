# Developer Guide - Lifestyle Manager

This document provides detailed information for developers working on the Lifestyle Manager application.

## Development Environment Setup

### Requirements

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- Git
- A modern code editor (VS Code recommended)
- Browser Developer Tools

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lifestyle-manager.git
   cd lifestyle-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
lifestyle-manager/
├── public/                  # Static frontend assets
│   ├── css/                 # CSS stylesheets
│   │   ├── styles.css       # Main stylesheet
│   │   └── error-handling.css # Error notification styles
│   ├── js/                  # Frontend JavaScript
│   │   ├── app.js           # Main application logic
│   │   └── error-handling.js # Error handling utilities
│   └── index.html           # Main HTML file
├── server/                  # Backend code
│   ├── middleware/          # Express middleware
│   │   └── errorHandler.js  # Error handling middleware
│   ├── models/              # Data models
│   │   ├── blog.js          # Blog post model
│   │   ├── db-setup.js      # Database initialization
│   │   ├── habit.js         # Habit model
│   │   └── recipe.js        # Recipe model
│   ├── routes/              # API routes
│   │   ├── blog.js          # Blog endpoints
│   │   ├── habits.js        # Habits endpoints
│   │   └── recipes.js       # Recipe endpoints
│   └── utils/               # Utilities
│       └── logger.js        # Logging utility
├── test/                    # Test files
│   ├── e2e/                 # End-to-end tests
│   │   ├── app.test.js      # Application lifecycle tests
│   │   └── cross-component.test.js # Cross-component tests
│   ├── fixtures/            # Test fixtures/mocks
│   │   ├── mock-blog-model.js
│   │   └── mock-habit-model.js
│   ├── integration/         # Integration tests
│   │   ├── blog.test.js     # Blog API tests
│   │   ├── habits.test.js   # Habits API tests
│   │   └── recipes.test.js  # Recipe API tests
│   ├── unit/                # Unit tests
│   │   ├── frontend.test.js # Frontend tests
│   │   ├── middleware/      # Middleware tests
│   │   │   └── errorHandler.test.js
│   │   ├── models/          # Model tests
│   │   │   ├── blog.test.js
│   │   │   ├── habit.test.js
│   │   │   └── recipe.test.js
│   │   ├── routes/          # Route handler tests
│   │   │   ├── blog.test.js
│   │   │   └── habits.test.js
│   │   └── utils/           # Utility tests
│   │       └── logger.test.js
│   ├── test-config.js       # Test configuration
│   ├── test-db.js           # Test database setup
│   └── test-server.js       # Test server setup
├── logs/                    # Application logs
├── server.js                # Main server entry point
├── package.json             # npm dependencies and scripts
├── database.sqlite          # SQLite database file
├── run-tests.sh             # Test runner script
├── .gitignore               # Git ignore file
├── API_DOCS.md              # API documentation
├── ARCHITECTURE.md          # Architecture documentation
├── DEPLOYMENT.md            # Deployment guide
├── DEVELOPER_GUIDE.md       # This file
├── ERROR_HANDLING.md        # Error handling documentation
├── README.md                # Project overview
└── TESTING.md               # Testing strategy
```

## Development Workflow

### Branching Strategy

We use a simplified Git Flow model:

1. `main` branch: Production-ready code
2. `develop` branch: Integration branch for new features
3. Feature branches: Create from `develop` with format: `feature/feature-name`
4. Bugfix branches: Create from `develop` with format: `bugfix/issue-description`
5. Hotfix branches: Create from `main` with format: `hotfix/issue-description`

### Pull Request Process

1. Create a branch from the appropriate base branch
2. Implement your changes with proper tests
3. Ensure all tests pass locally
4. Create a pull request with a clear description
5. Request a code review
6. Merge after approval

### Commit Message Guidelines

Follow conventional commits format:

```
type(scope): short description

longer description if needed
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example: `feat(habits): add streak calculation function`

## Coding Standards

### JavaScript

- Follow ES6+ standards
- Use const and let, avoid var
- Use async/await for asynchronous code
- Document functions with JSDoc comments
- Use descriptive variable and function names

### HTML & CSS

- Use semantic HTML5 elements
- Keep CSS organized by component
- Use responsive design principles
- Test across different viewport sizes

### API Design

- Follow RESTful principles
- Use appropriate HTTP methods and status codes
- Provide consistent error responses
- Version the API when making breaking changes

### Error Handling

- Use custom error classes
- Include appropriate error details
- Log errors with context
- Handle errors at the appropriate level

## Testing Guidelines

### Writing Tests

1. Each feature should have corresponding tests
2. Test both success and failure scenarios
3. Use descriptive test names: `should do something when condition`
4. Keep tests independent and idempotent

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run model-specific tests
npm run test:recipe
npm run test:habit
npm run test:blog

# Generate coverage report
npm run test:coverage
```

## Debugging

### Server-Side

1. Use the logger utility with appropriate levels:
   ```javascript
   const logger = require('./server/utils/logger');
   
   logger.debug('Debugging information');
   logger.info('Informational message');
   logger.warn('Warning message');
   logger.error('Error message', { error });
   ```

2. Check logs:
   ```bash
   npm run view-logs
   ```

3. Use Node.js debugging:
   ```bash
   node --inspect server.js
   ```

### Client-Side

1. Use browser developer tools
2. Check the console for error messages
3. Examine network requests in the Network tab
4. Set breakpoints in the Sources tab

## Performance Considerations

- Minimize DOM manipulations
- Use event delegation where appropriate
- Keep API responses small and focused
- Index database fields used in frequent queries
- Use proper HTTP caching headers

## Security Best Practices

- Validate all user input
- Sanitize data before rendering to prevent XSS
- Use parameterized queries to prevent SQL injection
- Don't expose sensitive information in error messages
- Keep dependencies updated

## Contributing

1. Review existing documentation
2. Follow the coding standards and guidelines
3. Include tests for new features
4. Update documentation as needed
5. Submit a pull request with a clear description

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Mocha Testing Framework](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
