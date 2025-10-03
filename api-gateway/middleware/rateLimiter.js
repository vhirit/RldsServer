const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests, please try again later'
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // limit auth attempts
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later'
    }
});

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // limit file uploads
    message: {
        success: false,
        error: 'Too many file uploads, please try again later'
    }
});

module.exports = { generalLimiter, authLimiter, uploadLimiter };