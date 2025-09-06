# Architecture Documentation - Lifestyle Manager

This document provides a comprehensive overview of the application architecture for the Lifestyle Manager web application.

## System Overview

The Lifestyle Manager is a lightweight, monolithic web application that combines three lifestyle tools:
1. Recipe Manager
2. Habit Tracker
3. Blog Platform

The application uses a clean, layered architecture with clear separation of concerns:

```
┌───────────────────────────────────────────────────────────────┐
│                       Client (Browser)                        │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                     Static Assets (Public)                    │
│                 HTML / CSS / Frontend JavaScript              │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                       Express.js Server                       │
│  ┌─────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  Middleware     │  │    Routes      │  │  Error Handling│  │
│  └─────────────────┘  └────────────────┘  └────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                          Models                               │
│  ┌─────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  Recipe Model   │  │  Habit Model   │  │  Blog Model    │  │
│  └─────────────────┘  └────────────────┘  └────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                       SQLite Database                         │
│  ┌─────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  Recipes Table  │  │  Habits Tables │  │  Blog Table    │  │
│  └─────────────────┘  └────────────────┘  └────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend

**Technologies:**
- HTML5
- CSS3 (with responsive design principles)
- Vanilla JavaScript (ES6+)

**Structure:**
- `public/index.html`: Single-page application entry point
- `public/css/`: Stylesheet files including responsive design
- `public/js/`: Frontend JavaScript modules
- `public/images/`: Image assets (if any)

**Design Patterns:**
- Module pattern for JavaScript organization
- Event delegation for efficient DOM event handling
- Form validation using constraint validation API
- Tab-based interface for switching between tools
- Client-side error handling and notifications

### 2. Backend Server

**Technologies:**
- Node.js
- Express.js

**Structure:**
- `server.js`: Main application entry point
- `server/routes/`: API route handlers
- `server/middleware/`: Custom middleware
- `server/utils/`: Utility functions and helpers
- `server/models/`: Data models and database interaction

**Design Patterns:**
- Middleware pipeline for request processing
- RESTful API design
- Dependency injection for testable components
- Promises/async-await for asynchronous operations
- Centralized error handling

### 3. Data Layer

**Technologies:**
- SQLite (file-based database)
- Raw SQL queries (no ORM)

**Database Schema:**

```sql
-- Recipes table
CREATE TABLE recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  instructions TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Habits table
CREATE TABLE habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Habit completions table
CREATE TABLE habit_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL,
  completed_date DATE NOT NULL,
  FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
  UNIQUE(habit_id, completed_date)
);

-- Blog posts table
CREATE TABLE blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Error Handling Subsystem

**Components:**
- Custom ApiError class
- Global error handler middleware
- Not Found handler
- Request logger
- Process-level error handling (unhandled rejections, uncaught exceptions)
- Graceful shutdown mechanism

**Logging:**
- Custom logger utility
- Log levels (error, warn, info, debug)
- File and console output
- Log rotation
- Contextual information in logs

## Request Lifecycle

1. **Client initiates request**:
   - Browser sends HTTP request to server
   - Static assets are served directly

2. **Request processing**:
   - CORS middleware handles cross-origin requests
   - Body parser middleware parses request body
   - Request logger logs incoming request
   - Route matching determines appropriate handler

3. **API processing**:
   - Route handler receives request
   - Model methods perform database operations
   - Response is formatted
   - Error handling manages exceptions

4. **Response sent**:
   - Response is sent back to client
   - Response logger logs outgoing response

5. **Client processing**:
   - Frontend JavaScript processes response
   - DOM is updated
   - User sees results
   - Error notification shown if needed

## Error Handling Flow

```
┌───────────────────────────┐
│      Client Request       │
└───────────────┬───────────┘
                │
                ▼
┌───────────────────────────┐
│    Request Validation     │◄────┐
└───────────────┬───────────┘     │
                │                 │
                ▼                 │
┌───────────────────────────┐     │
│      Route Handler        │     │
└───────────────┬───────────┘     │
                │                 │
                ▼                 │
┌───────────────────────────┐     │
│     Model Operations      │     │ Error
└───────────────┬───────────┘     │ Propagation
                │                 │
                │                 │
                │  ┌─────────────────────┐
                └─►│  Error Occurs?      │
                   └──────┬──────────────┘
                          │
                          ▼
                   ┌─────────────────────┐
                   │  ApiError Created   │
                   └──────┬──────────────┘
                          │
                          ▼
                   ┌─────────────────────┐
                   │Global Error Handler │
                   └──────┬──────────────┘
                          │
                          ▼
                   ┌─────────────────────┐
                   │    Error Logged     │
                   └──────┬──────────────┘
                          │
                          ▼
                   ┌─────────────────────┐
                   │ Error Response Sent │
                   └──────┬──────────────┘
                          │
                          ▼
                   ┌─────────────────────┐
                   │Client Error Handling│
                   └─────────────────────┘
```

## Key Design Decisions

### 1. Minimal Dependencies

The application intentionally uses minimal external dependencies to:
- Reduce complexity and learning curve
- Minimize security vulnerabilities
- Improve maintenance
- Lower bundle size for faster loading

### 2. SQLite as Database

SQLite was chosen as the database because:
- No separate database server needed
- Simplified deployment (single file)
- Reduced resource usage
- Adequate performance for the expected load
- Transaction support for data integrity

### 3. Single Page Application (SPA) Approach

The frontend uses a single HTML page with tab navigation to:
- Provide a seamless user experience
- Minimize full page reloads
- Share UI components across tools
- Simplify deployment

### 4. RESTful API Design

The API follows REST principles for:
- Standardized CRUD operations
- Predictable URL structure
- Stateless interactions
- Clear separation of concerns
- Easy extensibility

### 5. Comprehensive Error Handling

Robust error handling was implemented to:
- Improve user experience
- Facilitate debugging
- Prevent cascading failures
- Enable graceful recovery
- Provide meaningful feedback

## Scalability Considerations

While the application is intentionally minimal, several design choices allow for future scaling:

1. **Modular Code Structure**: Components are modularized for easier expansion
2. **Isolated Feature Sets**: The three tools are functionally independent
3. **Promise-based Async Operations**: Supports handling increased concurrency
4. **Centralized Error Handling**: Consistent error management as complexity grows
5. **Configurable Logging**: Adjustable logging levels for different environments

## Potential Enhancements

1. **Authentication**: Add user accounts and authentication
2. **Data Export/Import**: Allow data backup and restoration
3. **API Rate Limiting**: Protect against abuse
4. **Caching Layer**: Improve performance for frequently accessed data
5. **Search Functionality**: Full-text search across all components
6. **Mobile App**: Create a mobile version using the same API
7. **Multi-user Support**: Allow collaboration and sharing

## Development Workflow

1. **Local Development**: Run with `npm run dev`
2. **Testing**: Comprehensive test suite with `npm test`
3. **Production**: Deploy with `npm run prod`
4. **Monitoring**: View application logs with `npm run view-logs`

## Deployment Architecture

### Simple Deployment (Current)

```
┌─────────────────────────────────┐
│         Single Server           │
│                                 │
│  ┌─────────────┐  ┌──────────┐  │
│  │ Node.js App │  │ SQLite   │  │
│  └─────────────┘  └──────────┘  │
│                                 │
└─────────────────────────────────┘
```

### Potential Enhanced Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                   Load Balancer / Reverse Proxy             │
└───────────────────────────────┬─────────────────────────────┘
                                │
            ┌──────────────────┬┴┬──────────────────┐
            │                  │                    │
┌───────────▼───────────┐ ┌────▼───────────────┐ ┌──▼───────────────────┐
│    Node.js App #1     │ │   Node.js App #2   │ │    Node.js App #N    │
└───────────┬───────────┘ └────────┬───────────┘ └──────────┬───────────┘
            │                      │                        │
            └──────────────────────┼────────────────────────┘
                                   │
                       ┌───────────▼────────────┐
                       │    Shared Database     │
                       │   (SQLite -> MySQL)    │
                       └────────────────────────┘
```

## Conclusion

The Lifestyle Manager architecture prioritizes simplicity, maintainability, and user experience. The minimal design focuses on delivering core functionality efficiently while maintaining a clean separation of concerns and robust error handling. The architecture is extensible and can be scaled as needed for future enhancements or increased usage.
