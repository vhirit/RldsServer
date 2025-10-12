# PDF Download Feature Test Guide

## Overview
The document management system now supports advanced PDF download capabilities with automatic image-to-PDF conversion and combined document generation.

## New PDF Download Endpoints

### 1. Single Document as PDF
**Endpoint**: `GET /api/documents/download-pdf/:documentId/:fileId`
**Purpose**: Download any document (image or PDF) in PDF format

```bash
# Example: Download a specific document as PDF
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3000/api/documents/download-pdf/DOCUMENT_ID/FILE_ID" \
     --output document.pdf
```

**Features**:
- ✅ Automatic image to PDF conversion (JPG, PNG, TIFF → PDF)
- ✅ Proper PDF formatting with margins and scaling
- ✅ Original PDFs served as-is
- ✅ Standardized PDF output for all document types

### 2. All Documents as Combined PDF
**Endpoint**: `GET /api/documents/download-pdf-combined/:documentId`
**Purpose**: Download ALL user documents as one multi-page PDF

```bash
# Example: Download all documents as single PDF
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3000/api/documents/download-pdf-combined/DOCUMENT_ID" \
     --output all_documents.pdf
```

**Features**:
- ✅ Multiple documents in one PDF file
- ✅ Each document on separate page with metadata
- ✅ Document categorization (Personal, Financial, Address)
- ✅ Professional formatting with titles and upload dates

### 3. Category Documents as Combined PDF
**Endpoint**: `GET /api/documents/download-pdf-category/:documentId/:category`
**Purpose**: Download documents from specific category as combined PDF

```bash
# Example: Download only personal documents as PDF
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3000/api/documents/download-pdf-category/DOCUMENT_ID/personal" \
     --output personal_documents.pdf

# Example: Download only financial documents as PDF
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3000/api/documents/download-pdf-category/DOCUMENT_ID/financial" \
     --output financial_documents.pdf
```

**Valid Categories**: `personal`, `financial`, `address`

## PDF Conversion Features

### Automatic Image to PDF Conversion
- **Input Formats**: JPG, JPEG, PNG, TIFF
- **Output**: High-quality PDF with proper scaling
- **Page Size**: A4 standard with 50px margins
- **Scaling**: Images fit to page while maintaining aspect ratio
- **Quality**: Sharp image processing for optimal results

### Combined PDF Structure
```
Page 1: Document Header
        Type: AADHAAR
        Uploaded: 10/8/2024
        [High-quality image content]

Page 2: Document Header  
        Type: PAN CARD
        Uploaded: 10/8/2024
        [Converted image or original PDF content]

Page 3: Document Header
        Type: BANK STATEMENT
        Uploaded: 10/8/2024
        [Document content]
```

### PDF Metadata
Each generated PDF includes:
- **Title**: Document type and identification
- **Author**: Document Management System
- **Subject**: Document category/purpose
- **Creation Date**: Current timestamp
- **File Info**: Original filename and upload details

## Testing Workflow

### Step 1: Upload Test Documents
```bash
# Upload personal document (image)
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "files=@aadhaar_card.jpg" \
     -F "documentType=AADHAAR" \
     -F "documentNumber=1234-5678-9012" \
     "http://localhost:3000/api/documents/personal"

# Upload financial document (PDF)
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "files=@bank_statement.pdf" \
     -F "documentType=BANK_STATEMENT" \
     -F "accountNumber=123456789" \
     "http://localhost:3000/api/documents/financial"
```

### Step 2: Get Document Status
```bash
# Get document IDs and file IDs
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3000/api/documents/status"
```

### Step 3: Test PDF Downloads
```bash
# Test single document PDF conversion
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3000/api/documents/download-pdf/DOCUMENT_ID/FILE_ID" \
     --output single_document.pdf

# Test combined PDF generation
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3000/api/documents/download-pdf-combined/DOCUMENT_ID" \
     --output all_documents_combined.pdf

# Test category PDF generation
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3000/api/documents/download-pdf-category/DOCUMENT_ID/personal" \
     --output personal_docs_combined.pdf
```

## Benefits of PDF Format

### For Users
- **Universal Compatibility**: PDF works on all devices and platforms
- **Professional Presentation**: Consistent formatting and layout
- **Print-Ready**: Optimized for printing with proper margins
- **Secure**: Standardized format reduces compatibility issues
- **Compact**: Efficient compression while maintaining quality

### For System
- **Standardization**: All downloads in consistent format
- **Quality Control**: Automatic scaling and formatting
- **Metadata**: Rich document information embedded
- **Efficiency**: Temporary file management and cleanup
- **Flexibility**: Single files or combined documents as needed

## Error Handling

The system handles various error scenarios:
- **File Not Found**: Returns 404 with appropriate message
- **Access Denied**: Returns 403 for unauthorized access
- **Conversion Errors**: Returns 500 with conversion failure details
- **Invalid Categories**: Returns 400 for invalid category names
- **Missing Documents**: Returns 404 when no documents found in category

## Performance Considerations

- **Temporary Files**: Generated PDFs are automatically cleaned up after download
- **Memory Management**: Streaming used for large files to avoid memory issues
- **Cleanup Jobs**: Hourly cleanup of temporary files older than 1 hour
- **Image Processing**: Sharp library for high-performance image operations
- **PDF Generation**: PDFKit for efficient PDF creation and manipulation

## Security Features

- **Authentication**: All endpoints require valid JWT token
- **Authorization**: Users can only access their own documents (admin override)
- **File Validation**: Server validates file existence and ownership
- **Temporary File Security**: Temp files stored in secure directory with cleanup
- **Access Logging**: All download attempts logged for audit trail

This comprehensive PDF download system provides professional document management with automatic format conversion and flexible download options.