import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { PatientDocument } from '../src/models/patientDocument.model.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL || process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const fixPdfs = async () => {
    await connectDB();

    try {
        // Find PDFs that are currently using 'raw' URLs
        const docs = await PatientDocument.find({
            fileUrl: { $regex: /\/raw\/upload\// },
            fileUrl: { $regex: /\.pdf$/ }
        });

        console.log(`Found ${docs.length} raw PDF documents to fix.`);

        for (const doc of docs) {
            console.log(`Fixing: ${doc.title} (${doc._id})`);

            // We can re-upload using the remote URL directly!
            // Cloudinary can fetch from the raw URL and store as image type.
            const rawUrl = doc.fileUrl;

            try {
                const result = await cloudinary.uploader.upload(rawUrl, {
                    folder: 'hms_uploads',
                    resource_type: 'image', // Convert/Treat as image
                    format: 'pdf',
                    // Use a new public ID or let it generate one
                });

                console.log(`  New Image URL: ${result.secure_url}`);

                doc.fileUrl = result.secure_url;
                await doc.save();
                console.log(`  Updated DB record.`);

                // Optionally delete the old raw asset?
                // We'd need to extract public_id from rawUrl
                // rawUrl: .../raw/upload/v123/hms_uploads/foo.pdf
                // public_id: hms_uploads/foo.pdf (for raw, it often includes extension)
                // Let's skip deletion for safety for now, or log it.

            } catch (err) {
                console.error(`  [ERROR] Failed to re-upload ${doc._id}:`, err);
            }
        }

    } catch (err) {
        console.error('Fix script error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

fixPdfs();
