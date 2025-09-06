# API Documentation - Lifestyle Manager

This document provides detailed information about the RESTful API endpoints available in the Lifestyle Manager application.

## Base URL

When running locally, the base URL is:
```
http://localhost:3000/api
```

## Response Format

All API responses are in JSON format.

### Success Response Structure

```json
{
  "id": 1,
  "title": "Example Title",
  "property1": "value1",
  "property2": "value2"
}
```

For array responses:
```json
[
  {
    "id": 1,
    "title": "Example Item 1",
    "property": "value"
  },
  {
    "id": 2,
    "title": "Example Item 2",
    "property": "value"
  }
]
```

### Error Response Structure

```json
{
  "error": true,
  "message": "Error message description",
  "details": "Additional error details (optional)",
  "stack": "Error stack trace (in development only)"
}
```

## Authentication

Currently, the API does not require authentication.

## Rate Limiting

No rate limiting is currently implemented.

## Recipe Manager API

### Get All Recipes

Retrieves a list of all recipes.

- **URL:** `/recipes`
- **Method:** `GET`
- **URL Parameters:** None
- **Query Parameters:**
  - `category` (optional): Filter recipes by category

#### Success Response

- **Code:** 200 OK
- **Content Example:**
```json
[
  {
    "id": 1,
    "title": "Spaghetti Carbonara",
    "category": "Dinner",
    "instructions": "Cook spaghetti. Mix eggs, cheese, pancetta...",
    "created_at": "2025-06-01T15:30:45.000Z"
  },
  {
    "id": 2,
    "title": "Avocado Toast",
    "category": "Breakfast",
    "instructions": "Toast bread. Mash avocado. Spread on toast...",
    "created_at": "2025-06-02T08:15:22.000Z"
  }
]
```

### Get a Specific Recipe

Retrieves a single recipe by its ID.

- **URL:** `/recipes/:id`
- **Method:** `GET`
- **URL Parameters:**
  - `id`: Recipe ID (required)

#### Success Response

- **Code:** 200 OK
- **Content Example:**
```json
{
  "id": 1,
  "title": "Spaghetti Carbonara",
  "category": "Dinner",
  "instructions": "Cook spaghetti. Mix eggs, cheese, pancetta...",
  "created_at": "2025-06-01T15:30:45.000Z"
}
```

#### Error Responses

- **Code:** 404 Not Found
- **Content:** `{ "error": true, "message": "Recipe with ID 999 not found" }`

OR

- **Code:** 400 Bad Request
- **Content:** `{ "error": true, "message": "Invalid recipe ID provided" }`

### Create a New Recipe

Creates a new recipe.

- **URL:** `/recipes`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "title": "Greek Salad",
  "category": "Lunch",
  "instructions": "Chop cucumbers, tomatoes, and red onion. Mix with feta cheese..."
}
```

#### Success Response

- **Code:** 201 Created
- **Content Example:**
```json
{
  "id": 3,
  "title": "Greek Salad",
  "category": "Lunch",
  "instructions": "Chop cucumbers, tomatoes, and red onion. Mix with feta cheese...",
  "created_at": "2025-06-06T12:34:56.000Z"
}
```

#### Error Response

- **Code:** 400 Bad Request
- **Content:** `{ "error": true, "message": "Missing required recipe fields" }`

### Update a Recipe

Updates an existing recipe.

- **URL:** `/recipes/:id`
- **Method:** `PUT`
- **URL Parameters:**
  - `id`: Recipe ID (required)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "title": "Updated Greek Salad",
  "category": "Dinner",
  "instructions": "Updated instructions for Greek salad..."
}
```

#### Success Response

- **Code:** 200 OK
- **Content Example:**
```json
{
  "id": 3,
  "title": "Updated Greek Salad",
  "category": "Dinner",
  "instructions": "Updated instructions for Greek salad...",
  "created_at": "2025-06-06T12:34:56.000Z"
}
```

#### Error Responses

- **Code:** 404 Not Found
- **Content:** `{ "error": true, "message": "Recipe with ID 999 not found" }`

OR

- **Code:** 400 Bad Request
- **Content:** `{ "error": true, "message": "Missing required recipe fields" }`

### Delete a Recipe

Deletes a recipe.

- **URL:** `/recipes/:id`
- **Method:** `DELETE`
- **URL Parameters:**
  - `id`: Recipe ID (required)

#### Success Response

- **Code:** 200 OK
- **Content Example:**
```json
{
  "message": "Recipe deleted successfully",
  "id": 3,
  "deleted": true
}
```

#### Error Response

- **Code:** 404 Not Found
- **Content:** `{ "error": true, "message": "Recipe with ID 999 not found" }`

## Habit Tracker API

### Get All Habits

Retrieves a list of all habits with completion data.

- **URL:** `/habits`
- **Method:** `GET`
- **URL Parameters:** None

#### Success Response

- **Code:** 200 OK
- **Content Example:**
```json
[
  {
    "id": 1,
    "title": "Morning Exercise",
    "created_at": "2025-05-20T08:00:00.000Z",
    "completed_today": 1,
    "current_streak": 5,
    "total_completions": 42,
    "month_completions": 12
  },
  {
    "id": 2,
    "title": "Read a Book",
    "created_at": "2025-05-25T20:15:00.000Z",
    "completed_today": 0,
    "current_streak": 0,
    "total_completions": 15,
    "month_completions": 5
  }
]
```

### Create a New Habit

Creates a new habit.

- **URL:** `/habits`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "title": "Drink Water"
}
```

#### Success Response

- **Code:** 201 Created
- **Content Example:**
```json
{
  "id": 3,
  "title": "Drink Water",
  "created_at": "2025-06-06T12:34:56.000Z"
}
```

#### Error Response

- **Code:** 400 Bad Request
- **Content:** `{ "error": true, "message": "Title is required" }`

### Toggle Habit Completion

Toggles a habit's completion status for a specific date.

- **URL:** `/habits/:id/toggle`
- **Method:** `POST`
- **URL Parameters:**
  - `id`: Habit ID (required)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "date": "2025-06-06"
}
```

#### Success Response

- **Code:** 200 OK
- **Content Example (when marking complete):**
```json
{
  "completed": true,
  "date": "2025-06-06"
}
```

**Content Example (when unmarking):**
```json
{
  "completed": false,
  "date": "2025-06-06"
}
```

#### Error Response

- **Code:** 400 Bad Request
- **Content:** `{ "error": true, "message": "Date is required" }`

### Delete a Habit

Deletes a habit and its completion records.

- **URL:** `/habits/:id`
- **Method:** `DELETE`
- **URL Parameters:**
  - `id`: Habit ID (required)

#### Success Response

- **Code:** 200 OK
- **Content Example:**
```json
{
  "message": "Habit deleted successfully",
  "deleted": true
}
```

#### Error Response

- **Code:** 404 Not Found
- **Content:** `{ "error": true, "message": "Habit not found" }`

## Blog Platform API

### Get All Blog Posts

Retrieves a list of all blog posts.

- **URL:** `/blog`
- **Method:** `GET`
- **URL Parameters:** None

#### Success Response

- **Code:** 200 OK
- **Content Example:**
```json
[
  {
    "id": 1,
    "title": "Getting Started with Healthy Eating",
    "body": "Here are some tips for healthy eating...",
    "created_at": "2025-05-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "title": "Building a Morning Routine",
    "body": "A consistent morning routine can help...",
    "created_at": "2025-05-20T14:45:00.000Z"
  }
]
```

### Get a Specific Blog Post

Retrieves a single blog post by its ID.

- **URL:** `/blog/:id`
- **Method:** `GET`
- **URL Parameters:**
  - `id`: Blog Post ID (required)

#### Success Response

- **Code:** 200 OK
- **Content Example:**
```json
{
  "id": 1,
  "title": "Getting Started with Healthy Eating",
  "body": "Here are some tips for healthy eating...",
  "created_at": "2025-05-15T10:30:00.000Z"
}
```

#### Error Response

- **Code:** 404 Not Found
- **Content:** `{ "error": true, "message": "Blog post not found" }`

### Create a New Blog Post

Creates a new blog post.

- **URL:** `/blog`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "title": "Benefits of Regular Exercise",
  "body": "Regular exercise has many benefits including..."
}
```

#### Success Response

- **Code:** 201 Created
- **Content Example:**
```json
{
  "id": 3,
  "title": "Benefits of Regular Exercise",
  "body": "Regular exercise has many benefits including...",
  "created_at": "2025-06-06T12:34:56.000Z"
}
```

#### Error Response

- **Code:** 400 Bad Request
- **Content:** `{ "error": true, "message": "Title and body are required" }`

### Update a Blog Post

Updates an existing blog post.

- **URL:** `/blog/:id`
- **Method:** `PUT`
- **URL Parameters:**
  - `id`: Blog Post ID (required)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "title": "Updated Title",
  "body": "Updated content for the blog post..."
}
```

#### Success Response

- **Code:** 200 OK
- **Content Example:**
```json
{
  "id": 3,
  "title": "Updated Title",
  "body": "Updated content for the blog post...",
  "created_at": "2025-06-06T12:34:56.000Z"
}
```

#### Error Responses

- **Code:** 404 Not Found
- **Content:** `{ "error": true, "message": "Blog post not found" }`

OR

- **Code:** 400 Bad Request
- **Content:** `{ "error": true, "message": "Title and body are required" }`

### Delete a Blog Post

Deletes a blog post.

- **URL:** `/blog/:id`
- **Method:** `DELETE`
- **URL Parameters:**
  - `id`: Blog Post ID (required)

#### Success Response

- **Code:** 200 OK
- **Content Example:**
```json
{
  "message": "Blog post deleted successfully",
  "deleted": true
}
```

#### Error Response

- **Code:** 404 Not Found
- **Content:** `{ "error": true, "message": "Blog post not found" }`

## Status Codes

The API uses the following status codes:

- `200 OK`: The request was successful
- `201 Created`: The request was successful and a resource was created
- `400 Bad Request`: The request could not be processed due to client error
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: An unexpected server error occurred

## Error Handling

All API endpoints include error handling for:

1. Invalid or missing parameters
2. Non-existent resources
3. Database errors
4. Validation errors

Errors are returned with appropriate HTTP status codes and JSON response bodies containing error details.

## Database Considerations

- Foreign key constraints are enforced (e.g., deleting a habit will cascade delete its completions)
- Unique constraints prevent duplicate data (e.g., habit completions for the same date)
- Timestamps are automatically added to new records

## API Versioning

The current API is v1 (implicit). Future API changes that break compatibility would use explicit versioning:

```
/api/v2/recipes
/api/v2/habits
/api/v2/blog
```
