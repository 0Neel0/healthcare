import { Ward } from "../models/ward.model.js";
import { Billing } from "../models/billing.model.js";

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

        // --- BILLING LOGIC ---
        const admissionDate = new Date(bed.admissionDate);
        const dischargeDate = new Date();
        // Calculate duration in days (round up, minimum 1 day)
        const diffTime = Math.abs(dischargeDate - admissionDate);
        const daysStayed = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const totalCost = daysStayed * bed.costPerDay;

        // Create a Bill
        if (bed.patientId) {
            const newBill = new Billing({
                patientId: bed.patientId,
                services: [{
                    name: `Ward Charges - ${ward.name} (Bed ${bed.number})`,
                    cost: bed.costPerDay,
                    quantity: daysStayed
                }],
                totalAmount: totalCost,
                paymentStatus: 'Pending',
                notes: `Admitted: ${admissionDate.toLocaleDateString()}, Discharged: ${dischargeDate.toLocaleDateString()}`
            });
            await newBill.save();
        }
        // ---------------------

        bed.status = 'Available';
        bed.patientId = null;
        bed.admissionDate = null;
        ward.occupiedBeds = Math.max(0, ward.occupiedBeds - 1);

        await ward.save();
        res.status(200).json({ message: "Patient discharged and bill generated", ward });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const getAdmittedWardsForPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const wards = await Ward.find({ "beds.patientId": patientId });

        const admissions = [];
        wards.forEach(ward => {
            ward.beds.forEach(bed => {
                if (bed.patientId && bed.patientId.toString() === patientId) {
                    admissions.push({
                        wardName: ward.name,
                        wardId: ward._id,
                        bedId: bed._id,
                        bedNumber: bed.number,
                        bedType: bed.type,
                        costPerDay: bed.costPerDay,
                        admissionDate: bed.admissionDate,
                        status: bed.status
                    });
                }
            });
        });

        res.status(200).json(admissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const generateInterimBill = async (req, res) => {
    try {
        const { wardId, bedId } = req.params;

        const ward = await Ward.findById(wardId);
        if (!ward) return res.status(404).json({ message: "Ward not found" });

        const bed = ward.beds.id(bedId);
        if (!bed) return res.status(404).json({ message: "Bed not found" });

        if (bed.status !== 'Occupied' || !bed.patientId) {
            return res.status(400).json({ message: "Bed is not actively occupied by a patient" });
        }

        const admissionDate = new Date(bed.admissionDate);
        const now = new Date();
        const diffTime = Math.abs(now - admissionDate);
        const diffHours = diffTime / (1000 * 60 * 60);

        if (diffHours < 2) {
            return res.status(400).json({ message: "No new charges to bill yet. Minimum billing interval is 2 hours." });
        }

        const daysStayed = Math.ceil(diffHours / 24);
        const totalCost = daysStayed * bed.costPerDay;

        // Create Bill
        const newBill = new Billing({
            patientId: bed.patientId,
            services: [{
                name: `Interim Ward Charges - ${ward.name} (Bed ${bed.number})`,
                cost: bed.costPerDay,
                quantity: daysStayed
            }],
            totalAmount: totalCost,
            paymentStatus: 'Pending',
            notes: `Interim Payment: ${admissionDate.toLocaleDateString()} to ${now.toLocaleDateString()}`
        });
        const savedBill = await newBill.save();

        // RESET Billing Cycle: Update admissionDate to now
        bed.admissionDate = now;
        await ward.save();

        res.status(201).json(savedBill);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
