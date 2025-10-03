const authService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {
    async register(req, res) {
        try {
            const result = await authService.registerUser(req.body);
            
            res.status(201).json({
                success: true,
                data: {
                    user: result.user,
                    token: result.token
                },
                message: 'User registered successfully'
            });
        } catch (error) {
            if (error.message.includes('User already exists')) {
                return res.status(409).json({
                    success: false,
                    error: error.message
                });
            }
            
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.authenticateUser(email, password);
            
            res.json({
                success: true,
                data: {
                    user: result.user,
                    token: result.token
                },
                message: 'Login successful'
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                error: error.message
            });
        }
    }

    async logout(req, res) {
        try {
            await authService.logout(req.token);
            
            res.json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Logout failed'
            });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            
            res.json({
                success: true,
                message: result.message,
                // In production, remove the resetToken from response
                resetToken: process.env.NODE_ENV === 'development' ? result.resetToken : undefined
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            const result = await authService.resetPassword(token, password);
            
            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    async getProfile(req, res) {
        try {
            // This would typically fetch fresh user data from database
            res.json({
                success: true,
                data: {
                    user: req.user
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch profile'
            });
        }
    }

    async validateToken(req, res) {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: 'Token required'
                });
            }

            const isValid = await authService.validateToken(token);
            
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid token'
                });
            }

            res.json({
                success: true,
                data: {
                    valid: true,
                    user: req.user
                }
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }
    }
}

module.exports = new AuthController();