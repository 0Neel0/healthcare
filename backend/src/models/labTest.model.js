import mongoose from "mongoose";

const LabTestSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    cost: { type: Number, required: true },
    description: String,
    referenceRange: String,
    unit: String,
    createdAt: { type: Date, default: Date.now }
});

export const LabTest = mongoose.model('LabTest', LabTestSchema);
