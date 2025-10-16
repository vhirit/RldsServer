const express = require('express');
const router = express.Router();
const sourcePersonController = require('../controllers/sourcePersonController');

// Validation middleware
const validateSourcePerson = (req, res, next) => {
  const { name, mobile, email, city, state, county } = req.body;
  
  if (req.method === 'POST') {
    const requiredFields = ['name', 'mobile', 'email', 'city', 'state', 'county'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
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
router.post('/register', validateSourcePerson, sourcePersonController.createSourcePerson);
router.get('/all-persons', sourcePersonController.getAllSourcePersons);
router.get('/persons/statistics', sourcePersonController.getSourcePersonStatistics);
router.get('/persons/:id', sourcePersonController.getSourcePersonById);
router.put('/persons/:id', sourcePersonController.updateSourcePerson);
router.delete('/persons/:id', sourcePersonController.deleteSourcePerson);

module.exports = router;