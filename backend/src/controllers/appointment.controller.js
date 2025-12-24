import { Appointment } from "../models/appointment.model.js";
import { Patient } from "../models/patient.model.js";
import * as smsService from "../services/sms.service.js";

/**
 * Create a new appointment (Patient-facing)
 */
const createAppointment = async (req, res, next) => {
    try {
        const { userId, primaryPhysician, schedule, reason, note, patientId } = req.body;

        // Validate required fields
        if (!userId || !primaryPhysician || !schedule || !reason) {
            return res.status(400).json({
                message: 'Missing required fields: userId, primaryPhysician, schedule, reason'
            });
        }

        // Find patient by ID or create reference
        let patient = null;
        if (patientId) {
            patient = await Patient.findById(patientId);
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
        }

        // Create appointment with pending status
        const appointment = await Appointment.create({
            patient: patient?._id,
            userId,
            primaryPhysician,
            schedule: new Date(schedule),
            reason,
            note,
            status: 'pending'
        });

        // Populate patient data for response
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patient');

        res.status(201).json(populatedAppointment);
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
        const { cancellationReason } = req.body;

        if (!cancellationReason) {
            return res.status(400).json({ message: 'Cancellation reason is required' });
        }

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

const appointmentController = {
    createAppointment,
    getAppointment,
    getAppointments,
    getAppointmentStats,
    scheduleAppointment,
    cancelAppointment,
    updateAppointment,
    deleteAppointment
};

export default appointmentController;
