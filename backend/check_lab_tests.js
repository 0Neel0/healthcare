import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { LabTest } from './src/models/labTest.model.js';

dotenv.config();

const checkTests = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const count = await LabTest.countDocuments();
        console.log(`Total Lab Tests: ${count}`);

        if (count > 0) {
            const tests = await LabTest.find().limit(3);
            console.log("Sample Tests:", tests);
        } else {
            console.log("No lab tests found. Seeding default tests...");
            await LabTest.insertMany([
                { name: 'Complete Blood Count (CBC)', code: 'CBC', cost: 500, description: 'Routine blood test' },
                { name: 'Lipid Profile', code: 'LIPID', cost: 1200, description: 'Cholesterol check' },
                { name: 'Blood Sugar (Fasting)', code: 'BSF', cost: 200, description: 'Diabetes check' }
            ]);
            console.log("Seeded default tests.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkTests();
