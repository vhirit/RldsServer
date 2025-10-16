const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const branchSchema = new mongoose.Schema({
  branchName: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
    maxlength: [100, 'Branch name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Branch code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [10, 'Branch code cannot exceed 10 characters']
  },
  local: {
    type: Number,
    required: [true, 'Local amount is required'],
    min: [0, 'Local amount cannot be negative']
  },
  nonLocal: {
    type: Number,
    required: [true, 'Non-local amount is required'],
    min: [0, 'Non-local amount cannot be negative']
  },
   gst: {
    type: String,
    required: [true, 'GST number is required'],
    trim: true,
    uppercase: true,
    // Updated GST validation - more flexible
    validate: {
      validator: function(gst) {
        // Basic GST validation - 15 characters alphanumeric
        return /^[0-9A-Z]{15}$/.test(gst);
      },
      message: 'Please enter a valid 15-character GST number'
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  // Optional fields
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: [100, 'Contact person name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  openingDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total amount
branchSchema.virtual('totalAmount').get(function() {
  return (this.local || 0) + (this.nonLocal || 0);
});

// Index for better query performance
branchSchema.index({ code: 1 });
branchSchema.index({ status: 1 });
branchSchema.index({ branchName: 'text' });

// Pre-save middleware to validate data
branchSchema.pre('save', function(next) {
  // Convert amounts to numbers
  if (this.local) this.local = Number(this.local);
  if (this.nonLocal) this.nonLocal = Number(this.nonLocal);
  
  // Trim string fields
  if (this.branchName) this.branchName = this.branchName.trim();
  if (this.code) this.code = this.code.toUpperCase().trim();
  if (this.gst) this.gst = this.gst.toUpperCase().trim();
  
  next();
});

// Static method to get branch statistics
branchSchema.statics.getBranchStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalBranches: { $sum: 1 },
        activeBranches: {
          $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
        },
        totalLocal: { $sum: '$local' },
        totalNonLocal: { $sum: '$nonLocal' },
        totalAmount: { $sum: { $add: ['$local', '$nonLocal'] } }
      }
    }
  ]);
};

// Instance method to check if branch is active
branchSchema.methods.isActive = function() {
  return this.status === 'Active';
};

// Add pagination plugin
branchSchema.plugin(mongoosePaginate);

// Check if model already exists to avoid OverwriteModelError
module.exports = mongoose.models.Branch || mongoose.model('Branch', branchSchema);