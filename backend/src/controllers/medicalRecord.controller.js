import { MedicalRecord } from "../models/medicalRecord.model.js";

export const addMedicalRecord = async (req, res) => {
    try {
        const newRecord = new MedicalRecord(req.body);
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getPatientRecords = async (req, res) => {
    try {
        const { patientId } = req.params;
        const records = await MedicalRecord.find({ patientId })
            .populate('doctorId', 'name specialization')
            .sort({ visitDate: -1 });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRecordById = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await MedicalRecord.findById(id)
            .populate('patientId', 'name')
            .populate('doctorId', 'name');
        if (!record) return res.status(404).json({ message: "Record not found" });
        res.status(200).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
