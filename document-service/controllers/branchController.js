const BranchRepository = require('../repositories/branchRepository');

class BranchController {
  constructor() {
    this.branchRepository = new BranchRepository();
  }

  // Create new branch
  createBranch = async (req, res) => {
    try {
      console.log('📝 Creating new branch with data:', req.body);
      
      const branchData = {
        ...req.body,
        local: parseInt(req.body.local) || 0,
        nonLocal: parseInt(req.body.nonLocal) || 0,
      };

      const newBranch = await this.branchRepository.createBranch(branchData);
      
      console.log('✅ Branch created successfully:', newBranch.branchName);
      
      // Emit WebSocket event if io is available
      if (req.app.locals.io) {
        req.app.locals.io.emit('newBranchAdded', { 
          branch: newBranch,
          timestamp: new Date().toISOString()
        });
        console.log('📡 Document Service: Broadcasted newBranchAdded event');
      }

      // Also use the main server's global broadcast function if available
      if (req.app.locals.broadcastBranchCreation) {
        req.app.locals.broadcastBranchCreation(newBranch);
      }

      res.status(201).json({
        success: true,
        message: 'Branch created successfully',
        data: newBranch
      });
    } catch (error) {
      console.error('❌ Error creating branch:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`,
          errors: [`${field} must be unique`]
        });
      }
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  // Get all branches with pagination
  getAllBranches = async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = req.query;
      
      console.log(`📋 Fetching branches - Page: ${page}, Limit: ${limit}, Search: "${search}", Status: "${status}"`);
      
      const result = await this.branchRepository.getAllBranches({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status
      });

      console.log(`📋 Found ${result.data.length} branches out of ${result.pagination.totalItems} total`);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('❌ Error fetching branches:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch branches',
        error: error.message
      });
    }
  };

  // Get single branch by ID
  getBranchById = async (req, res) => {
    try {
      const { id } = req.params;
      console.log('📋 Fetching branch by ID:', id);
      
      const branch = await this.branchRepository.getBranchById(id);
      
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found'
        });
      }

      console.log('✅ Branch found:', branch.branchName);

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
  };

  // Update branch
  updateBranch = async (req, res) => {
    try {
      const { id } = req.params;
      console.log('🔄 Updating branch:', id, 'with data:', req.body);

      const updateData = {
        ...req.body,
        local: parseInt(req.body.local) || req.body.local,
        nonLocal: parseInt(req.body.nonLocal) || req.body.nonLocal,
      };

      const updatedBranch = await this.branchRepository.updateBranch(id, updateData);
      
      if (!updatedBranch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found'
        });
      }

      console.log('✅ Branch updated successfully:', updatedBranch.branchName);
      
      // Emit WebSocket event if io is available
      if (req.app.locals.io) {
        req.app.locals.io.emit('branchUpdated', { 
          branch: updatedBranch,
          timestamp: new Date().toISOString()
        });
        console.log('📡 Document Service: Broadcasted branchUpdated event');
      }

      res.json({
        success: true,
        message: 'Branch updated successfully',
        data: updatedBranch
      });
    } catch (error) {
      console.error('❌ Error updating branch:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`,
          errors: [`${field} must be unique`]
        });
      }
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update branch',
        error: error.message
      });
    }
  };

  // Delete branch
  deleteBranch = async (req, res) => {
    try {
      const { id } = req.params;
      console.log('🗑️ Deleting branch:', id);
      
      const deletedBranch = await this.branchRepository.deleteBranch(id);
      
      if (!deletedBranch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found'
        });
      }

      console.log('✅ Branch deleted successfully:', deletedBranch.branchName);
      
      // Emit WebSocket event if io is available
      if (req.app.locals.io) {
        req.app.locals.io.emit('branchDeleted', { 
          branchId: id,
          branchName: deletedBranch.branchName,
          timestamp: new Date().toISOString()
        });
        console.log('📡 Document Service: Broadcasted branchDeleted event');
      }

      res.json({
        success: true,
        message: 'Branch deleted successfully',
        data: {
          id: deletedBranch._id,
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
  };

  // Get branch statistics
  getBranchStatistics = async (req, res) => {
    try {
      console.log('📊 Fetching branch statistics');
      
      const stats = await this.branchRepository.getBranchStatistics();
      
      console.log('📊 Statistics:', stats);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  };
}

module.exports = new BranchController(); // ✅ Correct