# Document Management API Documentation

## Overview
This API provides comprehensive document management with multi-step registration and three types of verification: Residence, Office, and Business verification with detailed field collection as per loan processing requirements.

## Base URL
```
http://localhost:3000/api/documents
```

## Authentication
All endpoints require JWT authentication header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. DOCUMENT UPLOAD ENDPOINTS

### 1.1 Upload Personal Documents
**POST** `/personal`
- Upload PAN, Aadhaar, Passport, Voter ID, Driving License
- **Content-Type**: multipart/form-data
- **Fields**: 
  - `files`: Multiple files (images/PDFs, max 10MB each)
  - `documentType`: AADHAAR | PAN | PASSPORT | VOTER_ID | DRIVING_LICENSE
  - `documentNumber`: Document identification number

### 1.2 Upload Financial Documents  
**POST** `/financial`
- Upload Bank Statements, Salary Slips, ITR, Form 16
- **Content-Type**: multipart/form-data
- **Fields**:
  - `files`: Multiple files (images/PDFs, max 10MB each)
  - `documentType`: BANK_STATEMENT | SALARY_SLIP | ITR | FORM_16 | PAYSLIP
  - `monthYear`: MM/YYYY format (optional)
  - `accountNumber`: Bank account number (for bank statements)

### 1.3 Upload Address Documents
**POST** `/address`
- Upload Utility Bills, Rent Agreement, Property Tax, Lease Deed
- **Content-Type**: multipart/form-data
- **Fields**:
  - `files`: Multiple files (images/PDFs, max 10MB each)
  - `documentType`: UTILITY_BILL | RENT_AGREEMENT | PROPERTY_TAX | LEASE_DEED
  - `address`: Full address text

---

## 2. VERIFICATION ENDPOINTS

### 2.1 Residence Verification
**PUT** `/verification/residence/:documentId`

**Request Body Example:**
```json
{
  "dateOfReceipt": "2024-10-08T10:00:00.000Z",
  "dateOfReport": "2024-10-08T15:00:00.000Z",
  "referenceNo": "REF001234",
  "branchName": "Mumbai Central Branch",
  "typeOfLoan": "HOME_LOAN",
  "applicantName": "John Doe",
  "relationshipOfPerson": "SELF",
  "presentAddress": {
    "street": "123 Main Street, Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra", 
    "pincode": "400001"
  },
  "permanentAddress": {
    "street": "456 Home Street",
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411001"
  },
  "locality": "Bandra West",
  "accessibility": "Good road connectivity",
  "withinMunicipalLimit": true,
  "ownershipResidence": "OWNED",
  "typeOfResidence": "APARTMENT",
  "interiorFurniture": "WELL_FURNISHED",
  "typeOfRoof": "RCC",
  "numberOfFloors": 15,
  "vehiclesFoundAtResidence": ["Car - Honda City", "Motorcycle - Hero"],
  "yearsOfStay": 5,
  "monthsOfStay": 3,
  "areaSqFt": 1200,
  "namePlateSighted": true,
  "entryIntoResidencePermitted": true,
  "dateOfBirth": "1985-05-15T00:00:00.000Z",
  "aadharCardNo": "1234-5678-9012",
  "panCardNo": "ABCDE1234F",
  "mobileNo1": "9876543210",
  "mobileNo2": "9876543211",
  "mobileNo3": "9876543212",
  "qualification": "MBA",
  "landMark": "Near City Mall",
  "totalFamilyMembers": 4,
  "visibleItems": ["TV", "Refrigerator", "Air Conditioner", "Furniture"],
  "addressConfirmed": true,
  "neighboursVerification": true,
  "neighboursComments": "Known resident for 5 years, good reputation",
  "comments": "Well-maintained apartment in good locality",
  "fieldExecutiveComments": "Verification completed successfully",
  "verifiersName": "Field Executive Name",
  "authorizedSignatory": "Branch Manager"
}
```

### 2.2 Office Verification
**PUT** `/verification/office/:documentId`

**Request Body Example:**
```json
{
  "dateOfReceipt": "2024-10-08T10:00:00.000Z",
  "dateOfReport": "2024-10-08T15:00:00.000Z", 
  "referenceNo": "OFF001234",
  "branchName": "Mumbai Central Branch",
  "typeOfLoan": "PERSONAL_LOAN",
  "officeAddress": {
    "street": "Corporate Plaza, Floor 12",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "exactCompanyName": "Tech Solutions Pvt Ltd",
  "designation": "Senior Software Engineer",
  "employeeId": "EMP12345",
  "workingSince": "2020-01-15T00:00:00.000Z",
  "netSalary": 75000,
  "officeFloor": "12th Floor",
  "personContacted": true,
  "personContactedName": "HR Manager",
  "personMet": true, 
  "personMetName": "John Smith",
  "designationOfPerson": "HR Manager",
  "mobileNo1": "9876543210",
  "mobileNo2": "9876543211",
  "mobileNo3": "9876543212",
  "natureOfBusiness": "Software Development",
  "numberOfEmployeesSeen": 25,
  "landMark": "Opposite Metro Station",
  "nameBoardSighted": true,
  "businessActivitySeen": true,
  "equipmentSighted": true,
  "visitingCardObtained": true,
  "residenceCumOffice": false,
  "workConfirmed": true,
  "comments": "Active office with proper business operations",
  "fieldExecutiveComments": "Employment verified successfully",
  "verifiersName": "Field Executive Name",
  "authorizedSignatory": "Branch Manager"
}
```

### 2.3 Business Verification
**PUT** `/verification/business/:documentId`

**Request Body Example:**
```json
{
  "dateOfReceipt": "2024-10-08T10:00:00.000Z",
  "dateOfReport": "2024-10-08T15:00:00.000Z",
  "referenceNo": "BUS001234", 
  "branchName": "Mumbai Central Branch",
  "typeOfLoan": "BUSINESS_LOAN",
  "applicantName": "Jane Doe",
  "officeAddress": {
    "street": "Business Park, Unit 45",
    "city": "Mumbai", 
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "exactCompanyName": "Manufacturing Co. Ltd",
  "designationOfApplicant": "Managing Director",
  "contactPersonName": "Assistant Manager",
  "contactPersonDesignation": "Operations Manager",
  "natureOfBusiness": "Manufacturing",
  "officePremises": "OWNED",
  "numberOfYears": 8,
  "payingRent": 0,
  "nameBoardSighted": true,
  "businessActivitySeen": true,
  "equipmentSighted": true,
  "visitingCardObtained": true,
  "residenceCumOffice": false,
  "locatingOffice": "EASY",
  "areaInSqFt": 5000,
  "numberOfEmployees": 15,
  "officeLocation": "INDUSTRIAL_AREA",
  "businessNeighbour": "Other manufacturing units",
  "tradeLicenseNo": "TL123456789",
  "gstNo": "29ABCDE1234F1Z5",
  "fieldExecutiveComments": "Well-established business with good operations",
  "rating": "GOOD",
  "fieldExecutiveName": "Field Executive Name", 
  "authorizedSignatory": "Branch Manager"
}
```

---

## 3. DOCUMENT RETRIEVAL ENDPOINTS

### 3.1 Get Document Status
**GET** `/status`
- Returns overall document upload and verification status with completion percentage

### 3.2 Get User Documents  
**GET** `/my-documents`
- Returns all documents for authenticated user

### 3.3 Get Residence Verification Details
**GET** `/verification/residence/:documentId`
- Returns complete residence verification data

### 3.4 Get Office Verification Details
**GET** `/verification/office/:documentId`  
- Returns complete office verification data

### 3.5 Get Business Verification Details
**GET** `/verification/business/:documentId`
- Returns complete business verification data

---

## 4. DOCUMENT DOWNLOAD ENDPOINTS

### 4.1 Download Single Document File
**GET** `/download/:documentId/:fileId`
- Downloads a specific document file by document ID and file ID
- **Parameters**:
  - `documentId`: MongoDB ObjectId of the document registration
  - `fileId`: MongoDB ObjectId of the specific file within the document arrays
- **Response**: File stream (binary data)
- **Headers**: 
  - `Content-Disposition: attachment; filename="original_filename.ext"`
  - `Content-Type: application/pdf` or `image/jpeg` etc.

**Example Usage:**
```bash
curl -H "Authorization: Bearer <jwt_token>" \
     "http://localhost:3000/api/documents/download/67054abc123def456789/67054xyz987fed321" \
     --output downloaded_file.pdf
```

### 4.2 Download All Documents as ZIP
**GET** `/download-all/:documentId`
- Downloads all documents for a document registration as a ZIP file
- **Parameters**:
  - `documentId`: MongoDB ObjectId of the document registration
- **Response**: ZIP file containing all documents organized by category folders
- **Filename**: `documents_{documentNumber}.zip`

**Example Usage:**
```bash
curl -H "Authorization: Bearer <jwt_token>" \
     "http://localhost:3000/api/documents/download-all/67054abc123def456789" \
     --output all_documents.zip
```

**ZIP Structure:**
```
documents_DOC001234.zip
├── aadhaar/
│   ├── AADHAAR_DOC001234_1697654321.jpg
│   └── AADHAAR_DOC001234_1697654322.pdf
├── pan/
│   └── PAN_DOC001234_1697654323.jpg
├── bank_statement/
│   ├── BANK_STATEMENT_DOC001234_1697654324.pdf
│   └── BANK_STATEMENT_DOC001234_1697654325.pdf
└── utility_bill/
    └── UTILITY_BILL_DOC001234_1697654326.jpg
```

### 4.3 Download Documents by Category
**GET** `/download-category/:documentId/:category`
- Downloads all documents from a specific category as ZIP
- **Parameters**:
  - `documentId`: MongoDB ObjectId of the document registration
  - `category`: Document category (`personal`, `financial`, `address`)
- **Response**: ZIP file containing documents from the specified category
- **Filename**: `{category}_documents_{documentNumber}.zip`

**Valid Categories:**
- `personal` - PAN, Aadhaar, Passport, Voter ID, Driving License
- `financial` - Bank Statements, Salary Slips, ITR, Form 16
- `address` - Utility Bills, Rent Agreement, Property Tax, Lease Deed

**Example Usage:**
```bash
# Download only personal documents
curl -H "Authorization: Bearer <jwt_token>" \
     "http://localhost:3000/api/documents/download-category/67054abc123def456789/personal" \
     --output personal_documents.zip

# Download only financial documents  
curl -H "Authorization: Bearer <jwt_token>" \
     "http://localhost:3000/api/documents/download-category/67054abc123def456789/financial" \
     --output financial_documents.zip
```

### 4.4 Download Security Features
- **Authentication Required**: All download endpoints require valid JWT token
- **Access Control**: Users can only download their own documents (unless admin role)
- **File Validation**: Server validates file existence before streaming
- **Error Handling**: Proper HTTP status codes for missing files/access denied

### 4.5 PDF Download Endpoints (New Feature!)

### 4.5.1 Download Single Document as PDF
**GET** `/download-pdf/:documentId/:fileId`
- Downloads any document (image or PDF) as PDF format
- **Automatic Conversion**: Images (JPG, PNG, TIFF) are automatically converted to PDF
- **Parameters**:
  - `documentId`: MongoDB ObjectId of the document registration
  - `fileId`: MongoDB ObjectId of the specific file
- **Response**: PDF file stream
- **Filename**: `{original_name}.pdf`

**Example Usage:**
```bash
curl -H "Authorization: Bearer <jwt_token>" \
     "http://localhost:3000/api/documents/download-pdf/67054abc123def456789/67054xyz987fed321" \
     --output document.pdf
```

### 4.5.2 Download All Documents as Combined PDF
**GET** `/download-pdf-combined/:documentId`
- Downloads ALL documents as a single multi-page PDF file
- **Features**:
  - Multiple documents combined into one PDF
  - Each document on a separate page with title and metadata
  - Images automatically converted and properly scaled
  - Document categorization (Personal, Financial, Address)
- **Parameters**:
  - `documentId`: MongoDB ObjectId of the document registration
- **Response**: Combined PDF file with all documents
- **Filename**: `all_documents_{documentNumber}.pdf`

**Example Usage:**
```bash
curl -H "Authorization: Bearer <jwt_token>" \
     "http://localhost:3000/api/documents/download-pdf-combined/67054abc123def456789" \
     --output all_documents.pdf
```

**Combined PDF Structure:**
```
Page 1: Document 1: AADHAAR_DOC001234.jpg
        Type: AADHAAR
        Uploaded: 10/8/2024
        [Image content properly scaled]

Page 2: Document 2: PAN_DOC001234.pdf
        Type: PAN
        Uploaded: 10/8/2024
        [PDF Document note or content]

Page 3: Document 3: BANK_STATEMENT_DOC001234.pdf
        Type: BANK_STATEMENT
        Uploaded: 10/8/2024
        [Document content]
```

### 4.5.3 Download Category Documents as Combined PDF
**GET** `/download-pdf-category/:documentId/:category`
- Downloads all documents from specific category as single PDF
- **Parameters**:
  - `documentId`: MongoDB ObjectId of the document registration
  - `category`: Document category (`personal`, `financial`, `address`)
- **Response**: Combined PDF with category documents
- **Filename**: `{category}_documents_{documentNumber}.pdf`

**Example Usage:**
```bash
# Download all personal documents as one PDF
curl -H "Authorization: Bearer <jwt_token>" \
     "http://localhost:3000/api/documents/download-pdf-category/67054abc123def456789/personal" \
     --output personal_documents.pdf

# Download all financial documents as one PDF
curl -H "Authorization: Bearer <jwt_token>" \
     "http://localhost:3000/api/documents/download-pdf-category/67054abc123def456789/financial" \
     --output financial_documents.pdf
```

### 4.6 PDF Conversion Features

**Supported Input Formats:**
- **Images**: JPG, JPEG, PNG, TIFF → Automatically converted to PDF
- **PDFs**: Served as-is or included in combined PDFs

**PDF Conversion Benefits:**
- **Standardized Format**: All downloads in universally compatible PDF format
- **Professional Presentation**: Proper scaling, margins, and document titles
- **Metadata Inclusion**: Document type, upload date, and other info embedded
- **Multi-page Support**: Multiple documents combined intelligently
- **Security**: Consistent format reduces compatibility issues

**Image to PDF Conversion Details:**
- **Page Size**: A4 (configurable)
- **Margins**: 50px standard margins
- **Scaling**: Images automatically scaled to fit page while maintaining aspect ratio
- **Quality**: High-quality conversion with Sharp image processing
- **Metadata**: PDF includes title, author, creation date, and subject

### 4.7 Download Response Headers
**Single File Download:**
```
Content-Type: application/pdf (or image/jpeg, image/png for original format)
Content-Disposition: attachment; filename="AADHAAR_DOC001234.pdf"
Content-Length: 1234567
```

**PDF Download (Single/Combined):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="all_documents_DOC001234.pdf"
Transfer-Encoding: chunked
```

**ZIP File Download:**
```
Content-Type: application/zip
Content-Disposition: attachment; filename="documents_DOC001234.zip"
Transfer-Encoding: chunked
```

---

## 5. ADMIN ENDPOINTS

### 4.1 Get Pending Verifications
**GET** `/admin/pending-verifications`
- Admin only: Returns all documents pending verification

### 4.2 Approve Document
**PUT** `/admin/approve/:documentId`
- Admin only: Approve specific document

### 4.3 Reject Document  
**PUT** `/admin/reject/:documentId`
- Admin only: Reject specific document with reason

---

## 5. DATA MODELS

### Document Schema Structure
```javascript
{
  userId: ObjectId,
  documentNumber: String, // Auto-generated unique identifier
  
  // Document Arrays
  personalDocuments: [PersonalDocumentSchema],
  financialDocuments: [FinancialDocumentSchema], 
  addressDocuments: [AddressDocumentSchema],
  
  // Verification Objects
  residenceVerification: ResidenceVerificationSchema,
  officeVerification: OfficeVerificationSchema,
  businessVerification: BusinessVerificationSchema,
  
  // Status Fields
  overallStatus: String, // INCOMPLETE | PENDING | VERIFIED | REJECTED
  completionPercentage: Number, // Virtual field 0-100
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Verification Status Options
- `PENDING`: Initial state
- `IN_PROGRESS`: Verification in process  
- `VERIFIED`: Successfully verified
- `REJECTED`: Verification failed

### Loan Types
- HOME_LOAN
- PERSONAL_LOAN  
- BUSINESS_LOAN
- CAR_LOAN
- EDUCATION_LOAN
- OTHER

### Ownership Types
- OWNED
- RENTED
- PARENTAL
- COMPANY_PROVIDED
- OTHER

### Residence Types
- INDEPENDENT_HOUSE
- APARTMENT
- VILLA
- CHAWL
- SLUM
- OTHER

### Furniture Types
- WELL_FURNISHED
- FURNISHED
- SEMI_FURNISHED
- UNFURNISHED

### Roof Types
- RCC
- ASBESTOS
- TILE
- THATCHED
- OTHER

### Office Location Types
- COMMERCIAL_AREA
- RESIDENTIAL_AREA
- INDUSTRIAL_AREA
- MIXED_USE
- OTHER

### Rating Options
- EXCELLENT
- GOOD
- AVERAGE
- POOR
- NEGATIVE

---

## 6. FILE UPLOAD SPECIFICATIONS

### Supported File Types
- **Images**: JPG, JPEG, PNG
- **Documents**: PDF

### File Size Limits
- Maximum file size: 10MB per file
- Maximum files per request: Multiple files allowed

### File Naming Convention
Files are automatically renamed using the pattern:
```
{documentType}_{documentNumber}_{timestamp}.{extension}
```
Example: `AADHAAR_DOC001234_1697654321.jpg`

### Storage Location
Files are stored in: `/uploads/{documentNumber}/`

---

## 7. ERROR RESPONSES

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## 8. USAGE WORKFLOW

1. **Document Upload Phase**:
   - Upload personal documents (`/personal`)
   - Upload financial documents (`/financial`)  
   - Upload address documents (`/address`)

2. **Verification Phase**:
   - Field executive updates residence verification (`/verification/residence/:id`)
   - Field executive updates office verification (`/verification/office/:id`)
   - Field executive updates business verification (`/verification/business/:id`)

3. **Review Phase**:
   - Admin reviews all verifications (`/admin/pending-verifications`)
   - Admin approves/rejects documents (`/admin/approve/:id` or `/admin/reject/:id`)

4. **Status Tracking**:
   - User checks status (`/status`)
   - User retrieves documents (`/my-documents`)
   - User views specific verification details (`/verification/{type}/:id`)

This comprehensive system handles the complete loan document verification lifecycle with detailed field collection for residence, office, and business verification as per banking requirements.