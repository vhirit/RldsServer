// models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  // Document Reference Number (for WebSocket broadcasting)
  documentReferenceNumber: {
    type: String,
    unique: true,
    sparse: true
  },

  // Selected Verification Types
  selectedVerificationTypes: [{
    type: String,
    enum: ['residence', 'office', 'business']
  }],
  
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Personal Documents
  personalDocuments: [{
    documentType: {
      type: String,
      required: true,
      enum: ['AADHAAR', 'PAN', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE']
    },
    documentNumber: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'],
      default: 'PENDING'
    },
    rejectionReason: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Financial Documents
  financialDocuments: [{
    documentType: {
      type: String,
      required: true,
      enum: ['BANK_STATEMENT', 'SALARY_SLIP', 'ITR', 'FORM_16', 'PAYSLIP']
    },
    documentNumber: String,
    bankName: String,
    accountNumber: String,
    monthYear: String,
    fileUrl: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    rejectionReason: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Address Proof Documents
  addressDocuments: [{
    documentType: {
      type: String,
      required: true,
      enum: ['UTILITY_BILL', 'RENT_AGREEMENT', 'PROPERTY_TAX', 'LEASE_DEED']
    },
    documentNumber: String,
    address: String,
    fileUrl: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    rejectionReason: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Reference to Verification documents
  verifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Verification'
  }],
  
  // Overall Status
  overallStatus: {
    type: String,
    enum: ['INCOMPLETE', 'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
    default: 'INCOMPLETE'
  },
  
  // Completion Tracking
  completionSteps: {
    personalDocuments: { type: Boolean, default: false },
    financialDocuments: { type: Boolean, default: false },
    addressDocuments: { type: Boolean, default: false },
    verifications: { type: Boolean, default: false }
  },

  // Document Verification Progress
  verificationProgress: {
    personalDocuments: {
      verified: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    financialDocuments: {
      verified: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    addressDocuments: {
      verified: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    overallPercentage: { type: Number, default: 0 }
  },

  // Verification History
  verificationHistory: [{
    action: {
      type: String,
      required: true,
      enum: ['DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'STATUS_CHANGED', 'VERIFICATION_ADDED']
    },
    documentType: String,
    documentId: mongoose.Schema.Types.ObjectId,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String,
    previousStatus: String,
    newStatus: String,
    metadata: mongoose.Schema.Types.Mixed
  }],

  // Additional Metadata
  metadata: {
    lastDocumentUpload: Date,
    lastVerificationUpdate: Date,
    totalDocuments: { type: Number, default: 0 },
    verifiedDocuments: { type: Number, default: 0 },
    rejectedDocuments: { type: Number, default: 0 }
  },

  // Expiry and Review Dates
  reviewDate: Date,
  expiryDate: Date,
  nextReviewDate: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
documentSchema.index({ documentReferenceNumber: 1 });
documentSchema.index({ userId: 1 });
documentSchema.index({ overallStatus: 1 });
documentSchema.index({ 'personalDocuments.documentType': 1 });
documentSchema.index({ 'personalDocuments.documentNumber': 1 });
documentSchema.index({ 'financialDocuments.documentType': 1 });
documentSchema.index({ 'addressDocuments.documentType': 1 });
documentSchema.index({ createdAt: 1 });
documentSchema.index({ 'metadata.lastDocumentUpload': 1 });
documentSchema.index({ expiryDate: 1 });

// Virtual for completion percentage
documentSchema.virtual('completionPercentage').get(function() {
  const steps = Object.values(this.completionSteps);
  const completedSteps = steps.filter(step => step === true).length;
  return Math.round((completedSteps / steps.length) * 100);
});

// Virtual for document statistics
documentSchema.virtual('documentStats').get(function() {
  const personalVerified = this.personalDocuments.filter(doc => doc.verified).length;
  const financialVerified = this.financialDocuments.filter(doc => doc.verified).length;
  const addressVerified = this.addressDocuments.filter(doc => doc.verified).length;
  
  const totalDocuments = this.personalDocuments.length + this.financialDocuments.length + this.addressDocuments.length;
  const totalVerified = personalVerified + financialVerified + addressVerified;
  
  return {
    personal: { total: this.personalDocuments.length, verified: personalVerified },
    financial: { total: this.financialDocuments.length, verified: financialVerified },
    address: { total: this.addressDocuments.length, verified: addressVerified },
    overall: { total: totalDocuments, verified: totalVerified }
  };
});

// Method to check if all documents are uploaded
documentSchema.methods.isDocumentUploadComplete = function() {
  return this.personalDocuments.length > 0 && 
         this.financialDocuments.length > 0 && 
         this.addressDocuments.length > 0;
};

// Method to check if verifications are complete
documentSchema.methods.isVerificationComplete = function() {
  if (this.verifications.length === 0) return false;
  
  return this.verifications.every(verification => 
    verification.verificationStatus?.status === 'VERIFIED'
  );
};

// Method to add verification history
documentSchema.methods.addVerificationHistory = function(historyData) {
  this.verificationHistory.push(historyData);
  
  if (this.verificationHistory.length > 50) {
    this.verificationHistory = this.verificationHistory.slice(-50);
  }
};

// Method to update verification progress
documentSchema.methods.updateVerificationProgress = function() {
  // Personal Documents Progress
  const personalTotal = this.personalDocuments.length;
  const personalVerified = this.personalDocuments.filter(doc => doc.verified).length;
  this.verificationProgress.personalDocuments = {
    verified: personalVerified,
    total: personalTotal,
    percentage: personalTotal > 0 ? Math.round((personalVerified / personalTotal) * 100) : 0
  };

  // Financial Documents Progress
  const financialTotal = this.financialDocuments.length;
  const financialVerified = this.financialDocuments.filter(doc => doc.verified).length;
  this.verificationProgress.financialDocuments = {
    verified: financialVerified,
    total: financialTotal,
    percentage: financialTotal > 0 ? Math.round((financialVerified / financialTotal) * 100) : 0
  };

  // Address Documents Progress
  const addressTotal = this.addressDocuments.length;
  const addressVerified = this.addressDocuments.filter(doc => doc.verified).length;
  this.verificationProgress.addressDocuments = {
    verified: addressVerified,
    total: addressTotal,
    percentage: addressTotal > 0 ? Math.round((addressVerified / addressTotal) * 100) : 0
  };

  // Overall Percentage (weighted average)
  const totalDocs = personalTotal + financialTotal + addressTotal;
  if (totalDocs > 0) {
    const weightedSum = 
      (this.verificationProgress.personalDocuments.percentage * personalTotal) +
      (this.verificationProgress.financialDocuments.percentage * financialTotal) +
      (this.verificationProgress.addressDocuments.percentage * addressTotal);
    
    this.verificationProgress.overallPercentage = Math.round(weightedSum / totalDocs);
  } else {
    this.verificationProgress.overallPercentage = 0;
  }
};

// Method to update metadata
documentSchema.methods.updateMetadata = function() {
  const totalDocuments = this.personalDocuments.length + this.financialDocuments.length + this.addressDocuments.length;
  const verifiedDocuments = this.personalDocuments.filter(doc => doc.verified).length +
                           this.financialDocuments.filter(doc => doc.verified).length +
                           this.addressDocuments.filter(doc => doc.verified).length;
  const rejectedDocuments = this.personalDocuments.filter(doc => doc.status === 'REJECTED').length +
                           this.financialDocuments.filter(doc => doc.status === 'REJECTED').length +
                           this.addressDocuments.filter(doc => doc.status === 'REJECTED').length;

  this.metadata = {
    lastDocumentUpload: this.metadata.lastDocumentUpload,
    lastVerificationUpdate: new Date(),
    totalDocuments,
    verifiedDocuments,
    rejectedDocuments
  };
};

// Pre-save middleware to update completion steps and progress
documentSchema.pre('save', function(next) {
  this.completionSteps.personalDocuments = this.personalDocuments.length > 0;
  this.completionSteps.financialDocuments = this.financialDocuments.length > 0;
  this.completionSteps.addressDocuments = this.addressDocuments.length > 0;
  this.completionSteps.verifications = this.verifications.length > 0;
  
  this.updateVerificationProgress();
  this.updateMetadata();
  
  const completionPct = this.completionPercentage;
  const verificationPct = this.verificationProgress.overallPercentage;
  
  if (completionPct === 100 && verificationPct === 100) {
    this.overallStatus = 'VERIFIED';
  } else if (completionPct === 100 && verificationPct > 0) {
    this.overallStatus = 'UNDER_REVIEW';
  } else if (completionPct === 100) {
    this.overallStatus = 'PENDING';
  } else {
    this.overallStatus = 'INCOMPLETE';
  }
  
  if (!this.reviewDate && this.overallStatus === 'PENDING') {
    this.reviewDate = new Date();
  }
  
  if (!this.nextReviewDate && this.overallStatus === 'UNDER_REVIEW') {
    this.nextReviewDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Static method to find by user ID
documentSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId })
    .populate('verifications')
    .populate('userId')
    .populate('personalDocuments.verifiedBy')
    .populate('financialDocuments.verifiedBy')
    .populate('addressDocuments.verifiedBy')
    .populate('verificationHistory.performedBy');
};

// Static method to get document statistics
documentSchema.statics.getDocumentStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$overallStatus',
        count: { $sum: 1 },
        totalDocuments: { $sum: '$metadata.totalDocuments' },
        verifiedDocuments: { $sum: '$metadata.verifiedDocuments' }
      }
    },
    {
      $group: {
        _id: null,
        statusCounts: {
          $push: {
            status: '$_id',
            count: '$count'
          }
        },
        totalRecords: { $sum: '$count' },
        totalAllDocuments: { $sum: '$totalDocuments' },
        totalVerifiedDocuments: { $sum: '$verifiedDocuments' }
      }
    }
  ]);
};

module.exports = mongoose.model('Document', documentSchema);