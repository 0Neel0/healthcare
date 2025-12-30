import fs from 'fs';
import path from 'path';

/**
 * StorageService
 * Abstracts file storage operations to ensure security and allowing future swap to S3.
 */
class StorageService {
    constructor() {
        this.uploadDir = 'uploads';
        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * getFilePath
     * Returns the absolute secure path for a file.
     * @param {string} filename 
     */
    getFilePath(filename) {
        // Prevent directory traversal
        const safeFilename = path.basename(filename);
        return path.resolve(this.uploadDir, safeFilename);
    }

    /**
     * validateFileExists
     * Checks if file exists on disk
     * @param {string} filename 
     */
    validateFileExists(filename) {
        const filePath = this.getFilePath(filename);
        return fs.existsSync(filePath);
    }
}

export const storageService = new StorageService();
