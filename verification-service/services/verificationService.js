const Verification = require('../models/Verification');
const aiVerification = require('./aiVerification');
const manualReview = require('./manualReview');
const riskAssessment = require('./riskAssessment');

class VerificationService {
    async initiateVerification(documentId, userId) {
        try {
            const verification = new Verification({
                documentId,
                userId,
                status: 'pending',
                initiatedAt: new Date()
            });

            await verification.save();

            // Process verification asynchronously
            this.processVerification(verification._id);

            return verification;
        } catch (error) {
            throw new Error(`Verification initiation failed: ${error.message}`);
        }
    }

    async processVerification(verificationId) {
        try {
            const verification = await Verification.findById(verificationId);
            
            // AI-based document analysis
            const aiResult = await aiVerification.analyzeDocument(verification.documentId);
            
            // Risk assessment
            const riskScore = await riskAssessment.calculateRiskScore(verification, aiResult);
            
            let status = 'pending';
            if (riskScore < 0.3) {
                status = 'approved';
            } else if (riskScore > 0.7) {
                status = 'rejected';
            } else {
                status = 'manual_review';
                await manualReview.queueForReview(verificationId);
            }

            verification.status = status;
            verification.riskScore = riskScore;
            verification.aiResults = aiResult;
            verification.processedAt = new Date();
            
            await verification.save();

            // Emit verification update event
            this.emitVerificationUpdate(verification);

            return verification;
        } catch (error) {
            await Verification.findByIdAndUpdate(verificationId, {
                status: 'failed',
                error: error.message
            });
            throw error;
        }
    }

    async getVerificationStatus(verificationId, userId) {
        try {
            return await Verification.findOne({ _id: verificationId, userId });
        } catch (error) {
            throw new Error(`Failed to fetch verification status: ${error.message}`);
        }
    }

    async getUserVerifications({ userId, page, limit, status }) {
        try {
            const query = { userId };
            if (status) {
                query.status = status;
            }

            const verifications = await Verification.find(query)
                .sort({ initiatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            const total = await Verification.countDocuments(query);

            return {
                verifications,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to fetch verifications: ${error.message}`);
        }
    }

    async updateVerification(verificationId, updateData) {
        try {
            const verification = await Verification.findById(verificationId);
            
            if (!verification) {
                throw new Error('Verification not found');
            }

            Object.assign(verification, updateData);
            verification.reviewedAt = new Date();
            
            await verification.save();

            // Emit update event
            this.emitVerificationUpdate(verification);

            return verification;
        } catch (error) {
            throw new Error(`Verification update failed: ${error.message}`);
        }
    }

    emitVerificationUpdate(verification) {
        // This would typically publish to a message queue or WebSocket service
        console.log('Verification update:', {
            verificationId: verification._id,
            userId: verification.userId,
            status: verification.status,
            riskScore: verification.riskScore
        });
    }
}

module.exports = new VerificationService();