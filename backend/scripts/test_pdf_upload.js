import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const testUpload = async () => {
    try {
        // Pick a real file from uploads
        // I know one exists from the list: 1767003016280-881550909.pdf
        const filename = '1767003016280-881550909.pdf';
        const filePath = path.resolve(__dirname, '../uploads', filename);

        console.log('Uploading as image/auto...');
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'test_uploads',
            resource_type: 'image', // Explicitly image (Cloudinary supports PDF as image)
            use_filename: true,
            unique_filename: false,
        });

        console.log('Image Type URL:', result.secure_url);
        console.log('Result Type:', result.resource_type);

    } catch (err) {
        console.error('Upload failed:', err);
    }
};

testUpload();
