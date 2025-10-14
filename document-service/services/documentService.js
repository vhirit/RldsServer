const documentRepository = require('../repositories/documentRepository');

class DocumentService {
  // Create or get user document
  async createOrGetUserDocument(userId) {
    try {
      let document = await documentRepository.findByUserId(userId);
      
      if (!document) {
        document = await documentRepository.createDocument({
          userId,
          overallStatus: 'INCOMPLETE'
        });
      }

      return document;
    } catch (error) {
      throw new Error(`Document service error: ${error.message}`);
    }
  }

  // Get document by ID
  async getDocumentById(documentId) {
    try {
      const document = await documentRepository.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      return document;
    } catch (error) {
      throw new Error(`Error getting document: ${error.message}`);
    }
  }

  // Get document by user ID
  async getDocumentByUserId(userId) {
    try {
      const document = await documentRepository.findByUserId(userId);
      if (!document) {
        throw new Error('Document not found for user');
      }
      return document;
    } catch (error) {
      throw new Error(`Error getting user document: ${error.message}`);
    }
  }

  // Add personal document
  async addPersonalDocument(documentId, personalDocData) {
    try {
      const document = await documentRepository.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      return await documentRepository.addPersonalDocument(documentId, personalDocData);
    } catch (error) {
      throw new Error(`Error adding personal document: ${error.message}`);
    }
  }

  // Add financial document
  async addFinancialDocument(documentId, financialDocData) {
    try {
      const document = await documentRepository.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      return await documentRepository.addFinancialDocument(documentId, financialDocData);
    } catch (error) {
      throw new Error(`Error adding financial document: ${error.message}`);
    }
  }

  // Add address document
  async addAddressDocument(documentId, addressDocData) {
    try {
      const document = await documentRepository.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      return await documentRepository.addAddressDocument(documentId, addressDocData);
    } catch (error) {
      throw new Error(`Error adding address document: ${error.message}`);
    }
  }

  // Update document status
  async updateDocumentStatus(documentId, status) {
    try {
      const document = await documentRepository.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      return await documentRepository.updateDocumentStatus(documentId, status);
    } catch (error) {
      throw new Error(`Error updating document status: ${error.message}`);
    }
  }

  // Get document completion status
  async getDocumentCompletion(documentId) {
    try {
      const document = await documentRepository.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      const completionSteps = document.completionSteps;
      const totalSteps = Object.keys(completionSteps).length;
      const completedSteps = Object.values(completionSteps).filter(step => step).length;
      const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

      return {
        completionSteps,
        completionPercentage,
        overallStatus: document.overallStatus
      };
    } catch (error) {
      throw new Error(`Error getting document completion: ${error.message}`);
    }
  }

  // Create or get verification for document (supports both single and array types)
  async createOrGetVerification(documentId, verificationType, documentNumber) {
    try {
      const verificationService = require('./verificationService');
      const document = await documentRepository.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Use the enhanced verification service method to handle arrays
      const verificationData = {
        verificationType: verificationType, // Can be array or single value
        documentNumber,
        createdBy: document.userId,
        overallStatus: 'DRAFT',
        documentId: documentId
      };

      const verification = await verificationService.createOrUpdateVerificationWithMultipleTypes(verificationData);

      // Add verification reference to document if not already present
      if (!document.verifications.includes(verification._id)) {
        document.verifications.push(verification._id);
        await document.save();
      }

      return verification;
    } catch (error) {
      throw new Error(`Error creating verification: ${error.message}`);
    }
  }

  // Create multiple verifications for document (multiple types)
  async createMultipleVerifications(documentId, verificationTypes, documentNumber) {
    try {
      const verificationRepository = require('../repositories/verificationRepository');
      const document = await documentRepository.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Map frontend types to backend enum values
      const verificationTypeMapping = {
        'residence': 'RESIDENCE_VERIFICATION',
        'office': 'OFFICE_VERIFICATION', 
        'business': 'BUSINESS_VERIFICATION'
      };

      const createdVerifications = [];
      const skippedVerifications = [];

      // Create verification for each type
      for (const frontendType of verificationTypes) {
        const backendType = verificationTypeMapping[frontendType.toLowerCase()];
        
        if (!backendType) {
          throw new Error(`Invalid verification type: ${frontendType}`);
        }

        // Check if verification with this document number and type already exists
        let existingVerification = await verificationRepository.findByDocumentNumber(documentNumber, backendType);
        
        if (existingVerification) {
          skippedVerifications.push({
            type: frontendType,
            reason: 'Already exists',
            verification: existingVerification
          });
          continue;
        }

        try {
          // Create new verification
          let verification = await verificationRepository.createVerification({
            verificationType: backendType,
            documentNumber,
            createdBy: document.userId,
            overallStatus: 'DRAFT'
          });

          // Add verification reference to document if not already present
          if (!document.verifications.includes(verification._id)) {
            document.verifications.push(verification._id);
          }

          createdVerifications.push({
            type: frontendType,
            backendType: backendType,
            verification: verification
          });

        } catch (verificationError) {
          // Handle duplicate key error - this should only occur for the compound key (documentNumber + verificationType)
          if (verificationError.message.includes('duplicate key') || verificationError.message.includes('E11000')) {
            // This verification type with this document number already exists, skip it
            skippedVerifications.push({
              type: frontendType,
              reason: 'Duplicate verification type for this document number',
              error: verificationError.message
            });
            continue;
          }
          throw verificationError;
        }
      }

      // Save document with new verification references
      await document.save();

      return {
        documentId: document._id,
        documentNumber,
        createdVerifications,
        skippedVerifications,
        totalCreated: createdVerifications.length,
        totalSkipped: skippedVerifications.length
      };

    } catch (error) {
      throw new Error(`Error creating multiple verifications: ${error.message}`);
    }
  }

  // Update verification step
  async updateVerificationStep(documentId, verificationType, documentNumber, stepName, stepData) {
    try {
      const verificationRepository = require('../repositories/verificationRepository');
      
      // Get or create verification
      let verification = await this.createOrGetVerification(documentId, verificationType, documentNumber);

      // Update specific step data
      const updateData = {};
      
      if (stepName === 'administrativeDetails') {
        updateData.administrativeDetails = { ...verification.administrativeDetails, ...stepData };
      } else if (verificationType === 'RESIDENCE_VERIFICATION') {
        updateData[`residenceVerification.${stepName}`] = { 
          ...verification.residenceVerification?.[stepName], 
          ...stepData 
        };
      } else if (verificationType === 'OFFICE_VERIFICATION') {
        updateData[`officeVerification.${stepName}`] = { 
          ...verification.officeVerification?.[stepName], 
          ...stepData 
        };
      } else if (verificationType === 'BUSINESS_VERIFICATION') {
        updateData[`businessVerification.${stepName}`] = { 
          ...verification.businessVerification?.[stepName], 
          ...stepData 
        };
      }

      // Update verification
      verification = await verificationRepository.updateVerification(verification._id, updateData);

      return verification;
    } catch (error) {
      throw new Error(`Error updating verification step: ${error.message}`);
    }
  }

  // Get verification by document number
  async getVerificationByDocumentNumber(documentNumber, verificationType = null) {
    try {
      const verificationRepository = require('../repositories/verificationRepository');
      const verification = await verificationRepository.findByDocumentNumber(documentNumber, verificationType);
      
      if (!verification) {
        throw new Error('Verification not found');
      }

      return verification;
    } catch (error) {
      throw new Error(`Error getting verification: ${error.message}`);
    }
  }

  // Get all verifications for a document
  async getDocumentVerifications(documentId) {
    try {
      const document = await documentRepository.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      await document.populate('verifications');
      return document.verifications;
    } catch (error) {
      throw new Error(`Error getting document verifications: ${error.message}`);
    }
  }
}

module.exports = new DocumentService();