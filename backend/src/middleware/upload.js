import multer from 'multer';
import { storage as cloudinaryStorage } from '../config/cloudinary.config.js';

// --- Cloudinary Storage for General Documents ---
// We reuse the same storage configuration since it now handles different resource types dynamically.

const docFileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/webp',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'), false);
    }
};

export const upload = multer({
    storage: cloudinaryStorage,
    fileFilter: docFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for docs
});

// --- Cloudinary Storage for Profile Pictures ---
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed for profile pictures.'), false);
    }
};

export const profileUpload = multer({
    storage: cloudinaryStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for images
});
