import express from 'express';
import { BloodDonor, BloodInventory } from '../models/bloodBank.model.js';

const router = express.Router();

// --- Donors ---
router.post('/donors', async (req, res) => {
    try {
        const donor = new BloodDonor(req.body);
        await donor.save();
        res.status(201).json(donor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/donors', async (req, res) => {
    try {
        const donors = await BloodDonor.find().sort({ createdAt: -1 });
        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Inventory (Blood Bags) ---
// Add new blood bag (Donation)
router.post('/inventory', async (req, res) => {
    try {
        // Simple logic: bagNumber generation
        const count = await BloodInventory.countDocuments();
        const bagNumber = `BB-${new Date().getFullYear()}-${count + 1000}`;

        const bag = new BloodInventory({
            ...req.body,
            bagNumber
        });
        await bag.save();
        res.status(201).json(bag);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get Inventory (Grouped or List)
router.get('/inventory', async (req, res) => {
    try {
        // Return available bags
        const stock = await BloodInventory.find({ status: 'Available' }).populate('donorId', 'name');

        // Also handy to return stats grouped by blood group
        const stats = await BloodInventory.aggregate([
            { $match: { status: 'Available' } },
            { $group: { _id: "$bloodGroup", count: { $sum: "$quantity" } } } // quantity is usually 1 per bag entry based on schema usage, but let's assume 1 document = 1 bag for tracking
        ]);

        res.json({ stock, stats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Bag Status (Issued/Expired)
router.patch('/inventory/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const bag = await BloodInventory.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(bag);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
