const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Personal document validation
const personalDocumentValidation = [
    body('documentType')
        .notEmpty()
        .withMessage('Document type is required')
        .isIn(['AADHAAR', 'PAN', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE'])
        .withMessage('Invalid personal document type'),
    body('documentNumber')
        .notEmpty()
        .withMessage('Document number is required')
        .trim()
        .isLength({ min: 5, max: 20 })
        .withMessage('Document number must be between 5 and 20 characters'),
    handleValidationErrors
];

// Financial document validation
const financialDocumentValidation = [
    body('documentType')
        .notEmpty()
        .withMessage('Document type is required')
        .isIn(['BANK_STATEMENT', 'SALARY_SLIP', 'ITR', 'FORM_16', 'PAYSLIP'])
        .withMessage('Invalid financial document type'),
    body('monthYear')
        .optional()
        .matches(/^(0[1-9]|1[0-2])\/\d{4}$/)
        .withMessage('Month/Year must be in MM/YYYY format'),
    handleValidationErrors
];

// Address document validation
const addressDocumentValidation = [
    body('documentType')
        .notEmpty()
        .withMessage('Document type is required')
        .isIn(['UTILITY_BILL', 'RENT_AGREEMENT', 'PROPERTY_TAX', 'LEASE_DEED'])
        .withMessage('Invalid address document type'),
    body('address')
        .notEmpty()
        .withMessage('Address is required')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Address must be between 10 and 200 characters'),
    handleValidationErrors
];

// Residence verification validation
const residenceVerificationValidation = [
    body('referenceNo')
        .optional()
        .trim()
        .isLength({ min: 5, max: 20 })
        .withMessage('Reference number must be between 5 and 20 characters'),
    body('branchName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Branch name cannot exceed 100 characters'),
    body('typeOfLoan')
        .optional()
        .isIn(['HOME_LOAN', 'PERSONAL_LOAN', 'BUSINESS_LOAN', 'CAR_LOAN', 'EDUCATION_LOAN', 'OTHER'])
        .withMessage('Invalid loan type'),
    body('presentAddress.pincode')
        .optional()
        .matches(/^\d{6}$/)
        .withMessage('Pincode must be 6 digits'),
    body('ownershipResidence')
        .optional()
        .isIn(['OWNED', 'RENTED', 'PARENTAL', 'COMPANY_PROVIDED', 'OTHER'])
        .withMessage('Invalid ownership type'),
    body('typeOfResidence')
        .optional()
        .isIn(['INDEPENDENT_HOUSE', 'APARTMENT', 'VILLA', 'CHAWL', 'SLUM', 'OTHER'])
        .withMessage('Invalid residence type'),
    body('interiorFurniture')
        .optional()
        .isIn(['WELL_FURNISHED', 'FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED'])
        .withMessage('Invalid furniture type'),
    body('typeOfRoof')
        .optional()
        .isIn(['RCC', 'ASBESTOS', 'TILE', 'THATCHED', 'OTHER'])
        .withMessage('Invalid roof type'),
    body('numberOfFloors')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Number of floors must be between 1 and 50'),
    body('areaSqFt')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Area must be a positive number'),
    body('totalFamilyMembers')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Family members must be between 1 and 20'),
    handleValidationErrors
];

// Office verification validation
const officeVerificationValidation = [
    body('referenceNo')
        .optional()
        .trim()
        .isLength({ min: 5, max: 20 })
        .withMessage('Reference number must be between 5 and 20 characters'),
    body('exactCompanyName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Company name must be between 2 and 200 characters'),
    body('designation')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Designation must be between 2 and 100 characters'),
    body('netSalary')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Net salary must be a positive number'),
    body('officeAddress.pincode')
        .optional()
        .matches(/^\d{6}$/)
        .withMessage('Office pincode must be 6 digits'),
    body('numberOfEmployeesSeen')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Number of employees must be non-negative'),
    handleValidationErrors
];

// Business verification validation
const businessVerificationValidation = [
    body('referenceNo')
        .optional()
        .trim()
        .isLength({ min: 5, max: 20 })
        .withMessage('Reference number must be between 5 and 20 characters'),
    body('exactCompanyName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Company name must be between 2 and 200 characters'),
    body('designationOfApplicant')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Designation must be between 2 and 100 characters'),
    body('officePremises')
        .optional()
        .isIn(['OWNED', 'RENTED', 'SHARED', 'OTHER'])
        .withMessage('Invalid office premises type'),
    body('numberOfYears')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Number of years must be between 0 and 100'),
    body('payingRent')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Rent amount must be non-negative'),
    body('locatingOffice')
        .optional()
        .isIn(['EASY', 'MODERATE', 'DIFFICULT'])
        .withMessage('Invalid office location difficulty'),
    body('areaInSqFt')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Area must be a positive number'),
    body('numberOfEmployees')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Number of employees must be non-negative'),
    body('officeLocation')
        .optional()
        .isIn(['COMMERCIAL_AREA', 'RESIDENTIAL_AREA', 'INDUSTRIAL_AREA', 'MIXED_USE', 'OTHER'])
        .withMessage('Invalid office location type'),
    body('rating')
        .optional()
        .isIn(['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'NEGATIVE'])
        .withMessage('Invalid rating'),
    handleValidationErrors
];

// Generic document upload validation (legacy support)
const documentUploadValidation = [
    body('documentType')
        .notEmpty()
        .withMessage('Document type is required'),
    handleValidationErrors
];

module.exports = {
    personalDocumentValidation,
    financialDocumentValidation,
    addressDocumentValidation,
    residenceVerificationValidation,
    officeVerificationValidation,
    businessVerificationValidation,
    documentUploadValidation,
    handleValidationErrors
};
