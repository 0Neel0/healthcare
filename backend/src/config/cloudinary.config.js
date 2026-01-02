import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine resource type based on file mimetype
        let resource_type = 'image';
        let folder = 'hms_uploads';
        let format = undefined;

        if (
            file.mimetype === 'application/msword' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            resource_type = 'raw';
            // keep original extension for docs
        } else if (file.mimetype === 'application/pdf') {
            // Treat PDF as image for better preview support, unless specific requirement
            // Cloudinary detects PDF as image by default if we don't force raw
            resource_type = 'image';
            format = 'pdf';
        }

        return {
            folder: folder,
            resource_type: resource_type,
            format: format,
            public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`, // Unique filename without extension
        };
    },
});

export { cloudinary, storage };
