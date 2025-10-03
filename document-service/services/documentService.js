const Document = require('../models/Document');
const storageService = require('./storageService');
const ocrService = require('./ocrService');
const imageValidator = require('../utils/imageValidator');

class DocumentService {
    async processDocument({ userId, documentType, files, metadata }) {
        try {
            // Validate images
            for (const file of files) {
                await imageValidator.validateImage(file);
            }

            // Process OCR if needed
            let ocrData = null;
            if (this.requiresOCR(documentType)) {
                ocrData = await ocrService.extractText(files[0]);
            }

            // Upload to storage
            const storageResults = await storageService.uploadFiles(files);

            // Create document record
            const document = new Document({
                userId,
                documentType,
                files: storageResults,
                metadata: {
                    ...metadata,
                    ocrData,
                    fileCount: files.length,
                    totalSize: files.reduce((sum, file) => sum + file.size, 0)
                },
                status: 'uploaded'
            });

            await document.save();
            return document;
        } catch (error) {
            throw new Error(`Document processing failed: ${error.message}`);
        }
    }

    async getUserDocuments({ userId, page, limit, documentType }) {
        try {
            const query = { userId };
            if (documentType) {
                query.documentType = documentType;
            }

            const documents = await Document.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            const total = await Document.countDocuments(query);

            return {
                documents,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to fetch documents: ${error.message}`);
        }
    }

    async getDocumentById(documentId, userId) {
        try {
            return await Document.findOne({ _id: documentId, userId });
        } catch (error) {
            throw new Error(`Failed to fetch document: ${error.message}`);
        }
    }

    async deleteDocument(documentId, userId) {
        try {
            const document = await Document.findOne({ _id: documentId, userId });
            
            if (!document) {
                throw new Error('Document not found');
            }

            // Delete from storage
            await storageService.deleteFiles(document.files);

            // Delete from database
            await Document.findByIdAndDelete(documentId);
        } catch (error) {
            throw new Error(`Document deletion failed: ${error.message}`);
        }
    }

    requiresOCR(documentType) {
        const ocrDocumentTypes = ['passport', 'id_card', 'driver_license', 'utility_bill'];
        return ocrDocumentTypes.includes(documentType);
    }
}

module.exports = new DocumentService();