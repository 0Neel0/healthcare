import express from 'express';
import { OTRoom, OTSchedule } from '../models/ot.model.js';

const router = express.Router();

// --- Rooms ---
router.post('/rooms', async (req, res) => {
    try {
        const room = new OTRoom(req.body);
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/rooms', async (req, res) => {
    try {
        const rooms = await OTRoom.find();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Room Status
router.patch('/rooms/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const room = await OTRoom.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(room);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// --- Scheduling ---
router.get('/schedule', async (req, res) => {
    try {
        const { date } = req.query;
        let query = {};
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.startTime = { $gte: start, $lte: end };
        }

        const appointments = await OTSchedule.find(query)
            .populate('patientId', 'name')
            .populate('doctorId', 'name')
            .populate('roomId', 'name roomNumber')
            .sort({ startTime: 1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/schedule', async (req, res) => {
    try {
        // Basic overlap check could go here
        const schedule = new OTSchedule(req.body);
        await schedule.save();
        res.status(201).json(schedule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
