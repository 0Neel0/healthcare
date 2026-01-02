import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { Appointment } from '../src/models/appointment.model.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const verifyUTC = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL || process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Create a dummy appointment with a specific ISO string
        // Let's say user selects "2026-01-05T10:00:00.000" in their local time.
        // If the frontend sends this as ISO, it depends on the timezone.
        // We will simulate receiving a UTC ISO string which is what the frontend SHOULD send.

        const testDate = new Date();
        const testIso = testDate.toISOString();

        console.log('Test Date (Local Node Time):', testDate.toString());
        console.log('Test ISO String (What backend receives):', testIso);

        const appmt = new Appointment({
            patient: new mongoose.Types.ObjectId(), // Fake ID
            userId: 'test_user',
            primaryPhysician: 'Test Doctor',
            schedule: testIso,
            reason: 'UTC Test',
            status: 'pending_admin'
        });

        // We won't save it to avoid cluttering DB, just check the casting
        console.log('Mongoose Object Schedule:', appmt.schedule);
        console.log('Is Date Object?', appmt.schedule instanceof Date);
        console.log('Stored UTC value:', appmt.schedule.toUTCString());

        if (appmt.schedule.toISOString() === testIso) {
            console.log('SUCCESS: Date stored correctly as UTC.');
        } else {
            console.log('FAIL: Date mismatch.');
        }

    } catch (err) {
        console.error('Verification error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

verifyUTC();
