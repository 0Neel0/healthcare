import { Doctor } from "../models/doctor.model.js";


const createDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.create(req.body);
        res.json(doctor);
    } catch (err) {
        next(err);
    }
};


const getDoctors = async (req, res, next) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (err) {
        next(err);
    }
};


const getDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        res.json(doctor);
    } catch (err) {
        next(err);
    }
};


const updateDoctor = async (req, res, next) => {
    try {
        const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};


const deleteDoctor = async (req, res, next) => {
    try {
        await Doctor.findByIdAndDelete(req.params.id);
        res.json({ message: 'Doctor removed' });
    } catch (err) {
        next(err);
    }
};

// Update doctor availability
const updateAvailability = async (req, res, next) => {
    try {
        const { name } = req.params;
        const availabilityData = req.body;

        const doctor = await Doctor.findOneAndUpdate(
            { name },
            {
                $set: {
                    availability: availabilityData
                }
            },
            { new: true, runValidators: true }
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Cancel appointments conflicting with new Out of Office dates
        if (availabilityData.outOfOfficeDates && availabilityData.outOfOfficeDates.length > 0) {
            const { Appointment } = await import("../models/appointment.model.js");

            for (const leave of availabilityData.outOfOfficeDates) {
                const start = new Date(leave.startDate);
                start.setUTCHours(0, 0, 0, 0);
                const end = new Date(leave.endDate);
                end.setUTCHours(23, 59, 59, 999);

                // Find conflicting appointments
                // Note: primaryPhysician in Appointment usually matches "Dr. Name" or just "Name". 
                // We should match robustly. The doctor.name is just "Name".
                const conflicts = await Appointment.find({
                    primaryPhysician: { $regex: new RegExp(`(Dr\\.?\\s*)?${name}`, 'i') },
                    schedule: { $gte: start, $lte: end },
                    status: { $nin: ['cancelled', 'completed'] }
                });

                if (conflicts.length > 0) {
                    console.log(`Cancelling ${conflicts.length} appointments for Dr. ${name} due to leave.`);

                    for (const appt of conflicts) {
                        appt.status = 'cancelled';
                        appt.cancellationReason = `Doctor on leave: ${leave.reason || 'Unavailable'}`;
                        appt.updatedAt = new Date();
                        await appt.save();

                        // Notify via Socket if available
                        if (req.io) {
                            req.io.to(`patient_${appt.userId}`).emit('appointment_updated', appt);
                        }
                    }
                }
            }
        }

        res.json({
            success: true,
            message: 'Availability updated successfully. Conflicting appointments rescheduled/cancelled.',
            data: doctor
        });
    } catch (err) {
        next(err);
    }
};

// Get doctor statistics
const getStats = async (req, res, next) => {
    try {
        const { name } = req.params;
        const { period = 'week' } = req.query; // week, month, year

        const doctor = await Doctor.findOne({ name });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Calculate date range based on period
        const now = new Date();
        let startDate;

        switch (period) {
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 7));
        }

        // Filter earnings based on period
        const periodEarnings = doctor.earnings.filter(
            earning => new Date(earning.date) >= startDate
        );

        const totalEarnings = periodEarnings.reduce(
            (sum, earning) => sum + (earning.amount || 0),
            0
        );

        const consultationCount = periodEarnings.length;

        res.json({
            success: true,
            data: {
                period,
                totalEarnings,
                consultationCount,
                averageEarning: consultationCount > 0 ? totalEarnings / consultationCount : 0,
                earnings: periodEarnings
            }
        });
    } catch (err) {
        next(err);
    }
};

// Predict Disease (AI)
const predictDisease = async (req, res, next) => {
    try {
        const { symptoms } = req.body;
        if (!symptoms) return res.status(400).json({ message: "Symptoms required" });

        // Dynamic import to avoid circular dependency issues if any
        const { aiJobService } = await import('../services/AIJobService.js');
        const result = await aiJobService.predictDiseaseML(symptoms);
        res.json(result);
    } catch (error) {
        console.error("Prediction Error:", error);
        res.status(500).json({ message: "Prediction failed" });
    }
};

// Analyze Image (AI)
const analyzeImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const { aiJobService } = await import('../services/AIJobService.js');

        // Construct FormData for the Python service
        const formData = new FormData();
        // Create a blob-like object or stream from the buffer
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append('file', blob, req.file.originalname);

        const result = await aiJobService.analyzeImage(formData);
        res.json(result);
    } catch (error) {
        console.error("Image Analysis Error:", error);
        res.status(500).json({ message: "Image analysis failed" });
    }
};

const doctorController = {
    createDoctor,
    getDoctor,
    getDoctors,
    updateDoctor,
    deleteDoctor,
    updateAvailability,
    getStats,
    predictDisease,
    analyzeImage
}

export default doctorController;