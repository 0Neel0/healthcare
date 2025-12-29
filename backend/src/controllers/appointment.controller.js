import mongoose from "mongoose";
import { Appointment } from "../models/appointment.model.js";
import { Patient } from "../models/patient.model.js";
import * as smsService from "../services/sms.service.js";

import { User } from "../models/user.model.js";

/**
 * Create a new appointment (Patient-facing)
 * Initial Status: pending_admin
 */
const createAppointment = async (req, res, next) => {
    try {
        const { userId, primaryPhysician, schedule, reason, note, patientId, doctorId } = req.body;

        // ... validation ...
        if (!userId || !primaryPhysician || !schedule || !reason) {
            return res.status(400).json({
                message: 'Missing required fields: userId, primaryPhysician, schedule, reason'
            });
        }

        let patient = null;
        if (patientId) {
            patient = await Patient.findById(patientId);
            if (!patient) return res.status(404).json({ message: 'Patient not found' });
        }

        // Find doctor to link for chat
        let doctorUserId = null;

        // 1. Try explicit ID from frontend (Most Reliable)
        if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
            doctorUserId = doctorId;
        }
        // 2. Fallback: Find doctor by name (Legacy/Unreliable)
        else {
            const doctorNameClean = primaryPhysician.replace(/^Dr\.\s+/i, '');
            const doctorUser = await User.findOne({
                role: 'doctor',
                name: { $regex: new RegExp(`^${doctorNameClean}$`, 'i') }
            });
            doctorUserId = doctorUser?._id;
        }

        const appointment = await Appointment.create({
            patient: patient?._id,
            userId,
            primaryPhysician,
            doctor: doctorUserId, // Save reference
            schedule: new Date(schedule),
            reason,
            note,
            status: 'pending_admin' // Initial status
        });

        const populatedAppointment = await Appointment.findById(appointment._id).populate('patient');

        // Notify Admin
        if (req.io) {
            req.io.emit('new_appointment_request', populatedAppointment);
        }

        res.status(201).json(populatedAppointment);
    } catch (err) {
        next(err);
    }
};

/**
 * Admin requests doctor confirmation
 * Status: pending_doctor
 */
const adminRequestConfirmation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status: 'pending_doctor', updatedAt: new Date() },
            { new: true }
        ).populate('patient');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // Emit to specific Doctor
        // Assuming doctor joins room "doctor_{doctorName}"
        if (req.io) {
            req.io.to(`doctor_${appointment.primaryPhysician}`).emit('doctor_confirmation_request', appointment);
        }

        res.json(appointment);
    } catch (err) {
        next(err);
    }
};

/**
 * Doctor confirms and sets fee
 * Status: pending_payment
 */
const doctorConfirmAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { consultationFee } = req.body;

        if (!consultationFee) return res.status(400).json({ message: 'Consultation fee required' });

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            {
                status: 'pending_payment',
                consultationFee,
                updatedAt: new Date()
            },
            { new: true }
        ).populate('patient');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // Notify Admin and Patient
        if (req.io) {
            req.io.to('admin_room').emit('doctor_confirmed', appointment);
            req.io.to(`patient_${appointment.userId}`).emit('payment_request', appointment);
        }

        res.json(appointment);
    } catch (err) {
        next(err);
    }
};

/**
 * Get all appointments with pagination (Admin-facing)
 */
const getAppointments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const appointments = await Appointment.find()
            .populate('patient')
            .sort({ schedule: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Appointment.countDocuments();

        res.json({
            appointments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get appointment statistics (Admin-facing)
 */
const getAppointmentStats = async (req, res, next) => {
    try {
        const scheduledCount = await Appointment.countDocuments({ status: 'scheduled' });
        const pendingCount = await Appointment.countDocuments({ status: 'pending' });
        const cancelledCount = await Appointment.countDocuments({ status: 'cancelled' });

        res.json({
            scheduled: scheduledCount,
            pending: pendingCount,
            cancelled: cancelledCount,
            total: scheduledCount + pendingCount + cancelledCount
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get single appointment by ID
 */
const getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (err) {
        next(err);
    }
};

/**
 * Schedule an appointment (Admin-facing)
 * Changes status from 'pending' to 'scheduled'
 */
const scheduleAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { schedule, note } = req.body;

        const appointment = await Appointment.findById(id).populate('patient');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Update appointment
        appointment.status = 'scheduled';
        if (schedule) appointment.schedule = new Date(schedule);
        if (note) appointment.note = note;
        appointment.updatedAt = new Date();

        await appointment.save();

        // Send SMS notification if patient has phone number
        if (appointment.patient?.phone) {
            await smsService.sendAppointmentScheduled(
                appointment.patient.phone,
                {
                    doctor: appointment.primaryPhysician,
                    schedule: appointment.schedule,
                    reason: appointment.reason
                }
            );
        }

        res.json(appointment);
    } catch (err) {
        next(err);
    }
};

/**
 * Cancel an appointment (Admin-facing)
 */
const cancelAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cancellationReason = 'Cancelled by User' } = req.body;

        const appointment = await Appointment.findById(id).populate('patient');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Update appointment
        appointment.status = 'cancelled';
        appointment.cancellationReason = cancellationReason;
        appointment.updatedAt = new Date();

        await appointment.save();

        // Send SMS notification if patient has phone number
        if (appointment.patient?.phone) {
            await smsService.sendAppointmentCancellation(
                appointment.patient.phone,
                {
                    doctor: appointment.primaryPhysician,
                    schedule: appointment.schedule,
                    cancellationReason: cancellationReason
                }
            );
        }

        res.json(appointment);
    } catch (err) {
        next(err);
    }
};

/**
 * Update appointment
 */
const updateAppointment = async (req, res, next) => {
    try {
        const updated = await Appointment.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        ).populate('patient');

        if (!updated) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

/**
 * Delete appointment
 */
const deleteAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json({ message: 'Appointment removed' });
    } catch (err) {
        next(err);
    }
};

/**
 * Get appointments for a specific patient
 */
const getPatientAppointments = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        console.log(`[GetPatientAppointments] Fetching for ID: ${patientId}`);

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            console.error(`[GetPatientAppointments] Invalid Patient ID: ${patientId}`);
            return res.status(400).json({ message: 'Invalid Patient ID format' });
        }

        const appointments = await Appointment.find({ patient: patientId })
            .sort({ schedule: -1 })
            .populate('patient')
            .populate('doctor');

        console.log(`[GetPatientAppointments] Found ${appointments.length} appointments`);
        res.json(appointments);
    } catch (err) {
        console.error('[GetPatientAppointments Error]', err);
        next(err);
    }
};

/**
 * Get appointments for a specific doctor
 */
const getDoctorAppointments = async (req, res, next) => {
    try {
        const { doctorName } = req.params;
        const { date } = req.query;

        let query = { primaryPhysician: doctorName };

        // Filter by date if provided
        if (date === 'today') {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            query.schedule = { $gte: start, $lte: end };
        }

        const appointments = await Appointment.find(query)
            .populate('patient')
            .sort({ schedule: 1 }); // Sort by schedule ascending

        res.json(appointments);
    } catch (err) {
        next(err);
    }
};

/**
 * Update appointment status (for workflow: pending -> ongoing -> completed)
 */
const updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'scheduled', 'ongoing', 'completed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        ).populate('patient');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (err) {
        next(err);
    }
};

/**
 * Update billing status (Doctor/Admin)
 */
const updateBillingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { billingStatus } = req.body;

        const validStatuses = ['unbilled', 'requested', 'generated'];

        if (!validStatuses.includes(billingStatus)) {
            return res.status(400).json({
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { billingStatus, updatedAt: new Date() },
            { new: true }
        ).populate('patient');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (err) {
        next(err);
    }
};

const appointmentController = {
    createAppointment,
    getAppointment,
    getAppointments,
    getAppointmentStats,
    scheduleAppointment,
    cancelAppointment,
    updateAppointment,
    deleteAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    updateStatus,
    updateBillingStatus,
    adminRequestConfirmation,
    doctorConfirmAppointment
};

export default appointmentController;
