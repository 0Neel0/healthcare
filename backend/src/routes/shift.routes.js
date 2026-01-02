import express from 'express';
import { Shift } from '../models/shift.model.js';

const router = express.Router();

// GET /shifts - Get Roster (Default: current month)
router.get('/', async (req, res) => {
    try {
        const { start, end, dept } = req.query;
        let query = {};

        if (start && end) {
            query.date = { $gte: new Date(start), $lte: new Date(end) };
        }

        // If filtering by department, we need to populate staff first and then filter
        // Mongoose aggregate is better for this, but for simple MVP:

        const shifts = await Shift.find(query).populate('staffId', 'firstName lastName role department');

        if (dept) {
            const filtered = shifts.filter(s => s.staffId?.department === dept);
            return res.json(filtered);
        }

        res.json(shifts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /shifts - Assign Shift
router.post('/', async (req, res) => {
    try {
        const { staffId, date, type, location } = req.body;

        // Check existing
        const existing = await Shift.findOne({ staffId, date: new Date(date) });
        if (existing) {
            // Update if exists
            existing.type = type;
            existing.location = location;
            await existing.save();
            return res.json(existing);
        }

        const shift = new Shift(req.body);
        await shift.save();
        res.status(201).json(shift);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
