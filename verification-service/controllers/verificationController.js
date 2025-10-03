const verificationService = require('../services/verificationService');
const { validationResult } = require('express-validator');

class VerificationController {
    async initiateVerification(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { userId } = req.user;
            const { documentId } = req.body;

            const verification = await verificationService.initiateVerification(documentId, userId);

            res.status(201).json({
                success: true,
                data: verification,
                message: 'Verification process initiated'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getVerificationStatus(req, res) {
        try {
            const { verificationId } = req.params;
            const { userId } = req.user;

            const verification = await verificationService.getVerificationStatus(verificationId, userId);

            if (!verification) {
                return res.status(404).json({
                    success: false,
                    error: 'Verification not found'
                });
            }

            res.json({
                success: true,
                data: verification
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getUserVerifications(req, res) {
        try {
            const { userId } = req.user;
            const { page = 1, limit = 10, status } = req.query;

            const verifications = await verificationService.getUserVerifications({
                userId,
                page: parseInt(page),
                limit: parseInt(limit),
                status
            });

            res.json({
                success: true,
                data: verifications
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async updateVerification(req, res) {
        try {
            const { verificationId } = req.params;
            const { status, notes } = req.body;
            const { userId, role } = req.user;

            // Only admins/verifiers can update verification status
            if (!['admin', 'verifier'].includes(role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
            }

            const verification = await verificationService.updateVerification(
                verificationId, 
                { status, notes, reviewedBy: userId }
            );

            res.json({
                success: true,
                data: verification,
                message: 'Verification updated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new VerificationController();