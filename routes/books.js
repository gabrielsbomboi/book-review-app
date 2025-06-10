const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { books } = require('../models/data');
const { isValidISBN, sanitizeSearchText, isValidReview, errorResponse, successResponse } = require('../utils/helpers');
const router = express.Router();

// Get the book list available in the shop
router.get('/books', (req, res) => {
    res.json(successResponse(books, 'Books retrieved successfully'));
});

// Get the books based on ISBN
router.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    
    if (!isValidISBN(isbn)) {
        return res.status(400).json(errorResponse('Invalid ISBN format', 400));
    }
    
    if (books[isbn]) {
        res.json(successResponse(books[isbn], 'Book found'));
    } else {
        res.status(404).json(errorResponse('Book not found', 404));
    }
});

// Get all books by Author
router.get('/author/:author', (req, res) => {
    const author = sanitizeSearchText(req.params.author);
    
    if (!author) {
        return res.status(400).json(errorResponse('Author name is required', 400));
    }
    
    const booksByAuthor = {};
    
    for (let isbn in books) {
        if (books[isbn].author.toLowerCase().includes(author)) {
            booksByAuthor[isbn] = books[isbn];
        }
    }
    
    if (Object.keys(booksByAuthor).length > 0) {
        res.json(successResponse(booksByAuthor, `Books by author containing "${req.params.author}" found`));
    } else {
        res.status(404).json(errorResponse('No books found by this author', 404));
    }
});

// Get all books based on Title
router.get('/title/:title', (req, res) => {
    const title = sanitizeSearchText(req.params.title);
    
    if (!title) {
        return res.status(400).json(errorResponse('Title is required', 400));
    }
    
    const booksByTitle = {};
    
    for (let isbn in books) {
        if (books[isbn].title.toLowerCase().includes(title)) {
            booksByTitle[isbn] = books[isbn];
        }
    }
    
    if (Object.keys(booksByTitle).length > 0) {
        res.json(successResponse(booksByTitle, `Books with title containing "${req.params.title}" found`));
    } else {
        res.status(404).json(errorResponse('No books found with this title', 404));
    }
});

// Get book Review
router.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    
    if (!isValidISBN(isbn)) {
        return res.status(400).json(errorResponse('Invalid ISBN format', 400));
    }
    
    if (books[isbn]) {
        res.json(successResponse(books[isbn].reviews, 'Reviews retrieved successfully'));
    } else {
        res.status(404).json(errorResponse('Book not found', 404));
    }
});

// Add/Modify a book review
router.put('/auth/review/:isbn', authenticateToken, (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.user.username;
    
    if (!isValidISBN(isbn)) {
        return res.status(400).json(errorResponse('Invalid ISBN format', 400));
    }
    
    if (!books[isbn]) {
        return res.status(404).json(errorResponse('Book not found', 404));
    }
    
    if (!isValidReview(review)) {
        return res.status(400).json(errorResponse('Valid review content is required', 400));
    }
    
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    
    books[isbn].reviews[username] = review.trim();
    res.json(successResponse(null, 'Review added/modified successfully'));
});

// Delete book review
router.delete('/auth/review/:isbn', authenticateToken, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;
    
    if (!isValidISBN(isbn)) {
        return res.status(400).json(errorResponse('Invalid ISBN format', 400));
    }
    
    if (!books[isbn]) {
        return res.status(404).json(errorResponse('Book not found', 404));
    }
    
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json(errorResponse('Review not found', 404));
    }
    
    delete books[isbn].reviews[username];
    res.json(successResponse(null, 'Review deleted successfully'));
});

module.exports = router;