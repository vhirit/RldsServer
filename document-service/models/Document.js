const mongoose = require('mongoose');

// Main Document Registration Schema
const documentSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
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
    rejectionReason: String
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
    monthYear: String, // For salary slips, bank statements
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
    rejectionReason: String
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
    rejectionReason: String
  }],
  
  // 1. Residence Verification
  residenceVerification: {
    // Administrative Details
    dateOfReceipt: Date,
    dateOfReport: Date,
    referenceNo: String,
    branchName: String,
    typeOfLoan: String,
    
    // Applicant Information
    applicantName: String,
    relationshipOfPerson: String,
    
    // Address Information
    presentAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    permanentAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    locality: String,
    accessibility: String,
    withinMunicipalLimit: Boolean,
    
    // Property Details
    ownershipResidence: {
      type: String,
      enum: ['OWNED', 'RENTED', 'PARENTAL', 'COMPANY_PROVIDED', 'OTHER']
    },
    typeOfResidence: {
      type: String,
      enum: ['INDEPENDENT_HOUSE', 'APARTMENT', 'VILLA', 'CHAWL', 'SLUM', 'OTHER']
    },
    interiorFurniture: {
      type: String,
      enum: ['WELL_FURNISHED', 'FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']
    },
    typeOfRoof: {
      type: String,
      enum: ['RCC', 'ASBESTOS', 'TILE', 'THATCHED', 'OTHER']
    },
    numberOfFloors: Number,
    vehiclesFoundAtResidence: [String],
    yearsOfStay: Number,
    monthsOfStay: Number,
    areaSqFt: Number,
    
    // Verification Details
    namePlateSighted: Boolean,
    entryIntoResidencePermitted: Boolean,
    
    // Personal Information
    dateOfBirth: Date,
    aadharCardNo: String,
    panCardNo: String,
    mobileNo1: String,
    mobileNo2: String,
    mobileNo3: String,
    qualification: String,
    
    // Location Details
    landMark: String,
    totalFamilyMembers: Number,
    visibleItems: [String],
    
    // Verification Results
    addressConfirmed: Boolean,
    neighboursVerification: Boolean,
    neighboursComments: String,
    
    // Comments and Authorization
    comments: String,
    fieldExecutiveComments: String,
    verifiersName: String,
    authorizedSignatory: String,
    
    // System Fields
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },
    verifiedBy: String,
    verificationDate: Date,
    updatedAt: { type: Date, default: Date.now }
  },

  // 2. Office/Employee Verification
  officeVerification: {
    // Administrative Details
    dateOfReceipt: Date,
    dateOfReport: Date,
    referenceNo: String,
    branchName: String,
    typeOfLoan: String,
    
    // Office Address
    officeAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    
    // Company Information
    exactCompanyName: String,
    designation: String,
    employeeId: String,
    workingSince: Date,
    netSalary: Number,
    officeFloor: String,
    
    // Contact Information
    personContacted: Boolean,
    personContactedName: String,
    personMet: Boolean,
    personMetName: String,
    designationOfPerson: String,
    mobileNo1: String,
    mobileNo2: String,
    mobileNo3: String,
    
    // Business Details
    natureOfBusiness: String,
    numberOfEmployeesSeen: Number,
    landMark: String,
    nameBoardSighted: Boolean,
    businessActivitySeen: Boolean,
    equipmentSighted: Boolean,
    visitingCardObtained: Boolean,
    residenceCumOffice: Boolean,
    workConfirmed: Boolean,
    
    // Comments and Authorization
    comments: String,
    fieldExecutiveComments: String,
    verifiersName: String,
    authorizedSignatory: String,
    
    // System Fields
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },
    verifiedBy: String,
    verificationDate: Date,
    updatedAt: { type: Date, default: Date.now }
  },

  // 3. Business Verification
  businessVerification: {
    // Administrative Details
    dateOfReceipt: Date,
    dateOfReport: Date,
    referenceNo: String,
    branchName: String,
    typeOfLoan: String,
    
    // Applicant Information
    applicantName: String,
    
    // Office Address
    officeAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    
    // Company Information
    exactCompanyName: String,
    designationOfApplicant: String,
    contactPersonName: String,
    contactPersonDesignation: String,
    
    // Business Details
    natureOfBusiness: String,
    officePremises: {
      type: String,
      enum: ['OWNED', 'RENTED', 'SHARED', 'OTHER']
    },
    numberOfYears: Number,
    payingRent: Number,
    nameBoardSighted: Boolean,
    businessActivitySeen: Boolean,
    equipmentSighted: Boolean,
    visitingCardObtained: Boolean,
    residenceCumOffice: Boolean,
    locatingOffice: {
      type: String,
      enum: ['EASY', 'MODERATE', 'DIFFICULT']
    },
    areaInSqFt: Number,
    numberOfEmployees: Number,
    officeLocation: {
      type: String,
      enum: ['COMMERCIAL_AREA', 'RESIDENTIAL_AREA', 'INDUSTRIAL_AREA', 'MIXED_USE', 'OTHER']
    },
    businessNeighbour: String,
    
    // Legal Information
    tradeLicenseNo: String,
    gstNo: String,
    
    // Comments and Authorization
    fieldExecutiveComments: String,
    rating: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'NEGATIVE']
    },
    fieldExecutiveName: String,
    authorizedSignatory: String,
    
    // System Fields
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },
    verifiedBy: String,
    verificationDate: Date,
    updatedAt: { type: Date, default: Date.now }
  },
  
  // Overall Status
  overallStatus: {
    type: String,
    enum: ['INCOMPLETE', 'PENDING', 'VERIFIED', 'REJECTED'],
    default: 'INCOMPLETE'
  },
  
  // Completion Tracking
  completionSteps: {
    personalDocuments: { type: Boolean, default: false },
    financialDocuments: { type: Boolean, default: false },
    addressDocuments: { type: Boolean, default: false },
    homeVerification: { type: Boolean, default: false },
    officeVerification: { type: Boolean, default: false }
  },
  
  // Verification History
  verificationHistory: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String,
    previousStatus: String,
    newStatus: String
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});// Indexes for better performance
documentSchema.index({ userId: 1 });
documentSchema.index({ overallStatus: 1 });
documentSchema.index({ 'personalDocuments.documentType': 1 });
documentSchema.index({ 'personalDocuments.documentNumber': 1 });
documentSchema.index({ 'homeAddressVerification.verificationStatus': 1 });
documentSchema.index({ 'officeAddressVerification.verificationStatus': 1 });
documentSchema.index({ createdAt: 1 });

// Virtual for completion percentage
documentSchema.virtual('completionPercentage').get(function() {
  const steps = Object.values(this.completionSteps);
  const completedSteps = steps.filter(step => step === true).length;
  return Math.round((completedSteps / steps.length) * 100);
});

// Method to check if all documents are uploaded
documentSchema.methods.isDocumentUploadComplete = function() {
  return this.personalDocuments.length > 0 && 
         this.financialDocuments.length > 0 && 
         this.addressDocuments.length > 0;
};

// Method to check if verifications are complete
documentSchema.methods.isVerificationComplete = function() {
  return this.homeAddressVerification?.verificationStatus === 'VERIFIED' &&
         this.officeAddressVerification?.verificationStatus === 'VERIFIED';
};

// Pre-save middleware to update completion steps
documentSchema.pre('save', function(next) {
  // Update completion steps based on data
  this.completionSteps.personalDocuments = this.personalDocuments.length > 0;
  this.completionSteps.financialDocuments = this.financialDocuments.length > 0;
  this.completionSteps.addressDocuments = this.addressDocuments.length > 0;
  this.completionSteps.homeVerification = this.homeAddressVerification?.verificationStatus === 'VERIFIED';
  this.completionSteps.officeVerification = this.officeAddressVerification?.verificationStatus === 'VERIFIED';
  
  // Update overall status
  if (this.isVerificationComplete()) {
    this.overallStatus = 'VERIFIED';
  } else if (this.isDocumentUploadComplete()) {
    this.overallStatus = 'PENDING';
  } else {
    this.overallStatus = 'INCOMPLETE';
  }
  
  next();
});

module.exports = mongoose.model('Document', documentSchema);