const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController'  );

// Validation middleware
const validateBranch = (req, res, next) => {
  const { branchName, code, local, nonLocal, gst } = req.body;
  
  if (req.method === 'POST') {
    const requiredFields = ['branchName', 'code', 'local', 'nonLocal', 'gst'];
    const missingFields = requiredFields.filter(field => !req.body[field] && req.body[field] !== 0);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: missingFields.map(field => `${field} is required`)
      });
    }
  }
  
  next();
};

// Routes
router.post('/register', branchController.createBranch);
router.get('/', branchController.getAllBranches);
router.get('/all-branches', branchController.getAllBranches);
router.get('/statistics', branchController.getBranchStatistics);
router.get('/:id', branchController.getBranchById);
router.put('/:id', branchController.updateBranch);
router.delete('/:id', branchController.deleteBranch);

module.exports = router;