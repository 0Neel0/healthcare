import mongoose from "mongoose";


const PatientSchema = new mongoose.Schema({
    name: String,
    dob: Date,
    gender: String,
    phone: String,
    address: String,
    email: String,
    medicalHistory: [String],
    createdAt: { type: Date, default: Date.now }
});
export const Patient = mongoose.model('Patient', PatientSchema);