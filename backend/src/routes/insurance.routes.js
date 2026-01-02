import express from 'express';
import { InsuranceClaim } from '../models/insurance.model.js';

const router = express.Router();

// GET /insurance/claims - List all (with filters)
router.get('/claims', async (req, res) => {
    try {
        const { status, patientId } = req.query;
        let query = {};
        if (status) query.status = status;
        if (patientId) query.patient = patientId;

        const claims = await InsuranceClaim.find(query)
            .populate('patient', 'name email phone')
            .sort({ createdAt: -1 });

        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /insurance/claims - Submit new claim (Manual or Auto)
router.post('/claims', async (req, res) => {
    try {
        const claim = new InsuranceClaim(req.body);
        await claim.save();
        res.status(201).json(claim);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /insurance/claims/:id/status - Update status (Approve/Reject)
router.put('/claims/:id/status', async (req, res) => {
    try {
        const { status, approvedAmount, adminNotes } = req.body;

        const updates = { status };
        if (approvedAmount !== undefined) updates.approvedAmount = approvedAmount;
        if (adminNotes !== undefined) updates.adminNotes = adminNotes;
        updates.updatedAt = Date.now();

        const claim = await InsuranceClaim.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!claim) return res.status(404).json({ message: "Claim not found" });

        res.json(claim);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
