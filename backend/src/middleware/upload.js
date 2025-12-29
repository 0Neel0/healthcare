import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storage as cloudinaryStorage } from '../config/cloudinary.config.js';

// --- Local Storage for General Documents ---
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const localDiskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

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
    storage: localDiskStorage,
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
