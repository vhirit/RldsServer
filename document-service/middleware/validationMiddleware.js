const { errorResponse } = require('../utils/responseHandler');

const validateVerification = (req, res, next) => {
  const { verificationType, documentNumber, administrativeDetails } = req.body;

  // Basic validation
  if (!verificationType || !documentNumber) {
    return errorResponse(res, 'Verification type and document number are required', 400);
  }

  // Validate verification type - handle both array and single values
  const validTypes = ['RESIDENCE_VERIFICATION', 'OFFICE_VERIFICATION', 'BUSINESS_VERIFICATION'];
  
  if (Array.isArray(verificationType)) {
    // Check if all types in array are valid
    const invalidTypes = verificationType.filter(type => !validTypes.includes(type));
    if (invalidTypes.length > 0) {
      return errorResponse(res, `Invalid verification types: ${invalidTypes.join(', ')}`, 400);
    }
    if (verificationType.length === 0) {
      return errorResponse(res, 'At least one verification type is required', 400);
    }
  } else {
    // Single verification type validation
    if (!validTypes.includes(verificationType)) {
      return errorResponse(res, 'Invalid verification type', 400);
    }
  }

  // Administrative details validation (optional for initial creation)
  if (administrativeDetails && Object.keys(administrativeDetails).length > 0) {
    if (!administrativeDetails.dateOfReceipt || !administrativeDetails.referenceNo || 
        !administrativeDetails.branchName || !administrativeDetails.typeOfLoan || 
        !administrativeDetails.applicantName) {
      return errorResponse(res, 'All administrative details are required when provided', 400);
    }
  }

  next();
};

module.exports = { validateVerification };