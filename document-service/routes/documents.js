const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { uploadMultiple } = require('../middleware/upload');
const { documentUploadValidation } = require('../middleware/validation');
const jwt = require('jsonwebtoken');

// Simple JWT authentication middleware
// const authenticate = (req, res, next) => {
//     try {
//         const token = req.header('Authorization')?.replace('Bearer ', '');
        
//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 error: 'Access denied. No token provided.'
//             });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         res.status(401).json({
//             success: false,
//             error: 'Invalid token.'
//         });
//     }
// };

// Admin role check middleware
// const requireAdmin = (req, res, next) => {
//     if (!req.user || req.user.role !== 'admin') {
//         return res.status(403).json({
//             success: false,
//             error: 'Admin access required'
//         });
//     }
//     next();
// };

// Apply authentication to all routes
// router.use(authenticate);

// ===== MULTI-STEP DOCUMENT UPLOAD ROUTES =====

// Step 1: Upload Personal Documents (PAN, Aadhaar, Passport, etc.)
router.post('/personal', 
    uploadMultiple, 
    documentUploadValidation,
    documentController.uploadPersonalDocuments
);

// Step 2: Upload Financial Documents (Bank Statement, Salary Slip, etc.)
router.post('/financial', 
    uploadMultiple, 
    documentUploadValidation,
    documentController.uploadFinancialDocuments
);

// Step 3: Upload Address Proof Documents
router.post('/address', 
    uploadMultiple, 
    documentUploadValidation,
    documentController.uploadAddressDocuments
);

// Step 4: Update Residence Verification
router.put('/verification/residence/:documentId', documentController.updateResidenceVerification);

// Register or ensure a document record exists for a user (creates if missing)
router.post('/register', documentController.registerDocument);

// Step 5: Update Office Verification  
router.put('/verification/office/:documentId', documentController.updateOfficeVerification);

// Step 6: Update Business Verification
router.put('/verification/business/:documentId', documentController.updateBusinessVerification);

// ===== USER DOCUMENT MANAGEMENT ROUTES =====

// Get user's document registration status and completion percentage
router.get('/status', documentController.getDocumentStatus);

// Get all documents for the authenticated user
router.get('/my-documents', documentController.getUserDocuments);

// Get specific verification details
router.get('/verification/residence/:documentId', documentController.getResidenceVerification);
router.get('/verification/office/:documentId', documentController.getOfficeVerification);
router.get('/verification/business/:documentId', documentController.getBusinessVerification);

// ===== DOCUMENT DOWNLOAD ROUTES =====

// Download single document file by file ID
router.get('/download/:documentId/:fileId', documentController.downloadDocument);

// Download all documents for a specific document registration as ZIP
router.get('/download-all/:documentId', documentController.downloadAllDocuments);

// Download documents by category (personal/financial/address) as ZIP
router.get('/download-category/:documentId/:category', documentController.downloadDocumentsByCategory);

// ===== PDF DOWNLOAD ROUTES =====

// Download single document as PDF (converts images to PDF)
router.get('/download-pdf/:documentId/:fileId', documentController.downloadDocumentAsPDF);

// Download all documents as single combined PDF
router.get('/download-pdf-combined/:documentId', documentController.downloadAllDocumentsAsPDF);

// Download documents by category as single combined PDF
router.get('/download-pdf-category/:documentId/:category', documentController.downloadCategoryAsPDF);

// Delete a specific document by ID and category
router.delete('/delete/:documentId', documentController.deleteDocument);

// Final submit by user
router.post('/submit/:documentId', documentController.submitDocument);

// ===== ADMIN ROUTES =====

// Get all pending verifications (admin only)
router.get('/admin/pending-verifications', 
    // requireAdmin, 
    documentController.getPendingVerifications
);

// Update verification status (admin only)
router.put('/admin/verification/:documentId', 
    // requireAdmin, 
    documentController.updateVerificationStatus
);

// ===== LEGACY ROUTES (for backward compatibility) =====

// Legacy upload route (redirects to personal documents)
router.post('/upload', 
    uploadMultiple, 
    documentUploadValidation,
    documentController.uploadPersonalDocuments
);

// Legacy get documents route
router.get('/', documentController.getUserDocuments);

module.exports = router;
