const PDFDocument = require('pdfkit');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class PDFConversionService {
    constructor() {
        this.tempDir = path.join(__dirname, '../temp');
        // Ensure temp directory exists
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    /**
     * Convert image to PDF
     * @param {string} imagePath - Path to the source image file
     * @param {string} outputPath - Path where PDF should be saved
     * @param {object} options - Conversion options
     * @returns {Promise<string>} - Path to the generated PDF
     */
    async convertImageToPDF(imagePath, outputPath, options = {}) {
        try {
            const {
                title = 'Document',
                author = 'Document Management System',
                subject = 'Converted Document',
                pageSize = 'A4',
                margin = 50,
                fitToPage = true
            } = options;

            // Get image metadata
            const imageMetadata = await sharp(imagePath).metadata();
            
            // Create PDF document
            const doc = new PDFDocument({
                size: pageSize,
                margin: margin,
                info: {
                    Title: title,
                    Author: author,
                    Subject: subject,
                    CreationDate: new Date()
                }
            });

            // Create write stream
            const writeStream = fs.createWriteStream(outputPath);
            doc.pipe(writeStream);

            // Calculate image dimensions for PDF
            const pageWidth = doc.page.width - (margin * 2);
            const pageHeight = doc.page.height - (margin * 2);
            
            let imageWidth = imageMetadata.width;
            let imageHeight = imageMetadata.height;

            if (fitToPage) {
                // Scale image to fit page while maintaining aspect ratio
                const widthRatio = pageWidth / imageWidth;
                const heightRatio = pageHeight / imageHeight;
                const ratio = Math.min(widthRatio, heightRatio);

                imageWidth = imageWidth * ratio;
                imageHeight = imageHeight * ratio;
            }

            // Center the image on the page
            const x = (doc.page.width - imageWidth) / 2;
            const y = (doc.page.height - imageHeight) / 2;

            // Add image to PDF
            doc.image(imagePath, x, y, {
                width: imageWidth,
                height: imageHeight
            });

            // Finalize PDF
            doc.end();

            // Wait for PDF to be written
            return new Promise((resolve, reject) => {
                writeStream.on('finish', () => {
                    resolve(outputPath);
                });
                writeStream.on('error', reject);
            });

        } catch (error) {
            throw new Error(`Image to PDF conversion failed: ${error.message}`);
        }
    }

    /**
     * Convert any document to PDF format
     * @param {string} filePath - Path to the source file
     * @param {object} fileInfo - File information (mimeType, fileName, etc.)
     * @param {object} options - Conversion options
     * @returns {Promise<string>} - Path to the PDF (original if already PDF, converted if image)
     */
    async convertToPDF(filePath, fileInfo, options = {}) {
        try {
            const { mimeType, fileName } = fileInfo;

            // If already PDF, return original path
            if (mimeType === 'application/pdf') {
                return filePath;
            }

            // Check if it's an image that can be converted
            const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff'];
            if (!imageTypes.includes(mimeType)) {
                throw new Error(`Unsupported file type for PDF conversion: ${mimeType}`);
            }

            // Generate output path
            const baseName = path.parse(fileName).name;
            const timestamp = Date.now();
            const outputPath = path.join(this.tempDir, `${baseName}_${timestamp}.pdf`);

            // Convert image to PDF
            await this.convertImageToPDF(filePath, outputPath, {
                title: baseName,
                ...options
            });

            return outputPath;

        } catch (error) {
            throw new Error(`PDF conversion failed: ${error.message}`);
        }
    }

    /**
     * Create a multi-page PDF from multiple images/documents
     * @param {Array} files - Array of file objects with path and metadata
     * @param {string} outputPath - Path where combined PDF should be saved
     * @param {object} options - PDF options
     * @returns {Promise<string>} - Path to the generated PDF
     */
    async createMultiPagePDF(files, outputPath, options = {}) {
        try {
            const {
                title = 'Combined Documents',
                author = 'Document Management System',
                subject = 'Multiple Documents',
                pageSize = 'A4',
                margin = 50
            } = options;

            // Create PDF document
            const doc = new PDFDocument({
                size: pageSize,
                margin: margin,
                info: {
                    Title: title,
                    Author: author,
                    Subject: subject,
                    CreationDate: new Date()
                }
            });

            // Create write stream
            const writeStream = fs.createWriteStream(outputPath);
            doc.pipe(writeStream);

            const pageWidth = doc.page.width - (margin * 2);
            const pageHeight = doc.page.height - (margin * 2);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Add new page for each document (except first)
                if (i > 0) {
                    doc.addPage();
                }

                // Add document title
                doc.fontSize(16)
                   .font('Helvetica-Bold')
                   .text(`Document ${i + 1}: ${file.fileName}`, margin, margin);
                
                doc.fontSize(12)
                   .font('Helvetica')
                   .text(`Type: ${file.documentType}`, margin, margin + 25)
                   .text(`Uploaded: ${new Date(file.uploadedAt).toLocaleDateString()}`, margin, margin + 45);

                // Add some space before image
                const imageY = margin + 80;
                const availableHeight = pageHeight - 80;

                try {
                    if (file.mimeType === 'application/pdf') {
                        // For existing PDFs, add a note (can't easily embed PDF in PDF with pdfkit)
                        doc.text('PDF Document - Please download individual file for full content', 
                               margin, imageY, { width: pageWidth });
                    } else if (file.mimeType.startsWith('image/')) {
                        // Get image metadata
                        const imageMetadata = await sharp(file.filePath).metadata();
                        
                        // Calculate dimensions
                        let imageWidth = imageMetadata.width;
                        let imageHeight = imageMetadata.height;

                        const widthRatio = pageWidth / imageWidth;
                        const heightRatio = availableHeight / imageHeight;
                        const ratio = Math.min(widthRatio, heightRatio);

                        imageWidth = imageWidth * ratio;
                        imageHeight = imageHeight * ratio;

                        // Center horizontally
                        const x = margin + (pageWidth - imageWidth) / 2;

                        // Add image
                        doc.image(file.filePath, x, imageY, {
                            width: imageWidth,
                            height: imageHeight
                        });
                    }
                } catch (imageError) {
                    console.error(`Error processing file ${file.fileName}:`, imageError);
                    doc.text(`Error: Could not process ${file.fileName}`, margin, imageY);
                }
            }

            // Finalize PDF
            doc.end();

            // Wait for PDF to be written
            return new Promise((resolve, reject) => {
                writeStream.on('finish', () => {
                    resolve(outputPath);
                });
                writeStream.on('error', reject);
            });

        } catch (error) {
            throw new Error(`Multi-page PDF creation failed: ${error.message}`);
        }
    }

    /**
     * Clean up temporary files
     * @param {string} filePath - Path to temporary file to delete
     */
    async cleanupTempFile(filePath) {
        try {
            if (fs.existsSync(filePath) && filePath.includes(this.tempDir)) {
                await fs.promises.unlink(filePath);
            }
        } catch (error) {
            console.error('Error cleaning up temp file:', error);
        }
    }

    /**
     * Clean up all temporary files older than specified time
     * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
     */
    async cleanupOldTempFiles(maxAge = 3600000) {
        try {
            const files = await fs.promises.readdir(this.tempDir);
            const now = Date.now();

            for (const file of files) {
                const filePath = path.join(this.tempDir, file);
                const stats = await fs.promises.stat(filePath);
                
                if (now - stats.mtime.getTime() > maxAge) {
                    await fs.promises.unlink(filePath);
                }
            }
        } catch (error) {
            console.error('Error cleaning up old temp files:', error);
        }
    }
}

module.exports = new PDFConversionService();