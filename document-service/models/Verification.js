// models/Verification.js
const mongoose = require('mongoose');
const DocumentCounter = require('./DocumentCounter');

const verificationSchema = new mongoose.Schema({
  // Verification Type and Document Number
  verificationType: [{
    type: String,
    enum: ['RESIDENCE_VERIFICATION', 'OFFICE_VERIFICATION', 'BUSINESS_VERIFICATION']
  }],
  documentNumber: {
    type: String,
    required: true,
    unique: true
  },

  // Common Administrative Details (initially optional, required later)
  administrativeDetails: {
    dateOfReceipt: {
      type: Date,
      required: false
    },
    dateOfReport: Date,
    referenceNo: {
      type: String,
      required: false
    },
    branchName: {
      type: String,
      required: false
    },
    typeOfLoan: {
      type: String,
      required: false
    },
    applicantName: {
      type: String,
      required: false
    }
  },

  // RESIDENCE VERIFICATION Specific Fields
  residenceVerification: {
    // Step 2: Address Information
    addressInformation: {
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
      landMark: String
    },

    // Step 3: Property Details
    propertyDetails: {
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
      namePlateSighted: Boolean,
      entryIntoResidencePermitted: Boolean
    },

    // Step 4: Personal Information
    personalInformation: {
      relationshipOfPerson: String,
      dateOfBirth: Date,
      aadharCardNo: String,
      panCardNo: String,
      mobileNo1: String,
      mobileNo2: String,
      mobileNo3: String,
      qualification: String,
      totalFamilyMembers: Number,
      visibleItems: [String]
    },

    // Step 5: Verification Status
    verificationStatus: {
      addressConfirmed: Boolean,
      neighboursVerification: Boolean,
      neighboursComments: String,
      status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED'],
        default: 'PENDING'
      },
      verifiedBy: String,
      verificationDate: Date
    },

    // Step 6: Comments & Authorization
    commentsAuthorization: {
      comments: String,
      fieldExecutiveComments: String,
      verifiersName: String,
      authorizedSignatory: String
    }
  },

  // OFFICE VERIFICATION Specific Fields
  officeVerification: {
    // Step 2: Office Information
    officeInformation: {
      officeAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' }
      },
      exactCompanyName: String,
      designation: String,
      employeeId: String,
      workingSince: Date,
      netSalary: Number,
      officeFloor: String
    },

    // Step 3: Employee Details
    employeeDetails: {
      personContacted: Boolean,
      personContactedName: String,
      personMet: Boolean,
      personMetName: String,
      designationOfPerson: String
    },

    // Step 4: Contact Information
    contactInformation: {
      mobileNo1: String,
      mobileNo2: String,
      mobileNo3: String
    },

    // Step 5: Business Details
    businessDetails: {
      natureOfBusiness: String,
      numberOfEmployeesSeen: Number,
      landMark: String,
      nameBoardSighted: Boolean,
      businessActivitySeen: Boolean,
      equipmentSighted: Boolean,
      visitingCardObtained: Boolean,
      residenceCumOffice: Boolean,
      workConfirmed: Boolean
    },

    // Step 6: Comments & Authorization
    commentsAuthorization: {
      comments: String,
      fieldExecutiveComments: String,
      verifiersName: String,
      authorizedSignatory: String
    },

    // Verification Status
    verificationStatus: {
      status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED'],
        default: 'PENDING'
      },
      verifiedBy: String,
      verificationDate: Date
    }
  },

  // BUSINESS VERIFICATION Specific Fields
  businessVerification: {
    // Step 2: Business Address Information
    businessAddress: {
      officeAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' }
      },
      exactCompanyName: String,
      designationOfApplicant: String
    },

    // Step 3: Company & Contact Details
    companyContactDetails: {
      contactPersonName: String,
      contactPersonDesignation: String,
      mobileNo1: String,
      mobileNo2: String,
      mobileNo3: String
    },

    // Step 4: Business Premises Details
    businessPremises: {
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
      businessNeighbour: String
    },

    // Step 5: Legal Information
    legalInformation: {
      tradeLicenseNo: String,
      gstNo: String
    },

    // Step 6: Comments & Authorization
    commentsAuthorization: {
      fieldExecutiveComments: String,
      rating: {
        type: String,
        enum: ['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'NEGATIVE']
      },
      fieldExecutiveName: String,
      authorizedSignatory: String
    },

    // Verification Status
    verificationStatus: {
      status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED'],
        default: 'PENDING'
      },
      verifiedBy: String,
      verificationDate: Date
    }
  },

  // Step 7: Document Upload for all verification types
  documents: [{
    documentType: {
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
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    rejectionReason: String
  }],

  // Overall verification progress tracking
  completionSteps: {
    administrativeDetails: { type: Boolean, default: false },
    addressInformation: { type: Boolean, default: false },
    propertyDetails: { type: Boolean, default: false },
    personalInformation: { type: Boolean, default: false },
    verificationStatus: { type: Boolean, default: false },
    commentsAuthorization: { type: Boolean, default: false },
    documentUpload: { type: Boolean, default: false }
  },

  // Overall Status
  overallStatus: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'IN_PROGRESS', 'VERIFIED', 'REJECTED'],
    default: 'DRAFT'
  },

  // System fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
verificationSchema.index({ documentNumber: 1 }, { unique: true });
verificationSchema.index({ verificationType: 1 });
verificationSchema.index({ overallStatus: 1 });
verificationSchema.index({ createdBy: 1 });
verificationSchema.index({ 'administrativeDetails.referenceNo': 1 });

// Pre-save middleware to generate document number
verificationSchema.pre('save', async function(next) {
  if (this.isNew && !this.documentNumber) {
    try {
      // Get next sequence number (this will increment)
      const counter = await DocumentCounter.getNextSequence();
      const currentDate = DocumentCounter.getCurrentDate();
      
      // Format: 001/15-10-2025, 002/15-10-2025, etc.
      this.documentNumber = `${counter.sequence_value.toString().padStart(3, '0')}/${currentDate}`;
      this.documentDate = currentDate;
      
      next();
    } catch (error) {
      console.error('Error generating document number:', error);
      next(error);
    }
  } else {
    next();
  }
});

// Method to find all verifications by document number (across all types)
verificationSchema.statics.findAllByDocumentNumber = function(documentNumber) {
  return this.find({ documentNumber });
};

// Virtual for completion percentage
verificationSchema.virtual('completionPercentage').get(function() {
  const steps = Object.values(this.completionSteps);
  const completedSteps = steps.filter(step => step === true).length;
  return Math.round((completedSteps / steps.length) * 100);
});

// Method to get verification-specific data
verificationSchema.methods.getVerificationData = function() {
  const data = {};
  
  const types = Array.isArray(this.verificationType) ? this.verificationType : [this.verificationType];
  
  types.forEach(type => {
    switch (type) {
      case 'RESIDENCE_VERIFICATION':
        if (this.residenceVerification) data.residenceVerification = this.residenceVerification;
        break;
      case 'OFFICE_VERIFICATION':
        if (this.officeVerification) data.officeVerification = this.officeVerification;
        break;
      case 'BUSINESS_VERIFICATION':
        if (this.businessVerification) data.businessVerification = this.businessVerification;
        break;
    }
  });
  
  return data;
};

// Method to update completion steps
verificationSchema.methods.updateCompletionSteps = function() {
  const verificationData = this.getVerificationData();
  
  this.completionSteps.administrativeDetails = !!(this.administrativeDetails && this.administrativeDetails.dateOfReceipt && this.administrativeDetails.referenceNo);
  
  const types = Array.isArray(this.verificationType) ? this.verificationType : [this.verificationType];
  
  this.completionSteps.addressInformation = false;
  this.completionSteps.propertyDetails = false;
  this.completionSteps.personalInformation = false;
  this.completionSteps.verificationStatus = false;
  this.completionSteps.commentsAuthorization = false;
  
  types.forEach(type => {
    if (type === 'RESIDENCE_VERIFICATION' && verificationData.residenceVerification) {
      this.completionSteps.addressInformation = this.completionSteps.addressInformation || !!(verificationData.residenceVerification.addressInformation?.presentAddress);
      this.completionSteps.propertyDetails = this.completionSteps.propertyDetails || !!(verificationData.residenceVerification.propertyDetails?.ownershipResidence);
      this.completionSteps.personalInformation = this.completionSteps.personalInformation || !!(verificationData.residenceVerification.personalInformation?.dateOfBirth);
      this.completionSteps.verificationStatus = this.completionSteps.verificationStatus || !!(verificationData.residenceVerification.verificationStatus?.status);
      this.completionSteps.commentsAuthorization = this.completionSteps.commentsAuthorization || !!(verificationData.residenceVerification.commentsAuthorization?.verifiersName);
    } else if (type === 'OFFICE_VERIFICATION' && verificationData.officeVerification) {
      this.completionSteps.addressInformation = this.completionSteps.addressInformation || !!(verificationData.officeVerification.officeInformation?.officeAddress);
      this.completionSteps.propertyDetails = this.completionSteps.propertyDetails || !!(verificationData.officeVerification.employeeDetails?.personContacted !== undefined);
      this.completionSteps.personalInformation = this.completionSteps.personalInformation || !!(verificationData.officeVerification.contactInformation?.mobileNo1);
      this.completionSteps.verificationStatus = this.completionSteps.verificationStatus || !!(verificationData.officeVerification.verificationStatus?.status);
      this.completionSteps.commentsAuthorization = this.completionSteps.commentsAuthorization || !!(verificationData.officeVerification.commentsAuthorization?.verifiersName);
    } else if (type === 'BUSINESS_VERIFICATION' && verificationData.businessVerification) {
      this.completionSteps.addressInformation = this.completionSteps.addressInformation || !!(verificationData.businessVerification.businessAddress?.officeAddress);
      this.completionSteps.propertyDetails = this.completionSteps.propertyDetails || !!(verificationData.businessVerification.companyContactDetails?.contactPersonName);
      this.completionSteps.personalInformation = this.completionSteps.personalInformation || !!(verificationData.businessVerification.businessPremises?.natureOfBusiness);
      this.completionSteps.verificationStatus = this.completionSteps.verificationStatus || !!(verificationData.businessVerification.verificationStatus?.status);
      this.completionSteps.commentsAuthorization = this.completionSteps.commentsAuthorization || !!(verificationData.businessVerification.commentsAuthorization?.verifiersName);
    }
  });
  
  this.completionSteps.documentUpload = this.documents.length > 0;
};

// Pre-save middleware to update completion steps and overall status
verificationSchema.pre('save', function(next) {
  this.updateCompletionSteps();
  
  const percentage = this.completionPercentage;
  if (percentage === 100) {
    this.overallStatus = 'SUBMITTED';
  } else if (percentage > 0) {
    this.overallStatus = 'DRAFT';
  }
  
  next();
});

// Static method to find by document number and verification type
verificationSchema.statics.findByDocumentNumber = function(documentNumber, verificationType = null) {
  const query = { documentNumber };
  if (verificationType) {
    query.verificationType = verificationType;
  }
  return this.findOne(query);
};

module.exports = mongoose.model('Verification', verificationSchema);