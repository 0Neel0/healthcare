import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { PatientDocument } from '../src/models/patientDocument.model.js';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configure Cloudinary (if not already configured by import, but we need standalone config here just in case)
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

const migrate = async () => {
    await connectDB();

    try {
        // Find documents with local file paths
        const docs = await PatientDocument.find({ fileUrl: { $regex: /^\/uploads\// } });
        console.log(`Found ${docs.length} documents to migrate.`);

        for (const doc of docs) {
            console.log(`Processing: ${doc.title} (${doc._id})`);

            // Extract filename from URL: /uploads/filename.ext -> filename.ext
            const filename = doc.fileUrl.replace('/uploads/', '');
            const localFilePath = path.resolve(__dirname, '../uploads', filename);

            if (!fs.existsSync(localFilePath)) {
                console.error(`  [WARN] File not found locally: ${localFilePath}`);
                continue;
            }

            try {
                // Determine resource type
                const ext = path.extname(filename).toLowerCase();
                let resourceType = 'auto'; // default
                if (ext === '.pdf' || ext === '.doc' || ext === '.docx') {
                    resourceType = 'raw'; // use raw for documents
                } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                    resourceType = 'image';
                }

                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(localFilePath, {
                    folder: 'hms_uploads',
                    resource_type: resourceType,
                    use_filename: true,
                    unique_filename: false,
                    public_id: filename.replace(/\.[^/.]+$/, "") // ID without extension
                });

                console.log(`  Uploaded to Cloudinary: ${result.secure_url}`);

                // Update DB
                doc.fileUrl = result.secure_url;
                await doc.save();
                console.log(`  Updated DB record.`);

            } catch (uploadErr) {
                console.error(`  [ERROR] Upload failed for ${filename}:`, uploadErr);
            }
        }

        console.log('Migration completed.');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

migrate();
