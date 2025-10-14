const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Admin user management routes
router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserById);
router.patch('/users/:userId/verification', adminController.updateUserVerification);
router.patch('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser); 

module.exports = router;