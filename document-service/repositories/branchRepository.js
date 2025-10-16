const Branch = require('../models/branchModel');

class BranchRepository {
  // Create new branch
  async createBranch(branchData) {
    try {
      const branch = new Branch(branchData);
      return await branch.save();
    } catch (error) {
      throw error;
    }
  }

  // Get all branches with pagination and filtering
  async getAllBranches({ page = 1, limit = 10, search = '', status = '' }) {
    try {
      const query = {};
      
      // Search filter
      if (search) {
        query.$or = [
          { branchName: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { gst: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Status filter
      if (status) {
        query.status = status;
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        collation: { locale: 'en', strength: 2 }
      };

      const result = await Branch.paginate(query, options);
      
      // Transform the mongoose-paginate-v2 result to match expected structure
      return {
        data: result.docs,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalItems: result.totalDocs,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage,
          itemsPerPage: result.limit
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get branch by ID
  async getBranchById(id) {
    try {
      return await Branch.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Get branch by code
  async getBranchByCode(code) {
    try {
      return await Branch.findOne({ code: code.toUpperCase() });
    } catch (error) {
      throw error;
    }
  }

  // Update branch
  async updateBranch(id, updateData) {
    try {
      return await Branch.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Delete branch
  async deleteBranch(id) {
    try {
      return await Branch.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // Get branch statistics
  async getBranchStatistics() {
    try {
      const stats = await Branch.getBranchStats();
      return stats[0] || {
        totalBranches: 0,
        activeBranches: 0,
        totalLocal: 0,
        totalNonLocal: 0,
        totalAmount: 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Check if branch code exists (for validation)
  async isCodeExists(code, excludeId = null) {
    try {
      const query = { code: code.toUpperCase() };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      return await Branch.exists(query);
    } catch (error) {
      throw error;
    }
  }

  // Check if GST number exists (for validation)
  async isGstExists(gst, excludeId = null) {
    try {
      const query = { gst: gst.toUpperCase() };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      return await Branch.exists(query);
    } catch (error) {
      throw error;
    }
  }
}

// Export the class, not an instance
module.exports = BranchRepository; // ✅ Correct