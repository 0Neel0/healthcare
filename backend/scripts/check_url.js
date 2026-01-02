import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { PatientDocument } from '../src/models/patientDocument.model.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL || process.env.MONGODB_URI);
        const doc = await PatientDocument.findOne({ fileUrl: { $regex: /cloudinary/ } });
        if (doc) {
            console.log('Sample Cloudinary URL:', doc.fileUrl);
            console.log('Title:', doc.title);
            console.log('ResourceType:', doc.fileType); // This is mimetype stored in DB, not cloudinary param
        } else {
            console.log('No migrated documents found.');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

check();
