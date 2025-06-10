const express = require('express');
const { books } = require('../models/data');
const { isValidISBN, sanitizeSearchText, errorResponse, successResponse } = require('../utils/helpers');
const router = express.Router();

// Get all books – Using async callback function
const getAllBooksAsync = async (callback) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 100));
        callback(null, books);
    } catch (error) {
        callback(error, null);
    }
};

router.get('/async/books', (req, res) => {
    getAllBooksAsync((error, data) => {
        if (error) {
            res.status(500).json(errorResponse('Error retrieving books', 500));
        } else {
            res.json(successResponse(data, 'Books retrieved successfully using async callback'));
        }
    });
});

// Search by ISBN – Using Promises
const getBookByISBNPromise = (isbn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!isValidISBN(isbn)) {
                reject(new Error("Invalid ISBN format"));
                return;
            }
            
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject(new Error("Book not found"));
            }
        }, 100);
    });
};

router.get('/promise/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    getBookByISBNPromise(isbn)
        .then(book => res.json(successResponse(book, 'Book found using promises')))
        .catch(error => {
            const statusCode = error.message === 'Invalid ISBN format' ? 400 : 404;
            res.status(statusCode).json(errorResponse(error.message, statusCode));
        });
});

// Search by Author – Using Promises
const getBooksByAuthorPromise = (author) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const sanitizedAuthor = sanitizeSearchText(author);
            
            if (!sanitizedAuthor) {
                reject(new Error("Author name is required"));
                return;
            }
            
            const booksByAuthor = {};
            
            for (let isbn in books) {
                if (books[isbn].author.toLowerCase().includes(sanitizedAuthor)) {
                    booksByAuthor[isbn] = books[isbn];
                }
            }
            
            if (Object.keys(booksByAuthor).length > 0) {
                resolve(booksByAuthor);
            } else {
                reject(new Error("No books found by this author"));
            }
        }, 100);
    });
};

router.get('/promise/author/:author', (req, res) => {
    const author = req.params.author;
    getBooksByAuthorPromise(author)
        .then(books => res.json(successResponse(books, `Books by author containing "${author}" found using promises`)))
        .catch(error => {
            const statusCode = error.message === 'Author name is required' ? 400 : 404;
            res.status(statusCode).json(errorResponse(error.message, statusCode));
        });
});

// Search by Title – Using Async/Await
const getBooksByTitleAsync = async (title) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const sanitizedTitle = sanitizeSearchText(title);
            
            if (!sanitizedTitle) {
                reject(new Error("Title is required"));
                return;
            }
            
            const booksByTitle = {};
            
            for (let isbn in books) {
                if (books[isbn].title.toLowerCase().includes(sanitizedTitle)) {
                    booksByTitle[isbn] = books[isbn];
                }
            }
            
            if (Object.keys(booksByTitle).length > 0) {
                resolve(booksByTitle);
            } else {
                reject(new Error("No books found with this title"));
            }
        }, 100);
    });
};

router.get('/async/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const books = await getBooksByTitleAsync(title);
        res.json(successResponse(books, `Books with title containing "${title}" found using async/await`));
    } catch (error) {
        const statusCode = error.message === 'Title is required' ? 400 : 404;
        res.status(statusCode).json(errorResponse(error.message, statusCode));
    }
});

module.exports = router;