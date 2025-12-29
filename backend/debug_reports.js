import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Appointment } from './src/models/appointment.model.js';

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const totalApps = await Appointment.countDocuments();
        console.log(`Total Appointments: ${totalApps}`);

        const paidApps = await Appointment.countDocuments({ paymentStatus: 'paid' });
        console.log(`Paid Appointments: ${paidApps}`);

        const appsWithFee = await Appointment.find({ consultationFee: { $gt: 0 } }).limit(5);
        console.log(`Appointments with fee > 0 (sample 5):`, appsWithFee.length);

        if (appsWithFee.length > 0) {
            console.log("Sample Fee:", appsWithFee[0].consultationFee);
        }

        const distinctPhysicians = await Appointment.distinct('primaryPhysician');
        console.log("Physicians:", distinctPhysicians);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
