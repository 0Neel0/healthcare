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

        res.json({
            success: true,
            message: 'Availability updated successfully',
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

const doctorController = {
    createDoctor,
    getDoctor,
    getDoctors,
    updateDoctor,
    deleteDoctor,
    updateAvailability,
    getStats
}

export default doctorController;