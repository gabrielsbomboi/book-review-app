const isValidISBN = (isbn) => {
    return /^\d+$/.test(isbn) && isbn.length > 0;
};

const sanitizeSearchText = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.trim().toLowerCase();
};

const isValidReview = (review) => {
    return review && typeof review === 'string' && review.trim().length > 0;
};

const errorResponse = (message, statusCode = 500) => {
    return {
        error: true,
        message,
        statusCode,
        timestamp: new Date().toISOString()
    };
};

const successResponse = (data, message = 'Success') => {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
};

module.exports = {
    isValidISBN,
    sanitizeSearchText,
    isValidReview,
    errorResponse,
    successResponse
};