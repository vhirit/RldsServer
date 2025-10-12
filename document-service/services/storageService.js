const fs = require('fs').promises;
const path = require('path');

class StorageService {
    constructor() {
        this.uploadDir = './uploads';
        this.ensureUploadDirectory();
    }

    async ensureUploadDirectory() {
        try {
            await fs.access(this.uploadDir);
        } catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
        }
    }

    async uploadFiles(files, customFileName = null) {
        try {
            const uploadResults = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                let fileName;
                
                if (customFileName && files.length === 1) {
                    // Use custom filename for single file
                    fileName = customFileName;
                } else if (customFileName && files.length > 1) {
                    // Add index for multiple files
                    const extension = path.extname(customFileName);
                    const baseName = path.basename(customFileName, extension);
                    fileName = `${baseName}_${i + 1}${extension}`;
                } else {
                    // Default filename generation
                    fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
                }
                
                const filePath = path.join(this.uploadDir, fileName);
                
                // Handle different file sources (buffer or path)
                if (file.buffer) {
                    await fs.writeFile(filePath, file.buffer);
                } else if (file.path) {
                    const fileContent = await fs.readFile(file.path);
                    await fs.writeFile(filePath, fileContent);
                } else {
                    throw new Error('No file content found');
                }

                uploadResults.push({
                    originalName: file.originalname,
                    fileName: fileName,
                    filePath: filePath,
                    size: file.size,
                    mimeType: file.mimetype,
                    url: `/uploads/${fileName}`
                });
            }

            return uploadResults;
        } catch (error) {
            throw new Error(`File upload failed: ${error.message}`);
        }
    }

    async deleteFiles(fileInfos) {
        try {
            for (const fileInfo of fileInfos) {
                const fullPath = path.join(process.cwd(), fileInfo.filePath);
                try {
                    await fs.unlink(fullPath);
                } catch (error) {
                    console.warn(`Could not delete file ${fullPath}:`, error.message);
                }
            }
        } catch (error) {
            throw new Error(`File deletion failed: ${error.message}`);
        }
    }

    async getFileUrl(fileName) {
        return `/uploads/${fileName}`;
    }
}

module.exports = new StorageService();
