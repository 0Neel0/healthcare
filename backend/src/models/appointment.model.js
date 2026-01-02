import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    userId: { type: String, required: true }, // Appwrite user ID for cross-reference
    primaryPhysician: { type: String, required: true }, // Doctor name
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to Doctor User ID for Chat/Features
    schedule: { type: Date, required: true },
    reason: { type: String, required: true },
    note: { type: String },
    prescription: [{
        medicineName: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String
    }],
    consultationFee: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['pending_admin', 'pending_doctor', 'pending_payment', 'scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'pending_admin'
    },
    cancellationReason: { type: String },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    billingStatus: {
        type: String,
        enum: ['unbilled', 'requested', 'generated'],
        default: 'unbilled'
    },
    // Queue Management
    tokenNumber: { type: Number }, // Daily token
    queueStatus: {
        type: String,
        enum: ['Waiting', 'In Consultation', 'Completed', 'Skipped'],
        default: 'Waiting'
    },
    transactionId: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export const Appointment = mongoose.model('Appointment', AppointmentSchema);