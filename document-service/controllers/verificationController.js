const verificationService = require('../services/verificationService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class VerificationController {
  // Create new verification
  async createVerification(req, res) {
    try {
      const verificationData = {
        ...req.body,
        createdBy: req.user.id // From auth middleware
      };

      const verification = await verificationService.createVerification(verificationData);
      successResponse(res, 'Verification created successfully', verification, 201);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Get verification by ID
  async getVerification(req, res) {
    try {
      const { id } = req.params;
      const verification = await verificationService.getVerificationById(id);
      successResponse(res, 'Verification retrieved successfully', verification);
    } catch (error) {
      errorResponse(res, error.message, 404);
    }
  }

  // Get verifications by type
  async getVerificationsByType(req, res) {
    try {
      const { type } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await verificationService.getVerificationsByType(type, parseInt(page), parseInt(limit));
      successResponse(res, 'Verifications retrieved successfully', result);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Get user verifications
  async getUserVerifications(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user.id;

      const result = await verificationService.getUserVerifications(userId, parseInt(page), parseInt(limit));
      successResponse(res, 'User verifications retrieved successfully', result);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Update verification
  async updateVerification(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;

      const verification = await verificationService.updateVerification(id, updateData, userId);
      successResponse(res, 'Verification updated successfully', verification);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Update verification status
  async updateVerificationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const verifiedBy = req.user.id;

      const verification = await verificationService.updateVerificationStatus(id, status, verifiedBy);
      successResponse(res, 'Verification status updated successfully', verification);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Add document to verification
  async addDocumentToVerification(req, res) {
    try {
      const { id } = req.params;
      const documentData = req.body;

      const verification = await verificationService.addDocumentToVerification(id, documentData);
      successResponse(res, 'Document added to verification successfully', verification);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Delete verification
  async deleteVerification(req, res) {
    try {
      const { id } = req.params;
      await verificationService.deleteVerification(id);
      successResponse(res, 'Verification deleted successfully');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Get verification statistics
  async getVerificationStatistics(req, res) {
    try {
      const userId = req.query.userId || null;
      const statistics = await verificationService.getVerificationStatistics(userId);
      successResponse(res, 'Statistics retrieved successfully', statistics);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Get completion percentage
  async getCompletionPercentage(req, res) {
    try {
      const { id } = req.params;
      const percentage = await verificationService.getCompletionPercentage(id);
      successResponse(res, 'Completion percentage retrieved successfully', { percentage });
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new VerificationController();