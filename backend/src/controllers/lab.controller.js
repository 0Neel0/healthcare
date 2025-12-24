import { LabTest } from "../models/labTest.model.js";
import { LabRequest } from "../models/labRequest.model.js";

// --- Lab Catalog ---
export const addLabTest = async (req, res) => {
    try {
        const newTest = new LabTest(req.body);
        await newTest.save();
        res.status(201).json(newTest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getLabTests = async (req, res) => {
    try {
        const tests = await LabTest.find().sort({ name: 1 });
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Lab Requests ---
export const createLabRequest = async (req, res) => {
    try {
        const newRequest = new LabRequest(req.body);
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getLabRequests = async (req, res) => {
    try {
        const { patientId, status } = req.query;
        let query = {};
        if (patientId) query.patientId = patientId;
        if (status) query.status = status;

        const requests = await LabRequest.find(query)
            .populate('patientId', 'name')
            .populate('testId', 'name code')
            .populate('doctorId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateLabRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resultValue, resultNotes, reportUrl } = req.body;

        let updates = { status, updatedAt: Date.now() };
        if (resultValue) updates.resultValue = resultValue;
        if (resultNotes) updates.resultNotes = resultNotes;
        if (reportUrl) updates.reportUrl = reportUrl;

        if (status === 'Completed') updates.completedAt = Date.now();
        if (status === 'Sample Collected') updates.sampleCollectedAt = Date.now();

        const updatedRequest = await LabRequest.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedRequest) return res.status(404).json({ message: "Lab request not found" });
        res.status(200).json(updatedRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
