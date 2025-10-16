// services/documentNumberService.js
const Document = require('../models/Document');

class DocumentNumberService {
  /**
   * Generate next document number based on existing documents
   * @returns {Promise<string>} Generated document number
   */
  static async generateDocumentNumber() {
    try {
      // Get the latest document with a reference number
      const latestDocument = await Document.findOne({
        documentReferenceNumber: { $exists: true, $ne: null }
      })
      .sort({ createdAt: -1 })
      .select('documentReferenceNumber');

      if (latestDocument && latestDocument.documentReferenceNumber) {
        // Extract the sequence number from the latest document
        const parts = latestDocument.documentReferenceNumber.split('/');
        if (parts.length === 2) {
          const sequenceNumber = parseInt(parts[0]);
          if (!isNaN(sequenceNumber)) {
            const nextSequence = (sequenceNumber + 1).toString().padStart(3, '0');
            const currentDate = this.formatDate(new Date());
            return `${nextSequence}/${currentDate}`;
          }
        }
      }

      // If no documents exist or invalid format, start with 001
      const currentDate = this.formatDate(new Date());
      return `001/${currentDate}`;

    } catch (error) {
      console.error('Error generating document number:', error);
      // Fallback to default format
      const currentDate = this.formatDate(new Date());
      return `000/${currentDate}`;
    }
  }

  /**
   * Generate default document number with current date
   * @returns {string} Default document number in format 000/DD-MM-YYYY
   */
  static generateDefaultDocumentNumber() {
    const currentDate = this.formatDate(new Date());
    return `000/${currentDate}`;
  }

  /**
   * Format date to DD-MM-YYYY format
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  static formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Get current document number (latest or default)
   * @returns {Promise<string>} Current document number
   */
  static async getCurrentDocumentNumber() {
    try {
      const latestDocument = await Document.findOne({
        documentReferenceNumber: { $exists: true, $ne: null }
      })
      .sort({ createdAt: -1 })
      .select('documentReferenceNumber');

      if (latestDocument && latestDocument.documentReferenceNumber) {
        return latestDocument.documentReferenceNumber;
      }

      // Return default if no documents exist
      return this.generateDefaultDocumentNumber();

    } catch (error) {
      console.error('Error getting current document number:', error);
      return this.generateDefaultDocumentNumber();
    }
  }

  /**
   * Check if a document number already exists
   * @param {string} documentNumber - Document number to check
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  static async documentNumberExists(documentNumber) {
    try {
      const existingDoc = await Document.findOne({
        documentReferenceNumber: documentNumber
      });
      return !!existingDoc;
    } catch (error) {
      console.error('Error checking document number existence:', error);
      return false;
    }
  }

  /**
   * Validate document number format
   * @param {string} documentNumber - Document number to validate
   * @returns {boolean} True if valid format, false otherwise
   */
  static validateDocumentNumberFormat(documentNumber) {
    // Expected format: XXX/DD-MM-YYYY
    const regex = /^\d{3}\/\d{2}-\d{2}-\d{4}$/;
    return regex.test(documentNumber);
  }
}

module.exports = DocumentNumberService;