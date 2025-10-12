class ImageValidator {
    constructor() {
        this.allowedMimeTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp'
        ];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.minFileSize = 1024; // 1KB
    }

    async validateImage(file) {
        try {
            // Check if file exists
            if (!file) {
                throw new Error('No file provided');
            }

            // Check file size
            if (file.size > this.maxFileSize) {
                throw new Error(`File too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`);
            }

            if (file.size < this.minFileSize) {
                throw new Error(`File too small. Minimum size is ${this.minFileSize / 1024}KB`);
            }

            // Check mime type
            if (!this.allowedMimeTypes.includes(file.mimetype)) {
                throw new Error(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
            }

            // Check file extension
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const fileExtension = file.originalname.toLowerCase().split('.').pop();
            
            if (!allowedExtensions.some(ext => ext.includes(fileExtension))) {
                throw new Error(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`);
            }

            // Additional validation can be added here:
            // - Image dimensions check
            // - Image quality check
            // - Virus scanning
            // - Content validation

            return {
                isValid: true,
                fileName: file.originalname,
                size: file.size,
                mimeType: file.mimetype
            };

        } catch (error) {
            throw new Error(`Image validation failed: ${error.message}`);
        }
    }

    async validateMultipleImages(files) {
        try {
            if (!files || files.length === 0) {
                throw new Error('No files provided');
            }

            if (files.length > 10) {
                throw new Error('Too many files. Maximum 10 files allowed');
            }

            const validationResults = [];
            
            for (const file of files) {
                const result = await this.validateImage(file);
                validationResults.push(result);
            }

            return validationResults;
        } catch (error) {
            throw new Error(`Multiple image validation failed: ${error.message}`);
        }
    }

    getFileInfo(file) {
        return {
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            encoding: file.encoding
        };
    }
}

module.exports = new ImageValidator();
