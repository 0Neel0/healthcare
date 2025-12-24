import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    userId: { type: String, required: true }, // Appwrite user ID for cross-reference
    primaryPhysician: { type: String, required: true }, // Doctor name
    schedule: { type: Date, required: true },
    reason: { type: String, required: true },
    note: { type: String },
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'cancelled'],
        default: 'pending'
    },
    cancellationReason: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export const Appointment = mongoose.model('Appointment', AppointmentSchema);