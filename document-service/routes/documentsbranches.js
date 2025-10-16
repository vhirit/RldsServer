const express = require('express');
const router = express.Router();

// Mock branch data for now - this will be replaced with actual database integration
let branches = [
  {
    id: '1',
    _id: '1',
    branchName: 'Head Office',
    code: '8986',
    local: 300,
    nonLocal: 600,
    gst: '27ABCDE1234F1Z5',
    status: 'Active',
    address: 'Mumbai, Maharashtra',
    contactPerson: 'John Doe',
    phone: '9876543210',
    email: 'headoffice@bank.com',
    openingDate: '2020-01-15',
    description: 'Main branch office',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    _id: '2',
    branchName: 'Mumbai Branch',
    code: '8987',
    local: 350,
    nonLocal: 650,
    gst: '27ABCDE1234F1Z6',
    status: 'Active',
    address: 'Andheri, Mumbai',
    contactPerson: 'Jane Smith',
    phone: '9876543211',
    email: 'mumbai@bank.com',
    openingDate: '2021-03-10',
    description: 'Mumbai regional branch',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Validation middleware
const validateBranch = (req, res, next) => {
  const { branchName, code, local, nonLocal, gst } = req.body;
  
  if (req.method === 'POST') {
    const requiredFields = ['branchName', 'code', 'local', 'nonLocal', 'gst'];
    const missingFields = requiredFields.filter(field => 
      req.body[field] === undefined || req.body[field] === null || req.body[field] === ''
    );
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: missingFields.map(field => `${field} is required`)
      });
    }

    // Check for duplicate code
    const existingCode = branches.find(branch => branch.code === code);
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'Branch code already exists',
        errors: ['Code must be unique']
      });
    }

    // Check for duplicate GST
    const existingGst = branches.find(branch => branch.gst === gst);
    if (existingGst) {
      return res.status(400).json({
        success: false,
        message: 'GST number already exists',
        errors: ['GST number must be unique']
      });
    }
  }
  
  next();
};

// GET /api/document/documentsbranches - Get all branches
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedBranches = branches.slice(startIndex, endIndex);
    
    console.log('📋 Fetching branches - Page:', page, 'Limit:', limit);
    console.log('📋 Total branches:', branches.length, 'Returned:', paginatedBranches.length);

    res.json({
      success: true,
      data: paginatedBranches,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(branches.length / limit),
        totalItems: branches.length,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('❌ Error fetching branches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branches',
      error: error.message
    });
  }
});

// GET /api/document/documentsbranches/:id - Get single branch
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const branch = branches.find(b => b.id === id || b._id === id);
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    console.log('📋 Fetching single branch:', id);
    
    res.json({
      success: true,
      data: branch
    });
  } catch (error) {
    console.error('❌ Error fetching branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branch',
      error: error.message
    });
  }
});

// POST /api/document/documentsbranches - Create new branch
router.post('/', validateBranch, (req, res) => {
  try {
    const newId = Date.now().toString();
    const newBranch = {
      id: newId,
      _id: newId,
      ...req.body,
      local: parseInt(req.body.local) || 0,
      nonLocal: parseInt(req.body.nonLocal) || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    branches.unshift(newBranch);
    
    console.log('✅ Created new branch:', newBranch.branchName, 'ID:', newId);
    
    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: newBranch
    });
  } catch (error) {
    console.error('❌ Error creating branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create branch',
      error: error.message
    });
  }
});

// PUT /api/document/documentsbranches/:id - Update branch
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const branchIndex = branches.findIndex(b => b.id === id || b._id === id);
    
    if (branchIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Check for duplicate code (excluding current branch)
    const { code, gst } = req.body;
    if (code) {
      const existingCode = branches.find(b => b.code === code && (b.id !== id && b._id !== id));
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'Branch code already exists',
          errors: ['Code must be unique']
        });
      }
    }

    // Check for duplicate GST (excluding current branch)
    if (gst) {
      const existingGst = branches.find(b => b.gst === gst && (b.id !== id && b._id !== id));
      if (existingGst) {
        return res.status(400).json({
          success: false,
          message: 'GST number already exists',
          errors: ['GST number must be unique']
        });
      }
    }

    const updatedBranch = {
      ...branches[branchIndex],
      ...req.body,
      local: parseInt(req.body.local) || branches[branchIndex].local,
      nonLocal: parseInt(req.body.nonLocal) || branches[branchIndex].nonLocal,
      updatedAt: new Date()
    };

    branches[branchIndex] = updatedBranch;
    
    console.log('🔄 Updated branch:', updatedBranch.branchName, 'ID:', id);
    
    res.json({
      success: true,
      message: 'Branch updated successfully',
      data: updatedBranch
    });
  } catch (error) {
    console.error('❌ Error updating branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update branch',
      error: error.message
    });
  }
});

// DELETE /api/document/documentsbranches/:id - Delete branch
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const branchIndex = branches.findIndex(b => b.id === id || b._id === id);
    
    if (branchIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    const deletedBranch = branches[branchIndex];
    branches.splice(branchIndex, 1);
    
    console.log('🗑️ Deleted branch:', deletedBranch.branchName, 'ID:', id);
    
    res.json({
      success: true,
      message: 'Branch deleted successfully',
      data: { 
        id: deletedBranch.id,
        branchName: deletedBranch.branchName
      }
    });
  } catch (error) {
    console.error('❌ Error deleting branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete branch',
      error: error.message
    });
  }
});

// GET /api/document/documentsbranches/statistics - Get branch statistics
router.get('/statistics', (req, res) => {
  try {
    const totalBranches = branches.length;
    const activeBranches = branches.filter(b => b.status === 'Active').length;
    const inactiveBranches = branches.filter(b => b.status === 'Inactive').length;
    const totalLocal = branches.reduce((sum, b) => sum + (b.local || 0), 0);
    const totalNonLocal = branches.reduce((sum, b) => sum + (b.nonLocal || 0), 0);
    const grandTotal = totalLocal + totalNonLocal;

    const statistics = {
      totalBranches,
      activeBranches,
      inactiveBranches,
      totalLocal,
      totalNonLocal,
      grandTotal
    };
    
    console.log('📊 Branch statistics requested:', statistics);
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;