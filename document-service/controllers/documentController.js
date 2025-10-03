const documentService = require('../services/documentService');
const { validationResult } = require('express-validator');

class DocumentController {
    async uploadDocument(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { userId } = req.user;
            const { documentType, metadata } = req.body;
            const files = req.files;

            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No files uploaded'
                });
            }

            const document = await documentService.processDocument({
                userId,
                documentType,
                files,
                metadata
            });

            res.status(201).json({
                success: true,
                data: document,
                message: 'Document uploaded successfully'
            });
        } catch (error) {
            console.error('Document upload error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getDocuments(req, res) {
        try {
            const { userId } = req.user;
            const { page = 1, limit = 10, documentType } = req.query;

            const documents = await documentService.getUserDocuments({
                userId,
                page: parseInt(page),
                limit: parseInt(limit),
                documentType
            });

            res.json({
                success: true,
                data: documents
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getDocument(req, res) {
        try {
            const { documentId } = req.params;
            const { userId } = req.user;

            const document = await documentService.getDocumentById(documentId, userId);

            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found'
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

    async deleteDocument(req, res) {
        try {
            const { documentId } = req.params;
            const { userId } = req.user;

            await documentService.deleteDocument(documentId, userId);

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
}

module.exports = new DocumentController();