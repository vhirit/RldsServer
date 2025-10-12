const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./utils/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(rateLimiter);
app.use(express.json());
app.use(logger.requestLogger);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Public routes (no authentication required)
app.use('/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
    changeOrigin: true,
    onError: (err, req, res) => {
        errorHandler.handleGatewayError(err, req, res, 'auth-service');
    }
}));

// Protected routes
app.use('/users', authMiddleware, createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://localhost:3000',
    changeOrigin: true,
    onError: (err, req, res) => {
        errorHandler.handleGatewayError(err, req, res, 'user-service');
    }
}));

app.use('/documents', authMiddleware, createProxyMiddleware({
    target: process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    onError: (err, req, res) => {
        errorHandler.handleGatewayError(err, req, res, 'document-service');
    }
}));

app.use('/verifications', authMiddleware, createProxyMiddleware({
    target: process.env.VERIFICATION_SERVICE_URL || 'http://localhost:3003',
    changeOrigin: true,
    onError: (err, req, res) => {
        errorHandler.handleGatewayError(err, req, res, 'verification-service');
    }
}));

app.use('/notifications', authMiddleware, createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
    changeOrigin: true,
    onError: (err, req, res) => {
        errorHandler.handleGatewayError(err, req, res, 'notification-service');
    }
}));

// Error handling middleware
app.use(errorHandler.gatewayErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
});