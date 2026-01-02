import express from 'express';
import { getInventory, getLowStockItems, dispenseMedicine } from '../controllers/inventory.controller.js';
import { Prescription } from '../models/prescription.model.js'; // Direct access for MVP query

const router = express.Router();

// Get Pending Prescriptions for Pharmacy Dashboard
router.get('/prescriptions/pending', async (req, res) => {
    try {
        const prescriptions = await Prescription.find({
            // status: 'active', // Optional: decide if 'completed' appointments can still have pending Rx
            pharmacyStatus: { $in: ['pending', 'partially_dispensed'] }
        })
            .populate('patientId', 'name')
            .populate('appointmentId', 'consultationFee') // optional linking
            .sort({ createdAt: -1 });

        res.json(prescriptions);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Dispense
router.post('/dispense', dispenseMedicine);

export default router;
