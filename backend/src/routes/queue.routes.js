import express from 'express';
import { Appointment } from '../models/appointment.model.js';

const router = express.Router();

// GET /queue/display - Public endpoint for waiting screens
router.get('/display', async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const startOfDay = new Date(todayStr); // 00:00:00 today
        const endOfDay = new Date(todayStr);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch appointments that are confirmed/scheduled for today
        const appointments = await Appointment.find({
            schedule: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['scheduled', 'ongoing'] }, // Only show relevant ones
            queueStatus: { $ne: 'Completed' } // Hide completed ones from main waiting list
        })
            .populate('doctor', 'name specialty department') // Assuming User model has these, or use primaryPhysician
            .select('tokenNumber queueStatus primaryPhysician doctor patient')
            .sort({ tokenNumber: 1 });

        // Group by Doctor (Primary Physician Name)
        // Since we stored primaryPhysician as string in Appointment model, we can use that for grouping
        const queueByDoctor = {};

        appointments.forEach(appt => {
            const docName = appt.primaryPhysician || "General Doctor";
            if (!queueByDoctor[docName]) {
                queueByDoctor[docName] = {
                    doctorName: docName,
                    current: null,
                    upcoming: []
                };
            }

            if (appt.queueStatus === 'In Consultation') {
                queueByDoctor[docName].current = appt.tokenNumber;
            } else if (appt.queueStatus === 'Waiting') {
                queueByDoctor[docName].upcoming.push(appt.tokenNumber);
            }
        });

        res.json(Object.values(queueByDoctor));

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /queue/next - Call next patient (Protected: Doctor/Admin)
router.post('/next', async (req, res) => {
    try {
        const { doctorName } = req.body;
        // Ideally use doctorId from token, but for MVP using name matching or passing ID if available

        const todayStr = new Date().toISOString().split('T')[0];
        const startOfDay = new Date(todayStr);
        const endOfDay = new Date(todayStr);
        endOfDay.setHours(23, 59, 59, 999);

        // Find current 'In Consultation' and mark as 'Completed'
        await Appointment.findOneAndUpdate({
            primaryPhysician: doctorName,
            schedule: { $gte: startOfDay, $lte: endOfDay },
            queueStatus: 'In Consultation'
        }, {
            queueStatus: 'Completed',
            status: 'completed' // Also update main status? Maybe wait for formal close.
        });

        // Find next 'Waiting' and mark as 'In Consultation'
        const nextAppt = await Appointment.findOneAndUpdate({
            primaryPhysician: doctorName,
            schedule: { $gte: startOfDay, $lte: endOfDay },
            queueStatus: 'Waiting'
        }, {
            queueStatus: 'In Consultation',
            status: 'ongoing'
        }, {
            sort: { tokenNumber: 1 }, // Get lowest number
            new: true
        });

        if (!nextAppt) {
            return res.json({ message: "No more patients in queue", currentToken: null });
        }

        res.json({ message: "Next patient called", currentToken: nextAppt.tokenNumber, patient: nextAppt.patient });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
