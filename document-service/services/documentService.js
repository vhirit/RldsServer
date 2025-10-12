const Document = require('../models/Document');
const storageService = require('./storageService');
const ocrService = require('./ocrService');
const imageValidator = require('../utils/imageValidator');
const path = require('path');

class DocumentService {
    // Upload Personal Documents (Step 1)
    async uploadPersonalDocument({ userId, documentType, documentNumber, files }) {
        try {
            // Validate files
            for (const file of files) {
                await imageValidator.validateImage(file);
            }

            // Create unique filename with document number
            const fileName = this.generateFileName(documentType, documentNumber, files[0]);
            
            // Upload to storage
            const storageResult = await storageService.uploadFiles(files, fileName);

            // Find or create document record
            let document = await Document.findOne({ userId });
            if (!document) {
                document = new Document({ userId });
            }

            // Add personal document
            const personalDoc = {
                documentType,
                documentNumber,
                fileUrl: storageResult[0].url,
                fileName: storageResult[0].fileName,
                fileSize: storageResult[0].size,
                mimeType: storageResult[0].mimeType,
                uploadedAt: new Date()
            };

            // Remove existing document of same type and add new one
            document.personalDocuments = document.personalDocuments.filter(
                doc => doc.documentType !== documentType
            );
            document.personalDocuments.push(personalDoc);

            await document.save();
            return document;
        } catch (error) {
            throw new Error(`Personal document upload failed: ${error.message}`);
        }
    }

    // Upload Financial Documents (Step 2)
    async uploadFinancialDocument({ userId, documentType, bankName, accountNumber, monthYear, files }) {
        try {
            // Validate files
            for (const file of files) {
                await imageValidator.validateImage(file);
            }

            // Create unique filename
            const fileName = this.generateFileName(documentType, accountNumber || monthYear, files[0]);
            
            // Upload to storage
            const storageResult = await storageService.uploadFiles(files, fileName);

            // Find or create document record
            let document = await Document.findOne({ userId });
            if (!document) {
                document = new Document({ userId });
            }

            // Add financial document
            const financialDoc = {
                documentType,
                bankName,
                accountNumber,
                monthYear,
                fileUrl: storageResult[0].url,
                fileName: storageResult[0].fileName,
                fileSize: storageResult[0].size,
                mimeType: storageResult[0].mimeType,
                uploadedAt: new Date()
            };

            document.financialDocuments.push(financialDoc);
            await document.save();
            return document;
        } catch (error) {
            throw new Error(`Financial document upload failed: ${error.message}`);
        }
    }

    // Upload Address Documents (Step 3)
    async uploadAddressDocument({ userId, documentType, address, files }) {
        try {
            // Validate files
            for (const file of files) {
                await imageValidator.validateImage(file);
            }

            // Create unique filename
            const fileName = this.generateFileName(documentType, 'address', files[0]);
            
            // Upload to storage
            const storageResult = await storageService.uploadFiles(files, fileName);

            // Find or create document record
            let document = await Document.findOne({ userId });
            if (!document) {
                document = new Document({ userId });
            }

            // Add address document
            const addressDoc = {
                documentType,
                address,
                fileUrl: storageResult[0].url,
                fileName: storageResult[0].fileName,
                fileSize: storageResult[0].size,
                mimeType: storageResult[0].mimeType,
                uploadedAt: new Date()
            };

            document.addressDocuments.push(addressDoc);
            await document.save();
            return document;
        } catch (error) {
            throw new Error(`Address document upload failed: ${error.message}`);
        }
    }

    // Update Residence Verification (Step 4)
    async updateResidenceVerification(documentId, residenceData, user) {
        try {
            const document = await Document.findById(documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            // Update residence verification with comprehensive fields
            document.residenceVerification = {
                ...document.residenceVerification,
                ...residenceData,
                verificationDate: new Date(),
                verifiedBy: user.name || user.id,
                updatedAt: new Date()
            };

            await document.save();
            return document;
        } catch (error) {
            throw new Error(`Residence verification update failed: ${error.message}`);
        }
    }

    // Update Office Verification (Step 5)
    async updateOfficeVerification(documentId, officeData, user) {
        try {
            const document = await Document.findById(documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            // Update office verification with comprehensive fields
            document.officeVerification = {
                ...document.officeVerification,
                ...officeData,
                verificationDate: new Date(),
                verifiedBy: user.name || user.id,
                updatedAt: new Date()
            };

            await document.save();
            return document;
        } catch (error) {
            throw new Error(`Office verification update failed: ${error.message}`);
        }
    }

    // Update Business Verification (Step 6)
    async updateBusinessVerification(documentId, businessData, user) {
        try {
            const document = await Document.findById(documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            // Update business verification with comprehensive fields
            document.businessVerification = {
                ...document.businessVerification,
                ...businessData,
                verificationDate: new Date(),
                verifiedBy: user.name || user.id,
                updatedAt: new Date()
            };

            await document.save();
            return document;
        } catch (error) {
            throw new Error(`Business verification update failed: ${error.message}`);
        }
    }

    // ===== DOCUMENT DOWNLOAD SERVICES =====

    // Get File Information for Download
    async getFileForDownload(documentId, fileId, userId, userRole) {
        try {
            // Find the document
            const document = await Document.findById(documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            // Check ownership (unless admin)
            if (document.userId.toString() !== userId && userRole !== 'admin') {
                throw new Error('Access denied');
            }

            // Find the specific file
            const allDocuments = [
                ...document.personalDocuments,
                ...document.financialDocuments,
                ...document.addressDocuments
            ];

            const targetFile = allDocuments.find(doc => doc._id.toString() === fileId);
            if (!targetFile) {
                throw new Error('File not found');
            }

            return {
                document,
                file: targetFile
            };
        } catch (error) {
            throw new Error(`File retrieval failed: ${error.message}`);
        }
    }

    // Get All Files for Bulk Download
    async getAllFilesForDownload(documentId, userId, userRole) {
        try {
            // Find the document
            const document = await Document.findById(documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            // Check ownership (unless admin)
            if (document.userId.toString() !== userId && userRole !== 'admin') {
                throw new Error('Access denied');
            }

            // Collect all files
            const allFiles = [
                ...document.personalDocuments.map(doc => ({ ...doc.toObject(), category: 'personal' })),
                ...document.financialDocuments.map(doc => ({ ...doc.toObject(), category: 'financial' })),
                ...document.addressDocuments.map(doc => ({ ...doc.toObject(), category: 'address' }))
            ];

            return {
                document,
                files: allFiles
            };
        } catch (error) {
            throw new Error(`Bulk file retrieval failed: ${error.message}`);
        }
    }

    // Get Files by Category for Download
    async getFilesByCategoryForDownload(documentId, category, userId, userRole) {
        try {
            const validCategories = ['personal', 'financial', 'address'];
            if (!validCategories.includes(category.toLowerCase())) {
                throw new Error('Invalid category');
            }

            // Find the document
            const document = await Document.findById(documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            // Check ownership (unless admin)
            if (document.userId.toString() !== userId && userRole !== 'admin') {
                throw new Error('Access denied');
            }

            // Get files for the specific category
            let categoryFiles = [];
            const categoryLower = category.toLowerCase();
            
            if (categoryLower === 'personal') {
                categoryFiles = document.personalDocuments;
            } else if (categoryLower === 'financial') {
                categoryFiles = document.financialDocuments;
            } else if (categoryLower === 'address') {
                categoryFiles = document.addressDocuments;
            }

            return {
                document,
                files: categoryFiles,
                category: categoryLower
            };
        } catch (error) {
            throw new Error(`Category file retrieval failed: ${error.message}`);
        }
    }

    // Get User Document Status
    async getUserDocumentStatus(userId) {
        try {
            const document = await Document.findOne({ userId });
            return document;
        } catch (error) {
            throw new Error(`Failed to fetch document status: ${error.message}`);
        }
    }

    // Get All User Documents
    async getUserDocuments(userId) {
        try {
            return await Document.findOne({ userId });
        } catch (error) {
            throw new Error(`Failed to fetch documents: ${error.message}`);
        }
    }

    // Delete Specific Document
    async deleteDocument(userId, documentId, documentType, category) {
        try {
            const document = await Document.findOne({ userId });
            if (!document) {
                throw new Error('Document not found');
            }

            let documentToDelete = null;
            let arrayField = '';

            // Find the document in the appropriate array
            switch (category) {
                case 'personal':
                    arrayField = 'personalDocuments';
                    documentToDelete = document.personalDocuments.id(documentId);
                    break;
                case 'financial':
                    arrayField = 'financialDocuments';
                    documentToDelete = document.financialDocuments.id(documentId);
                    break;
                case 'address':
                    arrayField = 'addressDocuments';
                    documentToDelete = document.addressDocuments.id(documentId);
                    break;
            }

            if (!documentToDelete) {
                throw new Error('Document not found in specified category');
            }

            // Delete file from storage
            await storageService.deleteFiles([{
                filePath: documentToDelete.fileUrl,
                fileName: documentToDelete.fileName
            }]);

            // Remove from document array
            document[arrayField].pull(documentId);
            await document.save();

            return document;
        } catch (error) {
            throw new Error(`Document deletion failed: ${error.message}`);
        }
    }

    // Admin: Get Pending Verifications
    async getPendingVerifications({ page, limit }) {
        try {
            const query = {
                $or: [
                    { 'homeAddressVerification.verificationStatus': 'PENDING' },
                    { 'officeAddressVerification.verificationStatus': 'PENDING' }
                ]
            };

            const documents = await Document.find(query)
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await Document.countDocuments(query);

            return {
                verifications: documents,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to fetch pending verifications: ${error.message}`);
        }
    }

    // Admin: Update Verification Status
    async updateVerificationStatus(documentId, verificationType, status, notes, verifierId) {
        try {
            const document = await Document.findById(documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            const verificationField = verificationType === 'home' 
                ? 'homeAddressVerification' 
                : 'officeAddressVerification';

            document[verificationField].verificationStatus = status;
            document[verificationField].verifierNotes = notes;
            document[verificationField].verificationDate = new Date();
            document[verificationField].updatedAt = new Date();

            // Add to verification history
            document.verificationHistory.push({
                action: `${verificationType}_verification_${status.toLowerCase()}`,
                performedBy: verifierId,
                notes: notes,
                previousStatus: document[verificationField].verificationStatus,
                newStatus: status,
                timestamp: new Date()
            });

            await document.save();
            return document;
        } catch (error) {
            throw new Error(`Verification status update failed: ${error.message}`);
        }
    }

    // Generate unique filename with document number
    generateFileName(documentType, documentNumber, file) {
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        return `${documentType}_${documentNumber}_${timestamp}${extension}`;
    }
}

module.exports = new DocumentService();