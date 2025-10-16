const branchRepository = require('../repositories/branchRepository');

class BranchService {
  // Create new branch
  async createBranch(branchData) {
    try {
      // Validate unique code
      const codeExists = await branchRepository.isCodeExists(branchData.code);
      if (codeExists) {
        throw new Error('Branch code already exists');
      }

      // Validate unique GST
      const gstExists = await branchRepository.isGstExists(branchData.gst);
      if (gstExists) {
        throw new Error('GST number already exists');
      }

      // Create branch
      return await branchRepository.createBranch(branchData);
      
    } catch (error) {
      throw error;
    }
  }

  // Get all branches
  async getAllBranches(filters) {
    try {
      return await branchRepository.getAllBranches(filters);
    } catch (error) {
      throw error;
    }
  }

  // Get branch by ID
  async getBranchById(id) {
    try {
      const branch = await branchRepository.getBranchById(id);
      if (!branch) {
        throw new Error('Branch not found');
      }
      return branch;
    } catch (error) {
      throw error;
    }
  }

  // Update branch
  async updateBranch(id, updateData) {
    try {
      // Check if branch exists
      const existingBranch = await branchRepository.getBranchById(id);
      if (!existingBranch) {
        throw new Error('Branch not found');
      }

      // Validate unique code if being updated
      if (updateData.code && updateData.code !== existingBranch.code) {
        const codeExists = await branchRepository.isCodeExists(updateData.code, id);
        if (codeExists) {
          throw new Error('Branch code already exists');
        }
      }

      // Validate unique GST if being updated
      if (updateData.gst && updateData.gst !== existingBranch.gst) {
        const gstExists = await branchRepository.isGstExists(updateData.gst, id);
        if (gstExists) {
          throw new Error('GST number already exists');
        }
      }

      return await branchRepository.updateBranch(id, updateData);
    } catch (error) {
      throw error;
    }
  }

  // Delete branch
  async deleteBranch(id) {
    try {
      const branch = await branchRepository.getBranchById(id);
      if (!branch) {
        throw new Error('Branch not found');
      }
      return await branchRepository.deleteBranch(id);
    } catch (error) {
      throw error;
    }
  }

  // Get branch statistics
  async getBranchStatistics() {
    try {
      return await branchRepository.getBranchStatistics();
    } catch (error) {
      throw error;
    }
  }

  // Validate branch data
  validateBranchData(branchData, isUpdate = false) {
    const errors = [];

    // Required fields validation (for create)
    if (!isUpdate) {
      const requiredFields = ['branchName', 'code', 'local', 'nonLocal', 'gst'];
      requiredFields.forEach(field => {
        if (!branchData[field] && branchData[field] !== 0) {
          errors.push(`${field} is required`);
        }
      });
    }

    // GST format validation
    if (branchData.gst) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(branchData.gst.toUpperCase())) {
        errors.push('Invalid GST number format');
      }
    }

    // Amount validation
    if (branchData.local && branchData.local < 0) {
      errors.push('Local amount cannot be negative');
    }
    if (branchData.nonLocal && branchData.nonLocal < 0) {
      errors.push('Non-local amount cannot be negative');
    }

    return errors;
  }
}

module.exports = new BranchService();