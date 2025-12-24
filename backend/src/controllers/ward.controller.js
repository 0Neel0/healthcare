import { Ward } from "../models/ward.model.js";

// --- Ward Management ---
export const createWard = async (req, res) => {
    try {
        const newWard = new Ward(req.body);
        await newWard.save();
        res.status(201).json(newWard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getWards = async (req, res) => {
    try {
        const wards = await Ward.find().sort({ name: 1 });
        res.status(200).json(wards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Bed Management ---
export const addBedToWard = async (req, res) => {
    try {
        const { wardId } = req.params;
        const bedData = req.body;

        const ward = await Ward.findById(wardId);
        if (!ward) return res.status(404).json({ message: "Ward not found" });

        ward.beds.push(bedData);
        // Recalculate capacity could be done here if dynamic
        await ward.save();

        res.status(201).json(ward);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const admitPatientToBed = async (req, res) => {
    try {
        const { wardId, bedId } = req.params;
        const { patientId } = req.body; // Expect patientId in body

        const ward = await Ward.findById(wardId);
        if (!ward) return res.status(404).json({ message: "Ward not found" });

        const bed = ward.beds.id(bedId);
        if (!bed) return res.status(404).json({ message: "Bed not found" });

        if (bed.status === 'Occupied') {
            return res.status(400).json({ message: "Bed is already occupied" });
        }

        bed.status = 'Occupied';
        bed.patientId = patientId;
        bed.admissionDate = Date.now();
        ward.occupiedBeds += 1;

        await ward.save();
        res.status(200).json(ward);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const dischargePatientFromBed = async (req, res) => {
    try {
        const { wardId, bedId } = req.params;

        const ward = await Ward.findById(wardId);
        if (!ward) return res.status(404).json({ message: "Ward not found" });

        const bed = ward.beds.id(bedId);
        if (!bed) return res.status(404).json({ message: "Bed not found" });

        if (bed.status !== 'Occupied') {
            return res.status(400).json({ message: "Bed is not occupied" });
        }

        bed.status = 'Available';
        bed.patientId = null;
        bed.admissionDate = null;
        ward.occupiedBeds = Math.max(0, ward.occupiedBeds - 1);

        await ward.save();
        res.status(200).json(ward);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
