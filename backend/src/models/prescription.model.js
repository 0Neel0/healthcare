import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorName: {
        type: String,
        required: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },

    // Prescription Date
    prescriptionDate: {
        type: Date,
        default: Date.now
    },

    // Medications
    medications: [{
        medicineName: {
            type: String,
            required: true
        },
        dosage: {
            type: String,
            required: true
        },
        frequency: {
            type: String,
            required: true
        },
        duration: {
            type: String,
            required: true
        },
        instructions: String,
        quantity: String
    }],

    // Clinical Notes
    diagnosis: String,
    symptoms: [String],
    notes: String,

    // Follow-up
    followUpDate: Date,
    followUpInstructions: String,

    // Status
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },

    // Pharmacy Status
    pharmacyStatus: {
        type: String,
        enum: ['pending', 'dispensed', 'partially_dispensed'],
        default: 'pending'
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Prescription = mongoose.model('Prescription', PrescriptionSchema);
