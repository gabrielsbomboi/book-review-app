Developing Back-End Apps with Node.js and Express IBM course

# Book Review API - Endpoints

## General User Endpoints (No Authentication Required)

### GET /books
- Get all books available in the shop
- Response: JSON object with all books

### GET /isbn/:isbn
- Get book by ISBN
- Example: GET /isbn/1

### GET /author/:author
- Get books by author name
- Example: GET /author/jane

### GET /title/:title
- Get books by title
- Example: GET /title/pride

### GET /review/:isbn
- Get reviews for a book
- Example: GET /review/1

## Authentication Endpoints

### POST /register
- Register new user
- Body: { "username": "user", "password": "pass" }

### POST /login
- Login user
- Body: { "username": "user", "password": "pass" }
- Returns: JWT token

## Authenticated Endpoints (Require JWT Token)

### PUT /auth/review/:isbn
- Add/modify book review
- Headers: Authorization: Bearer TOKEN
- Body: { "review": "review text" }

### DELETE /auth/review/:isbn
- Delete book review
- Headers: Authorization: Bearer TOKEN

## Async/Promise Endpoints

### GET /async/books
- Get all books using async callback

### GET /promise/isbn/:isbn
- Get book by ISBN using promises

### GET /promise/author/:author
- Get books by author using promises

### GET /async/title/:title
- Get books by title using async/await
