const Verification = require('../models/Verification');

class VerificationRepository {
  // Create new verification
  async createVerification(verificationData) {
    try {
      console.log('Repository - Creating verification with data:', JSON.stringify(verificationData, null, 2));
      const verification = new Verification(verificationData);
      console.log('Repository - Verification instance created, saving...');
      const saved = await verification.save();
      console.log('Repository - Successfully saved verification');
      return saved;
    } catch (error) {
      console.error('Repository - Error creating verification:', error);
      throw new Error(`Error creating verification: ${error.message}`);
    }
  }

  // Find verification by ID
  async findById(verificationId) {
    try {
      return await Verification.findById(verificationId);
    } catch (error) {
      throw new Error(`Error finding verification: ${error.message}`);
    }
  }

  // Find verification by document number
  async findByDocumentNumber(documentNumber, verificationType = null) {
    try {
      const query = { documentNumber };
      if (verificationType) {
        query.verificationType = verificationType;
      }
      return await Verification.findOne(query);
    } catch (error) {
      throw new Error(`Error finding verification by document number: ${error.message}`);
    }
  }

  // Find all verifications by document number (across all types)
  async findAllByDocumentNumber(documentNumber) {
    try {
      return await Verification.find({ documentNumber });
    } catch (error) {
      throw new Error(`Error finding all verifications by document number: ${error.message}`);
    }
  }

  // Find verifications by type
  async findByVerificationType(verificationType, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = { verificationType };
      
      const [verifications, total] = await Promise.all([
        Verification.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Verification.countDocuments(query)
      ]);

      return {
        verifications,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      };
    } catch (error) {
      throw new Error(`Error finding verifications by type: ${error.message}`);
    }
  }

  // Find verifications by user
  async findByUser(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = { createdBy: userId };
      
      const [verifications, total] = await Promise.all([
        Verification.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Verification.countDocuments(query)
      ]);

      return {
        verifications,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      };
    } catch (error) {
      throw new Error(`Error finding user verifications: ${error.message}`);
    }
  }

  // Update verification
  async updateVerification(verificationId, updateData) {
    try {
      return await Verification.findByIdAndUpdate(
        verificationId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error updating verification: ${error.message}`);
    }
  }

  // Update verification status
  async updateVerificationStatus(verificationId, status, verifiedBy) {
    try {
      const updateData = {
        'verificationStatus.status': status,
        'verificationStatus.verifiedBy': verifiedBy,
        'verificationStatus.verificationDate': new Date()
      };

      return await Verification.findByIdAndUpdate(
        verificationId,
        { $set: updateData },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating verification status: ${error.message}`);
    }
  }

  // Add document to verification
  async addDocument(verificationId, documentData) {
    try {
      return await Verification.findByIdAndUpdate(
        verificationId,
        { $push: { documents: documentData } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error adding document: ${error.message}`);
    }
  }

  // Delete verification
  async deleteVerification(verificationId) {
    try {
      return await Verification.findByIdAndDelete(verificationId);
    } catch (error) {
      throw new Error(`Error deleting verification: ${error.message}`);
    }
  }

  // Get verification statistics
  async getStatistics(userId = null) {
    try {
      const matchStage = userId ? { createdBy: userId } : {};
      
      const stats = await Verification.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$verificationType',
            total: { $sum: 1 },
            verified: {
              $sum: {
                $cond: [{ $eq: ['$overallStatus', 'VERIFIED'] }, 1, 0]
              }
            },
            pending: {
              $sum: {
                $cond: [{ $eq: ['$overallStatus', 'PENDING'] }, 1, 0]
              }
            },
            rejected: {
              $sum: {
                $cond: [{ $eq: ['$overallStatus', 'REJECTED'] }, 1, 0]
              }
            }
          }
        }
      ]);

      return stats;
    } catch (error) {
      throw new Error(`Error getting statistics: ${error.message}`);
    }
  }
}

module.exports = new VerificationRepository();