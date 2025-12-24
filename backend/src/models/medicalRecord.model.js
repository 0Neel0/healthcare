import mongoose from "mongoose";

const MedicalRecordSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },

    // Visit Details
    visitType: { type: String, enum: ['OPD', 'IPD', 'Emergency', 'Telemedicine'], required: true },
    visitDate: { type: Date, default: Date.now },

    // Clinical Data
    symptoms: [String],
    diagnosis: { type: String, required: true },
    vitals: {
        bloodPressure: String,
        temperature: String,
        pulse: String,
        weight: String,
        height: String,
        spO2: String
    },

    // Treatment & Prescriptions
    prescription: [{
        medicineName: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: String
    }],

    notes: String,
    attachments: [String], // URLs to files

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const MedicalRecord = mongoose.model('MedicalRecord', MedicalRecordSchema);
