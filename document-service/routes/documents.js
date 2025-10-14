const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Document routes
router.get('/list', documentController.getDocumentByUser);
router.get('/:id', documentController.getDocument);
router.get('/:id/completion', documentController.getDocumentCompletion);
router.post('/create', documentController.createOrGetUserDocument);
router.post('/:id/personal', documentController.addPersonalDocument);
router.post('/:id/financial', documentController.addFinancialDocument);
router.post('/:id/address', documentController.addAddressDocument);
router.patch('/:id/status', documentController.updateDocumentStatus);

// Verification routes
router.post('/:id/verification', documentController.createOrGetVerification);
router.post('/:id/verifications/multiple', documentController.createMultipleVerifications);
router.get('/:id/verifications', documentController.getDocumentVerifications);
router.get('/verification/:documentNumber', documentController.getVerificationByDocumentNumber);
router.patch('/:id/verification/:stepName', documentController.updateVerificationStep);

module.exports = router;