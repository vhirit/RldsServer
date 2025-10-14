const Document = require('../models/Document');

class DocumentRepository {
  // Create new document
  async createDocument(documentData) {
    try {
      const document = new Document(documentData);
      return await document.save();
    } catch (error) {
      throw new Error(`Error creating document: ${error.message}`);
    }
  }

  // Find document by ID
  async findById(documentId) {
    try {
      return await Document.findById(documentId)
        .populate('verifications')
        .populate('userId');
    } catch (error) {
      throw new Error(`Error finding document: ${error.message}`);
    }
  }

  // Find document by user ID
  async findByUserId(userId) {
    try {
      return await Document.findOne({ userId })
        .populate('verifications')
        .populate('userId');
    } catch (error) {
      throw new Error(`Error finding user document: ${error.message}`);
    }
  }

  // Add verification to document
  async addVerification(documentId, verificationId) {
    try {
      return await Document.findByIdAndUpdate(
        documentId,
        { $push: { verifications: verificationId } },
        { new: true }
      ).populate('verifications');
    } catch (error) {
      throw new Error(`Error adding verification to document: ${error.message}`);
    }
  }

  // Update document status
  async updateDocumentStatus(documentId, status) {
    try {
      return await Document.findByIdAndUpdate(
        documentId,
        { $set: { overallStatus: status } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating document status: ${error.message}`);
    }
  }

  // Add personal document
  async addPersonalDocument(documentId, personalDocData) {
    try {
      return await Document.findByIdAndUpdate(
        documentId,
        { $push: { personalDocuments: personalDocData } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error adding personal document: ${error.message}`);
    }
  }

  // Add financial document
  async addFinancialDocument(documentId, financialDocData) {
    try {
      return await Document.findByIdAndUpdate(
        documentId,
        { $push: { financialDocuments: financialDocData } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error adding financial document: ${error.message}`);
    }
  }

  // Add address document
  async addAddressDocument(documentId, addressDocData) {
    try {
      return await Document.findByIdAndUpdate(
        documentId,
        { $push: { addressDocuments: addressDocData } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error adding address document: ${error.message}`);
    }
  }
}

module.exports = new DocumentRepository();