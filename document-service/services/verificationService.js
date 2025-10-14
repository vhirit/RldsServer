    const verificationRepository = require('../repositories/verificationRepository');
const documentRepository = require('../repositories/documentRepository');

class VerificationService {
  // Create new verification
  async createVerification(verificationData) {
    try {
      // Check if document number already exists
      const existingVerification = await verificationRepository.findByDocumentNumber(
        verificationData.documentNumber
      );

      if (existingVerification) {
        // If verification exists, check if we need to add more verification types
        if (Array.isArray(verificationData.verificationType)) {
          // Add new verification types to existing verification
          const existingTypes = Array.isArray(existingVerification.verificationType) 
            ? existingVerification.verificationType 
            : [existingVerification.verificationType];
          
          const newTypes = verificationData.verificationType.filter(
            type => !existingTypes.includes(type)
          );
          
          if (newTypes.length > 0) {
            const updatedTypes = [...existingTypes, ...newTypes];
            const updateData = { verificationType: updatedTypes };
            
            return await verificationRepository.updateVerification(
              existingVerification._id, 
              updateData
            );
          }
        }
        return existingVerification; // Return existing if no new types to add
      }

      // Ensure verificationType is always an array
      if (!Array.isArray(verificationData.verificationType)) {
        verificationData.verificationType = [verificationData.verificationType];
      }

      // Create verification
      const verification = await verificationRepository.createVerification(verificationData);

      // Link verification to user's main document if documentId is provided
      if (verificationData.documentId) {
        await documentRepository.addVerification(
          verificationData.documentId,
          verification._id
        );
      }

      return verification;
    } catch (error) {
      throw new Error(`Verification service error: ${error.message}`);
    }
  }

  // Get verification by ID
  async getVerificationById(verificationId) {
    try {
      const verification = await verificationRepository.findById(verificationId);
      if (!verification) {
        throw new Error('Verification not found');
      }
      return verification;
    } catch (error) {
      throw new Error(`Error getting verification: ${error.message}`);
    }
  }

  // Get verifications by type
  async getVerificationsByType(verificationType, page, limit) {
    try {
      return await verificationRepository.findByVerificationType(
        verificationType,
        page,
        limit
      );
    } catch (error) {
      throw new Error(`Error getting verifications by type: ${error.message}`);
    }
  }

  // Get user verifications
  async getUserVerifications(userId, page, limit) {
    try {
      return await verificationRepository.findByUser(userId, page, limit);
    } catch (error) {
      throw new Error(`Error getting user verifications: ${error.message}`);
    }
  }

  // Update verification
  async updateVerification(verificationId, updateData, userId) {
    try {
      const verification = await verificationRepository.findById(verificationId);
      if (!verification) {
        throw new Error('Verification not found');
      }

      // Add updatedBy field
      updateData.updatedBy = userId;

      return await verificationRepository.updateVerification(verificationId, updateData);
    } catch (error) {
      throw new Error(`Error updating verification: ${error.message}`);
    }
  }

  // Update verification status
  async updateVerificationStatus(verificationId, status, verifiedBy) {
    try {
      const verification = await verificationRepository.findById(verificationId);
      if (!verification) {
        throw new Error('Verification not found');
      }

      return await verificationRepository.updateVerificationStatus(
        verificationId,
        status,
        verifiedBy
      );
    } catch (error) {
      throw new Error(`Error updating verification status: ${error.message}`);
    }
  }

  // Add document to verification
  async addDocumentToVerification(verificationId, documentData) {
    try {
      const verification = await verificationRepository.findById(verificationId);
      if (!verification) {
        throw new Error('Verification not found');
      }

      return await verificationRepository.addDocument(verificationId, documentData);
    } catch (error) {
      throw new Error(`Error adding document to verification: ${error.message}`);
    }
  }

  // Delete verification
  async deleteVerification(verificationId) {
    try {
      const verification = await verificationRepository.findById(verificationId);
      if (!verification) {
        throw new Error('Verification not found');
      }

      return await verificationRepository.deleteVerification(verificationId);
    } catch (error) {
      throw new Error(`Error deleting verification: ${error.message}`);
    }
  }

  // Get verification statistics
  async getVerificationStatistics(userId = null) {
    try {
      return await verificationRepository.getStatistics(userId);
    } catch (error) {
      throw new Error(`Error getting verification statistics: ${error.message}`);
    }
  }

  // Get completion percentage
  async getCompletionPercentage(verificationId) {
    try {
      const verification = await verificationRepository.findById(verificationId);
      if (!verification) {
        throw new Error('Verification not found');
      }

      return verification.completionPercentage;
    } catch (error) {
      throw new Error(`Error getting completion percentage: ${error.message}`);
    }
  }

  // Create or update verification with multiple types in single document
  async createOrUpdateVerificationWithMultipleTypes(verificationData) {
    try {
      // Check if document number already exists
      const existingVerification = await verificationRepository.findByDocumentNumber(
        verificationData.documentNumber
      );

      if (existingVerification) {
        // Update existing verification with new verification types
        const existingTypes = Array.isArray(existingVerification.verificationType) 
          ? existingVerification.verificationType 
          : [existingVerification.verificationType];
        
        const newTypes = Array.isArray(verificationData.verificationType)
          ? verificationData.verificationType
          : [verificationData.verificationType];
        
        // Merge unique verification types
        const mergedTypes = [...new Set([...existingTypes, ...newTypes])];
        
        const updateData = { 
          verificationType: mergedTypes 
        };
        
        const updatedVerification = await verificationRepository.updateVerification(
          existingVerification._id, 
          updateData
        );
        
        return updatedVerification;
      }

      // Create new verification with array of verification types
      const newVerificationData = {
        verificationType: Array.isArray(verificationData.verificationType)
          ? verificationData.verificationType
          : [verificationData.verificationType],
        documentNumber: verificationData.documentNumber,
        createdBy: typeof verificationData.createdBy === 'object' 
          ? verificationData.createdBy._id 
          : verificationData.createdBy,
        overallStatus: verificationData.overallStatus || 'DRAFT'
      };

      const verification = await verificationRepository.createVerification(newVerificationData);

      // Link verification to user's main document if documentId is provided
      if (verificationData.documentId) {
        await documentRepository.addVerification(
          verificationData.documentId,
          verification._id
        );
      }

      return verification;
    } catch (error) {
      throw new Error(`Error creating/updating verification with multiple types: ${error.message}`);
    }
  }
}

module.exports = new VerificationService();