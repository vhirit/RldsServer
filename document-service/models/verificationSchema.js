
const mongoose = require('mongoose');

// Verification Schema
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
      required: false // Make optional for initial creation
    },
    dateOfReport: Date,
    referenceNo: {
      type: String,
      required: false // Make optional for initial creation
    },
    branchName: {
      type: String,
      required: false // Make optional for initial creation
    },
    typeOfLoan: {
      type: String,
      required: false // Make optional for initial creation
    },
    applicantName: {
      type: String,
      required: false // Make optional for initial creation
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
    required: false // Make optional for initial creation, will be set automatically
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

// Virtual for completion percentage
verificationSchema.virtual('completionPercentage').get(function() {
  const steps = Object.values(this.completionSteps);
  const completedSteps = steps.filter(step => step === true).length;
  return Math.round((completedSteps / steps.length) * 100);
});

// Method to get verification-specific data
verificationSchema.methods.getVerificationData = function() {
  switch (this.verificationType) {
    case 'RESIDENCE_VERIFICATION':
      return this.residenceVerification;
    case 'OFFICE_VERIFICATION':
      return this.officeVerification;
    case 'BUSINESS_VERIFICATION':
      return this.businessVerification;
    default:
      return {};
  }
};

// Method to update completion steps
verificationSchema.methods.updateCompletionSteps = function() {
  const verificationData = this.getVerificationData();
  
  // Update steps based on data presence
  this.completionSteps.administrativeDetails = !!(this.administrativeDetails.dateOfReceipt && this.administrativeDetails.referenceNo);
  
  if (this.verificationType === 'RESIDENCE_VERIFICATION') {
    this.completionSteps.addressInformation = !!(verificationData.addressInformation?.presentAddress);
    this.completionSteps.propertyDetails = !!(verificationData.propertyDetails?.ownershipResidence);
    this.completionSteps.personalInformation = !!(verificationData.personalInformation?.dateOfBirth);
  } else if (this.verificationType === 'OFFICE_VERIFICATION') {
    this.completionSteps.addressInformation = !!(verificationData.officeInformation?.officeAddress);
    this.completionSteps.propertyDetails = !!(verificationData.employeeDetails?.personContacted !== undefined);
    this.completionSteps.personalInformation = !!(verificationData.contactInformation?.mobileNo1);
  } else if (this.verificationType === 'BUSINESS_VERIFICATION') {
    this.completionSteps.addressInformation = !!(verificationData.businessAddress?.officeAddress);
    this.completionSteps.propertyDetails = !!(verificationData.companyContactDetails?.contactPersonName);
    this.completionSteps.personalInformation = !!(verificationData.businessPremises?.natureOfBusiness);
  }
  
  this.completionSteps.verificationStatus = !!(verificationData.verificationStatus?.status);
  this.completionSteps.commentsAuthorization = !!(verificationData.commentsAuthorization?.verifiersName);
  this.completionSteps.documentUpload = this.documents.length > 0;
};

// Pre-save middleware to update completion steps and overall status
verificationSchema.pre('save', function(next) {
  this.updateCompletionSteps();
  
  // Update overall status based on completion
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