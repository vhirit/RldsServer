const documentService = require('../services/documentService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class DocumentController {
  // Create or get user document
  async createOrGetUserDocument(req, res) {
    try {
      // Try multiple sources for user ID
      const userId = req.user?.id || req.user?._id || req.userId || req.user;
      
      console.log('User ID from request:', userId);
      console.log('Request user object:', req.user);
      console.log('Request headers:', req.headers);
      
      if (!userId) {
        return errorResponse(res, 'User ID not found. Please ensure you are authenticated.', 401);
      }

      const document = await documentService.createOrGetUserDocument(userId);
      successResponse(res, 'Document retrieved successfully', document);
    } catch (error) {
      console.error('Error in createOrGetUserDocument:', error);
      errorResponse(res, error.message, 400);
    }
  }

  // Get document by ID
  async getDocument(req, res) {
    try {
      const { id } = req.params;
      const document = await documentService.getDocumentById(id);
      successResponse(res, 'Document retrieved successfully', document);
    } catch (error) {
      errorResponse(res, error.message, 404);
    }
  }

  // Get document by user ID
  async getDocumentByUser(req, res) {
    try {
      const userId = req.user?.id || req.user?._id || req.userId || req.user;
      
      if (!userId) {
        return errorResponse(res, 'User ID not found. Please ensure you are authenticated.', 401);
      }

      const document = await documentService.getDocumentByUserId(userId);
      successResponse(res, 'User document retrieved successfully', document);
    } catch (error) {
      errorResponse(res, error.message, 404);
    }
  }

  // Add personal document
  async addPersonalDocument(req, res) {
    try {
      const { id } = req.params;
      const personalDocData = req.body;

      const document = await documentService.addPersonalDocument(id, personalDocData);
      successResponse(res, 'Personal document added successfully', document);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Add financial document
  async addFinancialDocument(req, res) {
    try {
      const { id } = req.params;
      const financialDocData = req.body;

      const document = await documentService.addFinancialDocument(id, financialDocData);
      successResponse(res, 'Financial document added successfully', document);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Add address document
  async addAddressDocument(req, res) {
    try {
      const { id } = req.params;
      const addressDocData = req.body;

      const document = await documentService.addAddressDocument(id, addressDocData);
      successResponse(res, 'Address document added successfully', document);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Update document status
  async updateDocumentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const document = await documentService.updateDocumentStatus(id, status);
      successResponse(res, 'Document status updated successfully', document);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Get document completion
  async getDocumentCompletion(req, res) {
    try {
      const { id } = req.params;
      const completion = await documentService.getDocumentCompletion(id);
      successResponse(res, 'Document completion retrieved successfully', completion);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Create or get verification (supports both single type and array)
  async createOrGetVerification(req, res) {
    try {
      const { id } = req.params;
      const { verificationType, documentNumber } = req.body;

      console.log('DocumentController - Request body:', JSON.stringify(req.body, null, 2));
      console.log('DocumentController - verificationType is array:', Array.isArray(verificationType));

      if (!verificationType || !documentNumber) {
        return errorResponse(res, 'Verification type and document number are required', 400);
      }

      // Handle both array and single verificationType
      const verification = await documentService.createOrGetVerification(id, verificationType, documentNumber);
      successResponse(res, 'Verification created/retrieved successfully', verification);
    } catch (error) {
      console.error('DocumentController - Error details:', error);
      errorResponse(res, error.message, 400);
    }
  }

  // Create multiple verifications (multiple types)
  async createMultipleVerifications(req, res) {
    try {
      const { id } = req.params;
      const { selectedTypes, documentNumber } = req.body;

      if (!selectedTypes || !Array.isArray(selectedTypes) || selectedTypes.length === 0) {
        return errorResponse(res, 'Selected verification types array is required', 400);
      }

      if (!documentNumber) {
        return errorResponse(res, 'Document number is required', 400);
      }

      const result = await documentService.createMultipleVerifications(id, selectedTypes, documentNumber);
      
      // Customize response message based on results
      let message = 'Verifications processed successfully';
      if (result.totalCreated > 0 && result.totalSkipped > 0) {
        message = `${result.totalCreated} verification(s) created, ${result.totalSkipped} already existed`;
      } else if (result.totalCreated > 0) {
        message = `${result.totalCreated} verification(s) created successfully`;
      } else if (result.totalSkipped > 0) {
        message = `All ${result.totalSkipped} verification(s) already existed`;
      }

      successResponse(res, message, result, 201);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Update verification step
  async updateVerificationStep(req, res) {
    try {
      const { id, stepName } = req.params;
      const { verificationType, documentNumber, ...stepData } = req.body;

      if (!verificationType || !documentNumber) {
        return errorResponse(res, 'Verification type and document number are required', 400);
      }

      const verification = await documentService.updateVerificationStep(
        id, 
        verificationType, 
        documentNumber, 
        stepName, 
        stepData
      );

      successResponse(res, `${stepName} updated successfully`, verification);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  // Get verification by document number
  async getVerificationByDocumentNumber(req, res) {
    try {
      const { documentNumber } = req.params;
      const { verificationType } = req.query;

      const verification = await documentService.getVerificationByDocumentNumber(documentNumber, verificationType);
      successResponse(res, 'Verification retrieved successfully', verification);
    } catch (error) {
      errorResponse(res, error.message, 404);
    }
  }

  // Get all verifications for a document
  async getDocumentVerifications(req, res) {
    try {
      const { id } = req.params;
      const verifications = await documentService.getDocumentVerifications(id);
      successResponse(res, 'Document verifications retrieved successfully', verifications);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new DocumentController();