const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateVerification } = require('../middlewares/validationMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Verification routes
router.post('/', validateVerification, verificationController.createVerification);
router.get('/', verificationController.getUserVerifications);
router.get('/statistics', verificationController.getVerificationStatistics);
router.get('/type/:type', verificationController.getVerificationsByType);
router.get('/:id', verificationController.getVerification);
router.get('/:id/completion', verificationController.getCompletionPercentage);
router.put('/:id', validateVerification, verificationController.updateVerification);
router.patch('/:id/status', verificationController.updateVerificationStatus);
router.post('/:id/documents', verificationController.addDocumentToVerification);
router.delete('/:id', verificationController.deleteVerification);

module.exports = router;