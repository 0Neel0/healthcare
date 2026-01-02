import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { PatientDocument } from '../src/models/patientDocument.model.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL || process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const remaining = await PatientDocument.countDocuments({ fileUrl: { $regex: /^\/uploads\// } });
        console.log(`Remaining legacy documents: ${remaining}`);

        const migrated = await PatientDocument.countDocuments({ fileUrl: { $regex: /^http/ } });
        console.log(`Migrated/Cloudinary documents: ${migrated}`);

    } catch (err) {
        console.error('Verification error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

verify();
