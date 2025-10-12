const documentService = require('../services/documentService');
const pdfConversionService = require('../services/pdfConversionService');
const Document = require('../models/Document');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

class DocumentController {
    // Step 1: Upload Personal Documents (PAN, Aadhaar, etc.)
    async uploadPersonalDocuments(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { userId } = req.user;
            const { documentType, documentNumber } = req.body;
            const files = req.files;

            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No files uploaded'
                });
            }

            const document = await documentService.uploadPersonalDocument({
                userId,
                documentType,
                documentNumber,
                files
            });

            res.status(201).json({
                success: true,
                data: document,
                message: 'Personal document uploaded successfully'
            });
        } catch (error) {
            console.error('Personal document upload error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Step 2: Upload Financial Documents (Bank Statement, Salary Slip, etc.)
    async uploadFinancialDocuments(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { userId } = req.user;
            const { documentType, bankName, accountNumber, monthYear } = req.body;
            const files = req.files;

            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No files uploaded'
                });
            }

            const document = await documentService.uploadFinancialDocument({
                userId,
                documentType,
                bankName,
                accountNumber,
                monthYear,
                files
            });

            res.status(201).json({
                success: true,
                data: document,
                message: 'Financial document uploaded successfully'
            });
        } catch (error) {
            console.error('Financial document upload error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Step 3: Upload Address Proof Documents
    async uploadAddressDocuments(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { userId } = req.user;
            const { documentType, address } = req.body;
            const files = req.files;

            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No files uploaded'
                });
            }

            const document = await documentService.uploadAddressDocument({
                userId,
                documentType,
                address,
                files
            });

            res.status(201).json({
                success: true,
                data: document,
                message: 'Address document uploaded successfully'
            });
        } catch (error) {
            console.error('Address document upload error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Step 4: Update Residence Verification
    async updateResidenceVerification(req, res) {
        try {
            const { documentId } = req.params;
            const residenceVerificationData = req.body;

            const document = await documentService.updateResidenceVerification(documentId, residenceVerificationData, req.user);

            res.json({
                success: true,
                data: document.residenceVerification,
                message: 'Residence verification updated successfully'
            });
        } catch (error) {
            console.error('Residence verification update error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Register document (create if not exists) - used to start multi-step flow
    async registerDocument(req, res) {
        try {
            // Expect authenticated user; fallback to body.userId for tests
            const userId = req.user?.id || req.body.userId;
            if (!userId) {
                return res.status(400).json({ success: false, error: 'Missing userId' });
            }

            let document = await Document.findOne({ userId });
            if (!document) {
                document = new Document({ userId });
                await document.save();
            }

            res.status(200).json({ success: true, data: { documentId: document._id, document }, message: 'Document registered' });
        } catch (error) {
            console.error('Register document error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Step 5: Update Office Verification
    async updateOfficeVerification(req, res) {
        try {
            const { documentId } = req.params;
            const officeVerificationData = req.body;

            const document = await documentService.updateOfficeVerification(documentId, officeVerificationData, req.user);

            res.json({
                success: true,
                data: document.officeVerification,
                message: 'Office verification updated successfully'
            });
        } catch (error) {
            console.error('Office verification update error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Step 6: Update Business Verification
    async updateBusinessVerification(req, res) {
        try {
            const { documentId } = req.params;
            const businessVerificationData = req.body;

            const document = await documentService.updateBusinessVerification(documentId, businessVerificationData, req.user);

            res.json({
                success: true,
                data: document.businessVerification,
                message: 'Business verification updated successfully'
            });
        } catch (error) {
            console.error('Business verification update error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get Residence Verification Details
    async getResidenceVerification(req, res) {
        try {
            const { documentId } = req.params;
            
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found'
                });
            }

            res.json({
                success: true,
                data: document.residenceVerification || {},
                message: 'Residence verification details retrieved successfully'
            });
        } catch (error) {
            console.error('Get residence verification error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get Office Verification Details
    async getOfficeVerification(req, res) {
        try {
            const { documentId } = req.params;
            
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found'
                });
            }

            res.json({
                success: true,
                data: document.officeVerification || {},
                message: 'Office verification details retrieved successfully'
            });
        } catch (error) {
            console.error('Get office verification error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get Business Verification Details
    async getBusinessVerification(req, res) {
        try {
            const { documentId } = req.params;
            
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found'
                });
            }

            res.json({
                success: true,
                data: document.businessVerification || {},
                message: 'Business verification details retrieved successfully'
            });
        } catch (error) {
            console.error('Get business verification error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // ===== DOCUMENT DOWNLOAD METHODS =====

    // Download Single Document File
    async downloadDocument(req, res) {
        try {
            const { documentId, fileId } = req.params;
            const userId = req.user.id;

            // Find the document and verify ownership
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found'
                });
            }

            // Check if user owns this document (unless admin)
            if (document.userId.toString() !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }

            // Find the specific file in all document arrays
            let targetFile = null;
            const allDocuments = [
                ...document.personalDocuments,
                ...document.financialDocuments,
                ...document.addressDocuments
            ];

            for (const doc of allDocuments) {
                if (doc._id.toString() === fileId) {
                    targetFile = doc;
                    break;
                }
            }

            if (!targetFile) {
                return res.status(404).json({
                    success: false,
                    error: 'File not found'
                });
            }

            const filePath = path.resolve(targetFile.fileUrl);
            
            // Check if file exists on disk
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    error: 'File not found on server'
                });
            }

            // Set appropriate headers for file download
            res.setHeader('Content-Disposition', `attachment; filename="${targetFile.fileName}"`);
            res.setHeader('Content-Type', targetFile.mimeType || 'application/octet-stream');

            // Stream the file
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);

        } catch (error) {
            console.error('Download document error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Download All Documents as ZIP
    async downloadAllDocuments(req, res) {
        try {
            const { documentId } = req.params;
            const userId = req.user.id;

            // Find the document and verify ownership
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found'
                });
            }

            // Check if user owns this document (unless admin)
            if (document.userId.toString() !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }

            // Collect all files
            const allFiles = [
                ...document.personalDocuments,
                ...document.financialDocuments,
                ...document.addressDocuments
            ];

            if (allFiles.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No files found to download'
                });
            }

            // Set headers for ZIP download
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="documents_${document.documentNumber}.zip"`);

            // Create ZIP archive
            const archive = archiver('zip', {
                zlib: { level: 9 } // Maximum compression
            });

            // Handle archive errors
            archive.on('error', (err) => {
                console.error('Archive error:', err);
                res.status(500).json({
                    success: false,
                    error: 'Error creating archive'
                });
            });

            // Pipe archive to response
            archive.pipe(res);

            // Add files to archive
            for (const file of allFiles) {
                const filePath = path.resolve(file.fileUrl);
                if (fs.existsSync(filePath)) {
                    const folderName = file.documentType.toLowerCase();
                    archive.file(filePath, { name: `${folderName}/${file.fileName}` });
                }
            }

            // Finalize the archive
            archive.finalize();

        } catch (error) {
            console.error('Download all documents error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Download Documents by Category as ZIP
    async downloadDocumentsByCategory(req, res) {
        try {
            const { documentId, category } = req.params;
            const userId = req.user.id;

            // Validate category
            const validCategories = ['personal', 'financial', 'address'];
            if (!validCategories.includes(category.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid category. Must be: personal, financial, or address'
                });
            }

            // Find the document and verify ownership
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found'
                });
            }

            // Check if user owns this document (unless admin)
            if (document.userId.toString() !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
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

            if (categoryFiles.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: `No ${category} documents found`
                });
            }

            // Set headers for ZIP download
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${category}_documents_${document.documentNumber}.zip"`);

            // Create ZIP archive
            const archive = archiver('zip', {
                zlib: { level: 9 }
            });

            // Handle archive errors
            archive.on('error', (err) => {
                console.error('Archive error:', err);
                res.status(500).json({
                    success: false,
                    error: 'Error creating archive'
                });
            });

            // Pipe archive to response
            archive.pipe(res);

            // Add files to archive
            for (const file of categoryFiles) {
                const filePath = path.resolve(file.fileUrl);
                if (fs.existsSync(filePath)) {
                    archive.file(filePath, { name: file.fileName });
                }
            }

            // Finalize the archive
            archive.finalize();

        } catch (error) {
            console.error('Download category documents error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // ===== PDF DOWNLOAD METHODS =====

    // Download Single Document as PDF
    async downloadDocumentAsPDF(req, res) {
        try {
            const { documentId, fileId } = req.params;
            const userId = req.user.id;

            // Find the document and verify ownership
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found'
                });
            }

            // Check if user owns this document (unless admin)
            if (document.userId.toString() !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }

            // Find the specific file
            let targetFile = null;
            const allDocuments = [
                ...document.personalDocuments,
                ...document.financialDocuments,
                ...document.addressDocuments
            ];

            for (const doc of allDocuments) {
                if (doc._id.toString() === fileId) {
                    targetFile = doc;
                    break;
                }
            }

            if (!targetFile) {
                return res.status(404).json({
                    success: false,
                    error: 'File not found'
                });
            }

            const filePath = path.resolve(targetFile.fileUrl);
            
            // Check if file exists on disk
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    error: 'File not found on server'
                });
            }

            // Convert to PDF if not already PDF
            let pdfPath;
            let isTemporary = false;

            try {
                pdfPath = await pdfConversionService.convertToPDF(filePath, {
                    mimeType: targetFile.mimeType,
                    fileName: targetFile.fileName
                }, {
                    title: `${targetFile.documentType} - ${targetFile.fileName}`,
                    subject: `${targetFile.documentType} Document`
                });

                // Mark as temporary if conversion was needed
                isTemporary = (pdfPath !== filePath);

                // Generate PDF filename
                const pdfFileName = path.parse(targetFile.fileName).name + '.pdf';

                // Set headers for PDF download
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);

                // Stream the PDF file
                const fileStream = fs.createReadStream(pdfPath);
                fileStream.pipe(res);

                // Clean up temporary file after streaming
                if (isTemporary) {
                    fileStream.on('end', () => {
                        pdfConversionService.cleanupTempFile(pdfPath);
                    });
                }

            } catch (conversionError) {
                console.error('PDF conversion error:', conversionError);
                res.status(500).json({
                    success: false,
                    error: 'Failed to convert document to PDF'
                });
            }

        } catch (error) {
            console.error('Download document as PDF error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Download All Documents as Combined PDF
    async downloadAllDocumentsAsPDF(req, res) {
        try {
            const { documentId } = req.params;
            const userId = req.user.id;

            // Find the document and verify ownership
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found'
                });
            }

            // Check if user owns this document (unless admin)
            if (document.userId.toString() !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }

            // Collect all files with full path information
            const allFiles = [
                ...document.personalDocuments.map(doc => ({
                    ...doc.toObject(),
                    filePath: path.resolve(doc.fileUrl),
                    category: 'Personal Documents'
                })),
                ...document.financialDocuments.map(doc => ({
                    ...doc.toObject(),
                    filePath: path.resolve(doc.fileUrl),
                    category: 'Financial Documents'
                })),
                ...document.addressDocuments.map(doc => ({
                    ...doc.toObject(),
                    filePath: path.resolve(doc.fileUrl),
                    category: 'Address Documents'
                }))
            ];

            // Filter files that exist on disk
            const existingFiles = allFiles.filter(file => fs.existsSync(file.filePath));

            if (existingFiles.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No files found to download'
                });
            }

            // Create combined PDF
            const timestamp = Date.now();
            const outputPath = path.join(pdfConversionService.tempDir, `combined_documents_${document.documentNumber}_${timestamp}.pdf`);

            try {
                await pdfConversionService.createMultiPagePDF(existingFiles, outputPath, {
                    title: `All Documents - ${document.documentNumber}`,
                    subject: 'Combined Document Package'
                });

                // Set headers for PDF download
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="all_documents_${document.documentNumber}.pdf"`);

                // Stream the PDF file
                const fileStream = fs.createReadStream(outputPath);
                fileStream.pipe(res);

                // Clean up temporary file after streaming
                fileStream.on('end', () => {
                    pdfConversionService.cleanupTempFile(outputPath);
                });

            } catch (pdfError) {
                console.error('Combined PDF creation error:', pdfError);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create combined PDF'
                });
            }

        } catch (error) {
            console.error('Download all documents as PDF error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Download Documents by Category as Combined PDF
    async downloadCategoryAsPDF(req, res) {
        try {
            const { documentId, category } = req.params;
            const userId = req.user.id;

            // Validate category
            const validCategories = ['personal', 'financial', 'address'];
            if (!validCategories.includes(category.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid category. Must be: personal, financial, or address'
                });
            }

            // Find the document and verify ownership
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found'
                });
            }

            // Check if user owns this document (unless admin)
            if (document.userId.toString() !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }

            // Get files for the specific category
            let categoryFiles = [];
            const categoryLower = category.toLowerCase();
            let categoryTitle = '';
            
            if (categoryLower === 'personal') {
                categoryFiles = document.personalDocuments;
                categoryTitle = 'Personal Documents';
            } else if (categoryLower === 'financial') {
                categoryFiles = document.financialDocuments;
                categoryTitle = 'Financial Documents';
            } else if (categoryLower === 'address') {
                categoryFiles = document.addressDocuments;
                categoryTitle = 'Address Documents';
            }

            // Add file paths
            const filesWithPath = categoryFiles.map(doc => ({
                ...doc.toObject(),
                filePath: path.resolve(doc.fileUrl),
                category: categoryTitle
            }));

            // Filter files that exist on disk
            const existingFiles = filesWithPath.filter(file => fs.existsSync(file.filePath));

            if (existingFiles.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: `No ${category} documents found`
                });
            }

            // Create combined PDF
            const timestamp = Date.now();
            const outputPath = path.join(pdfConversionService.tempDir, `${category}_documents_${document.documentNumber}_${timestamp}.pdf`);

            try {
                await pdfConversionService.createMultiPagePDF(existingFiles, outputPath, {
                    title: `${categoryTitle} - ${document.documentNumber}`,
                    subject: `${categoryTitle} Package`
                });

                // Set headers for PDF download
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${category}_documents_${document.documentNumber}.pdf"`);

                // Stream the PDF file
                const fileStream = fs.createReadStream(outputPath);
                fileStream.pipe(res);

                // Clean up temporary file after streaming
                fileStream.on('end', () => {
                    pdfConversionService.cleanupTempFile(outputPath);
                });

            } catch (pdfError) {
                console.error('Category PDF creation error:', pdfError);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create category PDF'
                });
            }

        } catch (error) {
            console.error('Download category as PDF error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get user's document registration status
    async getDocumentStatus(req, res) {
        try {
            const { userId } = req.user;

            const document = await documentService.getUserDocumentStatus(userId);

            res.json({
                success: true,
                data: document || {
                    userId,
                    overallStatus: 'INCOMPLETE',
                    completionPercentage: 0,
                    completionSteps: {
                        personalDocuments: false,
                        financialDocuments: false,
                        addressDocuments: false,
                        homeVerification: false,
                        officeVerification: false
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get all documents for a user
    async getUserDocuments(req, res) {
        try {
            const { userId } = req.user;

            const document = await documentService.getUserDocuments(userId);

            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'No documents found'
                });
            }

            res.json({
                success: true,
                data: document
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Delete specific document
    async deleteDocument(req, res) {
        try {
            const { documentId } = req.params;
            const { documentType, category } = req.body;
            const { userId } = req.user;

            await documentService.deleteDocument(userId, documentId, documentType, category);

            res.json({
                success: true,
                message: 'Document deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Admin: Get all pending verifications
    async getPendingVerifications(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const verifications = await documentService.getPendingVerifications({
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.json({
                success: true,
                data: verifications
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Admin: Update verification status
    async updateVerificationStatus(req, res) {
        try {
            const { documentId } = req.params;
            const { verificationType, status, notes } = req.body;
            const verifierId = req.user.userId;

            const result = await documentService.updateVerificationStatus(
                documentId, 
                verificationType, 
                status, 
                notes, 
                verifierId
            );

            res.json({
                success: true,
                data: result,
                message: 'Verification status updated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Submit final document (user action) - marks overallStatus and records submission
    async submitDocument(req, res) {
        try {
            const { documentId } = req.params;
            const { finalData, submittedAt } = req.body;

            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({ success: false, error: 'Document not found' });
            }

            document.overallStatus = 'PENDING';
            document.submittedAt = submittedAt ? new Date(submittedAt) : new Date();
            // Optionally merge finalData into document (be conservative)
            // document.finalData = finalData;

            await document.save();

            res.json({ success: true, data: { documentId: document._id, overallStatus: document.overallStatus }, message: 'Document submitted' });
        } catch (error) {
            console.error('Submit document error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new DocumentController();