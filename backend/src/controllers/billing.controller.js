import mongoose from 'mongoose';
import { Billing } from '../models/billing.model.js';
import { Appointment } from '../models/appointment.model.js';
import { Patient } from '../models/patient.model.js';
import { InsuranceClaim } from '../models/insurance.model.js'; // Import the model
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

        // 2. Fetch patient details
        const patient = await Patient.findById(patientId);

        if (patient) {
            // Send SMS
            if (patient.phone) {
                console.log(`[Billing] Sending SMS to ${patient.phone} for bill ${savedBill._id}`);
                await smsService.sendBillNotification(patient.phone, totalAmount);
            }

            // 3. AUTO-INSURANCE CLAIM LOGIC
            // If patient has insurance info, automatically raise a pending claim
            if (patient.insuranceProvider && patient.insurancePolicyNumber) {
                try {
                    console.log(`[Billing] Auto-generating insurance claim for Patient ${patient.name}`);

                    const servicesList = services.map(s => s.name).join(', ');

                    await InsuranceClaim.create({
                        patient: patientId,
                        providerName: patient.insuranceProvider,
                        policyNumber: patient.insurancePolicyNumber,
                        diagnosis: notes || `Services: ${servicesList}`, // Fallback diagnosis
                        claimAmount: totalAmount,
                        status: 'Pending',
                        adminNotes: 'Auto-generated via Billing System'
                    });
                } catch (err) {
                    console.error("Failed to auto-create insurance claim:", err);
                    // Do not fail the request, just log the error
                }
            }
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
