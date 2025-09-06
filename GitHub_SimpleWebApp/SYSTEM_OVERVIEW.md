# System Overview - Lifestyle Manager

This document provides a high-level overview of the Lifestyle Manager application architecture, showing how all components interact to form a cohesive system.

## Complete System Architecture

The following diagram illustrates the complete architecture of the Lifestyle Manager application, including all major components and their interactions:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             CLIENT BROWSER                              │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │  Recipe Manager │  │  Habit Tracker  │  │  Blog Platform          │  │
│  │                 │  │                 │  │                         │  │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────────────┐ │  │
│  │ │ Form Inputs │ │  │ │ Form Inputs │ │  │ │ Form Inputs         │ │  │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────────────┘ │  │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────────────┐ │  │
│  │ │ Display List│ │  │ │ Display List│ │  │ │ Display List        │ │  │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────────────┘ │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │               Client-side Error Handling & Notifications         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                │ AJAX/Fetch API Calls
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           EXPRESS.JS SERVER                             │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                          Middleware                             │    │
│  │                                                                 │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │    │
│  │  │ CORS       │  │ BodyParser │  │ Static     │  │ Request   │  │    │
│  │  │            │  │            │  │ Files      │  │ Logger    │  │    │
│  │  └────────────┘  └────────────┘  └────────────┘  └───────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                            Routes                               │    │
│  │                                                                 │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │    │
│  │  │ /api/      │  │ /api/      │  │ /api/      │                 │    │
│  │  │ recipes    │  │ habits     │  │ blog       │                 │    │
│  │  └────────────┘  └────────────┘  └────────────┘                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                           Models                                │    │
│  │                                                                 │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │    │
│  │  │ Recipe     │  │ Habit      │  │ Blog       │                 │    │
│  │  │ Model      │  │ Model      │  │ Model      │                 │    │
│  │  └────────────┘  └────────────┘  └────────────┘                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Error Handling System                      │    │
│  │                                                                 │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │    │
│  │  │ ApiError   │  │ Error      │  │ NotFound   │  │ Process   │  │    │
│  │  │ Class      │  │ Handler    │  │ Handler    │  │ Handlers  │  │    │
│  │  └────────────┘  └────────────┘  └────────────┘  └───────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        Logging System                           │    │
│  │                                                                 │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │    │
│  │  │ Logger     │  │ Log        │  │ Log        │                 │    │
│  │  │ Utility    │  │ Levels     │  │ Rotation   │                 │    │
│  │  └────────────┘  └────────────┘  └────────────┘                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                │ SQL Queries
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SQLITE DATABASE                               │
│                                                                         │
│  ┌────────────────┐  ┌──────────────────┐  ┌───────────────┐            │
│  │ recipes        │  │ habits           │  │ blog_posts    │            │
│  │                │  │                  │  │               │            │
│  │ - id           │  │ - id             │  │ - id          │            │
│  │ - title        │  │ - title          │  │ - title       │            │
│  │ - category     │  │ - created_at     │  │ - body        │            │
│  │ - instructions │  └──────────────────┘  │ - created_at  │            │
│  │ - created_at   │  ┌──────────────────┐  └───────────────┘            │
│  └────────────────┘  │ habit_completions│                               │
│                      │                  │                               │
│                      │ - id             │                               │
│                      │ - habit_id       │                               │
│                      │ - completed_date │                               │
│                      └──────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Interactions

### Frontend to Backend Communication

1. **User Interaction Flow**:
   ```
   User Action → Form Submission → AJAX Request → API Endpoint → Database Operation → Response → UI Update
   ```

2. **Error Flow**:
   ```
   Error Occurs → ApiError Created → Error Handler → Logger → Error Response → Client Error Handler → User Notification
   ```

### Data Flow Through System Layers

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Presentation │     │    Routes     │     │    Models     │     │   Database    │
│    Layer      │────►│    Layer      │────►│    Layer      │────►│    Layer      │
│ (HTML/JS/CSS) │     │ (Express.js)  │     │ (Data Models) │     │   (SQLite)    │
└───────────────┘     └───────────────┘     └───────────────┘     └───────────────┘
        ▲                     │                     │                     │
        │                     │                     │                     │
        └─────────────────────┴─────────────────────┴─────────────────────┘
                                 Response Flow
```

## Cross-Cutting Concerns

These concerns span across multiple architectural layers:

### 1. Error Handling System

```
┌──────────────────────┐
│    Error Handling    │
├──────────────────────┤
│                      │
│  ┌───────────────┐   │     ┌───────────────┐     ┌───────────────┐
│  │ Client-side   │   │     │  Server-side  │     │   Database    │
│  │ Error Handling│◄──┼─────┤ Error Handling│◄────┤   Errors      │
│  └───────────────┘   │     └───────────────┘     └───────────────┘
│                      │
└──────────────────────┘
```

### 2. Logging System

```
┌──────────────────────┐
│   Logging System     │
├──────────────────────┤
│                      │
│  ┌───────────────┐   │     ┌───────────────┐     ┌───────────────┐
│  │ Application   │   │     │  Server       │     │   Database    │
│  │ Events        │──►│     │  Events       │     │   Events      │
│  └───────────────┘   │     └───────────────┘     └───────────────┘
│         │            │           │                     │
│         └────────────┼───────────┴─────────────────────┘
│                      │                │
│                      │                ▼
│                      │        ┌───────────────┐
│                      │        │   Log Files   │
│                      │        └───────────────┘
└──────────────────────┘
```

## Testing Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                      Test Architecture                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐│
│  │   Unit Tests  │     │  Integration  │     │    E2E Tests  ││
│  │               │     │    Tests      │     │               ││
│  └───────────────┘     └───────────────┘     └───────────────┘│
│                                                               │
│  ┌───────────────────────────────────────────────────────────┐│
│  │                   Test Infrastructure                     ││
│  │                                                           ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   ││
│  │  │Test Database│  │Test Server │  │Test Configuration  │   ││
│  │  └────────────┘  └────────────┘  └────────────────────┘   ││
│  │                                                           ││
│  │  ┌────────────────────┐  ┌────────────────────────────┐   ││
│  │  │ Mock Objects       │  │ Test Fixtures              │   ││
│  │  └────────────────────┘  └────────────────────────────┘   ││
│  └───────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────┘
```

## System States

### Initialization Sequence

1. Database setup and schema validation
2. Express server configuration
3. Middleware registration
4. Route registration
5. Error handler registration
6. Server startup

### Request Processing State

1. Request received
2. Request logged
3. CORS and body parsing
4. Route matching and handling
5. Model operations
6. Response generation
7. Response sent

### Error State

1. Error detected
2. ApiError created with appropriate status
3. Error logged with context
4. Error response sent to client
5. Client displays error notification

### Shutdown Sequence

1. SIGTERM signal received
2. Active connections completed
3. Server stopped
4. Database connections closed
5. Final log messages
6. Process terminated

## Integration Points

### Internal Integration

- **Routes to Models**: Data validation and persistence
- **Models to Database**: SQL operations and error handling
- **Error Handler to Logger**: Logging of errors with context
- **Server to Process Events**: Graceful shutdown handling

### External Integration Possibilities

- **Authentication Service**: For user management (future)
- **Cloud Storage**: For media files (future)
- **Email Service**: For notifications (future)
- **Analytics Service**: For usage tracking (future)

## Conclusion

The Lifestyle Manager application follows a clean, layered architecture with clear separation of concerns. The system is designed to be maintainable, testable, and extensible while keeping the implementation minimal and lightweight. 

The architecture allows for:
- Independent development of different components
- Comprehensive testing at all levels
- Robust error handling and logging
- Potential future enhancements and scaling

For more detailed information, refer to the following documentation:
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API_DOCS.md)
- [Error Handling Documentation](./ERROR_HANDLING.md)
- [Testing Strategy](./TESTING.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
