import mongoose from 'mongoose';
import { Billing } from '../models/billing.model.js';
import { Appointment } from '../models/appointment.model.js';
import { Patient } from '../models/patient.model.js';
import * as smsService from '../services/sms.service.js';

/**
 * Create a new bill (Admin/Doctor)
 * POST /api/billing/create
 */
const createBill = async (req, res) => {
    try {
        const { patientId, appointmentId, services, notes } = req.body;

        // Calculate total amount
        const totalAmount = services.reduce((sum, service) => {
            return sum + (service.cost * (service.quantity || 1));
        }, 0);

        const newBill = new Billing({
            patientId,
            appointmentId,
            services,
            totalAmount,
            notes,
            paymentStatus: 'Pending'
        });

        const savedBill = await newBill.save();

        // 1. Update Appointment billingStatus to 'generated'
        if (appointmentId) {
            await Appointment.findByIdAndUpdate(appointmentId, { billingStatus: 'generated' });
        }

        // 2. Send Notification (SMS)
        // Fetch patient to get phone number
        const patient = await Patient.findById(patientId);
        if (patient && patient.phone) {
            // Requires smsService import
            // Assuming simplified message for now
            console.log(`[Billing] Sending SMS to ${patient.phone} for bill ${savedBill._id}`);
            await smsService.sendBillNotification(patient.phone, totalAmount);
        }

        res.status(201).json({ success: true, bill: savedBill });
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(500).json({ message: 'Failed to create bill', error: error.message });
    }
};

/**
 * Get bills for a specific patient
 * GET /api/billing/patient/:patientId
 */
const getPatientBills = async (req, res) => {
    try {
        const { patientId } = req.params;
        const bills = await Billing.find({ patientId }).populate('patientId', 'name email phone').sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        console.error('Error fetching patient bills:', error);
        res.status(500).json({ message: 'Failed to fetch bills', error: error.message });
    }
};

/**
 * Get all bills (Admin)
 * GET /api/billing
 */
const getAllBills = async (req, res) => {
    try {
        const bills = await Billing.find().populate('patientId', 'name email phone').sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        console.error('Error fetching all bills:', error);
        res.status(500).json({ message: 'Failed to fetch bills', error: error.message });
    }
};

/**
 * Get a single bill by ID
 * GET /api/billing/:id
 */
const getBillById = async (req, res) => {
    try {
        const bill = await Billing.findById(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bill', error: error.message });
    }
};

/**
 * Update Bill Status (Manual override or fallback)
 * PATCH /api/billing/:id/status
 */
const updateBillStatus = async (req, res) => {
    try {
        const { status, paymentMethod, transactionId } = req.body;
        const bill = await Billing.findByIdAndUpdate(
            req.params.id,
            {
                paymentStatus: status,
                paymentMethod,
                transactionId,
                updatedAt: Date.now()
            },
            { new: true }
        );
        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: 'Error updating bill', error: error.message });
    }
};

export default {
    createBill,
    getPatientBills,
    getAllBills,
    getBillById,
    updateBillStatus
};
